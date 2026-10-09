# Implementation plan: the stage rebuild

The talk has been rethought as a story where the room is the hero and one notice is followed from applause to evidence. The arc is in [storyboard-v2.html](storyboard-v2.html), the motion in [motion-treatment.html](motion-treatment.html), and the colour candidates in [palettes.html](palettes.html). This is the plan to build it on the existing app.

## Decisions already made

- **Telling:** PM-speak throughout. The Aussie and Gen Z tellings stay in the code but are not on the running order.
- **The needle is hand-driven.** No microphone. `→`/`←` held nudges it, `V` snaps to Vibes.
- **The context beat (3.4) is cut.** Pictures, voice and the kitchen-sink version stay in the code, off the running order.
- **Planted examples everywhere the room feeds the talk.** The only live AI calls are the room's two notices in 1.2 and their two rows in the 3.1 montage. Everything load-bearing is a rehearsal replay.
- **Open:** the palette. Default to B (noticeboard) unless the review says otherwise. Build on tokens so the choice is a one-file change.

## What stays

| Keep as is | Where |
| --- | --- |
| Translator and judge calls, key handling, caching | `server/plugin.ts`, `src/lib/api.ts` |
| Replay recording and playback, lab state, the IndexedDB store | `src/lib/store.ts`, `src/lib/runner.ts` |
| The three tellings: prompts, judges, golden examples, review flow, rerun phrases | `src/variants/*.ts` |
| The presenter window, act budgets, the timer | `src/components/Presenter.tsx`, `src/scenes.ts` |
| Vite dev server, `app.sh`, `.env` handling | root |

## What goes

Removed from the running order and left in code behind `cut`: `ImageLab`, `AudioLab`, `Traces` (the US/engineers context lab), the kitchen-sink Version 5 on the scoreboard, the "Who owns good" slide. The projector loses the six-word stepper, the footer dots, the key badges and the API-key badge; all of that moves to the presenter window.

## The new running order

Twenty-three minutes. Beat numbers match the storyboard.

| # | Beat | Scene kind | Needle | Live? |
| --- | --- | --- | --- | --- |
| 1.1 | Cold open, hands up | `hold` | hidden | no |
| 1.2 | Build it: note types, card answers, room adds two | `build` | Vibes | room's two only |
| 1.3 | Ship it? Room pushes the needle | `needle` | hand | no |
| 1.4 | The reveal: rewind, freeze, push in, hold | `reveal` | drops a third | no |
| 1.5 | Five tries, then more rules, then "better? worse?" hold | `deal` | | no (replay) |
| 2.1 | Chapter card: the loop with a gap | `chapter` | | |
| 2.2 | The room writes the rules | `rules` | nudge | no AI |
| 2.3 | Be the judge: three answers, vote bars | `vote` | nudge | no AI |
| 2.4 | The split, hold | `hold` | | |
| 2.5 | The wall: three fly in, the rest rain, hold | `wall` | nudge | no |
| 3.0 | Chapter card: Measure lit | `chapter` | | |
| 3.1 | Rules descend into judges, montage | `judges` + `montage` | nudge | room's two rows |
| 3.2 | The leave notice stamped, then Version 3, bars, hold | `stamped` + `bars` | crosses midpoint | no (replay) |
| 4.0 | Chapter card: Learn lit | `chapter` | | |
| 4.1 | A judge is wrong: agree/disagree | `stamped` + `vote` | | no |
| 4.2 | Two bins: fix the instructions, fix the judge | `bins` | | no |
| 4.3 | Green lines, before/after, chapter card laps, hold | `diff` + `bars` + `chapter` | biggest swing | no |
| 4.4 | Versions scoreboard | `bars` | | no |
| 5.1 | Ship it? Three gates | `bars` | | |
| 5.2 | Close: needle home, the notice with five ticks, hold, homework | `needle` + `stamped` + `hold` | Evidence | |

## The architecture of the stage

### Slots, not screens

One `Stage` component with fixed slots. A scene says which slots are filled and with what; slots keep their React subtree between scenes so the same card is the same DOM node across beats (this is what makes "the notice persists" true, and what lets FLIP moves work).

```
<Stage>
  <Slot name="needle" />     top centre (corner when small, large for 1.3 and 5.2)
  <Slot name="note" />       left wing: what we told it (and the judge's guide in 4.3)
  <Slot name="rules" />      above the card
  <Slot name="card" />       centre: the notice
  <Slot name="judgement" />  below the card: vote bars or stamps
  <Slot name="wall" />       off-canvas right; the camera pans to it once
  <Slot name="overlay" />    chapter cards, holds, captions
</Stage>
```

