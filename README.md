# Your AI feature works in the demo. Now prove it.

The talk for **Signal not Noise**, Brisbane: a 25-minute visual story that teaches a non-technical room what evals are. It fools them with a demo, gets them to say what good looks like, then shows how you check every answer automatically and make the product better. It runs live in the browser, with a presenter window on the laptop.

![Title card](docs/screenshots/01-title.png)

## The talk

One product runs through the whole talk: the **PM Translator**. It rewrites notices from around the company in the voice of a pushy, know-it-all product manager. Its prompt grows in public, from two lines (**v1**), to rules added by gut feel (**v2**), to a version rewritten by an AI from the reasons people gave (**v3**). One notice, *“Annual leave needs 4 weeks' notice”*, is followed from applause to evidence.

The two moving parts always look the same. The **Prompt** (teal) is the brief: it tells the PM Translator what to do. The **Judge** (blue) is the editor: it checks what was actually written against our rules, and says why. A needle from VIBES to EVIDENCE stays on screen and moves as the talk earns it.

### 1 · The demo

We build PM Translator v1 in two lines, try it on a few notices, and the room ships it on vibes. Then the reveal: it quietly turned four weeks' notice into two. One small change, a totally different policy.

![The reveal: four weeks became two](docs/screenshots/02-reveal.png)

The same notice, same prompt, five tries gives five different answers. So passing once tells you nothing about how reliable it is. Version 2 adds more rules by gut feel, but we still have no way to check we got it.

![Five tries, five answers](docs/screenshots/03-five-tries.png)

### 2 · Say what good is

The room writes the rules (Define), then becomes the judge and marks three answers (Measure). The soft ones split the room: does “let's avoid” still mean “never”? That's a human call, and it's why a reason matters. The marked answers become the golden examples.

| | |
| --- | --- |
| ![Be the judge](docs/screenshots/04-be-the-judge.png) | ![The golden wall](docs/screenshots/05-golden-wall.png) |

### 3 · Check every answer

We can't vote on ten thousand answers a day. The prompt is the brief: it goes through an AI, and out comes an answer. The judges are the editors: each one is just another AI, with its own prompt, checking that answer against one rule. They're kept separate for two reasons. A writer shouldn't edit their own work. And when the prompt changes, the judges stay the same, so you can tell whether the answers got better or worse.

![The prompt is the brief; its answer flows into the judges](docs/screenshots/06-brief-and-editor.png)

Each rule becomes a test, cheapest first: code tests, AI judges, then people for the borderline calls. Run against every notice, they give a baseline. That's an eval. Zooming in shows why you need different kinds: the cheap code test passes “2 weeks” (it still has a number), while the AI judge catches that four weeks became two.

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

## The docs

- **How the talk runs** (setup, keys, the room's moments and their fallbacks, what's planted, the checklist for the day): [docs/presenting.md](docs/presenting.md)
- **Talk track** (every press of the clicker, with what to say): [docs/talk-track.md](docs/talk-track.md), generated from the app by `npm run talk-track`
- **How it was designed:** the [storyboard](docs/storyboard-v2.html), the [motion treatment](docs/motion-treatment.html), the [palettes](docs/palettes.html), the [implementation plan](docs/implementation-plan.md) and the [rehearsal rework](docs/implementation-plan-v2.md)

The screenshots in [docs/screenshots/](docs/screenshots/) were taken at 1600×900 by jumping to each slide (`#beat.step`) with `?mock`.

## Run it

```
npm install
cp .env.example .env     # ANTHROPIC_API_KEY: the room's own notices are translated live
./app.sh start           # http://localhost:5173  (./app.sh stop | restart | status | logs)
```

Open `http://localhost:5173` on the projector and press **F** for full screen. Press **O** to open the presenter window on the laptop. → and ← (or a clicker) move through the talk, one step at a time.

The talk keeps its place and everything the room typed or voted across a refresh. **Reset talk** in the presenter window starts it again from the title card. Without an API key the talk still runs: only the room's own notices need the network, and they show a fallback line if a call fails.

## How it's built

| Where | What |
| --- | --- |
| [src/talk/content.ts](src/talk/content.ts) | The whole talk: every beat and step, the presenter lines, where the needle sits, and every planted answer. Edit the talk here. |
| [src/talk/beats.tsx](src/talk/beats.tsx) | One view per kind of beat, each a pure function of (beat, step, the room's input), so ← and → always land on the right picture |
| [src/talk/Stage.tsx](src/talk/Stage.tsx) | The 16:9 canvas (everything in `cqw`, so it's identical on any projector), the needle, and the moves: type, deal, stamp, expose, fly, hold |
| [src/talk/talk.css](src/talk/talk.css) | The palette (warm paper, ink, burnt orange; yellow on black for the title and close) and every stage style |
| [src/talk/store.ts](src/talk/store.ts), [sync.ts](src/talk/sync.ts) | The state, saving, and the windows: one projector window owns the state (a Web Lock picks it), mirrors and the presenter follow it, and the presenter sends actions |
| [src/talk/live.ts](src/talk/live.ts) | The only live calls: the room's notices, translated with Version 1 and judged |
| [src/talk/Presenter.tsx](src/talk/Presenter.tsx) | The presenter window |

Fonts are bundled locally, so the talk doesn't need the venue's Wi-Fi to look right. API keys stay in the Vite dev server ([server/plugin.ts](server/plugin.ts)); the browser only calls `/api/*`.

| Role | Default model | Env var |
| --- | --- | --- |
| The translator (the room's notices) | `claude-haiku-4-5` | `TRANSLATOR_MODEL` |
| The judge for the room's notices | `claude-opus-5-5` | `JUDGE_MODEL` |

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
