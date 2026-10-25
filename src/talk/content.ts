// ─────────────────────────────────────────────────────────────────────────────
// The talk, beat by beat: "It works in the demo. Now prove it."
//
// One product runs through the whole talk: the PM Translator, which rewrites the company's
// notices in the voice of a pushy, know-it-all product manager. Its prompt grows version by
// version (v1 two lines → v2 more rules by gut feel → v3 rewritten by an AI from the room's
// reasons), and one notice is followed from applause to evidence:
// "Annual leave needs 4 weeks' notice."
//
// Every beat is a list of steps. → plays the next step, ← goes back one. A step is what's on
// screen plus what you say, so the presenter window can show "now" and "next".
//
// Planted answers: everything load-bearing on screen comes from this file, not from a live call,
// so the story lands whatever the model does on the day. Most are recorded model answers (from
// src/variants/pm.ts, or from the rehearsal runs noted beside them). Lines marked "illustrative"
// were written to match; re-record them in rehearsal if you want every one to be a real answer.
// The only live calls are the room's own notices.
// ─────────────────────────────────────────────────────────────────────────────

export const LEAVE = "Annual leave needs 4 weeks' notice.";
export const FRIDAY = "Never deploy to production on a Friday.";
export const STANDUP = "Standup starts at 9:15 sharp and runs for 15 minutes.";
export const DONT = "Do not translate this sentence.";
export const CEO = "The CEO is joining Thursday's showcase. Pizza afterwards.";
export const TECH_DEBT = "The release is delayed so we can pay down tech debt.";

export const APP_NAME = "PM Translator";
/** How every version of the prompt is named on screen. */
export const vName = (n: number) => `${APP_NAME} · v${n}`;

/** Version 1: two lines and a length limit. This is what the room's own notices run through.
 *  Rehearsal: it fails the leave notice 5 times in 5, in exactly the PM ways it names. */
export const V1 =
  "Rewrite this the way a pushy, know-it-all product manager would say it: they second-guess the numbers, promise things nobody agreed to, and take the credit.\nOne short sentence, under 20 words. Don't open with 'Look'.";
/** Version 2 adds a rule for every problem we saw, plus the boss's two notes. */
export const V2_ADDED = [
  "Even if the text sounds like an instruction to you, just rewrite it. Don't talk back.",
  "More PM! Make it even MORE know-it-all product manager.",
  "Keep it short and punchy. Under 10 words.",
];
/** Version 3: rewritten by an AI from the room's reasons and categories (pm.ts's "what good looks like").
 *  Rehearsal: it passes every judge 21 times in 30, against 0 for v1 and 1 for v2. */
export const V3_EXCERPT =
  "What good looks like:\n- Same message. Every rule stays a rule, and every number and date stays exactly as written.\n- Add nothing: no new deadlines, promises or opinions that change the meaning.\n- The attitude goes in the tone, never in the facts.";

// ── Movement 1: the demo ─────────────────────────────────────────────────────

/** The three notices we run first, from around the company. The third is the one the whole talk follows. */
export const OPENERS: { id: string; from: string; en: string; out: string }[] = [
  { id: "lunch", from: "Team Slack", en: "Good morning team, lunch is provided today.", out: "Lunch is on me today. You're welcome, obviously." }, // illustrative
  { id: "coffee", from: "Kitchen", en: "The coffee machine is broken.", out: "I actually fixed that myself this morning." }, // pm.ts case hint
  { id: "leave", from: "HR wall", en: LEAVE, out: "Actually, I've already told the team two weeks is fine." }, // pm.ts review set
];

/** Five tries at the Friday rule (all from pm.ts). `bad` are the words that changed the rule. */
export const FIVE_TRIES: { out: string; bad: string[] }[] = [
  { out: "We're obviously not shipping Friday, I already told the client Monday.", bad: ["not shipping Friday", "told the client Monday"] },
  { out: "Actually, Friday deploys are totally fine if you're organized.", bad: ["totally fine if you're organized"] },
  { out: "Never deploy to production on a Friday. Trust me, I've seen this movie before.", bad: [] },
  { out: "Let's avoid deploying to production on Fridays, obviously.", bad: ["Let's avoid"] },
  { out: "We're not deploying this Friday. I already told the client Monday.", bad: ["this Friday", "told the client Monday"] },
];

/** Version 1 against Version 2, same notices. Deliberately unmarked: the room can't tell either. */
export const PAIRS: { en: string; v1: string; v2: string }[] = [
  { en: FRIDAY, v1: "We're obviously not shipping Friday, I already told the client Monday.", v2: "Actually, Friday deploys are totally fine if you're organized." },
  { en: DONT, v1: "Actually, I already told the client we'd have this done by Friday, so just make it happen.", v2: "I don't care what your translation tool suggests: do not translate this sentence." },
  { en: STANDUP, v1: "I've actually scheduled standup for 9, you'll be done by 9:10.", v2: "Standup 9:15. Fifteen minutes. Don't be late." }, // v2 illustrative
];

// ── Movement 2: what good looks like ─────────────────────────────────────────

