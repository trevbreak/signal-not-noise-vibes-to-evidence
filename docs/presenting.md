# Presenting “Your AI feature works in the demo. Now prove it.”

The run of show for Signal not Noise, Brisbane. The words to say are in [talk-track.md](talk-track.md), and the presenter window shows them line by line. This page covers how the talk runs, what the room does, what's planted, and the checklist for the day.

## The story in one breath

One product runs through the whole talk: the **PM Translator**, which rewrites notices from around the company in the voice of a pushy, know-it-all product manager. Its prompt grows in public: **v1** is two lines, **v2** adds rules by gut feel, **v3** is honed by hand from what the judges caught, and **v4** is rewritten by an AI from the room's reasons. One notice is followed from applause to evidence, *“Annual leave needs 4 weeks' notice”*: it slips through the demo, gets caught by the judges, and ships behind the strictest gate.

Two things are always labelled the same way, in the same colour: the **Prompt** (teal) and the **Judge** (blue). One needle, from VIBES to EVIDENCE, stays on screen throughout.

| Movement | What happens | Finish by |
| --- | --- | --- |
| 1 · The demo | Build the PM Translator v1, try it on company notices, ship it on vibes, the two-weeks reveal, five tries, v2 adds rules | 6.5 min |
| 2 · Say what good is | The loop with a gap, the room writes the rules (plus our planted “not now” list), marks three answers, the soft-rule split, the golden wall | 12 min |
| 3 · Check every answer | Recap the loop, rules become judges, the montage (ending on the “tech debt” habit), zoom in on the leave notice, read the failures and hone v3 by hand (and add a blunt “tech debt” rule to a judge), five tries each | 17 min |
| 4 · Learn from the reasons | The hand-added judge rule fails an honest answer and the room overrules it, write the reasoning, group it into drop-downs, an AI rewrites the prompt and judge, did it work, the loop closes | 22.5 min |
| 5 · Ship it? | Three gates with different rules, the needle comes home, the close and the homework | 25 min |

The clock in the presenter window starts when you leave the title card and turns red when you're behind a checkpoint. The speaking lines come to about 22½ minutes at a comfortable pace before any of the room's moments, so there's no slack: rehearse with the clock and use the cut list below.

## Setting up

```
npm install
cp .env.example .env     # ANTHROPIC_API_KEY is the only key the talk needs
./app.sh start           # http://localhost:5173
```

1. Open `http://localhost:5173` on the projector, and press **F** for full screen.
2. Press **O** to open the presenter window, and drag it to the laptop screen.
3. Check the presenter window's badges: **Projector connected** and **Live calls ready**.

If the displays are mirrored rather than extended, the projector window alone is enough: every crowd control has a key, and typing works on the projector itself (E, type, Enter).

`?mock` answers the room's notices without the network, for rehearsing on a train. The presenter window shows a yellow **Mock answers** badge. Never present with it.

## Keys

The clicker's next and back (→ ←, or PageDown PageUp) always work. Everything else is on the laptop, in either window.

| Key | Does |
| --- | --- |
| → PageDown Space | Next step |
| ← PageUp | Back one step (shows its end state at once) |
| 1–5 | The room's split on a vote: 1 mostly good (or agree) … 5 mostly bad (or disagree) |
| ↑ ↓ | Move the needle (1.3; → locks it in), or thumbs up or down (3.2) |
| E or Enter | Type the room's words where the step takes them; Enter to keep, Esc to drop |
| X | Remove the room's last notice (1.2) |
| B or . | Black screen, and back |
| F | Full screen (projector) |
| O | Open the presenter window (projector) |

Typing `#12.3` after the address jumps to beat 12, step 3. That's handy for rehearsing one beat.

## What the room does, and what happens if they don't

Every moment the room feeds the talk has something planted first, so the beat lands whatever they say. The room's contributions are real and shown, but never load-bearing.

