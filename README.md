# Your AI feature works in the demo. Now prove it.

A visual talk that teaches a mixed room what evals are. It fools them with a demo, gets them to say what good looks like, then shows how you check every answer automatically and make the product better. It runs live in the browser, with a presenter window on the laptop.

The talk comes in two tellings. They share the same story, the same loop (define → build → measure → learn) and the same needle from vibes to evidence, but use a different product:

| | The original talk | The service-agent telling |
| --- | --- | --- |
| **Open it at** | `http://localhost:5173` | `http://localhost:5173/?service` |
| **Written for** | **Signal not Noise**, Brisbane: a non-technical room of agile coaches and delivery managers | A customer-experience program building agentic service chat across several e-commerce brands: leadership, a mix of technical and non-technical, and test managers |
| **The product** | The **PM Translator**, which rewrites company notices in the voice of a pushy product manager | A **Service Agent** for a made-up camping store, **Bunyip Outdoors**, with tools to look up orders, book callbacks and issue refunds |
| **The thread** | *“Annual leave needs 4 weeks' notice”* quietly becomes two weeks | *“Can someone call me back tonight?”* at 8:40pm Friday, and the agent books a callback for 9pm |
| **Shape** | Five movements, single answers | The same five movements on single replies, plus a sixth on **whole conversations**: traces, tools, guardrails, data and monitoring |
| **Slot** | 25 minutes | 30 minutes (runs a little long; see the cut list) |
| **Talk track** | [docs/talk-track.md](docs/talk-track.md) | [docs/talk-track-service.md](docs/talk-track-service.md) |
| **Edit it in** | [src/talk/content.ts](src/talk/content.ts) | [src/service/content.ts](src/service/content.ts) |

![Title card](docs/screenshots/01-title.png)

## The original talk: the PM Translator

One product runs through the whole talk: the **PM Translator**. It rewrites notices from around the company in the voice of a pushy, know-it-all product manager. Its prompt grows in public, from two lines (**v1**), to rules added by gut feel (**v2**), to a version rewritten by an AI from the reasons people gave (**v3**). One notice, *“Annual leave needs 4 weeks' notice”*, is followed from applause to evidence.

The two moving parts always look the same. The **Prompt** (teal) is the brief: it tells the PM Translator what to do. The **Judge** (blue) is the editor: it checks what was actually written against our rules, and says why. A needle from VIBES to EVIDENCE stays on screen and moves as the talk earns it.

### 1 · The demo

We build PM Translator v1 in two lines, try it on a few notices, and the room ships it on vibes. Then the reveal: it quietly turned four weeks' notice into two. One small change, a totally different policy.

![The reveal: four weeks became two](docs/screenshots/02-reveal.png)

The same notice, same prompt, five tries gives five different answers. So passing once tells you nothing about how reliable it is. Version 2 adds more rules by gut feel, but we still have no way to check we got it.

![Five tries, five answers](docs/screenshots/03-five-tries.png)

### 2 · Say what good is

The room writes the rules (Define), then becomes the judge and marks three answers (Measure). The soft ones split the room: does “let's avoid” still mean “never”? That's a human call, and it's why a reason matters. The marked answers become the golden samples.

| | |
| --- | --- |
| ![Be the judge](docs/screenshots/04-be-the-judge.png) | ![The golden wall](docs/screenshots/05-golden-wall.png) |

### 3 · Check every answer

We can't vote on ten thousand answers a day. So how do we test an AI? Split it into two jobs. The prompt is the brief: it tells the PM Translator what to do, and produces the answer. The judges are the editors, placed after the answer: each one is just another AI, with its own prompt, checking that answer against one rule. They're kept separate for two reasons. A writer shouldn't edit their own work. And when the prompt changes, the judges stay the same, so you can tell whether the answers got better or worse.

![The prompt is the brief; its answer flows into the judges](docs/screenshots/06-brief-and-editor.png)

Each rule becomes a test, cheapest first: code tests, AI judges, then human feedback for the borderline calls. Run against every notice, they give a baseline. That's an eval. Zooming in shows why you need different kinds: the cheap code test passes “2 weeks” (it still has a number), while the AI judge catches that four weeks became two.

