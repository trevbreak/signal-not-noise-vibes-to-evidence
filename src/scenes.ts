import type { Stage } from "./lib/types";
import { VARIANT } from "./variants";

// ─────────────────────────────────────────────────────────────────────────────
// The talk's content lives in src/variants/: one file per telling (Aussie, Gen Z, PM).
// This file holds what every telling shares, and re-exports the one that's running.
// ─────────────────────────────────────────────────────────────────────────────

export const V = VARIANT;
export const { PROMPTS, RUBRIC, APP_CODES, JUDGE_CODES } = VARIANT;
/** The running order: every scene the telling defines, minus any marked `cut`. */
export const SCENES = VARIANT.SCENES.filter((s) => !s.cut);

/** Minutes each act may take, in running order. The presenter view checks the clock against them. */
export const ACT_BUDGET: { prefix: string; minutes: number }[] = [
  { prefix: "Open", minutes: 1 },
  { prefix: "0 ", minutes: 2 },
  { prefix: "1 ", minutes: 3 },
  { prefix: "2 ", minutes: 6 },
  { prefix: "3 ", minutes: 4 },
  { prefix: "4 ", minutes: 2 },
  { prefix: "5 ", minutes: 2 },
  { prefix: "6 ", minutes: 4 },
  { prefix: "7 ", minutes: 1 },
];

/** The clock time (in seconds) by which the act this scene belongs to should be finished. */
export function actDeadline(act: string): number | null {
  let total = 0;
  for (const a of ACT_BUDGET) {
    total += a.minutes;
    if (act.startsWith(a.prefix) || (a.prefix === "7 " && act === "Close")) return total * 60;
  }
  return null;
}
export const APP_NAME = VARIANT.appName;

// The macro mental model. Every scene is tagged with the stage it's teaching,
// and the top bar shows where we are in the loop.
export const LOOP: { id: Stage; label: string; blurb: string; group?: "define" | "test" }[] = [
  { id: "prioritise", label: "Prioritise", blurb: "Pick what matters most. Don't try to build everything at once.", group: "define" },
  { id: "define", label: "Define", blurb: "Write down what good and bad look like: a marking guide.", group: "define" },
  { id: "collect", label: "Collect", blurb: "Real examples, good, bad and borderline, marked by people who know.", group: "define" },
  { id: "run", label: "Run", blurb: "Run the app." },
  { id: "test", label: "Test", blurb: "Turn the guide and examples into judges that mark every answer.", group: "test" },
  { id: "iterate", label: "Iterate", blurb: "Check the judges, write down why you disagree, and improve them.", group: "test" },
];

export const LOOP_GROUPS = {
  define: "Define and show what good (and bad) looks like",
  test: "Test and iterate",
} as const;

