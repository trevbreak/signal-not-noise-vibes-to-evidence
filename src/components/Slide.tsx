import { LOOP, LOOP_GROUPS, PROMPTS, SCENES } from "../scenes";
import { useStore } from "../lib/store";
import type { LabScene, SlideScene } from "../lib/types";
import { Pretty } from "./Lab";
import { RubricScores } from "./Scores";
import { TestVisual } from "./TestVisual";

const LOOP_SUBTITLES = ["Build it. Run it. Hope.", "What we should have done first…", "…and what we do every time after."];

export function Slide({ scene }: { scene: SlideScene }) {
  const build = useStore((s) => s.build);
  const items = scene.table?.rows.length ?? scene.bullets?.length ?? scene.scorecards?.length ?? 0;
  // With reveal, each click shows the next row or bullet (or the subtitle, on a statement).
  // Hidden items keep their space, so nothing jumps around as they appear.
  const shown = (i: number) => !scene.reveal || i < build;
  const subtitleShown = !scene.reveal || items > 0 || build >= 1;
  const footnoteShown = !scene.reveal || build > items;

  const table = scene.table && (
    <table className={`t-${scene.id}`}>
      <thead className={shown(0) ? "in" : "veiled"}>
        <tr>
          {scene.table.head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {scene.table.rows.map((r, ri) => (
          <tr key={r[0]} className={shown(ri) ? "in" : "veiled"}>
            {r.map((c, i) => (
              <td key={i}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={`slide ${scene.layout}`}>
      {scene.kicker && <div className="kicker">{scene.kicker}</div>}
      <h1>{scene.title}</h1>
      {scene.layout === "loop" ? (
        <p className="sub" key={build}>
          {LOOP_SUBTITLES[Math.min(build, LOOP_SUBTITLES.length - 1)]}
        </p>
      ) : (
        scene.subtitle && <p className={`sub ${subtitleShown ? "in" : "veiled"}`}>{scene.subtitle}</p>
      )}
      {scene.layout === "loop" && <Loop build={build} />}
      {scene.bullets && (
        <ul>
          {scene.bullets.map((b, i) => (
            <li key={b} className={shown(i) ? "in" : "veiled"}>
              {b}
            </li>
          ))}
        </ul>
      )}
      {table && scene.layout === "judges" ? (
        <div className="split">
          {table}
          <TestVisual step={build} />
        </div>
      ) : (
        table
      )}
      {scene.scorecards && (
        <div className="sc-grid">
          {scene.scorecards.map((c, i) => (
            <article key={c.label} className={`sc ${c.label} ${shown(i) ? "in" : "veiled"}`}>
              <div className={`sc-label ${c.label}`}>{c.label === "good" ? "Good" : c.label === "bad" ? "Bad" : "Borderline"}</div>
              <div className="sc-src">{c.source}</div>
              <div className="sc-out">{c.output}</div>
              <RubricScores scores={c.scores} />
              <div className={`sc-verdict ${c.label}`}>{c.verdict}</div>
              <div className="sc-why">{c.why}</div>
            </article>
          ))}
        </div>
      )}
      {scene.evidence === "compare" && <Evidence />}
      {scene.footnote && <p className={`footnote ${footnoteShown ? "in" : "veiled"}`}>{scene.footnote}</p>}
    </div>
  );
}

/** Build 0: Run alone. Build 1: + "define good" group. Build 2: + "test and iterate" group. */
function Loop({ build }: { build: number }) {
  const box = (id: string, numbered: boolean) => {
    const i = LOOP.findIndex((x) => x.id === id);
    const st = LOOP[i];
    return (
      <li key={st.id} className={`loop-box ${st.id === "run" ? "run" : ""}`}>
        {numbered && <span className="n">{i + 1}</span>}
        <strong>{st.label}</strong>
        <span>{st.blurb}</span>
      </li>
    );
  };
  const group = (g: "define" | "test") => (
    <div className={`loop-group ${g}`} key={g}>
      <div className="loop-banner">{LOOP_GROUPS[g]}</div>
      <ol>{LOOP.filter((x) => x.group === g).map((x) => box(x.id, true))}</ol>
    </div>
  );
  return (
    <div className="loop2">
      {build >= 1 && group("define")}
      <ol className="loop-run">{box("run", build >= 1)}</ol>
      {build >= 2 && group("test")}
    </div>
  );
}

/**
 * The claim's evidence: the side-by-side the room just watched in "Let's try a few more",
 * read from that lab. Nothing on screen until it has been run.
 */
function Evidence() {
  const scene = SCENES.find((s): s is LabScene => s.kind === "lab" && !!s.compare);
  const lab = useStore((s) => (scene ? s.labs[scene.labId ?? scene.id] : undefined));
  if (!scene || !lab || !Object.keys(lab.before).length) return null;
  const rows = scene.cases.filter((c) => lab.before[c.id] && lab.results[c.id]?.[0]?.output);
  if (!rows.length) return null;
  const beforeLabel = Object.values(lab.before)[0]?.label ?? "Before";
  return (
    <div className="evidence" aria-label="What we just saw, side by side">
      <div className="evidence-head">
        <span>{beforeLabel}</span>
        <span>{PROMPTS[scene.versions[lab.versionIdx]]?.label ?? "Now"}</span>
      </div>
      {rows.map((c) => (
        <div key={c.id} className="evidence-row">
          <div className="evidence-src">{c.text}</div>
          <div className="evidence-out">
            <Pretty text={lab.before[c.id].output} />
          </div>
          <div className="evidence-out now">
            <Pretty text={lab.results[c.id][0].output ?? ""} />
          </div>
        </div>
      ))}
    </div>
  );
}