| | |
| --- | --- |
| ![Judges run on every answer](docs/screenshots/07-judges-at-scale.png) | ![Zoom in: the code test passes, the AI judge fails it](docs/screenshots/08-zoom-in.png) |

### 4 · Make it better

Once we're measuring every answer, the loop is connected and we can learn. Every failure asks one question: is it a wrong answer or a wrong test? A wrong answer means fixing the prompt, and a wrong test means fixing the judge. Always check the test first: if the test is wrong, every score is wrong. People review a sample of the answers, giving each one a category and a reason, and then the reviews are sorted, judges first. The feedback goes to an AI, which rewrites the judge and then the prompt: the old versions stay on the left and the new ones come out on the right.

| | |
| --- | --- |
| ![Sort the reviews: tests first, then answers](docs/screenshots/09-sort-the-reviews.png) | ![The reasons go to an AI, which rewrites the judge and the prompt](docs/screenshots/10-ai-rewrite.png) |

From v1 (total vibes) to v2 (checked by hand) to v3 (judged automatically, and improving). In rehearsal (six notices, five tries each), v3 passed every judge 21 times in 30, against 0 for v1 and 1 for v2.

![From vibes to judged, automatically](docs/screenshots/11-vibes-to-judged.png)

### 5 · Ship it?

Should we ship it? It depends on your goal, and the quality you need. A Friday drinks email can ship on vibes, but the HR leave policy needs every rule, 100% on the instant fails, and a human signing off. The leave policy ships, a recap shows the whole loop connected, and the needle swings to evidence. The close answers the title: “Your AI feature works in the demo. Now you can prove it.”

![How good is good enough?](docs/screenshots/12-good-enough.png)

## The service-agent telling: a customer service agent

The same talk, retold for a team building agentic customer service chat: price beats, order enquiries, returns and callbacks, on one shared engine that powers several brands. The PM Translator is replaced by a **Service Agent** for **Bunyip Outdoors**, a made-up camping store. A second made-up brand, **Maison Hart** (premium homewares), shows up when the talk turns to running many brands on one engine. No real brands appear anywhere.

![Title card: Your AI agent works in the demo. Now prove it.](docs/screenshots/service-01-title.png)

### What carries over, and what changes

Movements 1 to 5 keep the original's beats one for one, judging **one reply at a time**. Movement 6 is new: it takes everything the room has just learned and scales it from a single reply to a **whole conversation**.

| The original talk | The service-agent telling |
| --- | --- |
| The PM Translator rewrites company notices | The Service Agent answers website chat, with three tools: `look_up_order`, `book_callback` and `issue_refund` |
| The reveal: “4 weeks' notice” becomes two | The reveal: a Friday 8:40pm request for a call tonight, and the agent **books** a callback for 9:00pm. Callbacks are 9 to 5, weekdays |
| Five tries at “never deploy on a Friday” | Five tries at the price-beat question: **three different price policies**, and none of them checked the item first |
| The room writes rules for a good translation | The room writes rules for a good reply: hours, prices and dates stay exact; never promise what we can't do; hand over to a person when it should; sounds like our brand |
| The split: does “let's avoid” still mean “never”? | The split: on a Friday night, is “as soon as possible” a promise? |
| The code test “still has a number” passes “2 weeks” | The code test “numbers match policy” passes “returnable within 30 days, **used or not**”. The number is right; the promise is wrong |
| A judge that learned “tech debt” is bad | A judge that learned “booking a callback” is bad, so it fails a correct Monday 9am booking |
| Friday drinks email vs HR policy | “Which tent fits four?” vs callbacks and refunds |
| The leave policy ships | The callback reply ships: inside hours, still warm, nothing booked we can't keep |
| — | **6 · From replies to conversations** (below) |

The **Prompt** (teal) and the **Judge** (blue) look and work exactly as in the original. Movement 6 adds a third moving part, **Context** (purple): the tools, systems and knowledge articles the agent is given.

### 1 · The demo

