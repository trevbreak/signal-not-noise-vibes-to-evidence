export type Meters = { vibes: number; evidence: number };

export type PromptVersion = {
  id: string;
  /** Short, plain-language name shown on the version pills. */
  label: string;
  /** What we tell the model, exactly as you'd type it into a new chat. The English text is appended after it. */
  instructions: string;
};

export type Case = {
  id: string;
  text: string;
  /** Presenter-only hint: what good looks like / why this case is here. */
  hint?: string;
};

export type CodeCheckId = "no-preamble" | "length-ratio" | "numbers" | "placeholders" | "hollywood" | "glossary";

export type Judge =
  | { id: string; name: string; kind: "code"; check: CodeCheckId; terms?: string[]; blurb: string }
  | { id: string; name: string; kind: "llm"; rubric: string; withContext: boolean; blurb: string }
  | { id: string; name: string; kind: "human"; blurb: string };

export type Verdict = { pass: boolean; reason: string };

export type RunResult = {
  runId: string;
  traceId: string;
  output?: string;
  error?: string;
  latencyMs?: number;
  replayed?: boolean;
  verdicts: Record<string, Verdict | "pending">;
};

export type Stage = "prioritise" | "define" | "collect" | "run" | "test" | "iterate";

type SceneBase = {
  id: string;
  act: string;
  /** Presenter notes. One beat per line; **bold** marks what to press. */
  notes?: string;
  meters: Meters;
  stage?: Stage;
  /** Cut from the running order (kept so it can come back). Say why. */
  cut?: string;
};

export type SlideScene = SceneBase & {
  kind: "slide";
  layout: "title" | "statement" | "bullets" | "table" | "loop" | "scorecards" | "judges";
  title: string;
  kicker?: string;
  subtitle?: string;
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
  footnote?: string;
  /** Extra steps revealed with → before moving to the next scene. */
  builds?: number;
  /** Reveal the subtitle, each table row / bullet, then the footnote, one click at a time. */
  reveal?: boolean;
  /** What to say at each build step (index 0 = when the slide first appears). Shown in the presenter view. */
  talk?: string[];
  /** Show the side-by-side from the "main" lab under the statement: the evidence for the claim. */
  evidence?: "compare";
  /** Worked examples marked against the marking guide (the "collect" slide). */
  scorecards?: Scorecard[];
};

/** Scores out of 5 per marking-guide line; null = doesn't apply to this answer. */
export type Scores = Record<string, number | null>;

export type Scorecard = {
  label: "good" | "borderline" | "bad";
  source: string;
  output: string;
  scores: Scores;
  verdict: string;
  why: string;
};

export type LabScene = SceneBase & {
  kind: "lab";
  title: string;
  /** Scenes with the same labId share one translator: same instructions, results and history. */
  labId?: string;
  /** Instruction versions for this lab, in order. F reveals the next one. */
  versions: string[];
  /** Version to switch to when this scene opens, if the lab hasn't reached it yet. */
  enterVersion?: string;
  /** Background the AI judges get. Never shown on screen. */
  context?: string;
  cases: Case[];
  /** Checks for this scene, in reveal order. J reveals the next one. */
  judges: Judge[];
  /** Checks already showing when the scene opens. */
  judgesOn: string[];
  /** Show the big "real app" mock. */
  showApp?: boolean;
  /** Once a new version has answers, show every phrase side by side: the previous version vs this one. */
  compare?: boolean;
};

export type ImageScene = SceneBase & { kind: "image"; title: string };
export type AudioScene = SceneBase & { kind: "audio"; title: string };
export type TracesScene = SceneBase & { kind: "traces"; title: string };
export type ScoreboardScene = SceneBase & { kind: "scoreboard"; title: string };

export type GoldenExample = {
  id: string;
  source: string;
  output: string;
  label: "good" | "bad" | "borderline";
  why: string;
  /** Optional marks against the marking guide, shown when this example is explained. */
  scores?: Scores;
};

export type GoldenScene = SceneBase & {
  kind: "golden";
  title: string;
  examples: GoldenExample[];
  /** The first rows arrive one click at a time with an explanation; the next click brings in the rest. */
  explain?: { source: string; text: string }[];
  talk?: string[];
};

/** A real (or rehearsal-made) answer for the room to review, with the notes we'd write if nobody shouts one out. */
export type ReviewItem = {
  id: string;
  source: string;
  output: string;
  /**
   * Per judge: what it SHOULD say, and why. Drives the ✨ example notes, so the presenter can
   * speed through whatever the live judge actually said.
   */
  expected: Record<string, ExpectedMark>;
};

export type ExpectedMark = {
  pass: boolean;
  /** Our reasoning, in plain words. Used as the note. */
  why: string;
  /** What went wrong with the translation (when it should fail). Defaults to "Something else". */
  appCode?: string;
  /** What the judge got wrong, if it disagrees with us. Defaults to too strict / too lenient. */
  judgeCode?: string;
};

type FlowBase = SceneBase & {
  title: string;
  context: string;
  /** The instructions these answers came from. "Improve the instructions" writes the next version. */
  instructions: string;
  judges: Judge[];
  items: ReviewItem[];
  /** Per judge: labelled answers it must still get right after it's improved (label = what THIS judge should say). */
  judgeChecks: Record<string, GoldenExample[]>;
  /** More English phrases to re-run before vs after. */
  rerunPhrases: string[];
};
export type ReviewScene = FlowBase & { kind: "review" };
export type ImproveScene = FlowBase & { kind: "improve" };
export type RerunScene = FlowBase & { kind: "rerun" };
export type FlowScene = ReviewScene | ImproveScene | RerunScene;

export type Scene = SlideScene | LabScene | ImageScene | AudioScene | TracesScene | ScoreboardScene | GoldenScene | ReviewScene | ImproveScene | RerunScene;

export type Trace = {
  id: string;
  ts: number;
  sceneId: string;
  promptVersion: string;
  promptEdited: boolean;
  model: string;
  caseId: string;
  source: string;
  prompt: string;
  output?: string;
  error?: string;
  latencyMs?: number;
  inputTokens?: number;
  replayed?: boolean;
  /** Part of a Run / Run×10 batch, so it counts towards the scoreboard. */
  batchId: string;
  verdicts: Record<string, Verdict>;
  judgeNames: Record<string, string>;
  human?: "up" | "down";
  note?: string;
};