Chapter cards and holds are overlays on the same stage, not separate scenes, so the furniture underneath is still there when the overlay lifts.

### Steps, not clicks

Each scene is a list of steps. `→` plays the next step, `←` rewinds one (the runtime resets that step's effects and replays the previous step's end state). A step is data:

```ts
type Step = {
  say?: string;                 // the presenter line for this step (shown in the presenter window)
  enter?: SlotContent[];        // what appears, with its move: type | deal | stamp | fly | rise
  exit?: string[];              // ids that leave
  needle?: number;              // 0 (Vibes) … 100 (Evidence)
  run?: { caseId: string; live?: boolean; tries?: number };   // translate (replay unless live)
  judge?: { caseId: string };   // stamps land one by one
  expose?: { caseId: string; spans: [string, "ok" | "bad"][] };
  hold?: string;                // cut to black with this line
  chapter?: { lit: Stage; lap?: boolean };
};
```

Steps live in the variant files next to the prompts and cases, like `talk` and `notes` do now. The presenter window shows the current step's `say` and the next one's.

### The seven moves

CSS classes with one transition each, matching the motion page: `type` (a hook that types into a node at a given speed), `deal`, `stamp`, `expose` (scale on the card, dim on siblings, outlines on spans), `needle` (a store value and a tween), `fly` (a FLIP helper: measure, move, invert, play), `hold` (overlay). `prefers-reduced-motion` collapses every move to a fade; the presenter can force this with a key if the projector struggles.

Rule from the motion page that the review found the hard way: never put a transform on a positioned element for layout. Centre with `left: 0; right: 0; margin-inline: auto`, so an entrance animation ending in `transform: none` cannot move it.

### Replay and planting

The existing recorder stores every API response. Add to each case an optional `plant` field naming the recorded answer id to use in replay, so the leave notice always comes back halved in 1.2, the five tries always have one right answer, and the tech-debt judge always fails. Live runs are only taken when a step says `live: true` (the room's notices) and fall back to a "even the PM can't improve that" line on timeout.

The montage is a recorded run of thirty rows played at 300 ms a row; the room's two rows are judged live at the start of 3.1 and spliced in when their verdicts arrive, or dropped on timeout.

### Crowd controls

| Control | Key | Shows |
| --- | --- | --- |
| Add the room's notice | type, `Space` | typed onto the card, translated live |
| Needle by hand | `→` `←` held, `V` | the needle creeps, snaps |
| Rule card | type, `Enter` new, `!` seal | cards typed, seals stamp |
| Vote split | `1`–`5` | the bar fills from both ends |
| Thumbs | `↑` `↓` | the People stamp turns |
| Agree / disagree | `A` `D` | the verdict bar |
| Prepared note | `✨` button in the presenter window | the pre-written reason types in |

All of these are recorded too, so a rehearsal can be replayed end to end.

## Order of work

1. **Tokens and the stage shell.** Palette tokens in one file (the four candidates as named sets; B default). `Stage`, the slots, the needle, the hold and chapter overlays. Strip the projector chrome; move it to the presenter window. Stage typography scale.
2. **The hook, end to end: 1.1 → 1.5.** `build`, `needle`, `reveal`, `deal` scenes, the step runtime with `→`/`←`, the `type` and `expose` moves, planted replays. Rehearsable after this phase.
3. **Define: 2.1 → 2.5.** Chapter card, `rules` with live typing and seals, `vote` with the bars, the wall with `fly` and the rain.
4. **Measure: 3.0 → 3.2.** Rules-to-stamps `fly`, the montage with live splice, `stamped` with the stamp cadence, the version bars.
5. **Learn and close: 4.0 → 5.2.** `vote` on a stamp, the bins, the green-line diffs (pre-generated improvements), before/after bars, the lap, the gates, the close.
6. **Presenter window and docs.** Beats per step with keys in bold, the crowd controls as buttons, the act clock against the new budgets. Rewrite the run of show and the talk track to the storyboard; retire the old scene list and these three design pages' "open decisions".
7. **Rehearse.** Full run with recording on, screenshot every step at 1080p, check from the back of a room, present from replay.

Each phase ends with a `tsc -b --noEmit` pass and a screenshot sweep of every step (the Playwright script from the review can drive `→` and capture each step).

## Size

Phases 1 to 5 are five or six focused sessions. Phase 6 is one. Content is already written and tested. The two unknowns are how the needle feels in the hand on a clicker (it may want a presenter-window slider as well as the keys) and how B's light ground looks on the venue's projector, which only a rehearsal in a bright room answers.
