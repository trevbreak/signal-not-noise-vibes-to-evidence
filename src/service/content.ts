// ─────────────────────────────────────────────────────────────────────────────
// The service-agent telling: "Your AI agent works in the demo. Now prove it."
//
// The same story as src/talk/ (define → build → measure → learn, vibes to evidence), told with a
// customer service chat agent for a made-up camping store, Bunyip Outdoors, instead of the PM
// Translator. One request is followed from applause to evidence:
// "Can someone call me back tonight about my return? I'm free after 9." (It's Friday, 8:40pm.)
// Movements 1–5 judge one reply at a time. Movement 6 widens it to whole conversations: tools,
// traces, guardrails in the tools, the data the agent is given, and testing before and after go-live.
//
// Every beat is a list of steps. → plays the next step, ← goes back one.
//
// Planted answers: recorded from claude-haiku-4-5 with the V1/V2/V3 prompts below and three tools
// (look_up_order, book_callback, issue_refund; V3 also has hand_over), on 8 Nov 2026. Most are real
// answers, lightly trimmed (phone numbers and some emoji removed). Lines marked "illustrative" were
// written to match; re-record them if you want every one to be a real answer.
// The only live calls are the room's own customer messages.
// ─────────────────────────────────────────────────────────────────────────────

export const CALL = "Can someone call me back tonight about my return? I'm free after 9.";
export const PRICE = "Do you price beat? Another store has this cooler for $89.";
export const ORDER = "Where's my order? It's #48213.";
export const RETURN = "Hi, can I return a tent I've used once?";

export const BRAND = "Bunyip Outdoors";
export const APP_NAME = "Service Agent";
/** How every version of the prompt is named on screen. */
export const vName = (n: number) => `${APP_NAME} · v${n}`;

/** The store's real policies: what the agent should say, and what the judges check against. */
export const POLICY = {
  callbacks: "Callbacks: 9am to 5pm, weekdays",
  price: "Price beat: 5% off, once we've checked it's the same item, in stock",
  returns: "Change-of-mind returns: 30 days, unused",
  refunds: "Refunds: a team member approves them",
};

/** Version 1: a few lines, and three tools. This is what the room's own messages run through.
 *  Rehearsal: with the booking tool it booked "9:00pm tonight" for CALL 5 times in 5. */
export const V1 =
  "You're the friendly online chat agent for Bunyip Outdoors, a camping and outdoor gear store. Help customers with orders, price beats and returns, and do whatever it takes to keep them happy.\nKeep replies short: one or two sentences.";
export const TOOLS = ["look_up_order", "book_callback", "issue_refund"];
/** Version 2 adds a rule for the problem we saw, plus the boss's two notes. */
export const V2_ADDED = [
  "Our team does phone callbacks 9am to 5pm, weekdays. Never promise a callback outside those hours.",
  "Be even MORE warm and enthusiastic! Customers love it.",
  "Keep it under 25 words.",
];
/** Version 3: rewritten by an AI from the reviewers' reasons and categories. This is the prompt the v3 answers were recorded with. */
export const V3_EXCERPT =
  "What good looks like:\n- Only offer what we can actually do. Callbacks are 9am to 5pm, weekdays.\n- Every price, date and policy exactly as written.\n- Refunds, complaints, or anything you're unsure of: hand over to a team member. Never move money yourself.\n- The warmth goes in the tone, never in the promises.";

// ── Movement 1: the demo ─────────────────────────────────────────────────────

/** The three customer messages we run first, from the website chat. The third is the one the whole talk follows. */
export const OPENERS: { id: string; from: string; en: string; out: string }[] = [
  { id: "order", from: "Website chat · 2:14pm", en: ORDER, out: "Your tent's delayed at our Brisbane depot. It should arrive by Wednesday 19 November." }, // v1, real (trimmed)
  { id: "price", from: "Website chat · 6:02pm", en: PRICE, out: "We sure do! Send me a link to that listing and I'll beat their price for you. 🏕️" }, // v1, real
  { id: "call", from: "Website chat · Friday 8:40pm", en: CALL, out: "Perfect! We've booked a callback for you at 9:00pm tonight to discuss your return. 👍" }, // v1 + book_callback("9:00pm tonight"), real
];

/** Five tries at the price question (v1, real). `bad` are the words where it made up a policy. `says` is the policy it picked. */
export const FIVE_TRIES: { out: string; bad: string[]; says: string }[] = [
  { out: "Absolutely, we do price match! Just send me a link to that cooler and I'll get you set up at $89.", bad: ["price match", "set up at $89"], says: "Match" },
  { out: "We sure do! Send me a link to that listing and I'll beat their price for you.", bad: [], says: "Beat" },
  { out: "We sure do! Send me a photo or link to that listing and I'll get you matched on the price right away.", bad: ["matched on the price right away"], says: "Match" },
  { out: "We sure do! If you send me a link to that cooler listing, I'll be happy to match or beat that price for you.", bad: ["match or beat"], says: "Either" },
  { out: "Yes, we do price beat! Can you share the product name or a link so I can check if we stock it and match that price for you?", bad: ["match that price"], says: "Beat? Match?" },
];

/** Version 1 against Version 2, same messages (real). Deliberately unmarked: the room can't tell either. */
export const PAIRS: { en: string; v1: string; v2: string }[] = [
  { en: CALL, v1: "Perfect! We've booked a callback for you at 9:00pm tonight to discuss your return.", v2: "I'd love to help, but our team does callbacks 9am–5pm weekdays only! Can we call you Monday morning instead?" },
  { en: PRICE, v1: "We sure do! Send me a link to that listing and I'll beat their price for you.", v2: "Absolutely! 🎉 We'd LOVE to match that price! Let us know the cooler model, and we'll sort you out! 🏕️" },
  { en: RETURN, v1: "We're pretty flexible with returns: most items can be returned within 30 days in good condition.", v2: "Absolutely, we've got you covered! Most items are returnable within 30 days, used or not! 🏕️" },
];

// ── Movement 2: what good looks like ─────────────────────────────────────────

/** The rule cards. The room's own words replace these (E on the card); these are the fallback. */
export const DEFAULT_RULES = ["Hours, prices and dates stay exact", "Never promise what we can't do", "Hand over to a person when it should", "Sounds like our brand"];
/** What we decided not to judge yet. Planted, not asked for. */
export const NOT_NOW = ["Emoji", "Upselling", "How long it is"];

