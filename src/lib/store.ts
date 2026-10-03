import { create } from "zustand";
import { get, set } from "idb-keyval";
import { variantKey } from "../variants";
import { PROMPTS } from "../scenes";
import type { Case, LabScene, RunResult, Trace, Verdict } from "./types";
import { health, setReplayMode, type Health } from "./api";
import { SCENES } from "../scenes";

export type LabState = {
  versionIdx: number;
  /** Furthest version revealed so far. Later versions stay hidden so the pills don't spoil the story. */
  maxVersionIdx: number;
  instructions: string;
  /** True once the presenter has typed in the instructions box. */
  edited: boolean;
  /** Bumped on every version change, to trigger the typewriter reveal. */
  revealKey: number;
  previousInstructions: string;
  judgesOn: string[];
  results: Record<string, RunResult[]>;
  /** What the previous version said for each phrase, shown underneath for before/after. */
  before: Record<string, { label: string; output: string }>;
  /** Phrases typed into the app live (audience suggestions). */
  customCases: Case[];
  selectedCaseId: string | null;
};

type Store = {
  sceneIndex: number;
  /** Which build step of the current slide is showing. */
  build: number;
  health: Health | null;
  replay: boolean;
  notesOpen: boolean;
  theme: "dark" | "light";
  modelOverride: string | null;
  labs: Record<string, LabState>;
  running: Record<string, boolean>;
  traces: Trace[];

  go: (delta: number) => void;
  goTo: (i: number, build?: number) => void;
  toggleReplay: () => void;
  toggleNotes: () => void;
  toggleTheme: () => void;
  setModelOverride: (m: string | null) => void;
  lab: (scene: LabScene) => LabState;
  patchLab: (scene: LabScene, patch: Partial<LabState> | ((l: LabState) => Partial<LabState>)) => void;
  setVersion: (scene: LabScene, idx: number) => void;
  revealNextJudge: (scene: LabScene) => string | null;
  setRunning: (key: string, on: boolean) => void;
  setResults: (scene: LabScene, caseId: string, fn: (prev: RunResult[]) => RunResult[]) => void;
  addTrace: (t: Trace) => void;
  updateTrace: (id: string, patch: Partial<Trace>) => void;
  setVerdict: (traceId: string, judgeId: string, judgeName: string, v: Verdict) => void;
  clearTraces: () => void;
  resetLabs: () => void;
};

export const labKey = (scene: LabScene) => scene.labId ?? scene.id;

/** How many → presses a slide takes before moving on. */
export function buildCount(scene: (typeof SCENES)[number]): number {
  if (scene.kind === "golden") return scene.explain?.length ? scene.explain.length + 1 : 0;
  if (scene.kind !== "slide") return 0;
  if (scene.builds !== undefined) return scene.builds;
  if (!scene.reveal) return 0;
  const items = scene.table?.rows.length ?? scene.bullets?.length ?? scene.scorecards?.length ?? (scene.subtitle ? 1 : 0);
  return items + (scene.footnote ? 1 : 0);
}

/** Select the next or previous phrase in a lab (arrow keys). */
export function movePhrase(scene: LabScene, delta: number) {
  const s = useStore.getState();
  const lab = s.lab(scene);
  const all = [...scene.cases, ...lab.customCases];
  const i = Math.max(0, all.findIndex((c) => c.id === lab.selectedCaseId));
  const next = all[Math.max(0, Math.min(all.length - 1, i + delta))];
  s.patchLab(scene, { selectedCaseId: next.id });
}
export const shortLabel = (versionId: string) => PROMPTS[versionId].label.split(" · ")[0];

const initialHash = Number(location.hash.replace("#", "")) || 0;

/** The judges switched on: the scene's own defaults, plus any revealed live (labs can be shared between scenes). */
export const judgesOn = (scene: LabScene, lab: LabState) => [...new Set([...scene.judgesOn, ...lab.judgesOn])];

function freshLab(scene: LabScene): LabState {
  const p = PROMPTS[scene.versions[0]];
  return {
    versionIdx: 0,
    maxVersionIdx: 0,
    instructions: p.instructions,
    edited: false,
    revealKey: 0,
    previousInstructions: p.instructions,
    judgesOn: [...scene.judgesOn],
    results: {},
    before: {},
    customCases: [],
    selectedCaseId: null,
  };
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
function persistTraces(traces: Trace[]) {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => set(variantKey("traces"), traces), 300);
}

