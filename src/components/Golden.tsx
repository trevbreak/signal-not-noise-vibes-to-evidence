import { Fragment } from "react";
import { useStore } from "../lib/store";
import { DecidingScores } from "./Scores";
import type { GoldenExample, GoldenScene } from "../lib/types";

const COLUMNS = [
  { label: "good", title: "Good" },
  { label: "borderline", title: "Borderline" },
  { label: "bad", title: "Bad" },
] as const;

/**
 * One row per English phrase; each answer sits in the column its reviewers put it in.
 * With `explain`, the first rows arrive one click at a time with a note on how they score,
 * then the next click brings in everything else.
 */
export function Golden({ scene }: { scene: GoldenScene }) {
  const build = useStore((s) => s.build);
  const sources = [...new Set(scene.examples.map((e) => e.source))];
  const explained = scene.explain?.length ?? 0;
  const done = !explained || build > explained;
  // While explaining, rows arrive one per click. After that, the explained rows stay and
  // everything else collapses to a count: a wall of fourteen cards is unreadable from the back.
  const shownSources = done ? (explained ? scene.explain!.map((e) => e.source) : sources) : sources.slice(0, build);
  const current = explained && build >= 1 && build <= explained ? scene.explain![build - 1] : null;
  const rest = scene.examples.filter((e) => !shownSources.includes(e.source));
  const restCount = (label: GoldenExample["label"]) => rest.filter((e) => e.label === label).length;

  return (
    <div className="workbench">
      <h2>
        {scene.title} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· real answers, marked by people who know, with why</span>
      </h2>
      <div className="golden">
        <div className="golden-head" />
        {COLUMNS.map((c) => (
          <div key={c.label} className={`golden-head ${c.label}`}>
            {c.title}
          </div>
        ))}
        {shownSources.map((src) => (
          <Fragment key={src}>
            <Row source={src} examples={scene.examples.filter((e) => e.source === src)} showScores={!done} />
            {current?.source === src && <div className="golden-explain">{current.text}</div>}
          </Fragment>
        ))}
      </div>
      {done && rest.length > 0 && (
        <div className="golden-more">
          <strong>+ {rest.length} more answers</strong> for {new Set(rest.map((e) => e.source)).size} more phrases:{" "}
          <span className="good">{restCount("good")} good</span> · <span className="borderline">{restCount("borderline")} borderline</span> ·{" "}
          <span className="bad">{restCount("bad")} bad</span>, each with a reason why.
        </div>
      )}
    </div>
  );
}

function Row({ source, examples, showScores }: { source: string; examples: GoldenExample[]; showScores: boolean }) {
  return (
    <>
      <div className="golden-src">{source}</div>
      {COLUMNS.map((c) => (
        <div key={c.label} className="golden-cell">
          {examples
            .filter((e) => e.label === c.label)
            .map((e) => (
              <div key={e.id} className={`golden-card ${e.label}`}>
                <div className="golden-out">{e.output}</div>
                <div className="golden-why">{e.why}</div>
                {showScores && e.scores && <DecidingScores scores={e.scores} />}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
