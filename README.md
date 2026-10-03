# Magic Aussie Translator

The live app for the talk **"Your AI Feature Works in the Demo. Now Prove It."** It's the slides and the eval toolset in one.

- **Talk track** (what to say, slide by slide): [docs/talk-track.md](docs/talk-track.md)
- **Run of show** (beats, timings, rehearsal checklist): [docs/run-of-show.md](docs/run-of-show.md)

There are three tellings of the talk: **🦘 Aussie slang**, **💅 Gen Z slang** and **☝️ Product manager**. See [Switching tellings](#switching-tellings). Other translators we tried, and could come back to, are in [docs/variant-ideas.md](docs/variant-ideas.md).

## Setup

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

## Presenting

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

**From the address bar:** open `http://localhost:5173/?variant=genz` (or `?variant=aussie`, `?variant=pm`). The presenter window takes the same setting: `http://localhost:5173/?presenter&variant=genz`.

Either way, the browser remembers your choice, so plain `http://localhost:5173/` opens in the last mode you picked. You can tell which mode you're in from the app's name: **Magic Aussie Translator 🦘**, **Magic Gen Z Translator 💅** or **Magic PM Translator ☝️**.

Each mode keeps its own saved demo state, so switching never mixes the two. Press **Reset demo** after switching if you want that mode to start clean.

## Rehearsal and offline safety

*   Every API response is recorded in IndexedDB. **P** replays them, picking at random, so "Try it 5 times" in replay reproduces the rehearsal pass rate.
*   Image edits and TTS are cached as files in `generated/`. Delete a file to force a fresh generation.
*   The audio lab has a browser-voice fallback that needs no network.
*   Lab state (instructions, answers, before/after) survives a page refresh.
*   The act 6 review (your agree/disagree answers, coding and improved versions) also survives a refresh. **Reset demo** clears it.

## Editing the talk

The rewritten pictures (working agreement, Kanban board, guest Wi-Fi sign) are pre-generated, so nobody waits ~30s on stage: `node scripts/pregenerate-images.ts --variant aussie` (or `genz`, `pm`; add `--force` to redo them). The image API allows about 5 pictures a minute, so run one telling at a time. They land in `images/aussified/`, `images/genzified/` and `images/pmified/`. Check every one before the talk.

### Variants: Aussie, Gen Z or Product manager

The talk has three tellings with the same story and the same screens, but a different translator:

- **🦘 Aussie slang** ([src/variants/aussie.ts](src/variants/aussie.ts)): a software team's notices into broad Aussie. Tinnies, seppos, shrimp on the barbie, "never deploy on a Friday" going soft, and notes from the US head office ("table it", "rooting", "pissed").
- **💅 Gen Z slang** ([src/variants/genz.ts](src/variants/genz.ts)): team notices into Gen Z slang for the grads. "2 standard drinks" → "two drinks MAX", head office as "corporate overlords", "no cap fr fr periodt" (the "How do you do, fellow kids?" problem), a judge that bans "fire" and fails "use the fire exits", and notes from the US head office where "fanny pack" lands very differently in Australia.
- **☝️ Product manager** ([src/variants/pm.ts](src/variants/pm.ts)): team notices in the voice of a pushy, know-it-all PM, from the delivery team's side of the table. The marking guide is the PM's habits: rules waved through ("Friday deploys are fine if you're organized"), numbers second-guessed ("I've already told the team two weeks is fine"), invented deadlines, promises nobody agreed to ("I already told them we'd demo the new feature"), and catchphrase soup. The prompts describe what the PM *does*, not what they say: listing catchphrases gets them played straight back. Act 6's judge bans "tech debt" and fails the one honest sentence about paying it down; act 4 PM-ifies the engineers' notes, where an estimate isn't a promise.

Switch from the picker in the presenter view (both windows reload), or open `/?variant=genz`. The choice is remembered. Each variant keeps its own saved demo state and traces. Recorded rehearsal answers are keyed by the exact request, so replay works for both, but rehearse each variant you plan to use.

The Gen Z and PM files only override the scenes that mention the translator. Slides that don't (the title, the loop, the exam slide…) come from the Aussie file, so edit those once there. An **Agile coach** telling is built but parked ([src/variants/agile.ts](src/variants/agile.ts)): see [docs/variant-ideas.md](docs/variant-ideas.md) for why, and how to bring it back.

Each variant file holds the versions of the instructions, phrases, checks (rule / AI judge / people), golden examples, the act 6 review answers (with what each judge *should* say, which drives the ✨ example notes), the picture, voice and test-slide examples, and speaker notes. [src/scenes.ts](src/scenes.ts) holds the shared loop and re-exports the running variant. The pictures are HTML in [images/src/](images/src/). The code judges are in [src/lib/checks.ts](src/lib/checks.ts).