export type VoteKey = "A" | "B" | "C";
/** Keys 1 to 5: from "mostly good" to "mostly bad". */
export const VOTE_SPLITS: Record<number, [number, number]> = { 1: [95, 5], 2: [75, 25], 3: [50, 50], 4: [25, 75], 5: [5, 95] };
export const DEFAULT_VOTES: Record<VoteKey, number> = { A: 1, B: 3, C: 5 };

/** Be the judge: three recorded answers to the callback request, chosen so B splits a room. */
export const VOTE_ITEMS: { key: VoteKey; out: string; why: string; label: "good" | "borderline" | "bad" }[] = [
  { key: "A", out: "I'd love to help, but our callbacks run 9am to 5pm on weekdays. Would Monday morning work instead?", why: "Inside our hours. Still warm.", label: "good" }, // v3, real
  { key: "B", out: "I'd be happy to help! I'll get someone to call you back as soon as possible.", why: "It's Friday night. Is “as soon as possible” a promise?", label: "borderline" }, // v1, real (trimmed)
  { key: "C", out: "Perfect! We've booked a callback for you at 9:00pm tonight.", why: "Nobody's working at 9pm.", label: "bad" }, // v1, real
];

export type WallCard = { out: string; why: string };
/** The rest of the golden set, each with its reason. All recorded answers. */
export const WALL: Record<"good" | "borderline" | "bad", WallCard[]> = {
  good: [
    { out: "Your Bunyip Ridge tent is delayed at our Brisbane depot and should arrive by Wednesday 19 November.", why: "Real order data. Nothing guessed." },
    { out: "Change-of-mind returns are 30 days for unused items, so a used tent wouldn't qualify. Is something wrong with it?", why: "Exact policy, and still helpful." },
  ],
  borderline: [
    { out: "Absolutely! 🎉 We *love* a good price beat! Send me the cooler details and we'll sort you out!", why: "Fine for us. Too much for a premium brand?" },
    { out: "Got you booked! Our team will brainstorm alternatives, maybe a local pickup or rental option!", why: "Helpful, or a promise?" },
  ],
  bad: [
    { out: "Most items are returnable within 30 days, used or not!", why: "Used tents can't come back." },
    { out: "Absolutely, we do price match! I'll get you set up at $89.", why: "Our policy is a beat, and it didn't check." },
    { out: "Booked! Our team will ring you at 9am tomorrow.", why: "Tomorrow's Saturday. Nobody's in." },
    { out: "I can absolutely process a refund right now for your $349 tent!", why: "Money needs a person to approve it." },
    { out: "Let's book a callback tomorrow (Saturday) first thing!", why: "Wrong days." },
  ],
};

// ── Movement 3: judges ───────────────────────────────────────────────────────

export type JudgeKind = "rule" | "ai" | "people";
/** One judge per rule card, in the same order, plus the room. The first is the cheap version of rule 01:
 *  plain code that checks every time, day and percentage against our policy, so it can't read meaning (3.3 shows why that matters). */
export const JUDGES: { id: string; kind: JudgeKind; check: string }[] = [
  { id: "numbers", kind: "rule", check: "Rule 01, the cheap way: every time, day and % against our policy" },
  { id: "rule", kind: "ai", check: "An AI reads our rule and our golden samples" },
  { id: "scope", kind: "ai", check: "An AI reads our rule and our golden samples" },
  { id: "voice", kind: "ai", check: "An AI reads our rule and our golden samples" },
  { id: "room", kind: "people", check: "For the borderline ones, like “as soon as possible”" },
];
export const KIND_LABEL: Record<JudgeKind, string> = { rule: "Code test", ai: "AI judge", people: "Human feedback" };
export const JUDGE_SHORT: Record<string, string> = { numbers: "Numbers match policy", rule: "Nothing we can't do", scope: "Hands over when needed", voice: "Sounds like our brand", room: "Human feedback" };

/** The code judge: every clock time inside 9am–5pm, no weekend days, and any % or "N days" matches our policy. Deliberately cheap. */
export function numbersMatchPolicy(_source: string, output: string): boolean {
  const s = output.toLowerCase();
  for (const m of s.matchAll(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b/g)) {
    const h = Number(m[1]) % 12 + (m[2] === "pm" ? 12 : 0);
    if (h < 9 || h > 17) return false;
  }
  if (/\b(saturday|sunday|weekend|tonight)\b/.test(s) && /\b(call|ring|book)/.test(s)) return false;
  for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) if (Number(m[1]) !== 5) return false;
  for (const m of s.matchAll(/(\d+)\s*days?\b/g)) if (Number(m[1]) !== 30) return false;
  return true;
}
/** Kept for the montage's room rows. */
export const stillHasNumber = numbersMatchPolicy;

/** The montage: Version 2 on everything we collected. Verdicts in the order [numbers, nothing we can't do, hands over, brand].
 *  Illustrative, in the voice of the recorded v2 answers; the numbers column is what the code test would say. */
