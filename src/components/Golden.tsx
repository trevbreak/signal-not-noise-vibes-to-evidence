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
  const visible = explained && build <= explained ? build : sources.length;
  const current = explained && build >= 1 && build <= explained ? scene.explain![build - 1] : null;

  return (
    <div className="workbench">
      <h2>
        {scene.title}{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>
          · {visible === sources.length ? `${scene.examples.length} real answers, marked by people who know, with why` : "real answers, marked by people who know"}
        </span>
      </h2>
      <div className="golden">
        <div className="golden-head" />
        {COLUMNS.map((c) => (
          <div key={c.label} className={`golden-head ${c.label}`}>
            {c.title}
          </div>
        ))}
        {sources.slice(0, visible).map((src) => (
          <Fragment key={src}>
            <Row source={src} examples={scene.examples.filter((e) => e.source === src)} showScores={visible < sources.length || !explained} />
            {current?.source === src && <div className="golden-explain">{current.text}</div>}
          </Fragment>
        ))}
      </div>
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
