import { create } from "zustand";
import { get, set } from "idb-keyval";
import { post } from "./api";
import { compose, currentModel, judgeOutput, pool } from "./runner";
import { APP_CODES, JUDGE_CODES, V } from "../scenes";
import { variantKey } from "../variants";
import type { FlowScene, Judge, ReviewItem, Verdict } from "./types";

// Act 6: the room reviews what the judges said, codes the disagreements, and the AI uses
// that feedback to improve the instructions and the judges. Then we re-run and compare.

export type Response = { agree: boolean; code?: string; comment?: string };
export type Version = { label: string; text: string; changes?: string[] };
type Mark = { output: string; verdicts: Record<string, Verdict> };
export type RerunRow = { phrase: string; before?: Mark; after?: Mark };
export type JudgeCheckRow = { source: string; output: string; expectPass: boolean; before?: Verdict; after?: Verdict };

type FlowState = {
  selected: string | null;
  verdicts: Record<string, Record<string, Verdict | "pending">>;
  responses: Record<string, Response>;
  prompts: Version[];
  rubrics: Record<string, Version[]>;
  rerun: { rows: RerunRow[]; judges: Record<string, JudgeCheckRow[]> } | null;
  busy: string | null;
  error: string | null;
};

const initial: FlowState = {
  selected: null,
  verdicts: {},
  responses: {},
  prompts: [],
  rubrics: {},
  rerun: null,
  busy: null,
  error: null,
};

export const useFlow = create<FlowState>(() => ({ ...initial }));

// Survive a refresh mid-talk, like the labs do.
let timer: ReturnType<typeof setTimeout> | undefined;
useFlow.subscribe((s) => {
  clearTimeout(timer);
  timer = setTimeout(() => set(variantKey("flow"), { ...s, busy: null }), 400);
});
export async function bootFlow() {
  const saved = await get<FlowState>(variantKey("flow"));
  if (!saved) return;
  // A reload mid-marking would leave judges "marking…" forever: mark everything again instead.
  const stuck = Object.values(saved.verdicts).some((v) => Object.values(v).some((x) => x === "pending"));
  const rerunStuck = saved.rerun?.rows.some((r) => !r.before || !r.after);
  useFlow.setState({ ...initial, ...saved, verdicts: stuck ? {} : saved.verdicts, rerun: rerunStuck ? null : saved.rerun, busy: null, error: null });
}
export function resetFlow() {
  useFlow.setState({ ...initial });
}

export const responseKey = (itemId: string, judgeId: string) => `${itemId}:${judgeId}`;

export const currentInstructions = (scene: FlowScene) => useFlow.getState().prompts.at(-1)?.text ?? scene.instructions;

const rubricOf = (j: Judge, rubrics: FlowState["rubrics"]) => (j.kind === "llm" ? (rubrics[j.id]?.at(-1)?.text ?? j.rubric) : undefined);

/** The scene's judges with any improved marking guides swapped in. */
export function currentJudges(scene: FlowScene): Judge[] {
  const { rubrics } = useFlow.getState();
  return scene.judges.map((j) => (j.kind === "llm" ? { ...j, rubric: rubricOf(j, rubrics)! } : j));
}

async function step<T>(label: string, fn: () => Promise<T>) {
  useFlow.setState({ busy: label, error: null });
  try {
    return await fn();
  } catch (e) {
    useFlow.setState({ error: (e as Error).message });
  } finally {
    useFlow.setState({ busy: null });
  }
}

/** Mark every review item with the ORIGINAL judges (this is what the room reviews). */
export function runReviewJudges(scene: FlowScene) {
  return step("The judges are marking…", async () => {
    const pending = Object.fromEntries(scene.judges.map((j) => [j.id, "pending" as const]));
    useFlow.setState({ verdicts: Object.fromEntries(scene.items.map((i) => [i.id, { ...pending }])) });
    await Promise.all(
      scene.items.map((item) =>
        judgeOutput(scene.judges, item.source, item.output, scene.context, (jid, v) =>
          useFlow.setState((s) => ({ verdicts: { ...s.verdicts, [item.id]: { ...s.verdicts[item.id], [jid]: v } } })),
        ),
      ),
    );
  });
}

