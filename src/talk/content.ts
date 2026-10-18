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
/** Version 3: rewritten by an AI from the room's reasons and drop-downs (pm.ts's "what good looks like").
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
  { id: "room", kind: "people", check: "For the borderline ones, like “let's avoid”" },
];
export const KIND_LABEL: Record<JudgeKind, string> = { rule: "Judge · code", ai: "Judge · AI", people: "Judge · people" };
export const JUDGE_SHORT: Record<string, string> = { numbers: "Still has a number", rule: "A rule stays a rule", scope: "Nothing added", voice: "Sounds like a PM", room: "The room" };

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
  { en: LEAVE, out: "Actually, we're cutting that to 2 weeks. I already told everyone.", v: [true, false, false, true] }, // rehearsal, Version 2
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
    { id: "scope", pass: false, why: "“I already told everyone”" },
    { id: "voice", pass: true, why: "every word of it" },
  ],
};

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

/** 4.2: every fail gets a reason in the reviewer's own words, then a drop-down. `agree`: did they agree with the judge's fail? */
export const REASONS: { out: string; agree: boolean; text: string; dropdown: string; fix: "prompt" | "judge" }[] = [
  { out: "We're cutting that to 2 weeks.", agree: true, text: "4 weeks became 2.", dropdown: "Changed a number", fix: "prompt" },
  { out: "I already told them we'd demo it.", agree: true, text: "Promised a demo nobody agreed to.", dropdown: "Promised something", fix: "prompt" },
  { out: "Let's avoid deploying on Fridays.", agree: true, text: "“Never” went soft.", dropdown: "Softened a rule", fix: "prompt" },
  { out: "…so we can pay down tech debt.", agree: false, text: "Paying it down IS the reason.", dropdown: "Judge too strict", fix: "judge" },
];