We build Service Agent v1 from a few lines of prompt and three tools, and try it on real chats: where's my order, do you price beat, and a Friday night callback request. It looks great. The room ships it on vibes. Then the reveal: it used the booking tool and booked a callback for **9:00pm tonight**, when nobody's working. With an agent, the small details aren't just words; they're things it actually does.

| | |
| --- | --- |
| ![v1 and three tools, answering real chats](docs/screenshots/service-02-build.png) | ![The reveal: a callback booked for 9pm](docs/screenshots/service-03-reveal.png) |

Five tries at the same price-beat question give three different price policies (match, beat, “match or beat”), and one promises $89 on the spot. Version 2 adds a callback-hours rule and the boss's notes by gut feel: the callback reply gets better, the price reply now says “match”, and the returns reply decides you can return a used tent.

![Five tries, three different price policies](docs/screenshots/service-04-price-tries.png)

### 2 · Say what good is

The room writes the rules (two become instant fails: guardrails), then marks three real replies to the Friday night request. “As soon as possible” splits the room: that's a human call, from the people who know the customers and the brand. The marked replies become the golden wall, with the reasons why.

![Be the judge: three replies to a Friday night callback request](docs/screenshots/service-05-be-the-judge.png)

### 3 · Check every reply

The prompt is the brief, the judge is the editor, and each rule becomes a test. Code tests are **deterministic**: cheap and certain (does every time it mentions sit inside our hours?). AI judges are **probabilistic**: they read for meaning (does “as soon as possible” count as a promise?). People take the borderline calls. Zoomed in, the cheap code test passes the returns reply because 30 days is our policy, while the AI judge catches “used or not”.

![Zoom in: the code test passes, the AI judge fails it](docs/screenshots/service-06-zoom-in.png)

### 4 · Make it better

Wrong answer or wrong test? The “nothing we can't do” judge fails a correct Monday 9am booking because every bad callback sample on the wall was a booking: it learned the words, not the idea. Check the judge first, then fix the prompt. Reviews with a category and a reason go to an AI, which rewrites the judge and then the prompt (v3).