export function respond(itemId: string, judgeId: string, r: Partial<Response>) {
  useFlow.setState((s) => {
    const k = responseKey(itemId, judgeId);
    const prev = s.responses[k];
    // Switching between agree and disagree starts the coding afresh.
    const next = r.agree !== undefined && prev && prev.agree !== r.agree ? { agree: r.agree } : { ...prev, ...r };
    return { responses: { ...s.responses, [k]: next as Response } };
  });
}

/** What we'd say about this judge's mark, from the rehearsal notes: for speeding through on stage. */
function exampleResponse(item: ReviewItem, judgeId: string, v: Verdict): Response | null {
  const e = item.expected[judgeId];
  if (!e) return null;
  if (v.pass === e.pass) return v.pass ? { agree: true } : { agree: true, code: e.appCode ?? APP_CODES.at(-1)!, comment: e.why };
  // JUDGE_CODES starts with "too strict" then "too lenient".
  return { agree: false, code: e.judgeCode ?? JUDGE_CODES[v.pass ? 1 : 0], comment: e.why };
}

/** Fill in our example note for one judge, or every judge on the answer. Only judges that have marked it. */
export function applyExample(item: ReviewItem, judgeIds: string[]) {
  const { verdicts, responses } = useFlow.getState();
  const next = { ...responses };
  for (const id of judgeIds) {
    const v = verdicts[item.id]?.[id];
    const r = isVerdict(v) && exampleResponse(item, id, v);
    if (r) next[responseKey(item.id, id)] = r;
  }
  useFlow.setState({ responses: next });
}

export const hasExample = (item: ReviewItem, judgeId: string) => !!item.expected[judgeId];

/** Agreeing with a ✗ means the translation is bad: feedback for the instructions. */
export function promptFeedback(scene: FlowScene) {
  const { verdicts, responses } = useFlow.getState();
  return scene.items.flatMap((item) =>
    scene.judges
      .map((j) => ({ j, v: verdicts[item.id]?.[j.id], r: responses[responseKey(item.id, j.id)] }))
      .filter(({ v, r }) => r?.agree && isVerdict(v) && !v.pass && r.code)
      .map(({ j, r }) => ({ item, judge: j, code: r!.code!, comment: r!.comment ?? "" })),
  );
}

/** Disagreeing means the judge is wrong: feedback for that judge. */
export function judgeFeedback(scene: FlowScene) {
  const { verdicts, responses } = useFlow.getState();
  return scene.items.flatMap((item) =>
    scene.judges
      .map((j) => ({ j, v: verdicts[item.id]?.[j.id], r: responses[responseKey(item.id, j.id)] }))
      .filter(({ v, r }) => r && !r.agree && isVerdict(v) && r.code)
      .map(({ j, v, r }) => ({ item, judge: j, verdict: v as Verdict, code: r!.code!, comment: r!.comment ?? "" })),
  );
}

export function improvePrompt(scene: FlowScene) {
  return step("Rewriting the instructions from our feedback…", async () => {
    // One note per answer, even if several judges flagged it.
    const seen = new Set<string>();
    const feedback = promptFeedback(scene)
      .filter((f) => !seen.has(f.item.id + f.code) && seen.add(f.item.id + f.code))
      .map((f) => ({ source: f.item.source, output: f.item.output, code: f.code, comment: f.comment }));
    const res = await post<{ instructions: string; changes: string[] }>("/api/improve-prompt", {
      instructions: currentInstructions(scene),
      feedback,
      // Aussie leaves this out so rehearsal recordings still match.
      ...(V.voice ? { voice: V.voice } : {}),
    });
    useFlow.setState((s) => ({
      prompts: [...s.prompts, { label: `Version ${s.prompts.length + 3} · from our feedback`, text: res.instructions, changes: res.changes }],
      rerun: null,
    }));
  });
}

