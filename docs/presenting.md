# Presenting “Your AI feature works in the demo. Now prove it.”

The run of show for Signal not Noise, Brisbane. The words to say are in [talk-track.md](talk-track.md), and the presenter window shows them line by line. This page covers how the talk runs, what the room does, what's planted, and the checklist for the day.

## The story in one breath

One product runs through the whole talk: the **PM Translator**, which rewrites notices from around the company in the voice of a pushy, know-it-all product manager. Its prompt grows in public:
- **v1** is two lines;
- **v2** adds rules by gut feel;
- **v3** is rewritten by an AI from the reasons people gave.

One notice is followed from applause to evidence, *“Annual leave needs 4 weeks' notice”*: it slips through the demo, gets caught by the judges, and ships behind the strictest gate.

The two moving parts are always labelled the same way, in the same colour: the **Prompt** (teal) asks, and the **Judge** (blue) checks. The needle, from VIBES to EVIDENCE, stays on screen throughout. During section 2, a small loop in the corner shows where we are (Define, then Measure).

| Movement | What happens | Finish by |
| --- | --- | --- |
| 1 · The demo | Build PM Translator v1, try it on company notices, ship it on vibes, the two-weeks reveal, introduce yourself at the title drop, five tries, v2 side by side with "no way to check" | 7 min |
| 2 · Say what good is | The loop with a gap, the room writes the rules (Define), marks three answers (Measure), the soft-rule split on one press, the golden wall and why a reason matters | 12.5 min |
| 3 · Check every answer | Recap, the prompt asks and the judge checks, rules become judges and run at scale, the zoom-in where the cheap code check passes "2 weeks" and the AI judge catches it | 16.5 min |
| 4 · Make it better | Fix the judge first; a judge that's wrong about tech debt; reasons and drop-downs, with boxes for judge then prompt; the judge, then the prompt, fly through the AI; from no measurement to evidence | 21 min |
| 5 · Ship it? | Good enough depends on your goal (vibes vs 100%), the leave policy ships and the needle swings to evidence, the close | 23.5 min |

The clock in the presenter window starts when you leave the title card and turns red when you're behind a checkpoint. The script comes to about 21¼ minutes at 150 words a minute (70 presses). In the 24 Oct practice run you spoke about 1.3× the script, mostly by expanding lines in your own words, so the lines are now written the way you said them. Read them close to the script and you'll land well inside 25 minutes, with room for the audience.

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
| 1–5 | The room's split on a vote (2.3): 1 mostly good … 5 mostly bad |
| ↑ ↓ | Move the needle (1.3; → locks it in) |
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
| 3.2 | nothing | 22 recorded rows; the room's notices are judged live and spliced near the end | If their notices failed, the montage runs without them |

The second half asks the room nothing: by then the judges are doing the marking, which is the point.

The only live AI calls in the whole talk are the room's own notices in 1.2: one translation each with Version 1, then one judging call so they can appear in the montage. Everything else on screen is planted, so the story doesn't depend on the network.

## What's planted, and where it came from

All of it lives in [`src/talk/content.ts`](../src/talk/content.ts).

* **The prompts.** v1 is two lines plus a length limit, and it's what the room's notices run through live. v2 adds three lines. v3 is pm.ts's "what good looks like" prompt.
* **The judges.** The first is deliberately cheap code: "still has a number", the shortcut version of rule 01. It passes the two-weeks answer (2 is a number), which is the point of 3.3. The room's own notices go through the same judges. In rehearsal, "due by 5pm" became "by 4:30pm": the number judge passed it and the AI rule judge failed it.
* **Real numbers, from a rehearsal run on 11 Oct 2026** (Haiku 4.5 translating, Opus 5.5 judging): six notices × five tries, passing every judge. v1 got 0 of 30, v2 got 1 of 30 and v3 got 21 of 30, shown in 4.4 as none, barely any and 7 in 10. The montage's leave row is v2's real answer.
* **Illustrative:** most montage rows (the number column is what the code judge would say), the lunch answer, and Version 2's standup answer.
* **Recorded answers** elsewhere (the two-weeks reveal, the five Friday tries, the golden wall, the tech-debt release note) come from `src/variants/pm.ts`.

## Rehearsal

1. **Run it once end to end with the presenter clock**, out loud, and note where you're behind a checkpoint.
2. **Try the room's moments for real:** type two notices in 1.2 with the API key set, and watch them arrive in the montage in 3.1.
3. **Practise the needle in 1.3.** Push it a little and a lot before you lock it, so the line works either way.
4. **Practise one vote with each key** (1 to 5) in 2.3, so the keys are in your fingers.
5. **Press Reset talk** in the presenter window before the real thing. It clears everything the room typed and voted.

## On the day

* **Check the key on the morning:** the presenter window should say **Live calls ready**. Without a key the talk still runs; the room's notices just show the fallback line.
* **Bring a phone hotspot,** and test it with the laptop before you're on.
* **Freeze the laptop once you've rehearsed.** No updates, no installs, no edits to the code. The dev server reloads the page when a file changes, which moves you off your place mid-talk. The talk keeps its place and the room's input across a refresh, so if it does happen, keep going.
* **Turn off notifications** and anything that might pop up over the projector.
* **Start on the title card** while people sit down, and press → for the cold open.

## If you're running long

The 24 Oct cuts are already made: one introduction (at the title drop), v2 and "no way to check" on one slide, the split on one press, no "bad examples" hold, and no separate loop-closed chapter. If you're still long, cut in this order:

1. **2.2's "not now" press** (about 20 seconds). Leave the chips on screen and press past it.
2. **3.1's third press** (normal test vs a judge, about 20 seconds). The two cards carry the point.
3. **2.3's reasons for A and C** (about 15 seconds). Read the room's split and move on.

Use the beat strip at the bottom of the presenter window to jump past a beat.