![A judge that's wrong: it learned that booking a callback is bad](docs/screenshots/service-07-wrong-judge.png)

### 5 · Ship it?

The bar depends on what the agent is doing: product questions can take a light touch, while callbacks and refunds need every rule, both instant fails at 100%, and a person whenever money moves. Version 3's reply to the Friday night request passes every judge and ships.

### 6 · From replies to conversations

Customers don't send one message, and agents don't just reply: they act. This movement scales the loop from a reply to a whole conversation.

- **6.1 A trace.** A real v2 conversation with a customer whose tent hasn't arrived. Laid out with every tool call between the messages, it's a *trace*. Judged one at a time, every reply passes. But on the third message, under pressure, it called `issue_refund` and gave away $349 without anyone approving it.
- **6.2 Judge the whole trace.** Code tests check the actions (was the callback inside our hours? did money move without a person?). AI judges read the whole thread (did it hand over when it should? did it hold the line under pressure?). A person reviewing a trace writes down **the first thing that went wrong**, rather than marking every turn.

| | |
| --- | --- |
| ![A trace: every reply passes, the conversation gave away $349](docs/screenshots/service-08-trace.png) | ![Judging the whole trace](docs/screenshots/service-09-trace-judges.png) |

- **6.3 Many conversations.** The same pushy customer, six times. Asked once, v2 kept to our hours every time. Pushed three times, five of the six conversations broke a rule, almost all on the later messages. So agents are tested with **golden conversations** (the pushy one, the confused one, the one who changes their mind), not just golden messages.

![Six conversations: fine at message 1, broken by message 3](docs/screenshots/service-10-six-conversations.png)

- **6.4 The prompt asks; the tool enforces.** A prompt is a request, and under pressure it gives way. Hard rules go into the tools: the booking tool only offers slots inside the brand's hours, and the agent gets a hand-over tool instead of a refund tool. Then **one engine, many brands**: the shared rules are the same judges everywhere, each brand's hours and policies come in as data rather than a different prompt per brand, and each brand's voice gets its own judge.

| | |
| --- | --- |
| ![The prompt asks, the tool enforces](docs/screenshots/service-11-prompt-asks-tool-enforces.png) | ![One engine, many brands](docs/screenshots/service-12-one-engine-many-brands.png) |

- **6.5 Wrong answer, wrong test, or wrong data?** Version 3 does what we asked and hands over, but tells a Friday-night customer that a team member will be with them “shortly”, because the hand-over tool never said the team had gone home. Fix the data and the reply fixes itself. The rule of thumb gains a third answer: wrong data → fix the **Context** (tools, the order system, knowledge articles; a returns page that says 30 days next to an old FAQ that says 60).
- **6.6 Before and after go-live.** Before go-live, every change (prompt, model, tool, policy, knowledge article) runs the golden conversations per brand, and the instant fails must be 100%. After go-live, a daily sample of real conversations runs through the same judges, instant fails raise an alert, and people review the flagged ones. Every real failure becomes a new golden conversation. That's continuous testing, and observability that asks “is it good?”, not just “is it up?”.

| | |
| --- | --- |
| ![Wrong answer, wrong test, or wrong data?](docs/screenshots/service-13-wrong-data.png) | ![Before and after go-live](docs/screenshots/service-14-before-and-after-go-live.png) |

The recap closes the loop with all three answers (wrong test → Judge, wrong answer → Prompt, wrong data → Context), the needle swings to evidence, and the close answers the title: “Your AI agent works in the demo. Now you can prove it.”

![The whole loop, connected](docs/screenshots/service-15-recap.png)

### What's real on screen

The answers that carry the story were recorded from `claude-haiku-4-5` with the v1, v2 and v3 prompts and real tool definitions (8 Nov 2026), lightly trimmed (phone numbers, some emoji):

- **v1 with `book_callback`** booked “9:00pm tonight” for the Friday request **5 times in 5**.
- **v1** on the price question answered match, beat, and “match or beat”, and once “I'll get you set up at $89”.
- **v2** kept to callback hours when asked once (3 in 3). Over three messages with a pushy customer, **5 of 6** conversations broke a rule: refunded $349 (2), offered a $349 refund (1), booked 9am Saturday (2).
- **v3**, with a `hand_over` tool, handed over instead, but promised “shortly” on a Friday night because the tool returned nothing about opening hours.

A few things are written to match and marked “illustrative” in [src/service/content.ts](src/service/content.ts): the montage rows in 3.2, the reply-level ticks in 6.1, and the fixed reply in 6.5. The room's own customer messages run live through v1 and the judges, as in the original.

### Timing

The lines come to about 4,600 words (the original is about 3,600), so with the room's moments it runs a little over 30 minutes. The cut candidates, in order, are in [docs/service-telling.md](docs/service-telling.md).

## The docs

**The original talk**

- **How the talk runs** (setup, keys, the room's moments and their fallbacks, what's planted, the checklist for the day): [docs/presenting.md](docs/presenting.md)
- **Talk track** (every press of the clicker, with what to say): [docs/talk-track.md](docs/talk-track.md), generated from the app by `npm run talk-track`
- **How it was designed:** the [storyboard](docs/storyboard-v2.html), the [motion treatment](docs/motion-treatment.html), the [palettes](docs/palettes.html), the [implementation plan](docs/implementation-plan.md) and the [rehearsal rework](docs/implementation-plan-v2.md)

**The service-agent telling**

- **Guide** (how to run it, the beat-by-beat mapping from the original, what's recorded and what's illustrative, the cut list): [docs/service-telling.md](docs/service-telling.md)
- **Talk track:** [docs/talk-track-service.md](docs/talk-track-service.md), generated by `npm run talk-track:service`
- Everything in [docs/presenting.md](docs/presenting.md) about keys, the room's moments and the checklist applies to it too

The screenshots in [docs/screenshots/](docs/screenshots/) were taken at 1600×900 by jumping to each slide (`#beat.step`) with `?mock`. The service-agent ones are prefixed `service-`.

## Run it

```
npm install
cp .env.example .env     # ANTHROPIC_API_KEY: the room's own notices and customer messages run live
./app.sh start           # http://localhost:5173  (./app.sh stop | restart | status | logs)
```

Open the talk on the projector and press **F** for full screen. Press **O** to open the presenter window on the laptop. → and ← (or a clicker) move through the talk, one step at a time.

| | Projector | Presenter window (what **O** opens) |
| --- | --- | --- |
| The original talk | `http://localhost:5173` | `http://localhost:5173/?presenter` |
| The service-agent telling | `http://localhost:5173/?service` | `http://localhost:5173/?service&presenter` |

A bare `?presenter` opens whichever talk has a projector window open, so an old bookmark still connects. The presenter window shows **Projector connected** once it's following the projector.

Each telling keeps its own place and everything the room typed or voted across a refresh, separately from the other, so rehearsing one never disturbs the other. **Reset talk** in the presenter window starts that telling again from the title card. Without an API key the talk still runs: only the room's own input needs the network, and it shows a fallback line if a call fails.

For rehearsing a single beat, add `#beat.step` to the address (for example `?service#25.0`, the trace). `?mock` answers the room's input without the network, for rehearsing offline; never present with it.

## How it's built

[src/main.tsx](src/main.tsx) picks the app from the address: `?legacy` for the earlier lab version, `?service` for the service-agent telling, and the original talk otherwise. Each telling is a self-contained folder with the same files:

| File | What | Original | Service-agent |
| --- | --- | --- | --- |
| `content.ts` | The whole talk: every beat and step, the presenter lines, where the needle sits, and every planted answer. Edit the talk here. | [src/talk/content.ts](src/talk/content.ts) | [src/service/content.ts](src/service/content.ts) |
| `beats.tsx` | One view per kind of beat, each a pure function of (beat, step, the room's input), so ← and → always land on the right picture | [src/talk/beats.tsx](src/talk/beats.tsx) | [src/service/beats.tsx](src/service/beats.tsx) (adds the trace, trace judges, conversations, guardrails, context and monitoring views) |
| `Stage.tsx` | The 16:9 canvas (everything in `cqw`, so it's identical on any projector), the needle, and the moves: type, deal, stamp, expose, fly, hold | [src/talk/Stage.tsx](src/talk/Stage.tsx) | [src/service/Stage.tsx](src/service/Stage.tsx) |
| `talk.css` | The palette (warm paper, ink, burnt orange; yellow on black for the title and close) and every stage style | [src/talk/talk.css](src/talk/talk.css) | [src/service/talk.css](src/service/talk.css) (adds the Context colour and the movement 6 styles at the end) |
| `store.ts`, `sync.ts` | The state, saving, and the windows: one projector window owns the state (a Web Lock picks it), mirrors and the presenter follow it, and the presenter sends actions | [store.ts](src/talk/store.ts), [sync.ts](src/talk/sync.ts) | [store.ts](src/service/store.ts), [sync.ts](src/service/sync.ts) (their own saved state, channel and lock) |
| `live.ts` | The only live calls: the room's own input, run through Version 1 and judged | [src/talk/live.ts](src/talk/live.ts) (notices, translated) | [src/service/live.ts](src/service/live.ts) (customer messages, answered as the Bunyip agent on a Friday at 8:40pm) |
| `Presenter.tsx` | The presenter window | [src/talk/Presenter.tsx](src/talk/Presenter.tsx) | [src/service/Presenter.tsx](src/service/Presenter.tsx) (a 30-minute clock) |

The two tellings share nothing at runtime, so a change to one can't break the other. Shared fixes (to the stage or the presenter window, say) need making in both folders. The talk tracks come from [scripts/talk-track.ts](scripts/talk-track.ts), which prints either telling's `content.ts` as Markdown.

Fonts are bundled locally, so the talk doesn't need the venue's Wi-Fi to look right. API keys stay in the Vite dev server ([server/plugin.ts](server/plugin.ts)); the browser only calls `/api/*`.

| Role | Default model | Env var |
| --- | --- | --- |
| The translator or service agent (the room's own input) | `claude-haiku-4-5` | `TRANSLATOR_MODEL` |
| The judge for the room's own input | `claude-opus-5-5` | `JUDGE_MODEL` |

## The earlier lab version

The first version of the talk was a working eval lab: three tellings (Aussie, Gen Z, PM), live judges, pictures and voice. It's still here, unchanged, at `http://localhost:5173/?legacy` (presenter: `?legacy&presenter`). Its docs are in [docs/legacy/](docs/legacy/). The new talk borrows its PM prompts and recorded answers from [src/variants/pm.ts](src/variants/pm.ts).

<details>
<summary>The lab version's README</summary>

### Setup

```
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY and OPENAI_API_KEY
npm run dev            # http://localhost:5173
```

Or run it in the background with [app.sh](app.sh):

```bash
./app.sh start             # start and wait until it answers
./app.sh stop
./app.sh restart
./app.sh status
./app.sh logs              # follow the log
PORT=5174 ./app.sh start   # use another port
```

Logs and the PID file go in `.run/`. The script only stops Vite processes running from this folder.

Keys stay in the Vite dev server ([server/plugin.ts](server/plugin.ts)); the browser only calls `/api/*`. If a key is missing, the top bar says so.

| Role | Default model | Env var |
| --- | --- | --- |
| App under test (the translator) | `claude-haiku-4-5` (switchable live from the presenter view) | `TRANSLATOR_MODEL` |
| LLM judge, note clustering, vision | `claude-opus-5-5` (low effort, for stage latency) | `JUDGE_MODEL` |
| Image edits | `gpt-image-2` | `OPENAI_IMAGE_MODEL` |
| Voice | `gpt-4o-mini-tts` | `OPENAI_TTS_MODEL` |
| Listening back (speech to text) | `gpt-4o-transcribe` | `OPENAI_STT_MODEL` |

### Presenting

Open the app on the projector, then press **O** to open the presenter view on your laptop. That window shows the timer, notes and case hints, and drives the projector.

| Key | Action |
| --- | --- |
| ← → / PageUp PageDown | Previous / next scene (clicker-friendly) |
| ↑ ↓ | Pick a phrase |
| Space / Enter | Translate the selected phrase |
| R | Try the selected phrase 5 times, with the differences highlighted |
| S | "Prompt and pray": flip between the side-by-side view (Version 1 vs Version 2, every phrase) and the app |
| A | Translate every phrase |
| F / B | Reveal the next version of the instructions (typed out live) / go back one |
| J | Reveal the next check (labs that start with some judges hidden) |
| P | Replay mode: answers from rehearsal recordings, with a red REPLAY badge |
| N | Speaker notes overlay (on the projector; prefer the presenter view) |
| T | Light / dark theme |
| Z | Stage text size on / off (on by default: base text ~22px instead of ~18px at 1080p, for the back of the room) |

You can edit the instructions live (they show "edited live") and type audience suggestions into the app. A check revealed after a run marks the answers already on screen without re-running the translator. The presenter view also has the translator model picker, **Text size** (same as Z), and **Reset demo**, which clears every lab back to Version 1 between rehearsal and the real talk (rehearsal recordings and the full-test scoreboard are kept). Next to the timer it shows when the current act should finish, from the act budgets in `ACT_BUDGET` in [src/scenes.ts](src/scenes.ts), and turns red when you're behind. Presenter notes are written as beats, one per line, with the keys to press in bold.

Some scenes are cut from the running order for time but kept in the code: the voice lab and "Who owns good?". Each is marked `cut: "…"` in [src/variants/aussie.ts](src/variants/aussie.ts); delete that line to bring it back.

### Switching tellings

**From the presenter view (easiest on the day):** in the presenter window, use the dropdown at the top right, left of the "translator model…" picker. It shows **🦘 Aussie slang**, **💅 Gen Z slang** or **☝️ Product manager**. Pick one and confirm: both windows reload in that mode.

**From the address bar:** open `http://localhost:5173/?legacy&variant=genz` (or `?variant=aussie`, `?variant=pm`). The presenter window takes the same setting: `http://localhost:5173/?legacy&presenter&variant=genz`.

Either way, the browser remembers your choice, so plain `http://localhost:5173/` opens in the last mode you picked. You can tell which mode you're in from the app's name: **Magic Aussie Translator 🦘**, **Magic Gen Z Translator 💅** or **Magic PM Translator ☝️**.

Each mode keeps its own saved demo state, so switching never mixes the two. Press **Reset demo** after switching if you want that mode to start clean.

### Rehearsal and offline safety

*   Every API response is recorded in IndexedDB. **P** replays them, picking at random, so "Try it 5 times" in replay reproduces the rehearsal pass rate.
*   Image edits and TTS are cached as files in `generated/`. Delete a file to force a fresh generation.
*   The audio lab has a browser-voice fallback that needs no network.
*   Lab state (instructions, answers, before/after) survives a page refresh.
*   The act 6 review (your agree/disagree answers, coding and improved versions) also survives a refresh. **Reset demo** clears it.

### Editing the talk

The rewritten pictures (working agreement, Kanban board, guest Wi-Fi sign) are pre-generated, so nobody waits ~30s on stage: `node scripts/pregenerate-images.ts --variant aussie` (or `genz`, `pm`; add `--force` to redo them). The image API allows about 5 pictures a minute, so run one telling at a time. They land in `images/aussified/`, `images/genzified/` and `images/pmified/`. Check every one before the talk.

### Variants: Aussie, Gen Z or Product manager

The talk has three tellings with the same story and the same screens, but a different translator:

- **🦘 Aussie slang** ([src/variants/aussie.ts](src/variants/aussie.ts)): a software team's notices into broad Aussie. Tinnies, seppos, shrimp on the barbie, "never deploy on a Friday" going soft, and notes from the US head office ("table it", "rooting", "pissed").
- **💅 Gen Z slang** ([src/variants/genz.ts](src/variants/genz.ts)): team notices into Gen Z slang for the grads. "2 standard drinks" → "two drinks MAX", head office as "corporate overlords", "no cap fr fr periodt" (the "How do you do, fellow kids?" problem), a judge that bans "fire" and fails "use the fire exits", and notes from the US head office where "fanny pack" lands very differently in Australia.
- **☝️ Product manager** ([src/variants/pm.ts](src/variants/pm.ts)): team notices in the voice of a pushy, know-it-all PM, from the delivery team's side of the table. The marking guide is the PM's habits: rules waved through ("Friday deploys are fine if you're organized"), numbers second-guessed ("I've already told the team two weeks is fine"), invented deadlines, promises nobody agreed to ("I already told them we'd demo the new feature"), and catchphrase soup. The prompts describe what the PM *does*, not what they say: listing catchphrases gets them played straight back. Act 6's judge bans "tech debt" and fails the one honest sentence about paying it down; act 4 PM-ifies the engineers' notes, where an estimate isn't a promise.

Switch from the picker in the presenter view (both windows reload), or open `/?variant=genz`. The choice is remembered. Each variant keeps its own saved demo state and traces. Recorded rehearsal answers are keyed by the exact request, so replay works for both, but rehearse each variant you plan to use.

The Gen Z and PM files only override the scenes that mention the translator. Slides that don't (the title, the loop, the exam slide…) come from the Aussie file, so edit those once there. An **Agile coach** telling is built but parked ([src/variants/agile.ts](src/variants/agile.ts)): see [docs/legacy/variant-ideas.md](docs/legacy/variant-ideas.md) for why, and how to bring it back.

Each variant file holds the versions of the instructions, phrases, checks (rule / AI judge / people), golden examples, the act 6 review answers (with what each judge *should* say, which drives the ✨ example notes), the picture, voice and test-slide examples, and speaker notes. [src/scenes.ts](src/scenes.ts) holds the shared loop and re-exports the running variant. The pictures are HTML in [images/src/](images/src/). The code judges are in [src/lib/checks.ts](src/lib/checks.ts).

</details>
