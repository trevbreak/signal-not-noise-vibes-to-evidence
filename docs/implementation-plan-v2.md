# Implementation plan: the linked talk

> **Status: planned, not built.** This builds the design in [full-mock.html](full-mock.html) (the whole talk) and [proposal-second-half.html](proposal-second-half.html) (the second half in detail). The previous plan, [implementation-plan.md](implementation-plan.md), describes the stage as it was first built and is kept for history.

## Goal

Make the talk fit 25 minutes and read as one story:

- Cut the second half from 51 presses (about 15 minutes of speaking) to 31 (about 11), so the whole talk is about 22½ minutes before the room's moments.
- Explain what a judge is, how it differs from the prompt and from a normal test, and why you fix the judge first.
- Link the two halves with seven threads (listed at the top of the full mock), so nothing relies on "remember this for later".

## Decisions already made

- **Versions:** v1 (two lines), v2 (more rules, by gut feel) and v3 (improved from the reasons). The hand-fixed version and its sticky-note beat are gone.
- **Numbers on screen:** only the real rehearsal run from 11 Oct, shown as "out of 10" (v1 0, v2 barely any, v3 7). No percentages, no judge-agreement bars, and no counts that don't match what's on screen.
- **No room interaction in the second half.** The 3.2 thumbs and the 4.1 vote are both removed.
- **Prompt teal, Judge blue,** everywhere, as now.
- **Homework is removed.**

## Open decisions (answer before step 2)

1. **What the code judge checks.** The mock calls it "Has a notice period?". That only makes sense for the leave notice, and the room's own notices also run through it in the montage. **Recommend "Still has a number"**: pass if the answer has a number wherever the notice had one. It's generic, it still passes "2 weeks", and it makes the same point (a cheap check passes what the AI judge catches). The first rule card stays "Numbers and dates stay put"; the judge is the cheap version of it.
2. **The montage's tech-debt rows.** With no "keep an eye on these" line, three tech-debt rows at the end are just noise. **Recommend** keeping one, mid-montage, as a normal failing row, and removing the other two.
3. **The mock files** (`full-mock.html`, `full-mock/`, `proposal-second-half.html`). **Recommend** committing them with this plan as the design record, and deleting them once the build is verified.

## Running order after the build

Press numbers are approximate. Unchanged beats keep their current views.

| # | Beat | Presses | Kind | Change |
| --- | --- | --- | --- | --- |
| 0 | Title | 1 | title | — |
| 1.1–1.4 | Cold open → title drop | 17 | as now | Line edit on the reveal (slide 16) |
| 1.5 | Five tries | 3 | tries | Line edit ("one out of five") |
| 1.5 | Version 2: more rules | 3 | pairs | Line edit; prompt label aside "more rules, by gut feel" |
| 1.5 | Hold: we can't tell | 1 | hold | New sub-line and spoken line |
| 2.1 | The loop with a gap | 3 | chapter | — |
| 2.2 | The room writes the rules | 6 | rules | Line edit; **loop badge: Define** |
| 2.3 | Be the judge | 6 | vote | Line edit; **loop badge: Measure** |
| 2.4 | The split | 3 | split | **Loop badge: Measure** |
| 2.5 | The golden wall | 3 | wall | Tech-debt card swapped in; **loop badge: Measure** |
| 2.5 | Hold: bad examples teach | 1 | hold | New spoken line |
| 3.0 | Recap | 2 | chapter (recap) | 5 steps → 2 |
| 3.1 | The prompt and the judge | 3 | **promptJudge (new)** | New |
| 3.2 | Rules become judges, run on everything | 3 | judges | 4 steps → 3; code judge renamed; no tech-debt marks |
| 3.3 | Zoom in: why you need different judges | 3 | stamped | Code judge passes; no thumbs |
| — | ~~Read the failures, hone the prompt~~ | — | ~~hone~~ | **Removed** |
| — | ~~Better, and proven. Partly.~~ | — | ~~fiveEach~~ | **Removed** |
| 4.0 | Chapter: fix the judge first | 1 | chapter | New text |
| 4.1 | A judge that's wrong | 3 | expose | 5 steps → 3; no vote; judge guide and wall card shown |
| 4.2 | Reasons, then drop-downs | 3 | reasons | Merges the old reasons and drop-downs beats |
| 4.3 | The reasons go to an AI | 3 | diffs | Chips → AI → judge diff, then prompt diff |
| 4.4 | Did it work? | 2 | **results (new)** | Replaces the old after and versions beats |
| 4.5 | The loop, closed | 1 | chapter (lap) | Station lines spelled out |
| 5.1 | How good is good enough? | 3 | gates | Two ends on a vibes → evidence line |
| 5.2 | The leave policy ships → vibes to evidence | 2 | home | Order swapped: card first, then the needle |
| 5.3 | Close | 2 | close | No homework |

