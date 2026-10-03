import type { PromptVersion, Scene } from "../lib/types";

// A variant is one telling of the talk: the same story and the same screens, with a different
// translator. Everything the audience reads or hears that's specific to the theme lives here.

// "agile" is parked (see docs/variant-ideas.md): the file still builds, but it isn't in the picker.
export type VariantId = "aussie" | "genz" | "pm" | "agile";

export type ImageChapter = {
  id: string;
  label: string;
  /** Source file: images/<image>.jpg. The rewritten one: images/<variant images dir>/<image>.png */
  image: string;
  /** What the presenter says before revealing. */
  setup: string;
  /** The point, shown once the judges have marked it. */
  lesson: string;
  purposes?: boolean;
  /** With `purposes`: why the real one must stay exactly as it is. */
  dontTouch?: string;
};

export type Variant = {
  id: VariantId;
  /** For the presenter's picker. */
  label: string;
  appName: string;
  logo: string;
  /** The output pane's label in the app. */
  outLabel: string;
  /** The button that rewrites a picture or a voice notice. */
  verb: string;
  verbing: string;
  /** What we turn text into, in a phrase: "Aussie slang". */
  style: string;
  /** The voice the improved instructions must keep. Left out: the server's default (Aussie). */
  voice?: string;
  PROMPTS: Record<string, PromptVersion>;
  RUBRIC: { id: string; name: string; short: string }[];
  APP_CODES: string[];
  JUDGE_CODES: string[];
  SCENES: Scene[];
  images: { dir: string; editPrompt: string; chapters: ImageChapter[] };
  audio: { notice: string; context: string; voice: string; textTitle: string; spokenBlurb: string };
  /** The worked example on "Turn the guide into judges". */
  testExample: {
    source: string;
    answer: string;
    /** Per marking-guide line: did it pass? */
    marks: Record<string, boolean>;
    numbersReason: string;
    ruleReason: string;
    roomReason: string;
  };
};