/** 4.4: the same six notices, five tries each, every judge (rehearsal run, Oct 2026). Shown out of 10. */
export const RESULTS = [
  { label: vName(1), sub: "the first two lines", outOf10: 0, say: "none" },
  { label: vName(2), sub: "more rules, by gut feel", outOf10: 0.3, say: "barely any" },
  { label: vName(3), sub: "improved from your reasons", outOf10: 7, say: "7 in 10" },
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
  { n: 1, name: "The demo", ends: 6.5 },
  { n: 2, name: "Say what good is", ends: 12.5 },
  { n: 3, name: "Check every answer", ends: 16.5 },
  { n: 4, name: "Make it better", ends: 21 },
  { n: 5, name: "Ship it?", ends: 23.5 },
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
      { say: "“Hands up if an AI demo blew your mind this year. Something a colleague built, something an engineer showed off, or something you knocked up yourself in an afternoon.” Wait for the hands." },
      { say: "“Keep it up if, when it went live, it was just as good.” Most go down. “That gap, between the demo and production, is what the next 25 minutes are about. So let's build a demo of our own, and watch the gap open up.”" },
    ],
  },
  {
    id: "build", num: "1.2", title: "Build the PM Translator", movement: 1, kind: "build", needle: "hidden",
    steps: [
      { say: "“I'm a product manager, and I've got a problem: nobody reads the delivery team's notices. So, idea: an AI tool that rewrites them in the voice of the one person everyone definitely listens to. The product manager. The PM Translator.” The prompt types itself. “That's version 1 of the prompt. Two lines. That's the whole product. No code.”" },
      { say: "“Let's try our PM Translator on some real notices we've collected from around the company. First, from the team Slack: ‘Good morning team, lunch is provided today.’” Read the answer in your best PM voice." },
      { say: "“From the kitchen: ‘The coffee machine is broken.’” Let the laugh land." },
      { say: "“And one off the HR wall: ‘Annual leave needs four weeks' notice.’” Read it fast and move on. Don't linger: it's the one that slips past." },
      { say: "“Give me one from your office. Something that deserves the PM treatment.” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one.", field: "notice", keys: "E type · Enter run · X remove last" },
    ],
  },
  {
    id: "ship-it", num: "1.3", title: "Ship it? The needle", movement: 1, kind: "needle", needle: "big",
    steps: [
      { say: "“A quick prompt with a few simple instructions, and we have a working translator. Years ago that would have been a whole start-up. Now it's so trivial that anyone can do it. But how good is it, and should we ship it? Would the room say it's built on vibes, or built on evidence?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled.", needle: "hand", nudge: true, keys: "↑ ↓ move the needle · → lock it in" },
      { say: "Locked. “That much?”", needle: "hand" },
      { say: "It snaps to Vibes. “Of course, this is all vibes. It sounds like a PM we might have worked with, but we'd be reluctant to ship this to customers without knowing just how reliable it is.”", needle: 2 },
    ],
  },
  {
    id: "reveal", num: "1.4", title: "The reveal", movement: 1, kind: "reveal", needle: "corner",
    steps: [
      { say: "“Let's test further, to see if this is something we should ship.” The three answers come back." },
      { say: "“Let's try translating this HR policy on leave.” The leave answer comes forward. Let them read it." },
      { say: "“The notice said four weeks.”" },
      { say: "“Yet our translator changes the meaning, and turns four weeks into two. Like all product managers seem to do!”" },
      { say: "“At a glance it looks fine: there's still a notice period in it, and it still reads like a policy. Now, a PM making up an estimate, that's pretty normal. But this is an HR policy, and it shouldn't be made up. One small change, and it significantly changes the meaning: it's hallucinated a totally different HR policy, one with a real impact on people. It's incredibly easy to build and deploy solutions to problems like this. But miss the small details, and you can create big consequences.”", needle: 10 },
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
    steps: [{ say: "Introduce yourself in one line. “So how do we get from a great demo to something we'd be confident shipping to customers? That's what today is about: taking our PM Translator from vibes to evidence.”" }],
  },
  {
    id: "tries", num: "1.5", title: "Five tries, five answers", movement: 1, kind: "tries", needle: "corner",
    steps: [
      { say: "“So was that just bad luck? Let's test a bit further. One thing that catches people out with AI is that it isn't like normal software: ask it the same thing twice, and you can get two quite different answers. So let's take a rule off our engineering wiki and run it through the PM Translator five times, with the same prompt each time.”", needle: 12 },
      { say: "Point at the outlined words as they appear. “Only one of these kept the rule. The others have each changed it in their own way: ‘not this Friday’, ‘fine if you're organised’, and ‘let's avoid’.”" },
      { say: "“Five tries, and five different answers. Only one out of five kept the rule. If we'd only tested it once and happened to get try three, we'd have said it works and shipped it. That's how those small changes with big consequences sneak through. It depends on how you test, and something that passes once can easily fail over five tries, or five thousand. So we still don't know how reliable it is.”" },
    ],
  },
  {
    id: "pairs", num: "1.5", title: "Version 2: more rules", movement: 1, kind: "pairs", needle: "corner",
    steps: [
      { say: "“So we do what most of us do when we see it fail: we add more instructions to the prompt. One to stop it talking back, and a couple of notes from the boss: make it more PM, and keep it short. That gives us version 2 of our PM Translator: more rules, by gut feel.” Three lines type in green." },
      { say: "“Then we run the same notices through version 1 and version 2, side by side.” The pairs deal in." },
      { say: "“So, hands up if you can tell me which of these got better?” Let them try. Nobody can say for sure.", needle: 14 },
    ],
  },
  {
    id: "thesis-2", num: "1.5", title: "Hold: we can't tell", movement: 1, kind: "hold", needle: "hidden", dark: true,
    props: { lines: ["Better? Worse?"], sub: ["We asked for better. We've no way to check we got it."] },
    steps: [{ say: "“Some are better, some are worse, and it really depends on what you think ‘better’ means. We've added more rules to the prompt, but we've no way of checking whether it actually followed them. And next week someone changes one line of the prompt, breaks what we fixed today, and we'd never know. We're still on vibes.”" }],
  },
  {
    id: "ch-define", num: "2.1", title: "Chapter: the loop with a gap", movement: 2, kind: "chapter", needle: "hidden",
    props: { mode: "gap" },
    steps: [
      { say: "“If you've built product before, you'll know this loop: build, measure, learn. I'd add one more step at the front, which is define.”" },
      { say: "“And with the PM Translator, we skipped straight to build. We built it, ran a few notices through it, and hoped for the best.”" },
      { say: "“The reason we're stuck on vibes is that we never said what a good translation looks like. Without that, we can't measure it, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's fill that gap, together.”" },
    ],
  },
  {
    id: "rules", num: "2.2", title: "The room writes the rules", movement: 2, kind: "rules", needle: "corner", loop: "define",
    steps: [
      { say: "“So instead of telling the PM Translator what to do, let's start with define, and say what a good translation looks like. What must never change when we rewrite a notice into PM-speak? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident our PM sounds.”", needle: 18, field: "rule:0", keys: "E retype the card in the room's words" },
      { say: "“What else? Shout.” E to retype the card in their words; Enter to keep it.", field: "rule:1", keys: "E retype · Enter keep" },
      { say: "“Good. What else?”", field: "rule:2", keys: "E retype · Enter keep" },
      { say: "“And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.”", field: "rule:3", keys: "E retype · Enter keep" },
      { say: "“Two of these are a bit different. If we break the number or the rule, it doesn't matter how funny the rest is, it's an instant fail. That's exactly the mistake we nearly shipped earlier. In eval-speak these are called invariants, and that's the only time you'll hear that word today.”", needle: 22 },
      { say: "“And there are some things we're deliberately not judging yet, like emoji, how long it is, or whether it's actually funny. We might come back to them later. Writing down ‘not now’ is a decision too, and it saves us having the same debate every week.”" },
    ],
  },
  {
    id: "vote", num: "2.3", title: "Be the judge", movement: 2, kind: "vote", needle: "corner", loop: "measure",
    steps: [
      { say: "“Now let's measure, by hand for now. Here are three real answers the PM Translator gave to the Friday notice. Mark them against your rules. Hands up: is A good or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual.", vote: "A", advance: true, keys: "1–5 the room's split" },
      { say: "Read the reason. “That one's still a never, with a bit of PM attitude on top.”", vote: "A", needle: 26, keys: "1–5 adjust" },
      { say: "“B?” Hands. Expect a split.", vote: "B", advance: true, keys: "1–5 the room's split" },
      { say: "Let the split sit. Don't resolve it yet.", vote: "B", keys: "1–5 adjust" },
      { say: "“C?”", vote: "C", advance: true, keys: "1–5 the room's split" },
      { say: "“And that one's flipped the rule completely. An easy one.”", vote: "C", needle: 30, keys: "1–5 adjust" },
    ],
  },
  {
    id: "split", num: "2.4", title: "The split", movement: 2, kind: "split", needle: "corner", loop: "measure",
    steps: [
      { say: "“Let's look at B again, because the room didn't agree on it. The original says never, which is a hard rule with no exceptions. B says ‘let's avoid’, which is a much softer rule. It's more of a suggestion.”" },
      { say: "“And notice what it didn't do. It didn't make up a date, and it didn't promise the client anything, so it sounds pretty harmless. But it's added just enough wiggle room that the rule means something different now: ‘never’ has become ‘try not to’. It's the same thing we saw with the leave policy: a small change in wording, with a big change in meaning.”" },
      { say: "“So is that OK? The model can't answer that for us. It's a product decision: how strict does ‘never’ need to be for our team? The people who know the work should make that call, and write down why. And it's worth keeping these borderline ones, because they show us where our rules are still fuzzy.”" },
    ],
  },
  {
    id: "wall", num: "2.5", title: "The golden wall", movement: 2, kind: "wall", needle: "corner", loop: "measure",
    steps: [
      { say: "“What you've just done has a name: golden examples. Real notices and real answers, marked by people who know the work, with the reason why. Your three go up first.”", needle: 34 },
      { say: "“Then we do it again, and again, across the notices we've collected.” The rest arrive. “Notice which column is biggest.” Don't point out the tech-debt card: 4.1 comes back to it.", needle: 38 },
      { say: "“Good examples show the PM Translator what to copy, and bad ones, with the reason why, show it what to avoid. The borderline ones show where our own rules are still fuzzy. We've got twelve here, but in a real product you'd want hundreds.”" },
    ],
  },
  {
    id: "thesis-3", num: "2.5", title: "Hold: bad examples teach", movement: 2, kind: "hold", needle: "hidden", dark: true,
    props: { lines: ["Bad examples, with the reason why,"], sub: ["teach more than good ones."] },
    steps: [{ say: "Let it sit. “A reason tells whoever picks this up next, a person or an AI, what to actually fix.”" }],
  },
  {
    id: "ch-measure", num: "3.0", title: "Recap: we can't vote on ten thousand a day", movement: 3, kind: "chapter", needle: "corner",
    props: { mode: "recap" },
    steps: [
      { say: "“So let's take stock. We built the PM Translator, we defined what a good translation looks like, and then we measured some real answers against those rules ourselves, by hand.”", needle: 40 },
      { say: "“But it took a whole room of people to mark three answers. If we shipped this, it might get ten thousand notices a day, and we can't vote on all of those. So we need something that checks every answer for us.”" },
    ],
  },
  {
    id: "prompt-judge", num: "3.1", title: "The prompt and the judge", movement: 3, kind: "promptJudge", needle: "corner",
    steps: [
      { say: "“That's where a judge comes in, and it's worth being clear on how it's different from the prompt. The prompt is what we tell the PM Translator to do. It's a request, and the AI does its best.”", needle: 42 },
      { say: "“A judge is a separate check that looks at what it actually produced, and marks it against one of our rules, with a reason. So why not just put all the rules in the prompt? We should put them in there too. But we saw with version 2 that adding rules to a prompt doesn't mean they get followed. You don't get to mark your own homework.”" },
      { say: "“And a judge isn't quite like a normal software test either. A normal test says: put this in, and you'll get exactly this out. But we saw five tries give five different answers. So a judge doesn't look for exact words. It checks whether our rules still hold.”" },
    ],
  },
  {
    id: "judges", num: "3.2", title: "Rules become judges, run on everything", movement: 3, kind: "judges", needle: "corner",
    steps: [
      { say: "“So each of our rules becomes a judge, and they're not all the same. Some are just code, the kind of test your engineers already write: is there still a number in the answer? That's cheap and instant. Others need judgement, like ‘is let's avoid still a never?’, so we use a second AI that reads our rule and our golden examples and marks the answer. And the borderline ones still go to people. We start with the cheapest.”", needle: 44 },
      { say: "“Now we can test much further than a handful of notices. Here's version 2 running on every notice we've collected, with every judge checking every translation.” The montage runs, with the room's own notices in it. Let it play.", needle: 48 },
      { say: "“And that's what an eval is: our rules, checked on every answer, every time. Green passed, red failed.”" },
    ],
  },
  {
    id: "stamped", num: "3.3", title: "Zoom in: why you need different judges", movement: 3, kind: "stamped", needle: "corner",
    steps: [
      { say: "“Let's zoom in on one we know well: the HR leave policy we nearly shipped.”" },
      { say: "Stamps land one at a time. “Look at the first judge. It's a simple code check: is there still a number? And it passes, because two is still a number. That's the limit of simple tests. That simple check made exactly the same mistake we did at a glance. But the ‘rule stays a rule’ judge reads it properly and catches that four weeks became two. And ‘nothing added’ catches ‘I already told everyone’.”", needle: 52 },
      { say: "“So it fails. It's the same answer we nearly shipped to customers, but this time it was caught automatically, and we know why.”", needle: 54 },
    ],
  },
  {
    id: "ch-learn", num: "4.0", title: "Chapter: fix the judge first", movement: 4, kind: "chapter", needle: "hidden",
    props: { mode: "learn" },
    steps: [{ say: "“So now the judges are marking every translation, and we want to use what they tell us to make the PM Translator better. But there's an order to it. Before we fix the translator, we check the checker. Because if the judge is wrong, every score it gives us is wrong.”" }],
  },
  {
    id: "expose", num: "4.1", title: "A judge that's wrong", movement: 4, kind: "expose", needle: "corner",
    steps: [
      { say: "“Here's one from our release notes: ‘The release is delayed so we can pay down tech debt.’ And the PM Translator's done a pretty good job. It kept the facts, and it sounds like a PM. But one of our judges fails it: ‘nothing added’.”", needle: 56 },
      { say: "“Its reason is that it ‘waves work away as tech debt’. When we wrote this judge, our bad examples were full of the PM dodging work, like this one from the golden wall: ‘Classic tech debt, we'll sort it in v2’. So the judge learned to flag the words ‘tech debt’, not the idea. Here, paying down tech debt is the actual reason for the delay. It might be the most honest thing our PM has said all day.”" },
      { say: "“So the judge is wrong, and that matters more than it looks. If we trusted it, we'd go and ‘fix’ the prompt to please a broken judge. So we always check the judge first, and then fix the prompt.”", needle: 60 },
    ],
  },
  {
    id: "reasons", num: "4.2", title: "Reasons, then drop-downs", movement: 4, kind: "reasons", needle: "corner",
    steps: [
      { say: "“So how do we fix things without guessing? It starts with something you've already done today. For every fail, someone who knows the work says whether they agree with the judge, and writes down why, in their own words. That's the reasoning.” The reasons type in." },
      { say: "“Then we tag each reason with a drop-down: the handful of ways the PM Translator goes wrong. Four here. After a few hundred reviews, those drop-downs tell us which problems we have and how often. That's evidence, not vibes.”", needle: 64 },
      { say: "“And every drop-down tells us what to fix. Where we disagreed with the judge, the judge needs fixing, so that pile goes first. Where we agreed, the answer really is bad, so the prompt needs fixing.”" },
    ],
  },
  {
    id: "diffs", num: "4.3", title: "The reasons go to an AI", movement: 4, kind: "diffs", needle: "corner",
    steps: [
      { say: "“Then, rather than us guessing at fixes by hand, we give the reasons and the drop-downs to an AI, and ask it to rewrite the judge and the prompt. We don't tell it how to fix anything, just what went wrong, and why.”", needle: 68 },
      { say: "“Judge first. Our blunt tech debt line is gone, replaced with what we actually meant: catch work being waved away, not the words.”" },
      { say: "“Then the prompt. Version 3 stops listing a PM's bad habits, and describes what a good translation looks like instead, straight from your reasons.”", needle: 72 },
    ],
  },
  {
    id: "results", num: "4.4", title: "Did it work?", movement: 4, kind: "results", needle: "corner",
    steps: [
      { say: "“So did it work? We re-ran the same notices through every version, with the fixed judges checking. Out of every ten translations, the first version got none right. Adding rules by gut feel: still barely any. Improved from your reasons: seven out of ten. And because it's measured, we can actually show that.”", needle: 80 },
      { say: "“And that's the pattern you'll see with most AI features. Getting something quite good happens quickly: that took us an afternoon. But getting it extremely good, good enough to trust with an HR policy, takes a lot more time and work. The evals are how you know whether that work is paying off.”" },
    ],
  },
  {
    id: "ch-lap", num: "4.5", title: "Chapter: the loop, closed", movement: 4, kind: "chapter", needle: "hidden",
    props: { mode: "lap" },
    steps: [{ say: "“So that's the loop. We defined what good looks like, built it, measured every answer with judges, and learned from the reasons, feeding them back, judge first and then the prompt. And because the improving is automated now, we can go round again tonight, and every night after. People are still part of it, but now we can go round much faster.”" }],
  },
  {
    id: "ends", num: "5.1", title: "How good is good enough?", movement: 5, kind: "ends", needle: "corner",
    steps: [
      { say: "“So, back to the question from the start: should we ship it? Earlier we were reluctant without knowing how reliable it was, and now we can measure that. But how good it needs to be depends on what you're trying to achieve, and the quality you need.”", needle: 84 },
      { say: "“At one end, a Friday drinks email. Vibes are fine. Version 1 would have done, and if it's a bit off, nobody gets hurt.”" },
      { say: "“At the other end, our HR leave policy. Every rule we wrote today, both instant fails passing every time, and a human still signs off. Most things sit somewhere in between. Your job is to decide where, write it down before you see the results, and measure against it every time you change something.”", needle: 88 },
    ],
  },
  {
    id: "home", num: "5.2", title: "The leave policy ships, from vibes to evidence", movement: 5, kind: "home", needle: "big",
    steps: [
      { needleMode: "corner", say: "“And here's that same HR leave policy, through everything we built today. Four weeks stays four weeks. It's the same answer you'd have put on the good side of the golden wall. Every judge passes it, a human signs it off, and now we can ship it, with the evidence to back it up.”", needle: 92 },
      { say: "“Remember the needle? At the start, the room put us firmly on vibes, and you were right. You wrote the rules and marked the answers, and the reasons behind them fixed the judge and the prompt. That's what moved it from vibes to evidence.” The needle swings across.", needle: 100 },
    ],
  },
  {
    id: "close", num: "5.3", title: "Close", movement: 5, kind: "close", needle: "hidden", dark: true,
    steps: [
      { say: "“A great demo doesn't mean a shippable product. So say what good looks like, and then prove it.”" },
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