## Work, in order

**Commit and push after every step.** This checkout has been reset to `origin` from outside the session three times (21:16 and 23:31 on 11 Oct, and once on 10 Oct), and the second reset wiped uncommitted work. Nothing should sit uncommitted for long.

### Step 1 · First-half link changes (small, independent)

`src/talk/content.ts`:
- Reveal step 5, tries step 3, pairs step 1, thesis-2, rules step 1, vote step 1 and thesis-3: new `say` lines, word for word from the full mock.
- `thesis-2` props: `sub: ["We asked for better. We've no way to check we got it."]`.
- `WALL.bad`: replace "Actually, I already told the client we'd have this done by Friday." with "Server patch? Classic tech debt. We'll sort it in v2." / "Waves the work away."

`src/talk/beats.tsx`:
- `PairsView`: `aside="more rules, by gut feel"` on the v2 prompt note.

Check: typecheck, then screenshot beats 4, 7, 8, 9, 14 and 15 against `docs/full-mock/`.

### Step 2 · The loop badge

- `content.ts`: add `loop?: "define" | "measure"` to `Beat`, and set it on `rules` (define), and on `vote`, `split` and `wall` (measure).
- `Stage.tsx`: a `LoopBadge` beside the needle layer, rendered when the beat has `loop`. It's a small four-station loop with the current station in accent, and a mono label above ("Define · rules + examples" or "Measure · by hand"), bottom-right at about 8.5cqw wide. It fades between stations, using the same keyed `a-fade` as `Loop`.
- `talk.css`: `.loop-badge` styles.

Check: screenshots of all four beats. The badge mustn't overlap the vote bars or the wall cards.

### Step 3 · Content model for the second half

`content.ts`:
- **Remove:** `THEMES`, `FAILURES`, `V3_ADDED` (the hand-fixed lines), `TECH_DEBT_RULE`, `FIVE_EACH`, `AFTER`, `DROPDOWNS.count`, `HOMEWORK`, and the `judge` vote key and its split defaults.
- **Rename:** `V4_EXCERPT` → `V3_EXCERPT`. It's the "what good looks like" prompt, now called v3.
- **Judges:** the `numbers` judge becomes the code check from open decision 1 (`JUDGE_SHORT`: "Still has a number"). Its `check` text becomes "Is there still a number? Plain code."
- **`STAMPED_FAIL`:** the numbers stamp becomes `pass: true`, why "“2 weeks” still has a number".
- **`MONTAGE`:** recompute column 0 for the new check (most rows pass; rows that lose a number entirely, like "end of day-ish", fail). Keep one tech-debt row mid-montage and drop the end-of-montage ones. Update `MONTAGE_ROOM_AT` and set the montage column label to "Number".
- **New `JUDGE_GUIDE`**: the "nothing added" guide with the over-strict line ("…like ‘that's just tech debt, we'll do it in v2’"), plus `JUDGE_GUIDE_FIX` (the rewritten line).
- **`REASONS`:** the four rows from the mock (answer, agree/disagree, reason, drop-down, `fix: "prompt" | "judge"`).
- **New `RESULTS`:** `{ label, sub, outOf10 }` for v1 (0), v2 (0.3, shown as "barely any") and v3 (7).
- **`GATES` → `ENDS`:** two entries, Friday drinks email (vibes) and HR leave policy (100%, a human signs off).
- **`BEATS`:** the new running order above, with `say` lines word for word from the mock. Remove `hone` and `five-each`. Add `prompt-judge` and `results`. Re-tune the needle values (judges 42–48, stamped 52, expose 60, reasons 66, diffs 72, results 80, home 100).
- **`MOVEMENTS`:** rename 4 to "Make it better". Set the checkpoints from the timing script (expect about 6.5 / 12 / 15.5 / 20.5 / 23).

`store.ts`:
- Remove `thumbs`, `setThumbs`, and the thumbs branch of `upDown`. ↑ ↓ then only nudge the needle in 1.3.
- Bump the saved-state key to `talk-state-v3`.

`Presenter.tsx`: remove the thumbs control, and the agree/disagree labels for the `judge` vote.

`live.ts` (with `src/lib/checks.ts` if the check lives there): column 0 for the room's notices uses the new code check, so their montage rows match the label.

### Step 4 · Second-half views

In `beats.tsx`, one at a time, each checked against its mock before moving on:

