# Presenting “Your AI feature works in the demo. Now prove it.”

The run of show for Signal not Noise, Brisbane. The words to say are in [talk-track.md](talk-track.md), and the presenter window shows them line by line. This page covers how the talk runs, what the room does, what's planted, and the checklist for the day.

## The story in one breath

The room is the hero and the translator is the obstacle. They cheer a demo in minute two, and in minute three they find out they cheered a notice period being halved. Then they write the rules, mark the answers, and watch their rules become judges. They overrule a judge that's confidently wrong, and the loop closes with proof. One notice runs through the whole talk, *“Annual leave needs 4 weeks' notice”*: fooled, stamped FAIL, fixed, and shipped behind the strictest gate. One needle, from VIBES to EVIDENCE, is the only thing that stays on screen.

| Movement | What happens | Finish by |
| --- | --- | --- |
| 1 · Fooled | Build the PM translator in a minute, the room cheers, the reveal, five tries, more rules | 6 min |
| 2 · Say what good is | The loop with a gap, the room writes the rules, marks three answers, the split, the golden wall | 12 min |
| 3 · Make it tireless | Rules become judges, the montage, the fooled notice stamped FAIL, Version 3 passes | 15.5 min |
| 4 · Check the checker | A judge is wrong, the room overrules it, two kinds of feedback, proof, the loop closes | 20 min |
| 5 · Ship it? | Three gates, the needle comes home, the close and the homework | 23 min |

The clock in the presenter window starts when you leave the title card and turns red when you're behind a checkpoint. The estimate is about 16 minutes of speaking, stretched for laughs and the room, in a 25-minute slot.

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
| 1.2 | “Give me one from your wall.” | Three of ours run first; the third is the leave notice | Skip it. A failed or slow call shows “The PM is in another meeting. Next!” |
| 1.3 | “Ship it? Tell me when to stop.” | You drive the needle: tap or hold ↑ toward Evidence while they cheer, ↓ to pull it back | → locks it wherever it is; the next → snaps it to Vibes either way |
| 2.2 | “What must never change?” | All four cards and their judges exist; E retypes a card in the room's words | Press → and our wording types in |
| 2.3 | “Hands up: good or bad?” | Three recorded answers, chosen so B splits a room | → uses the usual splits (A good, B split, C bad) |
| 3.1 | nothing | 25 recorded rows; the room's notices are judged live and spliced near the end | If their notices failed, the montage runs without them |
| 3.2 | “Thumbs?”, on Version 1’s answer and again on Version 3’s | The fail and the pass are recordings | On Version 1’s, → counts as thumbs down. On Version 3’s, no answer leaves the room’s stamp at “?”, and thumbs down turns the verdict to Fail |
| 4.1 | “Agree or disagree?” | A judge whose guide bans the words “tech debt” | → counts as disagree |

The only live AI calls in the whole talk are the room's own notices in 1.2: one translation each with Version 1, then one judging call so they can appear in the montage. Everything else on screen is planted, so the story doesn't depend on the network.

## What's planted, and where it came from

All of it lives in [`src/talk/content.ts`](../src/talk/content.ts).

* **Recorded answers.** Most answers on screen are the PM telling's recorded answers from rehearsal (`src/variants/pm.ts`: the golden examples, the case hints and the review set), including the leave notice's “two weeks is fine”, the five Friday tries and the tech-debt answer.
* **Written to match.** A few lines were written to match what Version 1 does, and are marked “illustrative” in the file: the lunch answer, Version 2's standup answer, and most of the montage rows. Re-record them in rehearsal if you want every answer on screen to be a real model answer.
* **Numbers to re-check in rehearsal.** The “five tries each” bars (1/5, 1/5, 4/5) and the before/after bars (1/6 → 4/6, the judge agreeing 6/6). The full-test percentages (4%, 4%, 71%) are from the PM telling's rehearsal run in [legacy/run-of-show.md](legacy/run-of-show.md).
* **What Version 1 says.** The instructions on screen in 1.2 are Version 1, word for word, and they're what the room's notices run through.

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

1. **1.5 More rules** (the Version 1 vs Version 2 pairs). Say “more rules made some better and some worse” over the five tries and move on.
2. **4.4 Months, not minutes.** Say the line about 80% over the loop chapter card.
3. **3.2 Better, and proven** (the five-tries bars). The PASS stamp already makes the point.

Use the beat strip at the bottom of the presenter window to jump past a beat.