export function improveJudge(scene: FlowScene, judgeId: string) {
  return step("Rewriting the judge from our feedback…", async () => {
    const judge = scene.judges.find((j) => j.id === judgeId);
    if (!judge || judge.kind !== "llm") return;
    const { verdicts, responses, rubrics } = useFlow.getState();
    const notes = judgeFeedback(scene)
      .filter((f) => f.judge.id === judgeId)
      .map((f) => ({
        source: f.item.source,
        output: f.item.output,
        label: f.verdict.pass ? "bad" : "good",
        judgeSaid: `${f.verdict.pass ? "pass" : "fail"}: ${f.verdict.reason}`,
        reasoning: `${f.code}. ${f.comment}`,
      }));
    // What it already gets right must stay right: answers we agreed on, plus labelled examples.
    const keep = [
      ...scene.items
        .filter((i) => responses[responseKey(i.id, judgeId)]?.agree)
        .map((i) => {
          const v = verdicts[i.id]?.[judgeId] as Verdict;
          return { source: i.source, output: i.output, label: v.pass ? "good" : "bad", reasoning: v.reason };
        }),
      ...(scene.judgeChecks[judgeId] ?? []).map((g) => ({ source: g.source, output: g.output, label: g.label, reasoning: g.why })),
    ];
    const res = await post<{ rubric: string; changes: string[] }>("/api/refine-rubric", {
      rubric: rubricOf(judge, rubrics),
      context: scene.context,
      scope: `${judge.name}: ${judge.blurb}`,
      others: scene.judges.filter((j) => j.id !== judgeId).map((j) => j.name),
      notes,
      keep,
      ...(V.voice ? { voice: V.voice } : {}),
    });
    useFlow.setState((s) => ({
      rubrics: {
        ...s.rubrics,
        [judgeId]: [...(s.rubrics[judgeId] ?? []), { label: `Guide ${(s.rubrics[judgeId]?.length ?? 0) + 2} · from our feedback`, text: res.rubric, changes: res.changes }],
      },
      rerun: null,
    }));
  });
}

/** Before vs after, for the instructions and for every judge we improved. */
export function rerun(scene: FlowScene) {
  return step("Running everything again…", async () => {
    const judgesNow = currentJudges(scene);
    const phrases = [...new Set([...scene.items.map((i) => i.source), ...scene.rerunPhrases])];
    const rows: RerunRow[] = phrases.map((phrase) => ({ phrase }));
    const improved = scene.judges.filter((j) => j.kind === "llm" && useFlow.getState().rubrics[j.id]?.length);
    const { verdicts, responses } = useFlow.getState();

    // What we expect each improved judge to say: our review decisions, then labelled examples.
    const checks: Record<string, JudgeCheckRow[]> = Object.fromEntries(
      improved.map((j) => [
        j.id,
        [
          ...scene.items.flatMap((i) => {
            const v = verdicts[i.id]?.[j.id];
            const r = responses[responseKey(i.id, j.id)];
            if (!isVerdict(v) || !r) return [];
            return [{ source: i.source, output: i.output, expectPass: r.agree ? v.pass : !v.pass }];
          }),
          ...(scene.judgeChecks[j.id] ?? []).map((g) => ({ source: g.source, output: g.output, expectPass: g.label === "good" })),
        ],
      ]),
    );
    useFlow.setState({ rerun: { rows, judges: checks } });
    const update = () => useFlow.setState({ rerun: { rows: [...rows], judges: { ...checks } } });

    const jobs: (() => Promise<void>)[] = [];
    for (const row of rows) {
      for (const side of ["before", "after"] as const) {
        jobs.push(async () => {
          const instructions = side === "before" ? scene.instructions : currentInstructions(scene);
          const res = await post<{ text: string }>("/api/translate", { model: currentModel(), user: compose(instructions, row.phrase) });
          const mark: Mark = { output: res.text.trim(), verdicts: {} };
          row[side] = mark;
          update();
          // Same ruler for both sides: today's (improved) judges.
          await judgeOutput(judgesNow, row.phrase, mark.output, scene.context, (jid, v) => {
            mark.verdicts[jid] = v;
            update();
          });
        });
      }
    }
    for (const j of improved) {
      const before = scene.judges.find((x) => x.id === j.id)!;
      const after = judgesNow.find((x) => x.id === j.id)!;
      for (const row of checks[j.id]) {
        for (const [side, judge] of [
          ["before", before],
          ["after", after],
        ] as const) {
          jobs.push(() =>
            judgeOutput([judge], row.source, row.output, scene.context, (_, v) => {
              row[side] = v;
              update();
            }),
          );
        }
      }
    }
    await pool(jobs, 8);
  });
}

export function isVerdict(v: Verdict | "pending" | undefined): v is Verdict {
  return !!v && v !== "pending";
}