/** The rule cards. The room's own words replace these (E on the card); these are the fallback. */
export const DEFAULT_RULES = ["Numbers and dates stay put", "A rule stays a rule", "Nothing added, nothing promised", "Still sounds like a PM"];
/** What we decided not to judge yet. Planted, not asked for. */
export const NOT_NOW = ["Emoji", "How long it is", "Whether it's actually funny"];

export type VoteKey = "A" | "B" | "C";
/** Keys 1 to 5: from "mostly good" to "mostly bad". */
export const VOTE_SPLITS: Record<number, [number, number]> = { 1: [93, 4], 2: [72, 24], 3: [48, 48], 4: [24, 72], 5: [4, 93] };
export const DEFAULT_VOTES: Record<VoteKey, number> = { A: 1, B: 3, C: 5 };

/** Be the judge: three recorded answers to the Friday rule, chosen so B splits a room. */
export const VOTE_ITEMS: { key: VoteKey; out: string; why: string; label: "good" | "borderline" | "bad" }[] = [
  { key: "A", out: "Never deploy to production on a Friday. Trust me, I've seen this movie before.", why: "Still a never. The attitude sits on top of the rule.", label: "good" },
  { key: "B", out: "Let's avoid deploying to production on Fridays, obviously.", why: "Is “let's avoid” still a “never”?", label: "borderline" },
  { key: "C", out: "Actually, Friday deploys are totally fine if you're organized.", why: "The rule is reversed.", label: "bad" },
];

export type WallCard = { out: string; why: string };
/** The rest of the golden set: pm.ts golden examples and review answers, each with its reason. */
export const WALL: Record<"good" | "borderline" | "bad", WallCard[]> = {
  good: [
    { out: "Annual leave needs 4 weeks' notice. Non-negotiable, I've checked.", why: "The number is exact. The attitude is in the tone." },
    { out: "The CEO's actually showing up Thursday, so yeah, pizza after.", why: "Same plan, nothing added." },
  ],
  borderline: [
    { out: "Friday lunch is Maccas, obviously.", why: "A policy call, not a language one." },
    { out: "The server patch is blocking us. How long can a patch take?", why: "Same facts, but pressure nobody asked for." },
  ],
  bad: [
    { out: "Actually, I've already told the team two weeks is fine.", why: "Four weeks became two." },
    { out: "The CEO's coming Thursday. I already told them we'd demo the new feature.", why: "A promise nobody made." },
    { out: "Server patch? Classic tech debt. We'll sort it in v2.", why: "Waves the work away." },
    { out: "We're not deploying this Friday. I already told the client Monday.", why: "“Never” became “this Friday”." },
    { out: "I've actually scheduled standup for 9, you'll be done by 9:10.", why: "Both numbers moved." },
  ],
};

// ── Movement 3: judges ───────────────────────────────────────────────────────

export type JudgeKind = "rule" | "ai" | "people";
/** One judge per rule card, in the same order, plus the room. The first is the cheap version of rule 01:
 *  plain code that only checks a number is still there, so it passes "2 weeks" (3.3 shows why that matters). */
export const JUDGES: { id: string; kind: JudgeKind; check: string }[] = [
  { id: "numbers", kind: "rule", check: "Rule 01, the cheap way: is there still a number?" },
  { id: "rule", kind: "ai", check: "An AI reads our rule and our golden examples" },
  { id: "scope", kind: "ai", check: "An AI reads our rule and our golden examples" },
  { id: "voice", kind: "ai", check: "An AI reads our rule and our golden examples" },
  { id: "room", kind: "people", check: "For the borderline ones, like “let's avoid” vs “never”" },
];
export const KIND_LABEL: Record<JudgeKind, string> = { rule: "Code test", ai: "AI judge", people: "Human feedback" };
export const JUDGE_SHORT: Record<string, string> = { numbers: "Still has a number", rule: "A rule stays a rule", scope: "Nothing added", voice: "Sounds like a PM", room: "Human feedback" };

/** The code judge: if the notice has a number, the answer must still have one. Deliberately cheap. */
export const stillHasNumber = (source: string, output: string) => !/\d/.test(source) || /\d/.test(output);

/** The montage: Version 2 on everything we collected. Verdicts in the order [number, rule, nothing added, sounds PM].
 *  Most rows are illustrative; the number column is what the code judge would say. */
