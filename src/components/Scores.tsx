import { RUBRIC } from "../scenes";
import type { Scores } from "../lib/types";

/** Green for high, amber for the middle, red for low. Lines that don't apply say so. */
export const scoreTone = (n: number | null) => (n === null ? "na" : n >= 4 ? "hi" : n === 3 ? "mid" : "lo");

/** One line per marking-guide dimension, with its score out of 5. */
export function RubricScores({ scores }: { scores: Scores }) {
  return (
    <div className="rubric-scores">
      {RUBRIC.map((d) => {
        const n = scores[d.id] ?? null;
        return (
          <div key={d.id} className={`rs-row ${scoreTone(n)}`}>
            <span className="rs-name">{d.name}</span>
            <span className="rs-score">{n === null ? "n/a" : `${n}/5`}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Just what decided it: the low lines (up to two), or one chip when everything scored well. */
export function DecidingScores({ scores }: { scores: Scores }) {
  const scored = RUBRIC.map((d) => ({ d, n: scores[d.id] ?? null })).filter((x): x is { d: (typeof RUBRIC)[number]; n: number } => x.n !== null);
  const low = scored.filter((x) => x.n <= 3).sort((a, b) => a.n - b.n).slice(0, 2);
  const min = Math.min(...scored.map((x) => x.n));
  return (
    <div className="golden-marks">
      {low.length ? (
        low.map(({ d, n }) => (
          <span key={d.id} className={`golden-mark ${scoreTone(n)}`}>
            {d.short} {n}/5
          </span>
        ))
      ) : (
        <span className="golden-mark hi">✓ {min === 5 ? "5/5" : `${min}–5`} on every line</span>
      )}
    </div>
  );
}
