import type { Stage } from "./lib/types";
import { VARIANT } from "./variants";

// ─────────────────────────────────────────────────────────────────────────────
// The talk's content lives in src/variants/: one file per telling (Aussie, Agile).
// This file holds what every telling shares, and re-exports the one that's running.
// ─────────────────────────────────────────────────────────────────────────────

export const V = VARIANT;
export const { PROMPTS, RUBRIC, APP_CODES, JUDGE_CODES, SCENES } = VARIANT;
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