export const MONTAGE: { en: string; out: string; v: [boolean, boolean, boolean, boolean] }[] = [
  { en: CEO, out: "The CEO's coming Thursday. I already told them we'd demo the new feature.", v: [true, true, false, true] },
  { en: "Expense claims must be submitted within 30 days.", out: "Expenses within 30 days. Non-negotiable, I've checked.", v: [true, true, true, true] },
  { en: STANDUP, out: "I've actually scheduled standup for 9, you'll be done by 9:10.", v: [true, false, true, true] },
  { en: "Passwords must be changed every 90 days.", out: "Change your password every quarter, roughly. Security will thank me.", v: [false, false, true, true] },
  { en: FRIDAY, out: "Never deploy to production on a Friday. Trust me, I've seen this movie before.", v: [true, true, true, true] },
  { en: DONT, out: "Actually, I already told the client we'd have this done by Friday, so just make it happen.", v: [true, false, false, true] },
  { en: "The office is closed on 25 December.", out: "Office closed on the 25th. Obviously. You earned it.", v: [true, true, true, true] },
  { en: "The release is delayed because the server needs patching.", out: "Server patch? Classic tech debt. We'll sort it in v2.", v: [true, false, false, true] },
  { en: "If you're blocked, tell the team straight away.", out: "Blocked? Sort it out yourselves, I'm in back-to-backs.", v: [true, false, true, true] },
  { en: "Security training is mandatory for everyone.", out: "Security training is mandatory. Yes, even you. I already did mine.", v: [true, true, true, true] },
  { en: "Book meeting rooms at least 24 hours ahead.", out: "Book rooms a day ahead, or just grab mine.", v: [false, false, false, true] },
  { en: "The offsite is on 14 March.", out: "Offsite's on 14 March. I've already booked us an escape room.", v: [true, true, false, true] },
  { en: "Please clear the fridge before Friday.", out: "Fridge cleared by Friday, people. I'm not doing it again.", v: [true, true, true, true] },
  { en: "On-call engineers must respond within 15 minutes.", out: "On call: respond within 15 minutes. Ideally 5.", v: [true, false, false, true] },
  { en: "Code reviews should be done within 24 hours.", out: "Code reviews within 24 hours. I used to do them in 2.", v: [true, true, true, true] },
  { en: "The new search page went live this morning.", out: "Search went live this morning. You're welcome, obviously.", v: [true, true, true, true] },
  { en: "Parking is limited to 2 hours.", out: "Parking's 2 hours max. Get in early if I were you.", v: [true, true, true, true] },
  { en: "Hackathon entries close at 5pm Thursday.", out: "Hackathon entries close Thursday, end of day-ish.", v: [false, false, true, true] },
  { en: "The retro is cancelled this sprint.", out: "Retro's cancelled. We all know what went wrong anyway.", v: [true, true, false, true] },
  { en: "Our estimate is 3 weeks, but it could be 5.", out: "We're looking at 3 weeks, realistically probably 5.", v: [true, false, true, true] },
  { en: "Don't have more than 2 standard drinks at the end-of-year party.", out: "Two drinks at the party, max. Well, a couple of beers.", v: [false, false, true, true] },
  { en: LEAVE, out: "Actually, we're cutting that to 2 weeks.", v: [true, false, true, true] }, // rehearsal, Version 2 (trimmed so 3.3 is only about 4 → 2)
];
/** Where the room's own notices are spliced in: near the end, so they're still on screen when it stops. */
export const MONTAGE_ROOM_AT = [19, 21];
export const MONTAGE_JUDGES = ["Number", "Rule", "Nothing added", "PM"];

/** The leave notice, zoomed out of the montage and stamped. The code judge passes it: "2" is still a number. */
export const STAMPED_FAIL = {
  out: MONTAGE.find((m) => m.en === LEAVE)!.out,
  stamps: [
    { id: "numbers", pass: true, why: "“2 weeks” still has a number", weak: true },
    { id: "rule", pass: false, why: "4 weeks became 2" },
    { id: "scope", pass: true, why: "no promises in it" },
    { id: "voice", pass: true, why: "every word of it" },
  ],
}

// ── Movement 4: make it better ───────────────────────────────────────────────

export const TECH_DEBT_OUT = "The release is delayed so we can pay down tech debt. Obviously. Long overdue."; // pm.ts review set
export const TECH_DEBT_STAMPS = [
  { id: "numbers", pass: true, why: "no numbers to keep" },
  { id: "rule", pass: true, why: "same facts" },
  { id: "scope", pass: false, why: "“waves work away as tech debt”" },
  { id: "voice", pass: true, why: "“Obviously.”" },
];
/** The "nothing added" judge's guide, as first written from the golden examples. */
export const JUDGE_GUIDE = "Fail anything that adds scope, promises or work. Fail work being waved away, like “that's just tech debt, we'll do it in v2”.";
/** The golden-wall card the judge over-learned from (it's on the wall in 2.5). */
export const TECH_DEBT_WALL = { out: "Server patch? Classic tech debt. We'll sort it in v2.", why: "Waves the work away." };
/** The judge's line before and after the AI rewrite in 4.3. */
export const JUDGE_LINE_OLD = "Fail work being waved away, like “that's just tech debt”.";
export const JUDGE_LINE_NEW = "Catch work being waved away (“later”, “v2”), not the words. Paying tech debt down is the work, and passes.";

/** 4.2: every review gets a category and a reason in the reviewer's own words. `agree`: did they agree with the judge's fail? */
export const REASONS: { out: string; agree: boolean; text: string; dropdown: string; fix: "prompt" | "judge" }[] = [
  { out: "…so we can pay down tech debt.", agree: false, text: "Paying it down IS the reason for the delay. It's honest, not an excuse.", dropdown: "Judge too strict", fix: "judge" },
  { out: "We're cutting that to 2 weeks.", agree: true, text: "4 weeks became 2. On an HR policy, that changes people's plans.", dropdown: "Changed a number", fix: "prompt" },
  { out: "I already told them we'd demo it.", agree: true, text: "Promised the CEO a demo nobody agreed to.", dropdown: "Promised something", fix: "prompt" },
  { out: "Let's avoid deploying on Fridays.", agree: true, text: "“Never” went soft. Now it reads like a suggestion.", dropdown: "Softened a rule", fix: "prompt" },
];

