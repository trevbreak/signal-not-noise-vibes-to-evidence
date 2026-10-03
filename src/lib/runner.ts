import { post } from "./api";
import { runCheck } from "./checks";
import { judgesOn, labKey, useStore } from "./store";
import { PROMPTS, SCENES } from "../scenes";
import type { Case, Judge, LabScene, RunResult, Trace, Verdict } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

type TranslateRes = {
  text: string;
  model: string;
  latencyMs: number;
  usage?: { input: number; output: number };
  replayed?: boolean;
};
type JudgeRes = { results: { id: string; pass: boolean; reason: string }[] };

/** Exactly what you'd paste into a new chat: the instructions, then the text. */
export function compose(instructions: string, text: string) {
  return `${instructions.trimEnd()}\n\n${text}`;
}

export const currentModel = () => {
  const s = useStore.getState();
  return s.modelOverride || s.health?.translatorModel || "claude-haiku-4-5";
};

export const allCases = (scene: LabScene): Case[] => [...scene.cases, ...useStore.getState().lab(scene).customCases];

/** Run a list of async jobs with a concurrency cap so "try 10 times" doesn't hit rate limits. */
export async function pool<T>(jobs: (() => Promise<T>)[], limit = 6): Promise<T[]> {
  const out: T[] = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const i = next++;
      out[i] = await jobs[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  return out;
}

/** Mark one answer with the given automated checks (rules instantly, AI judges in at most two calls). */
export async function judgeOutput(
  judges: Judge[],
  source: string,
  output: string,
  context: string,
  onVerdict: (judgeId: string, v: Verdict) => void,
) {
  for (const j of judges) {
    if (j.kind === "code") onVerdict(j.id, runCheck(j.check, source, output, j.terms));
  }
  const llm = judges.filter((j): j is Extract<Judge, { kind: "llm" }> => j.kind === "llm");
  const groups = [llm.filter((j) => j.withContext), llm.filter((j) => !j.withContext)].filter((g) => g.length);
  await Promise.all(
    groups.map(async (group) => {
      try {
        const res = await post<JudgeRes>("/api/judge", {
          source,
          output,
          context: group[0].withContext ? context : undefined,
          criteria: group.map((j) => ({ id: j.id, name: j.name, rubric: j.rubric })),
        });
        for (const j of group) {
          const r = res.results.find((x) => x.id === j.id);
          onVerdict(j.id, r ? { pass: r.pass, reason: r.reason } : { pass: false, reason: "The judge gave no verdict." });
        }
      } catch (e) {
        for (const j of group) onVerdict(j.id, { pass: false, reason: `Judge error: ${(e as Error).message}` });
      }
    }),
  );
}

export async function runScene(scene: LabScene, times: number, onlyCaseId?: string) {
  const s = useStore.getState();
  const key = labKey(scene);
  if (s.running[key]) return;
  const lab = s.lab(scene);
  const model = currentModel();
  const judges = scene.judges.filter((j) => judgesOn(scene, lab).includes(j.id) && j.kind !== "human");
  const batchId = uid();
  const cases = allCases(scene).filter((c) => !onlyCaseId || c.id === onlyCaseId);
  const version = scene.versions[lab.versionIdx];

  s.setRunning(key, true);
  for (const c of cases) s.setResults(scene, c.id, () => []);
  const jobs = cases.flatMap((c) =>
    Array.from(
      { length: times },
      () => () => runOne(scene, c, { instructions: lab.instructions, edited: lab.edited, model, judges, batchId, version }),
    ),
  );
  await pool(jobs);
  s.setRunning(key, false);
}

async function runOne(
  scene: LabScene,
  c: Case,
  ctx: { instructions: string; edited: boolean; model: string; judges: Judge[]; batchId: string; version: string },
) {
  const s = useStore.getState();
  const runId = uid();
  const traceId = uid();
  const prompt = compose(ctx.instructions, c.text);
  const pending: RunResult = {
    runId,
    traceId,
    verdicts: Object.fromEntries(ctx.judges.map((j) => [j.id, "pending" as const])),
  };
  s.setResults(scene, c.id, (prev) => [...prev, pending]);
  const patch = (p: Partial<RunResult>) =>
    useStore.getState().setResults(scene, c.id, (prev) => prev.map((r) => (r.runId === runId ? { ...r, ...p } : r)));

  const trace: Trace = {
    id: traceId,
    ts: Date.now(),
    sceneId: scene.id,
    promptVersion: ctx.version,
    promptEdited: ctx.edited,
    model: ctx.model,
    caseId: c.id,
    source: c.text,
    prompt,
    batchId: ctx.batchId,
    verdicts: {},
    judgeNames: Object.fromEntries(ctx.judges.map((j) => [j.id, j.name])),
  };

  let output: string;
  try {
    const res = await post<TranslateRes>("/api/translate", { model: ctx.model, user: prompt });
    output = res.text.trim();
    patch({ output, latencyMs: res.latencyMs, replayed: res.replayed });
    s.addTrace({ ...trace, output, latencyMs: res.latencyMs, inputTokens: res.usage?.input, replayed: res.replayed });
  } catch (e) {
    const error = (e as Error).message;
    patch({ error, verdicts: {} });
    s.addTrace({ ...trace, error });
    return;
  }

  await judgeOutput(ctx.judges, c.text, output, scene.context ?? "", (judgeId, v) => {
    useStore.getState().setResults(scene, c.id, (prev) =>
      prev.map((r) => (r.runId === runId ? { ...r, verdicts: { ...r.verdicts, [judgeId]: v } } : r)),
    );
    const j = ctx.judges.find((x) => x.id === judgeId)!;
    useStore.getState().setVerdict(traceId, judgeId, j.name, v);
  });
}

/** A check was switched on after the run: mark the answers already on screen, without re-running the app. */
export async function judgeExisting(scene: LabScene, judgeId: string) {
  const judge = scene.judges.find((j) => j.id === judgeId);
  if (!judge || judge.kind === "human") return;
  const lab = useStore.getState().lab(scene);
  const jobs: (() => Promise<void>)[] = [];
  for (const c of allCases(scene)) {
    for (const r of lab.results[c.id] ?? []) {
      if (!r.output || r.verdicts[judgeId]) continue;
      useStore.getState().setResults(scene, c.id, (prev) =>
        prev.map((x) => (x.runId === r.runId ? { ...x, verdicts: { ...x.verdicts, [judgeId]: "pending" } } : x)),
      );
      jobs.push(() =>
        judgeOutput([judge], c.text, r.output!, scene.context ?? "", (id, v) => {
          useStore.getState().setResults(scene, c.id, (prev) =>
            prev.map((x) => (x.runId === r.runId ? { ...x, verdicts: { ...x.verdicts, [id]: v } } : x)),
          );
          useStore.getState().setVerdict(r.traceId, id, judge.name, v);
        }),
      );
    }
  }
  await pool(jobs);
}

/** Arriving at a scene with judges on: mark any answers still on screen from before, every judge per answer at once. */
export async function judgeAllExisting(scene: LabScene) {
  const lab = useStore.getState().lab(scene);
  const judges = scene.judges.filter((j) => judgesOn(scene, lab).includes(j.id) && j.kind !== "human");
  const jobs: (() => Promise<void>)[] = [];
  for (const c of allCases(scene)) {
    for (const r of lab.results[c.id] ?? []) {
      const missing = judges.filter((j) => !r.verdicts[j.id]);
      if (!r.output || !missing.length) continue;
      const set = (id: string, v: Verdict | "pending") =>
        useStore.getState().setResults(scene, c.id, (prev) =>
          prev.map((x) => (x.runId === r.runId ? { ...x, verdicts: { ...x.verdicts, [id]: v } } : x)),
        );
      for (const j of missing) set(j.id, "pending");
      jobs.push(() =>
        judgeOutput(missing, c.text, r.output!, scene.context ?? "", (id, v) => {
          set(id, v);
          useStore.getState().setVerdict(r.traceId, id, missing.find((j) => j.id === id)!.name, v);
        }),
      );
    }
  }
  await pool(jobs);
}

/** Reveal the next check in the scene's order and mark what's already on screen. */
export function revealJudge(scene: LabScene) {
  const id = useStore.getState().revealNextJudge(scene);
  if (id) judgeExisting(scene, id);
}

/** The presenter (or the room) marks an answer by hand. */
export function setHumanVerdict(scene: LabScene, caseId: string, runId: string, judgeId: string, pass: boolean) {
  const s = useStore.getState();
  const r = s.lab(scene).results[caseId]?.find((x) => x.runId === runId);
  if (!r) return;
  const v: Verdict = { pass, reason: pass ? "The room approves." : "The room says no." };
  s.setResults(scene, caseId, (prev) => prev.map((x) => (x.runId === runId ? { ...x, verdicts: { ...x.verdicts, [judgeId]: v } } : x)));
  s.setVerdict(r.traceId, judgeId, "The room", v);
}

/** Add an audience suggestion typed into the app, and translate it. */
export function addCustomCase(scene: LabScene, text: string) {
  const id = `custom-${uid()}`;
  useStore.getState().patchLab(scene, (lab) => ({
    customCases: [...lab.customCases, { id, text }],
    selectedCaseId: id,
  }));
  return runScene(scene, 1, id);
}

// ── The full test: every phrase, against every version of the instructions ──────

export type GoldenCell = {
  version: string;
  done: number;
  total: number;
  passed: number;
  latencyMs: number;
  inputTokens: number;
};

/** One scene per lab: the one with the most checks. */
function testScenes(): LabScene[] {
  const byLab = new Map<string, LabScene>();
  for (const sc of SCENES) {
    if (sc.kind !== "lab" || !sc.judges.some((j) => j.kind !== "human")) continue;
    const prev = byLab.get(labKey(sc));
    if (!prev || prev.judges.length < sc.judges.length) byLab.set(labKey(sc), sc);
  }
  return [...byLab.values()];
}

export const testCaseCount = () => testScenes().reduce((n, s) => n + s.cases.length, 0);

export async function runGolden(versions: string[], times: number, onProgress: (cells: Record<string, GoldenCell>) => void) {
  const model = currentModel();
  const cells: Record<string, GoldenCell> = Object.fromEntries(
    versions.map((v) => [v, { version: v, done: 0, total: 0, passed: 0, latencyMs: 0, inputTokens: 0 }]),
  );
  const jobs: (() => Promise<void>)[] = [];
  const batchId = "golden-" + uid();

  for (const v of versions) {
    for (const scene of testScenes()) {
      const judges = scene.judges.filter((j) => j.kind !== "human");
      for (const c of scene.cases) {
        for (let i = 0; i < times; i++) {
          cells[v].total++;
          jobs.push(async () => {
            const prompt = compose(PROMPTS[v].instructions, c.text);
            const verdicts: Record<string, Verdict> = {};
            const trace: Trace = {
              id: uid(),
              ts: Date.now(),
              sceneId: "golden",
              promptVersion: v,
              promptEdited: false,
              model,
              caseId: c.id,
              source: c.text,
              prompt,
              batchId,
              verdicts,
              judgeNames: Object.fromEntries(judges.map((j) => [j.id, j.name])),
            };
            try {
              const res = await post<TranslateRes>("/api/translate", { model, user: prompt });
              const output = res.text.trim();
              await judgeOutput(judges, c.text, output, scene.context ?? "", (id, verdict) => (verdicts[id] = verdict));
              const pass = judges.every((j) => verdicts[j.id]?.pass);
              useStore.getState().addTrace({
                ...trace,
                output,
                latencyMs: res.latencyMs,
                inputTokens: res.usage?.input,
                replayed: res.replayed,
              });
              if (pass) cells[v].passed++;
              cells[v].latencyMs += res.latencyMs ?? 0;
              cells[v].inputTokens += res.usage?.input ?? 0;
            } catch (e) {
              useStore.getState().addTrace({ ...trace, error: (e as Error).message });
            }
            cells[v].done++;
            onProgress({ ...cells });
          });
        }
      }
    }
  }
  onProgress({ ...cells });
  await pool(jobs, 8);
}