1. **`PromptJudgeView` (new).** Two notes, Prompt then Judge, with the example line and caption, and the test-vs-judge strip on step 3. It reuses `Note` and `Tag`.
2. **`ChapterView` recap.** Two steps: the loop with Define and Measure lit, then "You can't vote on ten thousand notices a day." The `RECAP` table shrinks to two states.
3. **`JudgesView`.** Step 1 shows the rules turning into judges, with the cost line. Steps 2–3 are the montage and the caption. Drop the `mark` prop and the tech-debt highlighting.
4. **`StampedView`.** Three steps, no thumbs. The code stamp passes, with an amber outline (`.stamp.hl`). Verdict "Fail" with the "caught automatically" sub-line.
5. **`ExposeView`.** Three steps. Step 1 shows the card with the stamps, the failing one enlarged, and the line "Same facts. Sounds like a PM. So why did it fail?". Steps 2–3 replace the stamps with the judge-guide note and the golden-wall card side by side, then the blue "fix the judge first" callout. It no longer uses `Bar` or the vote.
6. **`ReasonsView` (merged).** A four-column table: answer, judge said ✗ / you agree or disagree, reason (typed), drop-down chip. Step 2 stamps the chips in; step 3 sorts the rows into a Judge pile (1) then a Prompt pile (3). Delete `DropdownsView`.
7. **`DiffsView`.** The drop-down chips on the left flow into the dark "AI" box. Step 2 shows the judge note diff (struck line + added line); step 3 shows the prompt v3 note. Remove the standalone old-prompt state.
8. **`ResultsView` (new).** Step 1 shows ten dots per version, filled to its out-of-10 score, with the labels. Step 2 is the "where we started → quite good (an afternoon) → extremely good (months)" line. Delete `AfterView` and `VersionsView`.
9. **`ChapterView` lap.** The station list with the Prompt and Judge tags.
10. **`GatesView` → two ends.** The vibes → evidence gradient line, "most things sit in between", and the two end cards.
11. **`HomeView`.** Step 1 is the leave-policy card with all stamps and "A human signs off", needle in the corner. Step 2 swings the needle big to Evidence, with "From vibes to evidence."
12. **`CloseView`.** Two steps; the homework line is removed.

Then update `BEAT_VIEWS` and the `BeatKind` union.

### Step 5 · Styles

`talk.css`:
- **Add** `.prompt-judge`, the `.recap` tweaks, `.stamp.hl`, `.expose-why`, `.reasons` four-column table and piles, `.ai-box` and its flow arrows, `.results` dots and progress line, and `.ends` (the gates' two ends).
- **Remove** styles left with no view: `.hone-*`, `.themes`, `.theme`, `.remember`, `.fails`, `.fail-row`, `.dd-*`, `.after*`, `.bars.tight`, `.bars.four`, `.gates`/`.gate`/`.rchip`, `.owners`, `.feed*` (if unused), `.mhead` tech-debt marks, and the thumbs-only stamp states.

### Step 6 · Docs

- `npm run talk-track` to regenerate `docs/talk-track.md`.
- `docs/presenting.md`:
  - **Run-of-show table:** new beats and checkpoints.
  - **Room table:** remove 3.2 and 4.1.
  - **Keys:** ↑ ↓ are now only for the needle.
  - **Planted data:** real numbers only, and the code judge explained.
  - **Cut list:** redone for the new beats. Likely candidates: 1.5 "Version 2: more rules", the 3.1 bottom strip, and 4.5 said over 4.4.
- `README.md`: check the talk section still matches.
- Memory: update the talk-story note to say the design is built.

## Verification

1. `npm run typecheck`.
2. Press → through every step in `?mock` with a cleared saved state, then ← back through a few. No console errors, and the last press lands on the close.
3. Screenshot every step (the same script as before) and compare each against the mock: nothing overlapping, nothing past the 16:9 edge, and the badge and needle never colliding.
4. Room notices: type two notices in 1.2 with the API key set. They should translate through v1 and appear in the 3.2 montage with all four judge columns filled.
5. Presenter window: no thumbs control, the vote controls only on 2.3, and the clock checkpoints match `MOVEMENTS`.
6. Timing: run the word-count script. The whole talk should come to about 22–23 minutes of speaking at 150 wpm.
7. A full read-through of `docs/talk-track.md`, checking every first-half link has its payoff (the seven threads in the full mock).

## Size

Step 1 is small. Step 2 is one new component. Steps 3–5 are the bulk: twelve views touched, roughly half of `beats.tsx` rewritten, and a matching CSS cleanup. Steps 6 and verification are routine. The commit points are one per step, plus one per three or four views in step 4.