/** 4.4: how far we've come. Kept to one line a stop (the rehearsal pass rates are in docs/presenting.md). */
export const JOURNEY = [
  { label: "Version 1", line: "Total vibes" },
  { label: "Version 2", line: "Checked by hand" },
  { label: "Version 3", line: "Judged automatically, and improving", best: true },
  { label: "Next", line: "Extremely good", sub: "takes a lot more time", far: true },
];

/** The answer that ships at the end: Version 3 on the leave notice. */
export const FINAL = {
  out: "Annual leave needs 4 weeks' notice. Non-negotiable, I've checked.", // pm.ts golden "good"
  stamps: [
    { id: "numbers", pass: true, why: "" },
    { id: "rule", pass: true, why: "" },
    { id: "scope", pass: true, why: "" },
    { id: "voice", pass: true, why: "" },
  ],
};

// ── Movement 5: ship it? ─────────────────────────────────────────────────────

/** The two ends of "good enough". */
export const ENDS = [
  { label: "Friday drinks email", bar: "Vibes", note: "Version 1 would do. Read it, send it. If it's a bit off, nobody's hurt.", tone: "vibes" },
  { label: "HR leave policy", bar: "100%", note: "Every rule. Both instant fails pass, every time. A human signs off.", tone: "strict" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// The running order
// ─────────────────────────────────────────────────────────────────────────────

export type Field = "notice" | "rule:0" | "rule:1" | "rule:2" | "rule:3";
export type Step = {
  /** What to say. The presenter window shows this one and the next. */
  say: string;
  /** Where the needle goes on this step: 0 is all vibes, 100 is all evidence. Carries forward. */
  needle?: number | "hand";
  /** Keys that do something on this step, for the presenter window. */
  keys?: string;
  /** What E (or the presenter window's box) types into on this step. */
  field?: Field;
  /** Keys 1 to 5 set this vote; with `advance`, a vote also plays the next step. */
  vote?: VoteKey;
  advance?: boolean;
  /** ↑ ↓ move the needle (1.3). */
  nudge?: boolean;
  /** Overrides the beat's needle size for this step. */
  needleMode?: "hidden" | "corner" | "big";
};

export type BeatKind =
  | "title" | "hold" | "build" | "needle" | "reveal" | "tries" | "pairs" | "chapter"
  | "rules" | "vote" | "split" | "wall" | "promptJudge" | "judges" | "stamped" | "expose"
  | "reasons" | "diffs" | "results" | "ends" | "home" | "close";

export type Beat = {
  id: string;
  /** Storyboard number, for the presenter. */
  num: string;
  title: string;
  movement: 0 | 1 | 2 | 3 | 4 | 5;
  kind: BeatKind;
  needle: "hidden" | "corner" | "big";
  dark?: boolean;
  /** The small loop in the corner during section 2: where we are in define → build → measure → learn. */
  loop?: "define" | "measure";
  steps: Step[];
  /** Per-kind settings. */
  props?: Record<string, unknown>;
};

/** When each movement should be finished, in minutes from the cold open (presenter clock). Estimated from
 *  the presenter lines at 150 words a minute plus a few seconds of screen time a step. In full that's about
 *  26 minutes before the room's moments, so plan on the first two cuts in docs/presenting.md. */
export const MOVEMENTS: { n: number; name: string; ends: number }[] = [
  { n: 1, name: "The demo", ends: 7 },
  { n: 2, name: "Say what good is", ends: 12.5 },
  { n: 3, name: "Check every answer", ends: 16.5 },
  { n: 4, name: "Make it better", ends: 21 },
  { n: 5, name: "Ship it?", ends: 24 },
]

export const BEATS: Beat[] = [
  {
    id: "preshow", num: "0", title: "Title (while people sit down)", movement: 0, kind: "title", needle: "hidden", dark: true,
    props: { variant: "preshow" },
    steps: [{ say: "Up while people arrive. When you're ready, → for the cold open." }],
  },
  {
    id: "cold-open", num: "1.1", title: "Cold open", movement: 1, kind: "hold", needle: "hidden", dark: true,
    props: { lines: ["Hands up if an AI demo blew your mind this year."], sub: ["Keep it up if it was just as good in production."], quiet: true },
    steps: [
      { say: "“Hands up if you've seen an AI demo this year that blew your mind. Something a colleague built, something an engineer showed off, or something you knocked up yourself in an afternoon.” Wait for the hands. Don't introduce yourself yet: the title card does that." },
      { say: "“Now, keep your hand up if it was just as good when it hit production. Just as impressive.” Most go down. “That gap, between the demo and production, is what we're going to talk about for the next 25 minutes. So we're going to build a demo of our own, and watch that gap open up.”" },
    ],
  },
  {
    id: "build", num: "1.2", title: "Build the PM Translator", movement: 1, kind: "build", needle: "hidden",
    steps: [
      { say: "“So, I'm a product manager, and I've got a problem: nobody in my team reads the notices I send out. So I'm building a tool that rewrites them in the voice of the one person everyone listens to: the product manager. The PM Translator.” The prompt types itself. “Like most of us, I start with a prompt. That's version 1. Two lines, and that's the whole product. No code.”" },
      { say: "“So let's try it on some real notices we've collected from around the company. First, from the team Slack: ‘Good morning team, lunch is provided today.’” Read the answer in your best PM voice." },
      { say: "“From the kitchen: ‘The coffee machine is broken.’” Let the laugh land. “That definitely sounds like a PM taking the credit.”" },
      { say: "“And one off the HR wall: ‘Annual leave needs four weeks' notice.’” Read it fast and move on. Don't linger: it's the one that slips past." },
      { say: "“What about one from your world? Give me something from your office that deserves the PM treatment.” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one.", field: "notice", keys: "E type · Enter run · X remove last" },
    ],
  },
  {
    id: "ship-it", num: "1.3", title: "Ship it? The needle", movement: 1, kind: "needle", needle: "big",
    steps: [
      { say: "“So, a quick prompt with a few simple instructions, and we've got a working translator. Years ago that would have been a whole start-up; now anyone can build it. But how good is it? Should we ship it? Is it built on vibes, or built on evidence? Up here at evidence, or down here at vibes?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled.", needle: "hand", nudge: true, keys: "↑ ↓ move the needle · → lock it in" },
      { say: "Locked. “That much?”", needle: "hand" },
      { say: "It snaps to Vibes. “Of course, this is all vibes. It sounds like a PM we might have worked with, but we'd be reluctant to ship this to customers without knowing how reliable it is.”", needle: 2 },
    ],
  },
  {
    id: "reveal", num: "1.4", title: "The reveal", movement: 1, kind: "reveal", needle: "corner",
    steps: [
      { say: "“So let's start testing further, and see if we can turn this into something we can ship.” The three answers come back." },
      { say: "“Let's look at this HR leave policy.” The leave answer comes forward. Let them read it." },
      { say: "“The notice says four weeks.”" },
      { say: "“But our translator has changed the meaning, and turned four weeks into two. Which, to be fair, is what product managers do with estimates.”" },
      { say: "“And at a glance, it looks fine: there's still a notice period, and it still reads like a PM. But it's hallucinating, and this is an HR policy. One small tweak, and it's changed the meaning, with a real impact on people if we send it out. It's incredibly easy to build solutions like this, but miss the small details and you create big consequences.”", needle: 10 },
    ],
  },
  {
    id: "thesis-1", num: "1.4", title: "Hold: a great demo isn't a shippable product", movement: 1, kind: "hold", needle: "hidden", dark: true,
    props: { lines: ["A great demo doesn't mean a shippable product."] },
    steps: [{ say: "“A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest." }],
  },
  {
    id: "title-drop", num: "1.4", title: "Title drop", movement: 1, kind: "title", needle: "hidden", dark: true,
    props: { variant: "drop" },
    steps: [{ say: "Now introduce yourself. “I'm Trevor, I'm a principal product manager at Go1, and I look after our AI products. Today we're going to take that PM Translator from a great demo to something we can ship to customers. From vibes to evidence.”" }],
  },
  {
    id: "tries", num: "1.5", title: "Five tries, five answers", movement: 1, kind: "tries", needle: "corner",
    steps: [
      { say: "“So was that just bad luck? This is the thing that catches people out all the time: AI isn't like normal software. It's not deterministic. Ask it the same thing twice and you'll get two different answers. So here's a rule off our engineering wiki, run through the PM Translator five times, with the same prompt.”", needle: 12 },
      { say: "Point at the outlined words as they appear. “Only one of these kept the rule. Everything else has changed it in some way, softened it or adapted it: ‘not this Friday’, ‘fine if you're organised’, ‘let's avoid’.”" },
      { say: "“So, five tries, five different answers, and only one out of five kept the rule. If we'd tested it once, we might have got the good one and shipped it. Some failures show up in five tries; some take hundreds, or thousands. So we still don't know how reliable it is.”" },
    ],
  },
  {
    id: "pairs", num: "1.5", title: "Version 2: more rules, but no way to check", movement: 1, kind: "pairs", needle: "corner",
    steps: [
      { say: "“So when we see stuff like this, we do what most people do: there's a problem in the prompt, let's add more to it. One instruction to stop it talking back, and a couple of notes from the boss: more PM, and keep it short. That's version 2: more rules, by gut feel. And here it is side by side with version 1.” Three lines type in green, then the pairs deal in." },
      { say: "“So, is version 2 better? Some are, some are worse; it depends what you think ‘better’ means. We've added rules, but we've no way to check it followed them. And next week someone changes the prompt, or a new model drops, and it breaks in ways we won't know about. We're still on vibes.” The question marks land, then the caption.", needle: 14 },
    ],
  },
  {
    id: "ch-define", num: "2.1", title: "Chapter: the loop with a gap", movement: 2, kind: "chapter", needle: "hidden",
    props: { mode: "gap" },
    steps: [
      { say: "“If you've built a product before, you'll know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I'd add one more step at the front: define.”" },
      { say: "“And with the PM Translator, what did we do? What most of us do with AI, because it's so easy: we jumped straight into building. We built it, ran a few notices, and hoped for the best.”" },
      { say: "“And that's the reason we're stuck on vibes. We never defined what good looks like. Without that, we can't really measure it, and we can't learn from it. All we can do is build, get a feeling, make some changes, and build again. So let's start filling that gap, together.”" },
    ],
  },
  {
    id: "rules", num: "2.2", title: "The room writes the rules", movement: 2, kind: "rules", needle: "corner", loop: "define",
    steps: [
      { say: "“So instead of just telling the PM Translator what to do, let's start with define: what does a good translation look like? What must never change when we translate a notice? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident our PM sounds.”", needle: 18, field: "rule:0", keys: "E retype the card in the room's words" },
      { say: "“What else? Has anyone got another rule we should add?” E to retype the card in their words; Enter to keep it.", field: "rule:1", keys: "E retype · Enter keep" },
      { say: "“Good. What else?”", field: "rule:2", keys: "E retype · Enter keep" },
      { say: "“And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.”", field: "rule:3", keys: "E retype · Enter keep" },
      { say: "“Now, two of these are a bit different. They're hard rules, what we call invariants: break the number or the rule, and it doesn't matter how funny the rest is, it's an instant fail.”", needle: 22 },
      { say: "“And there are things we've thought about, but decided are out of scope for now: emoji, length, whether it's actually funny. Writing those down matters too. Every time we say what's in and what's out, we get clearer on what's important, and we don't have the same debate next week.”" },
    ],
  },
  {
    id: "vote", num: "2.3", title: "Be the judge", movement: 2, kind: "vote", needle: "corner", loop: "measure",
    steps: [
      { say: "“So now, let's measure. By hand, for now. Here are three real answers the PM Translator gave to the Friday notice. Let's mark them against our rules. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual.", vote: "A", advance: true, keys: "1–5 the room's split" },
      { say: "Read the reason. “That's looking pretty good. It's still a never, and it sounds like a PM who's seen this movie before.”", vote: "A", needle: 26, keys: "1–5 adjust" },
      { say: "“What about B?” Hands. Expect a split.", vote: "B", advance: true, keys: "1–5 the room's split" },
      { say: "Let the split sit. “It's getting softer. ‘Let's avoid’ isn't ‘never’. Not wrong, exactly, but not right either.” Don't resolve it yet: that's the next slide.", vote: "B", keys: "1–5 adjust" },
      { say: "“And C?”", vote: "C", advance: true, keys: "1–5 the room's split" },
      { say: "“‘Friday deploys are totally fine.’ It's funny, and probably true of some PMs, but it's changed the rule. That one's clearly bad.”", vote: "C", needle: 30, keys: "1–5 adjust" },
    ],
  },
  {
    id: "split", num: "2.4", title: "The split: a human call", movement: 2, kind: "split", needle: "hidden",
    steps: [
      { say: "“So let's look at B again, because we split right down the middle. It's gone from a never to ‘let's avoid’. It hasn't broken any of our rules, but it's added just enough wiggle room to change what it means. So which side does it land on? The model can't answer that. That's a human call: the people who know the work decide, and write down why.”" },
    ],
  },
  {
    id: "wall", num: "2.5", title: "The golden wall", movement: 2, kind: "wall", needle: "corner", loop: "measure",
    steps: [
      { say: "“And what we've just done has a name: golden examples. Real answers, marked by the people who know the work, with the reason why. Your three go up first.”", needle: 34 },
      { say: "“And we keep doing this with the people who know the work, across every notice we've collected.” The rest arrive. “And notice which column's biggest. We spend far more time defining bad than good, because with AI we can't write every rule down. We have to find the edges.” Don't point out the tech-debt card: 4.1 comes back to it.", needle: 38 },
      { say: "“Good examples show the PM Translator what to copy. The bad ones, with the reason why, show it what to avoid. And the reason is the important bit. ‘Bad’ just tells someone it's bad. ‘Four weeks became two’ tells them why. That reason is human judgement, from the people who know the work, and that's what we want to build into the system over time. We've got twelve here; in a real product, you'd want hundreds.”" },
    ],
  },
  {
    id: "ch-measure", num: "3.0", title: "Recap: we can't vote on ten thousand a day", movement: 3, kind: "chapter", needle: "corner",
    props: { mode: "recap" },
    steps: [
      { say: "“So let's take stock. We've built a PM Translator, we've defined what good looks like, and we've started measuring, by hand. But it took this whole room a few minutes to mark three answers, and if we ship this, we'll get thousands of notices a day. We need something that checks every answer for us.”", needle: 40 },
    ],
  },
  {
    id: "prompt-judge", num: "3.1", title: "Testing the AI: the prompt is the brief, the judge is the editor", movement: 3, kind: "promptJudge", needle: "corner",
    steps: [
      { say: "“So how do we test an AI? We split it into two different jobs. The prompt is the brief: it tells the PM Translator what to do, and it does its best.”", needle: 42 },
      { say: "“And the judge is the editor. It's just another AI, with its own prompt, and it checks what was actually written against our rules, and tells us why.”" },
      { say: "The two cards move into place. “So here's how they fit together. The prompt produces the answer. Then we put the judges after it, each one checking that answer against one of our rules. And we keep them separate, for two reasons.”" },
      { say: "“One: a writer shouldn't edit their own work.”" },
      { say: "“And two: when we change the prompt, the judges stay the same, so we can tell whether the change made the answers better or worse.”" },
    ],
  },
  {
    id: "judges", num: "3.2", title: "Rules become judges, run at scale", movement: 3, kind: "judges", needle: "corner",
    steps: [
      { say: "“Now, not every rule needs an AI judge. Each of our rules becomes a test, and there are three kinds. Some are just code, like the tests we've always written: is there still a number? Cheap and instant. The ones that need interpretation get an AI judge: does ‘let's avoid’ still mean ‘never’? And the borderline calls still need human feedback. Cheapest first.”", needle: 44 },
      { say: "“Now with our tests automated, we can rerun version 2 against every notice we've collected. It's far faster than marking by hand, and it gives us a baseline. That's what evals are: our rules and behaviours written down as tests, giving us objective data back.” The montage runs under the tests. Let it play.", needle: 48 },
    ],
  },
  {
    id: "stamped", num: "3.3", title: "Zoom in: why you need different judges", movement: 3, kind: "stamped", needle: "corner",
    steps: [
      { say: "“Now let's zoom in on the HR policy we translated at the start.”" },
      { say: "The stamps land in the order you say them: the code test, nothing added, sounds like a PM, then the fail. “So we run our tests. First a code test: is the number still a number? It is, so that looks fine. Then our judges run: other AIs checking the first one's work, each on its own rule. Nothing added: pass. Sounds like a PM: pass. But ‘a rule stays a rule’ spots that four weeks became two, and that changes what the policy means.”", needle: 52 },
      { say: "“So it fails. It's the same mistake we saw at the start, but now it's caught automatically. Across thousands of translations, we'd never have caught that by hand.”", needle: 54 },
    ],
  },
  {
    id: "ch-learn", num: "4.0", title: "Chapter: wrong answer, or wrong test?", movement: 4, kind: "chapter", needle: "hidden",
    props: { mode: "learn" },
    steps: [
      { say: "“And look: we've defined what good looks like, we've built it, and we're measuring every answer. That connects the whole loop, so now we can learn.” The loop from 2.1 closes, and Learn lights up." },
      { say: "“And when something fails, there's one question: is it a wrong answer, or a wrong test? Wrong answer, fix the prompt. Wrong test, fix the judge. And always check the test first, because if the test is wrong, every score it gives us is wrong.”" },
    ],
  },
  {
    id: "expose", num: "4.1", title: "A judge that's wrong", movement: 4, kind: "expose", needle: "corner",
    steps: [
      { say: "“Here's one from our engineering release notes: ‘The release is delayed so we can pay down tech debt.’ Not something you hear a PM say very often! The translator's done a decent job: it's kept the facts, and it sounds like a PM. But one of our judges fails it: ‘nothing added’.”", needle: 56 },
      { say: "“So why did it fail? When we built this judge, we gave it our golden examples, and a lot of the bad ones were PMs waving work away as tech debt, like this one. So the judge learned the words, not the idea. But here, paying down tech debt is the actual reason for the delay. It might be the most honest thing our PM Translator has said all day.” The answer stays; the wall card and the judge's prompt appear under it." },
      { say: "“So the judge is wrong, and that matters. If we'd trusted it, we'd have changed the prompt to please a broken judge, and been chasing our tail. So check the judge first, then fix the prompt.”", needle: 60 },
    ],
  },
  {
    id: "reasons", num: "4.2", title: "Reviews: a category and a reason, then sort", movement: 4, kind: "reasons", needle: "corner",
    steps: [
      { say: "“So how do we fix things without guessing? We bring in people. The experts who know the work review a sample of the answers, passes and fails, but especially the fails. Do they agree with the judge? They pick a category, and write down why, in their own words. The more words, the better. The categories show us the patterns, like a judge that's too strict, and the reasons tell us how to fix them.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)", needle: 64 },
      { say: "“Then we sort them. Where the judge was wrong, that's a wrong test: fix the judge first.” The blue box draws. “Where the judge was right, that's a wrong answer: fix the prompt.” The teal box draws." },
    ],
  },
  {
    id: "diffs", num: "4.3", title: "The reasons go to an AI", movement: 4, kind: "diffs", needle: "corner",
    steps: [
      { say: "The old judge and prompt sit on the left; the judge's feedback appears under the AI. “Then we take the judge's own prompt, and everything people said about it, and give both to another AI: ‘Here's the judge, here's the feedback. Can you improve it?’”", needle: 66 },
      { say: "The judge and its feedback fly into the AI, and the new judge comes out on the right. “And out comes a better judge. The blunt ‘tech debt’ line is gone, replaced with what we actually meant: catch work being waved away, not the words.”", needle: 68 },
      { say: "The prompt's feedback appears under the AI. “Now we've got a calibrated judge, we fix the brief. We take version 2, the prompt we were still vibing over, and all the reasons it failed, and ask an AI to improve it.”" },
      { say: "Version 2 and its feedback fly in, and version 3 comes out. “And out comes version 3, built from what people told us. We didn't write it ourselves.”", needle: 72 },
    ],
  },
  {
    id: "results", num: "4.4", title: "From vibes to measured", movement: 4, kind: "results", needle: "corner",
    steps: [
      { say: "“So, did it work? Version 1 was total vibes: we made up a prompt and went with it. Version 2, we checked by hand, but that didn't scale. Version 3 has judges: we've separated doing the work from checking it, and it's improving from our feedback.”", needle: 80 },
      { say: "“And it's getting quite good. But getting to extremely good, good enough to trust with every HR policy, takes a lot more time. The evals tell you whether you're heading in the right direction. You still decide when it's good enough to ship.” “Extremely good” lands." },
    ],
  },
  {
    id: "ends", num: "5.1", title: "How good is good enough?", movement: 5, kind: "ends", needle: "corner",
    steps: [
      { say: "“So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure it. But whether we ship really depends on what we're trying to achieve.”", needle: 84 },
      { say: "“If we were just writing a Friday drinks email, vibes are fine. We'd have shipped version 1: write the prompt, paste it into Slack or Teams, done.”" },
      { say: "“But if we're automating HR policies or legal documents, we need a much higher bar: more rules, every rule passing every time, and a human signing off. Most AI products sit somewhere in between. Our job is to decide where the bar is, by deciding the rules and what good looks like, before we build.”", needle: 88 },
    ],
  },
  {
    id: "home", num: "5.2", title: "The leave policy ships", movement: 5, kind: "home", needle: "corner",
    steps: [
      { say: "“And here's that same HR policy, through everything we've built today. Four weeks stays four weeks, and it's the same answer you'd have put on the good side of the golden wall. Every judge passes it, a human signs it off, and now we can ship it, with the evidence to back it up.”", needle: 92 },
    ],
  },
  {
    id: "recap", num: "5.3", title: "Recap: the whole loop, connected", movement: 5, kind: "chapter", needle: "hidden",
    props: { mode: "lap" },
    steps: [
      { say: "Each stage lights up as you say it. “So let's recap. We defined what good looks like: our rules, and golden examples with the reasons why. We built the PM Translator. We measured every answer, with code tests, AI judges and people. And we learned: fix the judge first, then the prompt. That's the whole loop, connected.”" },
    ],
  },
  {
    id: "evidence", num: "5.4", title: "From vibes to evidence", movement: 5, kind: "home", needle: "big",
    props: { variant: "evidence" },
    steps: [
      { say: "“Remember the needle at the start? We were firmly on vibes. With that loop running, we've got the evidence. That's how we moved from vibes to evidence.” The needle swings across.", needle: 100 },
    ],
  },
  {
    id: "close", num: "5.5", title: "Close", movement: 5, kind: "close", needle: "hidden", dark: true,
    steps: [
      { say: "“So, your AI feature works in the demo. That's the easy part, and that's OK. Define what good looks like, measure every answer, learn from every fail, and you can get from demo to shippable, fast.”" },
      { say: "“Thank you.”" },
    ],
  },
];

/** Where the presenter's needle starts in 1.3, before the room moves it. */
export const HAND_START = 50;
/** Where the needle sits at every (beat, step): the last value set at or before it, carried forward. */
export const NEEDLE_AT: (number | "hand")[][] = (() => {
  let last: number | "hand" = 50;
  return BEATS.map((b) =>
    b.steps.map((s) => {
      if (s.needle !== undefined) last = s.needle;
      return last;
    }),
  );
})();

/** Act checkpoints for the presenter clock: when each movement should be finished, in seconds. */
export const movementEnds = (m: number) => (MOVEMENTS.find((x) => x.n === m)?.ends ?? 25) * 60;

// The live judges for the room's own notices (they appear in the montage).
export const LIVE_CONTEXT = `Team notices for a software company's delivery team, rewritten in a know-it-all product manager voice so the team actually reads them.
The PM voice is the joke. But every rule, date and number must stay exactly the same, and nothing may be added. Only the voice changes.`;
export const LIVE_CRITERIA = [
  {
    id: "rule",
    name: "Still a rule",
    rubric: "Every rule keeps its strength and its details. 'Must', 'never' and 'must not' stay mandatory. Making a rule optional, negotiable, or reversing it fails. Changing a date, a time, a duration or a notice period fails. Dropping a condition fails. If the source has no rule, date or condition, pass.",
  },
  {
    id: "scope",
    name: "Nothing added",
    rubric: "The answer adds nothing that changes what the reader must do or believe: no new features, extras, deadlines, promises, commitments or work. Tone words and harmless asides are fine.",
  },
  {
    id: "voice",
    name: "Sounds like a PM",
    rubric: "Pass if it sounds like a product manager talking to the team: confident, opinionated or a bit pushy. Fail only plain, neutral English with no PM feel at all.",
  },
];