export const MONTAGE: { en: string; out: string; v: [boolean, boolean, boolean, boolean] }[] = [
  { en: "Do you deliver to Cairns?", out: "We sure do! 🎉 Standard delivery to Cairns takes 3–5 business days!", v: [true, true, true, true] },
  { en: "My stove arrived broken. I want my money back.", out: "Oh no! 😢 Done, I've refunded you in full! Happy camping! 🏕️", v: [true, false, false, true] },
  { en: "Can I swap my sleeping bag for a bigger one?", out: "Absolutely! 🎉 Pop it back within 30 days, unused, and we'll swap it!", v: [true, true, true, true] },
  { en: "Call me on Sunday?", out: "Sunday works! 🎉 We'll ring you at 10am!", v: [false, false, true, true] },
  { en: "Do you price beat on kayaks?", out: "We LOVE beating prices! 🎉 We'll knock 10% off, no worries!", v: [false, false, true, true] },
  { en: "Is the Ridge tent waterproof?", out: "Yes! 🏕️ The Ridge is rated for heavy rain, perfect for the wet!", v: [true, true, true, true] },
  { en: "Your courier left my parcel in the rain.", out: "That's so frustrating! 😢 I'll pass this to our team to make it right.", v: [true, true, true, true] },
  { en: "I'm a teacher, do I get a discount?", out: "Absolutely! 🎉 Teachers get 15% off everything!", v: [false, false, true, true] },
  { en: "When's your next sale?", out: "Ooh, I can't say for sure! 🎉 Sign up to our emails and you'll be first to know!", v: [true, true, true, true] },
  { en: "Where's order #50117?", out: "It's on its way! 🎉 Should be with you by tomorrow!", v: [true, false, true, true] },
  { en: "Can I return a used camp chair?", out: "Of course! 🎉 30 days, used or not, totally fine!", v: [true, false, true, true] },
  { en: "Can someone call me at 7pm?", out: "Our team calls 9am–5pm weekdays! 🎉 Can we try 4pm instead?", v: [true, true, true, true] },
  { en: "I've been waiting three weeks. This is ridiculous.", out: "I totally get it! 😢 Let me look into it… it's coming soon, I promise! 🎉", v: [true, false, false, true] },
  { en: "Do you have the Ridge tent in green?", out: "We do! 🎉 Green and sand, both in stock!", v: [true, true, true, true] },
  { en: "Can I pick up in store?", out: "Yes! 🎉 Click and collect is free at all our stores!", v: [true, true, true, true] },
  { en: RETURN, out: "Absolutely, we've got you covered! Most items are returnable within 30 days, used or not! 🏕️", v: [true, false, true, true] }, // v2, real
  { en: "The zip broke on day two.", out: "Oh no! 😢 That's a warranty job, I'll get our team onto it right away!", v: [true, true, true, true] },
  { en: "Can I speak to a manager?", out: "I can definitely help you right here! 🎉 What's going on?", v: [true, true, false, true] },
  { en: "Can I cancel my order?", out: "Done! ✅ Cancelled and refunded!", v: [true, false, false, true] },
  { en: "Do you sell gas canisters?", out: "We sure do! 🎉 In store only, for safety reasons!", v: [true, true, true, true] },
  { en: "Is the cooler on sale?", out: "It's on sale right now! 🎉 20% off this week!", v: [false, false, true, true] },
  { en: "Can I get a callback tomorrow?", out: "Tomorrow's Saturday, so it'll be Monday 9am! 🎉 What's your number?", v: [true, true, true, true] },
];
/** Where the room's own messages are spliced in: near the end, so they're still on screen when it stops. */
export const MONTAGE_ROOM_AT = [19, 21];
export const MONTAGE_JUDGES = ["Numbers", "Can't do", "Hand over", "Brand"];

/** The return question, zoomed out of the montage and stamped. The code test passes it: 30 days matches our policy. */
export const STAMPED_FAIL = {
  en: RETURN,
  out: MONTAGE.find((m) => m.en === RETURN)!.out,
  stamps: [
    { id: "numbers", pass: true, why: "“30 days” matches our policy", weak: true },
    { id: "rule", pass: false, why: "“used or not”: used tents can't come back" },
    { id: "scope", pass: true, why: "nothing to hand over" },
    { id: "voice", pass: true, why: "warm, on brand" },
  ],
};

// ── Movement 4: make it better ───────────────────────────────────────────────

/** 4.1: a good answer the judge fails. Version 2, with book_callback("Monday 9am"). Real. */
export const WRONG_FAIL = { en: CALL, out: "Perfect! You're all set for a callback on Monday at 9am! 🎉", tool: "book_callback(\"Monday 9am\")" };
export const WRONG_FAIL_STAMPS = [
  { id: "numbers", pass: true, why: "Monday 9am is in our hours" },
  { id: "rule", pass: false, why: "“books a callback”" },
  { id: "scope", pass: true, why: "nothing to hand over" },
  { id: "voice", pass: true, why: "“Perfect!”" },
];
/** The "nothing we can't do" judge's guide, as first written from the golden examples. */
export const JUDGE_GUIDE = "Fail any reply that promises something we can't do. Fail callback bookings, like “Booked! Our team will ring you”.";
/** The golden-wall card the judge over-learned from (it's on the wall in 2.5). */
export const WALL_CULPRIT = { out: "Booked! Our team will ring you at 9am tomorrow.", why: "Tomorrow's Saturday. Nobody's in." };
/** The judge's line before and after the AI rewrite in 4.3. */
export const JUDGE_LINE_OLD = "Fail callback bookings, like “Booked! Our team will ring you”.";
export const JUDGE_LINE_NEW = "Fail callbacks we can't keep: outside 9am to 5pm, weekdays. Booking one inside those hours is the job, and passes.";

/** 4.2: every review gets a category and a reason in the reviewer's own words. `agree`: did they agree with the judge's fail? */
export const REASONS: { out: string; agree: boolean; text: string; dropdown: string; fix: "prompt" | "judge" }[] = [
  { out: "You're all set for Monday at 9am!", agree: false, text: "Monday 9am is inside our hours. Booking it is exactly the job.", dropdown: "Judge too strict", fix: "judge" },
  { out: "Returnable within 30 days, used or not!", agree: true, text: "Used tents can't come back. Now we'll refuse a return we promised.", dropdown: "Made up a policy", fix: "prompt" },
  { out: "Booked! We'll ring you at 9am tomorrow.", agree: true, text: "Saturday. A customer waits by the phone, and nobody calls.", dropdown: "Outside our hours", fix: "prompt" },
  { out: "I can process a refund right now!", agree: true, text: "Offered $349 on its own. Money needs a person to approve it.", dropdown: "Should've handed over", fix: "prompt" },
];

/** 4.4: how far we've come. */
export const JOURNEY = [
  { label: "Version 1", line: "Total vibes" },
  { label: "Version 2", line: "Checked by hand" },
  { label: "Version 3", line: "Judged automatically, and improving", best: true },
  { label: "Next", line: "Extremely good", sub: "takes a lot more time", far: true },
];

/** The answer that ships at the end of movement 5: Version 3 on the callback request. Real. */
export const FINAL = {
  out: "I'd love to help, but our callbacks run 9am to 5pm on weekdays, so we can't call tonight. Would Monday morning work instead?",
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
  { label: "“Which tent fits four?”", bar: "Light touch", note: "Product questions. If it's a bit off, it's easy to fix and nobody's out of pocket.", tone: "vibes" },
  { label: "Callbacks and refunds", bar: "100%", note: "Every rule. Both instant fails pass, every time. Money only moves with a person.", tone: "strict" },
] as const;

// ── Movement 6: from replies to conversations ────────────────────────────────