export const useStore = create<Store>((setState, getState) => ({
  sceneIndex: Math.min(initialHash, SCENES.length - 1),
  build: 0,
  health: null,
  replay: false,
  notesOpen: false,
  theme: (localStorageGet("theme") as "dark" | "light") || "dark",
  modelOverride: null,
  labs: {},
  running: {},
  traces: [],

  go: (delta) => {
    // Slides with builds step through them before moving on, like a clicker would.
    const { sceneIndex, build } = getState();
    const builds = buildCount(SCENES[sceneIndex]);
    if (delta > 0 && build < builds) return setState({ build: build + 1 });
    if (delta < 0 && build > 0) return setState({ build: build - 1 });
    const prev = SCENES[sceneIndex + delta];
    // Going back lands on the fully built slide.
    getState().goTo(sceneIndex + delta, delta < 0 && prev ? buildCount(prev) : 0);
  },
  goTo: (i, build = 0) => {
    const sceneIndex = Math.max(0, Math.min(SCENES.length - 1, i));
    history.replaceState(null, "", `${location.search}#${sceneIndex}`);
    setState({ sceneIndex, build });
  },
  toggleReplay: () => {
    const replay = !getState().replay;
    setReplayMode(replay);
    setState({ replay });
  },
  toggleNotes: () => setState((s) => ({ notesOpen: !s.notesOpen })),
  toggleTheme: () => {
    const theme = getState().theme === "dark" ? "light" : "dark";
    localStorageSet("theme", theme);
    setState({ theme });
  },
  setModelOverride: (modelOverride) => setState({ modelOverride }),

  lab: (scene) => getState().labs[labKey(scene)] ?? freshLab(scene),
  patchLab: (scene, patch) =>
    setState((s) => {
      const key = labKey(scene);
      const cur = s.labs[key] ?? freshLab(scene);
      const p = typeof patch === "function" ? patch(cur) : patch;
      return { labs: { ...s.labs, [key]: { ...cur, ...p } } };
    }),
  setVersion: (scene, idx) => {
    const cur = getState().lab(scene);
    const i = Math.max(0, Math.min(scene.versions.length - 1, idx));
    if (i === cur.versionIdx && !cur.edited) return;
    // Keep what the old version said, so every phrase can show before and after.
    const label = cur.edited ? `${shortLabel(scene.versions[cur.versionIdx])} (edited)` : shortLabel(scene.versions[cur.versionIdx]);
    const before = { ...cur.before };
    for (const [caseId, runs] of Object.entries(cur.results)) {
      const first = runs.find((r) => r.output);
      if (first?.output) before[caseId] = { label, output: first.output };
    }
    const p = PROMPTS[scene.versions[i]];
    getState().patchLab(scene, {
      versionIdx: i,
      maxVersionIdx: Math.max(cur.maxVersionIdx, i),
      instructions: p.instructions,
      edited: false,
      previousInstructions: cur.instructions,
      revealKey: cur.revealKey + 1,
      results: {},
      before,
    });
  },
  revealNextJudge: (scene) => {
    const cur = getState().lab(scene);
    const on = judgesOn(scene, cur);
    const next = scene.judges.find((j) => !on.includes(j.id));
    if (!next) return null;
    getState().patchLab(scene, { judgesOn: [...cur.judgesOn, next.id] });
    return next.id;
  },
  setRunning: (key, on) => setState((s) => ({ running: { ...s.running, [key]: on } })),
  setResults: (scene, caseId, fn) =>
    getState().patchLab(scene, (lab) => ({ results: { ...lab.results, [caseId]: fn(lab.results[caseId] ?? []) } })),
  addTrace: (t) =>
    setState((s) => {
      const traces = [...s.traces, t];
      persistTraces(traces);
      return { traces };
    }),
  updateTrace: (id, patch) =>
    setState((s) => {
      const traces = s.traces.map((t) => (t.id === id ? { ...t, ...patch } : t));
      persistTraces(traces);
      return { traces };
    }),
  setVerdict: (traceId, judgeId, judgeName, v) =>
    setState((s) => {
      const traces = s.traces.map((t) =>
        t.id === traceId
          ? { ...t, verdicts: { ...t.verdicts, [judgeId]: v }, judgeNames: { ...t.judgeNames, [judgeId]: judgeName } }
          : t,
      );
      persistTraces(traces);
      return { traces };
    }),
  clearTraces: () => {
    set(variantKey("traces"), []);
    setState({ traces: [] });
  },
  resetLabs: () => {
    set(variantKey("labs"), {});
    setState({ labs: {}, running: {} });
  },
}));

// Survive an accidental refresh mid-talk: keep every lab's instructions, answers and history.
let labsTimer: ReturnType<typeof setTimeout> | undefined;
useStore.subscribe((s, prev) => {
  if (s.labs === prev.labs) return;
  clearTimeout(labsTimer);
  labsTimer = setTimeout(() => set(variantKey("labs"), s.labs), 400);
});

export async function bootStore() {
  const [h, traces, labs] = await Promise.all([health(), get<Trace[]>(variantKey("traces")), get<Record<string, LabState>>(variantKey("labs"))]);
  // Instructions may have been rewritten in scenes.ts since this browser last saved: refresh any the presenter didn't edit.
  const fixed: Record<string, LabState> = { ...(labs ?? {}) };
  for (const sc of SCENES) {
    if (sc.kind !== "lab" || !fixed[labKey(sc)]) continue;
    const lab = fixed[labKey(sc)];
    const v = sc.versions[lab.versionIdx];
    if (!lab.edited && v && PROMPTS[v]) fixed[labKey(sc)] = { ...lab, instructions: PROMPTS[v].instructions };
  }
  // A reload mid-run leaves work that will never finish: drop half-made answers, and unmark
  // half-marked ones so the judges mark them again.
  for (const [k, lab] of Object.entries(fixed)) {
    const results = Object.fromEntries(
      Object.entries(lab.results).map(([caseId, runs]) => [
        caseId,
        runs
          .filter((r) => r.output || r.error)
          .map((r) => ({ ...r, verdicts: Object.fromEntries(Object.entries(r.verdicts).filter(([, v]) => v !== "pending")) })),
      ]),
    );
    fixed[k] = { ...lab, results };
  }
  useStore.setState({ health: h, traces: traces ?? [], labs: fixed });
}

function localStorageGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function localStorageSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode: theme just won't persist */
  }
}