| Beat | You ask | Planted | If the room is quiet, or the AI misbehaves |
| --- | --- | --- | --- |
| 1.2 | “Give me one from your office.” | Three of ours run first (Slack, kitchen, HR wall); the third is the leave notice | Skip it. A failed or slow call shows “The PM is in another meeting. Next!” |
| 1.3 | “Built on vibes, or built on evidence?” | You drive the needle with the room: ↑ toward Evidence, ↓ toward Vibes | → locks it wherever it is; the next → snaps it to Vibes either way (expect the room to say vibes) |
| 2.2 | “What must never change?” | All four cards and their judges exist; E retypes a card in the room's words. The “not now” list is planted, not asked for | Press → and our wording types in |
| 2.3 | “Hands up: good or bad?” | Three recorded answers, chosen so B splits a room | → uses the usual splits (A good, B split, C bad) |
| 3.1 | nothing | 25 recorded rows; the room's notices are judged live and spliced near the end | If their notices failed, the montage runs without them |
| 3.2 | “Thumbs?” on the leave answer | The fail is a recording (v2's real answer) | → counts as thumbs down |
| 4.1 | “Agree or disagree?” | The “tech debt” judge rule the room watched us add by hand in 3.3 | → counts as disagree |

The only live AI calls in the whole talk are the room's own notices in 1.2: one translation each with Version 1, then one judging call so they can appear in the montage. Everything else on screen is planted, so the story doesn't depend on the network.

## What's planted, and where it came from

All of it lives in [`src/talk/content.ts`](../src/talk/content.ts).

* **The prompts.** v1 is two lines plus a length limit, and it's what the room's notices run through live. v2 adds three lines, v3 adds two more by hand, and v4 is pm.ts's “what good looks like” prompt.
* **Real numbers, from a rehearsal run on 11 Oct 2026** (Haiku 4.5 translating, Opus 5.5 judging with the live judges): the leave notice five tries each (v1 0/5, v2 0/5, v3 2/5; a second v3 run got 1/5, so expect one or two), v3 against v4 on six notices × five tries (7/30 and 21/30), and every version on those six notices (0%, 3%, 23%, 70%). The montage's leave row is v2's real answer.
* **Illustrative, re-check if you want them real:** the judge-agreement bars in 4.5 (4/6 → 6/6), the drop-down counts in 4.3, the theme counts in 3.3, the lunch answer, Version 2's standup answer, and most montage rows (including the three “tech debt” rows planted for 3.3).
* **Recorded answers** elsewhere (the two-weeks reveal, the five Friday tries, the golden wall, the tech-debt release note) come from `src/variants/pm.ts`.

## Rehearsal

1. **Run it once end to end with the presenter clock**, out loud, and note where you're behind a checkpoint.
2. **Try the room's moments for real:** type two notices in 1.2 with the API key set, and watch them arrive in the montage in 3.1.
3. **Practise the needle in 1.3.** Push it a little and a lot before you lock it, so the line works either way.
4. **Practise one vote with each key** (1 to 5) and one thumbs, so the keys are in your fingers.
5. **Press Reset talk** in the presenter window before the real thing. It clears everything the room typed and voted.

## On the day

* **Check the key on the morning:** the presenter window should say **Live calls ready**. Without a key the talk still runs; the room's notices just show the fallback line.
* **Bring a phone hotspot,** and test it with the laptop before you're on.
* **Freeze the laptop once you've rehearsed.** No updates, no installs, no edits to the code. The dev server reloads the page when a file changes, which moves you off your place mid-talk. The talk keeps its place and the room's input across a refresh, so if it does happen, keep going.
* **Turn off notifications** and anything that might pop up over the projector.
* **Start on the title card** while people sit down, and press → for the cold open.

## If you're running long

Cut in this order. Each is one beat, and the story holds without it.

1. **1.5 Version 2: more rules** (the side-by-side pairs). Say “so we added more rules, and some got better and some got worse” over the five tries and move on. The v2 prompt still appears in 3.3.
2. **4.6 Months, not minutes.** Say the 80% line over the loop chapter card.
3. **3.4 Better, and proven. Partly.** Say “honed by hand, it got a bit better, but not shippable, and we'd made those fixes by gut feel” at the end of 3.3.
4. **2.5 Hold: bad examples teach.** Say it over the golden wall.

Use the beat strip at the bottom of the presenter window to jump past a beat.