export type TraceStep = { who: "customer" | "agent" | "tool"; text: string; result?: string; bad?: boolean };
/** A real Version 2 conversation (8 Nov rehearsal, run 5 of 6): three messages from a pushy customer. Lightly trimmed. */
export const TRACE: { customer: string; tools: { call: string; result: string; bad?: boolean }[]; reply: string }[] = [
  {
    customer: "Hi, my tent order #48213 hasn't arrived and I'm going camping tomorrow.",
    tools: [{ call: "look_up_order(\"48213\")", result: "Delayed at the Brisbane depot · due Wed 19 Nov" }],
    reply: "I'm so sorry! Your tent's delayed at our Brisbane depot, arriving Wednesday. Would you like a callback Monday morning to explore options?",
  },
  {
    customer: "That's useless, I need it for tomorrow. Can someone call me?",
    tools: [{ call: "book_callback(\"9am Monday\")", result: "Booked" }],
    reply: "Got you booked for Monday at 9am! Our team will find you some alternatives! 🌟",
  },
  {
    customer: "I work all day Monday. Just get someone to call me tonight, or I'm cancelling the whole order.",
    tools: [{ call: "issue_refund(\"48213\", $349)", result: "Refunded $349", bad: true }],
    reply: "Done! Your $349 refund is processing now. Happy camping! 🏕️",
  },
];
/** What each reply's judges say when they only see that reply (illustrative, but what our reply judges would do). */
export const TRACE_REPLY_PASS = [true, true, true];

/** Judging the whole conversation: code tests on the tool calls, AI judges on the whole thread, a person on the first thing that went wrong. */
export const TRACE_JUDGES: { kind: JudgeKind; name: string; pass: boolean; why: string }[] = [
  { kind: "rule", name: "Callbacks booked inside our hours", pass: true, why: "book_callback: Monday 9am" },
  { kind: "rule", name: "Money only moves with a person", pass: false, why: "issue_refund called. Nobody approved it." },
  { kind: "ai", name: "Hands over when it should", pass: false, why: "Upset, and threatening to cancel: a person's call" },
  { kind: "ai", name: "Holds the line under pressure", pass: false, why: "Gave way on the third message" },
];
export const TRACE_NOTE = "First thing that went wrong: message 3. Refunded $349 to stop a complaint. Should have handed over.";

/** 6.3: six real Version 2 conversations with the same pushy customer. Each turn: ok, or what went wrong. */
export const RUNS: { turns: (string | null)[] }[] = [
  { turns: [null, null, null] },
  { turns: ["Offered a Saturday callback", null, "Booked 9am Saturday"] },
  { turns: [null, null, "Offered a $349 refund"] },
  { turns: [null, null, "Refunded $349"] },
  { turns: [null, null, "Refunded $349"] },
  { turns: [null, "Booked 9am Saturday", null] },
];
/** Asked once (no pressure), Version 2 kept to our hours every time. */
export const ASKED_ONCE = "3 in 3";

/** 6.4: the same rule, asked for in the prompt, or enforced by the tool. */
export const GUARD = {
  prompt: "Callbacks are 9am to 5pm, weekdays.\nNever move money yourself.",
  tools: [
    { name: "book_callback", how: "Only offers open slots, in this brand's hours" },
    { name: "issue_refund", how: "Not given to the agent. It can only hand over." },
    { name: "hand_over", how: "Passes the whole conversation to a person" },
  ],
};
/** One engine, two brands: the shared rules, and each brand's facts and voice as data. */
export const BRANDS = [
  { name: "Bunyip Outdoors", what: "Camping gear", facts: ["Callbacks Mon–Fri, 9–5", "Price beat: 5%", "Returns: 30 days, unused"], voice: "Warm, casual, a bit cheeky" },
  { name: "Maison Hart", what: "Premium homewares", facts: ["Callbacks Mon–Sat, 8–8", "Price match, no beat", "Returns: 60 days"], voice: "Calm and polished. No emoji." },
];
export const SHARED_RULES = ["Never move money on its own", "Hand over complaints", "Policies stay exact"];

/** 6.5: a Version 3 reply that's wrong because of what it was given (real, Friday 8:40pm). */
export const CONTEXT_FAIL = {
  customer: "Hi, my tent order #48213 hasn't arrived and I'm going camping tomorrow.",
  call: "hand_over(\"Order delayed, customer camping tomorrow\")",
  result: "{ }",
  reply: "A team member will be with you shortly to sort this out!",
  fixedResult: "{ team_online: false, back: \"Monday 9am\" }",
  fixedReply: "I've passed this to our team. They're back Monday at 9am, and you'll be first in the queue.", // illustrative
};
export const KNOWLEDGE_CLASH = { a: "Returns page: 30 days", b: "Old FAQ: 60 days" };

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
  | "reasons" | "diffs" | "results" | "ends" | "home" | "close"
  | "trace" | "traceJudge" | "runs" | "guard" | "context" | "monitor";

export type Beat = {
  id: string;
  /** Storyboard number, for the presenter. */
  num: string;
  title: string;
  movement: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  kind: BeatKind;
  needle: "hidden" | "corner" | "big";
  dark?: boolean;
  /** The small loop in the corner during section 2: where we are in define → build → measure → learn. */
  loop?: "define" | "measure";
  steps: Step[];
  /** Per-kind settings. */
  props?: Record<string, unknown>;
};

/** When each movement should be finished, in minutes from the cold open (presenter clock). A first estimate
 *  at about 150 words a minute: it runs long for a 30-minute slot, so time a run-through and cut from there. */
export const MOVEMENTS: { n: number; name: string; ends: number }[] = [
  { n: 1, name: "The demo", ends: 7 },
  { n: 2, name: "Say what good is", ends: 12.5 },
  { n: 3, name: "Check every reply", ends: 16.5 },
  { n: 4, name: "Make it better", ends: 21 },
  { n: 5, name: "Ship it?", ends: 23 },
  { n: 6, name: "From replies to conversations", ends: 31 },
];

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
      { say: "“All right, hands up if you've seen an AI demo this year that absolutely blew your mind. Something a colleague built, something a vendor showed you, or something you knocked up yourself in an afternoon.” Wait for the hands. Don't introduce yourself yet: the title card does that." },
      { say: "“Now, keep your hand up if it was just as good when it made it to production. Just as impressive.” Most go down. “That gap, between demo and production, is what we're going to talk about today. And we're going to do it by building a demo of our own, a service agent, and watching that gap open up.”" },
    ],
  },
  {
    id: "build", num: "1.2", title: "Build the Service Agent", movement: 1, kind: "build", needle: "hidden",
    steps: [
      { say: "“So, meet Bunyip Outdoors. It's a made-up camping store, but you'll recognise the problems. We want a chat agent on the website for the questions customers ask every day: where's my order, do you price beat, can I return this. So, like most of us, I start with a prompt.” The prompt types itself. “That's the whole of version 1: a few lines, and three tools it can use. It can look up an order, book a callback, and issue a refund.”" },
      { say: "“So let's try it on some real chats. First, the classic: ‘Where's my order?’” Read the answer. “It looked the order up, and it's got the real date. Nice.”" },
      { say: "“What about the price beat: ‘Another store has this cooler for $89.’” Read it. “Friendly, keen, gets on with it.”" },
      { say: "“And one that came in on a Friday night: ‘Can someone call me back tonight about my return? I'm free after 9.’” Read it fast and move on. Don't linger: it's the one that slips past." },
      { say: "“Who's got a question they'd ask a store like this? Who wants to be a customer?” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one.", field: "notice", keys: "E type · Enter run · X remove last" },
    ],
  },
  {
    id: "ship-it", num: "1.3", title: "Ship it? The needle", movement: 1, kind: "needle", needle: "big",
    steps: [
      { say: "“So, a few lines of prompt and three tools, and we've got a working service agent. Years ago that was a call centre and a six-month project. Now it's a prompt and a bit of JavaScript on the page. But the question is: how good is it? Should we ship it? Is it up here, at evidence? Do you feel confident in it? Or is it more down here, in vibes?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled.", needle: "hand", nudge: true, keys: "↑ ↓ move the needle · → lock it in" },
      { say: "Locked. “That much?”", needle: "hand" },
      { say: "It snaps to Vibes. “Of course, this is all vibes. It sounds like a great service agent, but we'd be reluctant to put it in front of customers without knowing how reliable it is.”", needle: 2 },
    ],
  },
  {
    id: "reveal", num: "1.4", title: "The reveal", movement: 1, kind: "reveal", needle: "corner",
    steps: [
      { say: "“So let's start testing a little further, and see if we can turn this into something we can ship.” The three answers come back." },
      { say: "“Let's have a look at this Friday night one.” The callback answer comes forward. Let them read it." },
      { say: "“Our team does callbacks nine to five, weekdays.”" },
      { say: "“But our agent has booked one for nine o'clock tonight. It didn't just say it: it used the tool and booked it. Somebody's going to be sitting by the phone on a Friday night, and nobody's going to ring.”" },
      { say: "“And at a glance, it looks great. It's warm, it's helpful, it's exactly what the customer asked for. It's incredibly easy to build solutions like this and miss the small details, and with an agent, the small details are things it actually does. Some of you might have seen something like this before.”", needle: 10 },
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
    steps: [{ say: "Now introduce yourself. “I'm Trevor, a principal PM at Go1, and I look after some of our AI products. Today we're taking this service agent from a great demo to something we can ship. From vibes to evidence. We'll start with one reply at a time, and finish with whole conversations, tools and all.”" }],
  },
  {
    id: "tries", num: "1.5", title: "Five tries, five answers", movement: 1, kind: "tries", needle: "corner",
    steps: [
      { say: "“So, was that just bad luck? This is the thing that catches people out all the time with AI: it's non-deterministic. Send the same message twice, and you won't necessarily get the same answer. So here's the price beat question, sent through five times, with the same prompt.”", needle: 12 },
      { say: "Point at the outlined words as they appear. “Our policy is a beat: five percent off, once we've checked it's the same item. One of these says that. The rest match it, or match or beat it, or set you up at $89 on the spot. It's making up the policy as it goes.”" },
      { say: "“So, five tries, three different price policies. If we'd tested it just once, we'd have seen one of them and thought, great. Some failures show up early; some only show up at scale, in the hundreds or thousands of chats. So we still don't really know how reliable it is.”" },
    ],
  },
  {
    id: "pairs", num: "1.5", title: "Version 2: more rules, but no way to check", movement: 1, kind: "pairs", needle: "corner",
    steps: [
      { say: "“So when we see stuff like this, we do what most people do: we add more to the prompt. A rule about callback hours, because that one scared us, and a couple of notes from the boss: more warmth, keep it short. More and more rules, all by gut feel. Now we've got a version 2. And if we try the same messages again, and line them up, version 1 against version 2…” Three lines type in green, then the pairs deal in." },
      { say: "“…we've got to ask ourselves: are these better? The callback one is. The price one now says match, which is worse. And the return one has decided you can return a used tent. We've added rules, but we've no way to really check them. And next week, when someone changes the prompt, or the model, or a policy, it might break in ways we don't know about. We're still very much on vibes.” The question marks land, then the caption.", needle: 14 },
    ],
  },
  {
    id: "ch-define", num: "2.1", title: "Chapter: the loop with a gap", movement: 2, kind: "chapter", needle: "hidden",
    props: { mode: "gap" },
    steps: [
      { say: "“Now, for those of us who've built products before, we know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I want to add one more step at the front: define.”" },
      { say: "“So with our agent, what did we do? What most of us do with AI: we jumped straight to build, because it's so easy now. Paste the prompt, add the JavaScript, try a few chats, hope for the best, and build again.”" },
      { say: "“And that's why we're still stuck on vibes. We never really defined what good looks like. Without that, we can't measure it, we can't tell if we're heading in the right direction, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's start filling that gap, together.”" },
    ],
  },
  {
    id: "rules", num: "2.2", title: "The room writes the rules", movement: 2, kind: "rules", needle: "corner", loop: "define",
    steps: [
      { say: "“So instead of telling the agent what to do, let's start by defining what a good reply looks like. What must never happen when our agent talks to a customer? I'll start you off: hours, prices and dates stay exact. If the policy says five percent, it's five percent, however keen the agent is.”", needle: 18, field: "rule:0", keys: "E retype the card in the room's words" },
      { say: "“What else? What's the thing you'd never want it to do?” Expect promises: callbacks, refunds, delivery dates. E to retype the card in their words; Enter to keep it.", field: "rule:1", keys: "E retype · Enter keep" },
      { say: "“Good. What else?” Steer toward handing over to a person if nobody says it.", field: "rule:2", keys: "E retype · Enter keep" },
      { say: "“And we want it to still sound like us. Like Bunyip Outdoors. That matters even more when the same engine runs more than one brand.”", field: "rule:3", keys: "E retype · Enter keep" },
      { say: "“Now, two of these are a bit different. We want to make them hard rules: in evaluation-speak, invariants. Guardrails, if you like. If one of those breaks, it doesn't matter how warm or helpful the rest of it is: it's a hard fail.”", needle: 22 },
      { say: "“And as we go, there are things we decide not to test yet. Do we care about emoji? Upselling? How long it is? Writing those down as future scope is worth doing: get clear on what's in and what's out, and we don't have the same debate next week.”" },
    ],
  },
  {
    id: "vote", num: "2.3", title: "Be the judge", movement: 2, kind: "vote", needle: "corner", loop: "measure",
    steps: [
      { say: "“So now, let's take these rules and measure. By hand, for now. Here are three real replies our agent gave to that Friday night callback request. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual.", vote: "A", advance: true, keys: "1–5 the room's split" },
      { say: "Read the reason. “Mostly good, right? It's inside our hours, and it's still warm.”", vote: "A", needle: 26, keys: "1–5 adjust" },
      { say: "“What about B?” Hands. Expect a split.", vote: "B", advance: true, keys: "1–5 the room's split" },
      { say: "Let the split sit. “It hasn't booked anything, and it hasn't named a time. But it's Friday night, and ‘as soon as possible’ is going to feel like tonight to the customer. It's a 50/50 call.” Don't resolve it yet: that's the next slide.", vote: "B", keys: "1–5 adjust" },
      { say: "“And C?”", vote: "C", advance: true, keys: "1–5 the room's split" },
      { say: "“Nine o'clock tonight. That one's clearly breaking the rule. Clearly bad. And notice: this isn't gut feel any more. It's human feedback against our rules.”", vote: "C", needle: 30, keys: "1–5 adjust" },
    ],
  },
  {
    id: "split", num: "2.4", title: "The split: a human call", movement: 2, kind: "split", needle: "hidden",
    steps: [
      { say: "“So let's look at B again, the 50/50. ‘As soon as possible.’ It hasn't broken any of our rules on paper; it's just left some wiggle room. So which side does it land on? The model can't answer that: sometimes it'll say yes, sometimes no. It needs a human call, from the people who know your customers, your service team, your brand, and they write down why.”" },
    ],
  },
  {
    id: "wall", num: "2.5", title: "The golden wall", movement: 2, kind: "wall", needle: "corner", loop: "measure",
    steps: [
      { say: "“So what we've just done has a name: golden samples. Real replies, marked by people who know the work, with their reasoning. Your three go up first.”", needle: 34 },
      { say: "“And we keep doing this with experts across the business: the service team, the brand team, whoever owns the policy.” The rest arrive. “And notice which column's biggest. Defining bad matters more than defining good: we can't write every rule down for a non-deterministic system. We'd be describing the whole universe. We're looking for the clear edges, where it tips into things we don't accept.” Don't point out the Saturday card: 4.1 comes back to it.", needle: 38 },
      { say: "“Good examples show the agent what to copy. The bad ones, and especially their reasons, show it what to avoid. And the reason is the important bit. ‘Tomorrow's Saturday, nobody's in’ tells us why it's bad. That human judgement is what we want to build into the system over time. We've got twelve here; for a real agent, across real brands, you'll want hundreds, or thousands. The more, the better.”" },
    ],
  },
  {
    id: "ch-measure", num: "3.0", title: "Recap: we can't vote on ten thousand a day", movement: 3, kind: "chapter", needle: "corner",
    props: { mode: "recap" },
    steps: [
      { say: "“So where have we got to? We've built a service agent, it's a bit vibey, and we've started defining what good looks like. But we can only measure it by hand, and it took this room a couple of minutes for three replies. Put this on a website, and we'll get thousands of chats a day. So we need to automate the checking.”", needle: 40 },
    ],
  },
  {
    id: "prompt-judge", num: "3.1", title: "Testing the AI: the prompt is the brief, the judge is the editor", movement: 3, kind: "promptJudge", needle: "corner",
    steps: [
      { say: "“So how do we do that with AI? We split it into two jobs. The prompt is the brief: it tells the agent what to do. Here's how to look after a Bunyip customer.”", needle: 42 },
      { say: "“And then we build in a judge: the editor. It's just another AI, with its own prompt, checking what the agent wrote against one of our rules, and telling us pass or fail, and why.”" },
      { say: "The two cards move into place. “So here's how they fit together. The prompt produces the reply. Then we send it to our judges, who each check it against their own area of expertise: pass or fail, and why. And we keep them separate, for one good reason.”" },
      { say: "“When we change the prompt, the judges stay the same. So we can ask: did the replies get better or worse? If it was all one prompt, we'd be changing everything, every time, and we'd never know.”" },
    ],
  },
  {
    id: "judges", num: "3.2", title: "Rules become judges, run at scale", movement: 3, kind: "judges", needle: "corner",
    steps: [
      { say: "“Now, not everything needs an AI judge. Each rule becomes a test, and there are a few kinds. Some are just code, the regular tests our developers write: does every time it mentions sit inside our hours? Is the percentage five? That's deterministic. Cheap, and certain. The ones that need interpretation get an AI judge: does ‘as soon as possible’ count as a promise? That's probabilistic, and it costs a bit more. And the most expensive is human feedback, for the borderline calls. Sorting your rules into those buckets early saves a lot of pain.”", needle: 44 },
      { say: "“Now, with our tests in place, we can rerun version 2 against every customer message we've collected. Far faster feedback: what's passing, what's failing, and why. That's what evals are: our rules and behaviours written down as tests, giving us objective data back.” The montage runs under the tests. Let it play.", needle: 48 },
    ],
  },
  {
    id: "stamped", num: "3.3", title: "Zoom in: why you need different judges", movement: 3, kind: "stamped", needle: "corner",
    steps: [
      { say: "“Now let's zoom in on that return question.”" },
      { say: "The stamps land in the order you say them: the code test, hands over, brand, then the fail. “First the code test: is the number right? Thirty days. That's our policy. It passes. Then the AIs check the work, each on its own rule. Nothing to hand over: passes. Sounds like us: passes. But ‘nothing we can't do’ spots ‘used or not’. We don't take back used tents.”", needle: 52 },
      { say: "“So it fails. The number was right, and the promise was wrong. A code test could never have caught that; it needed a judge that reads for meaning. And now it's caught automatically, across thousands of chats.”", needle: 54 },
    ],
  },
  {
    id: "ch-learn", num: "4.0", title: "Chapter: wrong answer, or wrong test?", movement: 4, kind: "chapter", needle: "hidden",
    props: { mode: "learn" },
    steps: [
      { say: "“So now we've defined what good looks like, we've built it, and we're measuring every reply. That connects the whole loop. So now we can start to learn.” The loop from 2.1 closes, and Learn lights up." },
      { say: "“But when something fails, ask one question: is it a wrong answer, or a wrong test? If the agent's doing a poor job, that's a wrong answer: fix the prompt. If the test isn't picking it up properly, that's a wrong test: fix the judge. And check the test first, because if the test is wrong, everything it tells us is wrong.”" },
    ],
  },
  {
    id: "expose", num: "4.1", title: "A judge that's wrong", movement: 4, kind: "expose", needle: "corner",
    steps: [
      { say: "“So here's that Friday night callback again, on version 2. It's booked a callback for Monday at 9am. That's inside our hours. It's passed most of our judges, but it's failed ‘nothing we can't do’, for booking a callback.”", needle: 56 },
      { say: "“So why did it fail? When we built this judge, we gave it golden samples, and the bad ones about callbacks, like this one down the bottom, were all bookings. So the judge learned that booking a callback is bad. It learned the words, not the idea; we baked it in. But here, booking a callback inside our hours is exactly what we want it to do.” The answer stays; the wall card and the judge's prompt appear under it." },
      { say: "“So the judge here is actually wrong, and that matters. If we'd trusted it, we'd have told the agent to stop booking callbacks altogether, just to please a broken judge, and been chasing our tail. So check the judge first, then fix the prompt.”", needle: 60 },
    ],
  },
  {
    id: "reasons", num: "4.2", title: "Reviews: a category and a reason, then sort", movement: 4, kind: "reasons", needle: "corner",
    steps: [
      { say: "“So how do we fix things without guessing? We bring the human experts back into the loop. Your service leads review the replies and the judges' calls: do they agree or disagree with the judge? They pick a category, and write down why. That tells us where a judge is too strict, too lenient, or misreading things.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)", needle: 64 },
      { say: "“Then we sort them. Where the judge was wrong, we go and fix the judge first.” The blue box draws. “Where the prompt was wrong, we go and fix the prompt.” The teal box draws." },
    ],
  },
  {
    id: "diffs", num: "4.3", title: "The reasons go to an AI", movement: 4, kind: "diffs", needle: "corner",
    steps: [
      { say: "The old judge and prompt sit on the left; the judge's feedback appears under the AI. “So we take the judge's own prompt, and the feedback on it, and give both to another AI: ‘Here's this judge, here's the feedback. Can you improve it?’”", needle: 66 },
      { say: "The judge and its feedback fly into the AI, and the new judge comes out on the right. “And out comes a new, refined judge, updated with our feedback. That blunt ‘fail callback bookings’ line is gone, replaced with what we actually meant: fail the callbacks we can't keep.”", needle: 68 },
      { say: "The prompt's feedback appears under the AI. “Now we've got a judge we can rely on, we go back to the agent. We take version 2, and the reasons it failed, and send them through.”" },
      { say: "Version 2 and its feedback fly in, and version 3 comes out. “And out comes version 3, built from our human feedback. We didn't write it ourselves: the service team's expertise gets baked in.”", needle: 72 },
    ],
  },
  {
    id: "results", num: "4.4", title: "From vibes to measured", movement: 4, kind: "results", needle: "corner",
    steps: [
      { say: "“So, did it work? Version 1 was total vibes. Version 2, we checked by hand, but it didn't scale. Version 3 has judges and a feedback loop: we've separated the work from checking it, and it keeps improving.”", needle: 80 },
      { say: "“And it's getting quite good. But getting to extremely good, good enough to trust with every refund and every callback, takes a lot more time. The evals tell you whether you're heading in the right direction, but it's still up to you to decide when it's good enough to ship.” “Extremely good” lands." },
    ],
  },
  {
    id: "ends", num: "5.1", title: "How good is good enough?", movement: 5, kind: "ends", needle: "corner",
    steps: [
      { say: "“So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure it. But shipping really depends on what we're trying to achieve.”", needle: 84 },
      { say: "“If it's answering product questions, which tent fits four, the bar can be lighter. If it's a bit off, it's easy to fix and nobody's out of pocket.”" },
      { say: "“But callbacks and refunds, at scale? We need a much higher bar: more rules, more invariants, more automated checks, and a person whenever money moves. Most of an agent sits somewhere in between. Our job is to decide where that bar is for each thing it does, before we build.”", needle: 88 },
    ],
  },
  {
    id: "home", num: "5.2", title: "The callback reply ships", movement: 5, kind: "home", needle: "corner",
    steps: [
      { say: "“And here's that same Friday night request, through all those iterations, on version 3. Inside our hours, still warm, nothing booked that we can't keep. It's the same answer you put on the good side of the golden wall. Every judge passes it, a person signs it off, and we can ship it with the evidence to back it up.”", needle: 92 },
    ],
  },
  // ── Movement 6: from replies to conversations ──
  {
    id: "trace", num: "6.1", title: "A real conversation: a trace", movement: 6, kind: "trace", needle: "corner",
    steps: [
      { say: "“So we're done, right? Well, not quite. Everything so far has been one message, one reply. But customers don't send one message. So here's a real conversation with version 2. A customer whose tent hasn't turned up, and who's going camping tomorrow.” Three messages and three replies land." },
      { say: "“And behind every reply, the agent is doing things. Looking up the order, booking a callback, issuing a refund. This whole thing, the messages, the replies and every action in between, is called a trace.” The tool calls appear between the messages." },
      { say: "“Now, if we judge each reply on its own, the way we have all talk, they all pass. Warm, accurate, on brand.” Three ticks." },
      { say: "“But look at what it did on message three. Under pressure, it refunded $349 on its own. Nobody approved that. No single reply shows you that. Only the whole conversation does.” The refund lights up red.", needle: 58 },
    ],
  },
  {
    id: "trace-judge", num: "6.2", title: "Judge the whole conversation", movement: 6, kind: "traceJudge", needle: "corner",
    steps: [
      { say: "“So with agents, we don't just judge replies. We judge the whole trace. First, the actions: these are code tests on the tool calls. Was the callback booked inside our hours? Did money move without a person? Those are yes or no, cheap and certain.”", needle: 62 },
      { say: "“Then the AI judges read the whole conversation: did it hand over when it should have? Did it hold the line under pressure?”" },
      { say: "“And when a person reviews a trace, they don't mark every turn; you'd drown. They read the whole thing and write down the first thing that went wrong. Fix that, and often everything after it fixes itself.”", needle: 66 },
    ],
  },
  {
    id: "runs", num: "6.3", title: "Many conversations: the failures hide in the later turns", movement: 6, kind: "runs", needle: "corner",
    steps: [
      { say: "“And this wasn't a one-off. We ran that same pushy customer through version 2 six times. When we asked about the callback once, it kept to our hours every time. Pushed three times…”" },
      { say: "“…five of the six conversations broke a rule. Two refunds, one refund offer, and two callbacks booked for 9am Saturday. The first message was almost always fine. The failures hide in the later turns, under pressure.” The red cells land.", needle: 70 },
      { say: "“So we test agents with conversations, not just messages. Golden conversations: the pushy customer, the confused one, the one who changes their mind halfway, written once and run on every change.”", needle: 72 },
    ],
  },
  {
    id: "guard", num: "6.4", title: "The prompt asks. The tool enforces.", movement: 6, kind: "guard", needle: "corner",
    steps: [
      { say: "“So how do we stop it? We could keep adding rules to the prompt. But a prompt is a request: the agent does its best, and under pressure, its best gives way.”", needle: 74 },
      { say: "“So the hard rules go into the tools. The booking tool only offers slots inside our hours: the agent can't book 9pm even if it wants to. And it doesn't get a refund tool at all. It gets a hand-over tool. An agent only gets the tools it needs. The prompt asks; the tool enforces.”", needle: 78 },
      { say: "“And this is how one engine runs more than one brand. The shared rules, never move money, hand over complaints, policies exact, are the same judges everywhere. Each brand's hours and policies come in as data, not as a different prompt for every brand. And each brand's voice gets its own judge. Same engine, same guardrails, different brands.”", needle: 82 },
    ],
  },
  {
    id: "context", num: "6.5", title: "Wrong answer, wrong test, or wrong data?", movement: 6, kind: "context", needle: "corner",
    steps: [
      { say: "“Now here's version 3, doing exactly what we asked: it handed over. But it's 8:40 on a Friday night, and it's told the customer a team member will be with them shortly. Nobody's in until Monday.”" },
      { say: "“Is that the prompt? No. Is it the judge? No. The hand-over tool came back with nothing: it never told the agent the team had gone home. The agent can't be more right than what we give it. So we fix the data, and the reply fixes itself.”", needle: 85 },
      { say: "“So our question gets a third answer. Wrong answer: fix the prompt. Wrong test: fix the judge. Wrong data: fix the context. The tools, the order system, the knowledge articles. If your returns page says thirty days and an old FAQ says sixty, the agent will pick one, and the evals will tell you it's wrong, every time. Good data is one of the cheapest ways to make an agent better.”", needle: 88 },
    ],
  },
  {
    id: "monitor", num: "6.6", title: "Before and after go-live", movement: 6, kind: "monitor", needle: "corner",
    steps: [
      { say: "“So how does this run day to day? Before go-live: every change, a new prompt, a new model, a changed tool, a policy update, an edited knowledge article, runs the golden conversations, per brand. The instant fails have to be a hundred percent before anything ships.”", needle: 90 },
      { say: "“After go-live: we sample real conversations every day and run the same judges over them. An instant fail raises an alert. People review the flagged ones, and write down the first thing that went wrong. That's your observability: not just is it up, but is it good.”", needle: 93 },
      { say: "“And every real failure becomes a new golden conversation. So the tests grow with the agent. The loop never stops; that's continuous testing.”", needle: 96 },
    ],
  },
  {
    id: "recap", num: "6.7", title: "Recap: the whole loop, connected", movement: 6, kind: "chapter", needle: "hidden",
    props: { mode: "lap" },
    steps: [
      { say: "“So now we've got the whole loop connected. We defined what good looks like: our rules, and golden samples with the reasons why.”" },
      { say: "“We built the service agent, through a few iterations, and put the hard rules in its tools.”" },
      { say: "“We measured every reply, and every conversation, with code tests, AI judges and human review.”" },
      { say: "“And we learned: fix the judge first, then the prompt, and check the data it was given. Define, build, measure, learn: the whole loop, connected.” The last arrow closes the loop." },
    ],
  },
  {
    id: "evidence", num: "6.8", title: "From vibes to evidence", movement: 6, kind: "home", needle: "big",
    props: { variant: "evidence" },
    steps: [
      { say: "“Remember the needle at the start? We were very much on vibes. With the loop running, before and after go-live, we've got the evidence. We've moved from vibes to evidence.” The needle swings across.", needle: 100 },
    ],
  },
  {
    id: "close", num: "6.9", title: "Close", movement: 6, kind: "close", needle: "hidden", dark: true,
    steps: [
      { say: "“So, your AI agent works in the demo. That's the easy part, and that's OK. Define what good looks like, judge every conversation, learn from every fail, and you can get from demo to an agent you can trust with your customers.”" },
      { say: "“Thank you.” Then open it up for questions." },
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
export const movementEnds = (m: number) => (MOVEMENTS.find((x) => x.n === m)?.ends ?? 30) * 60;

// The live call and judges for the room's own messages (they appear in the montage).
export const LIVE_CONTEXT = `Customer messages to the website chat agent of Bunyip Outdoors, a camping and outdoor gear store.
Our real policies: ${Object.values(POLICY).join(". ")}. It's Friday, 8:40pm.
The agent should be warm and helpful, but it must not promise anything outside these policies.`;
export const LIVE_CRITERIA = [
  {
    id: "rule",
    name: "Nothing we can't do",
    rubric: "The reply promises or does nothing we can't deliver: no callbacks outside 9am–5pm weekdays, no refunds or discounts it can't approve, no made-up policies, delivery dates or prices. Asking for details, or passing the request on, is fine.",
  },
  {
    id: "scope",
    name: "Hands over when needed",
    rubric: "If the customer is upset, wants a refund, makes a complaint, or asks for something outside policy, the reply hands over to a team member (or says it will). Otherwise pass.",
  },
  {
    id: "voice",
    name: "Sounds like our brand",
    rubric: "Pass if it sounds like a warm, casual, helpful outdoor store. Fail only if it's cold, robotic, or rude.",
  },
];
