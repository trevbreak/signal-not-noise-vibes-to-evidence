import { currentJudges, rerun, useFlow, type JudgeCheckRow, type RerunRow } from "../lib/flow";
import type { Judge, RerunScene, Verdict } from "../lib/types";

export function Rerun({ scene }: { scene: RerunScene }) {
  const flow = useFlow();
  const judges = currentJudges(scene).filter((j) => j.kind !== "human");
  const rows = flow.rerun?.rows ?? [];
  const improvedJudges = Object.keys(flow.rerun?.judges ?? {});
  const nothingImproved = !flow.prompts.length && !Object.keys(flow.rubrics).length;

  return (
    <div className="workbench rerun">
      <div className="toolbar">
        <button className="btn primary" disabled={!!flow.busy} onClick={() => rerun(scene)}>
          {flow.rerun ? "Run it all again" : "Run it all again with our improvements"}
        </button>
        {flow.busy && <span className="thinking">{flow.busy}</span>}
        {flow.error && <span className="error">{flow.error}</span>}
        {nothingImproved && <span className="muted">Nothing's been improved yet: go back and press ✨.</span>}
      </div>

      <div className="improve">
        <section className="improve-col">
          <div className="col-head">
            <span className="dest prompt">The instructions</span>
            <span className="muted">Before vs after, marked by the same judges</span>
          </div>
          <Scoreboard rows={rows} judges={judges} />
          <div className="rerun-rows">
            {rows.map((r) => (
              <PhraseRow key={r.phrase} row={r} judges={judges} />
            ))}
          </div>
        </section>

        <section className="improve-col">
          <div className="col-head">
            <span className="dest judge">The judge</span>
            <span className="muted">Does it agree with us now?</span>
          </div>
          {!improvedJudges.length && <p className="muted">Improve a judge on the last screen to see it here.</p>}
          {improvedJudges.map((jid) => (
            <JudgeBlock key={jid} name={scene.judges.find((j) => j.id === jid)?.name ?? jid} rows={flow.rerun!.judges[jid]} />
          ))}
        </section>
      </div>
    </div>
  );
}

const passed = (m: RerunRow["before"], judges: Judge[]) => !!m && judges.every((j) => m.verdicts[j.id]?.pass);
const marked = (m: RerunRow["before"], judges: Judge[]) => !!m && judges.every((j) => m.verdicts[j.id]);

function Scoreboard({ rows, judges }: { rows: RerunRow[]; judges: Judge[] }) {
  if (!rows.length) return null;
  const count = (side: "before" | "after", j?: Judge) =>
    rows.filter((r) => (j ? r[side]?.verdicts[j.id]?.pass : passed(r[side], judges))).length;
  const done = (side: "before" | "after", j?: Judge) => rows.filter((r) => (j ? r[side]?.verdicts[j.id] : marked(r[side], judges))).length;
  return (
    <div className="ba">
      <BeforeAfter label="Passed every check" before={count("before")} after={count("after")} total={rows.length} doneB={done("before")} doneA={done("after")} big />
      {judges.map((j) => (
        <BeforeAfter key={j.id} label={j.name} before={count("before", j)} after={count("after", j)} total={rows.length} doneB={done("before", j)} doneA={done("after", j)} />
      ))}
    </div>
  );
}

function BeforeAfter(props: { label: string; before: number; after: number; total: number; doneB: number; doneA: number; big?: boolean }) {
  const pct = (n: number) => `${(100 * n) / props.total}%`;
  return (
    <div className={`ba-row ${props.big ? "big" : ""}`}>
      <span className="ba-label">{props.label}</span>
      <div className="ba-bars">
        <div className="ba-bar before">
          <div style={{ width: pct(props.before) }} />
          <span>
            Before {props.doneB < props.total ? "…" : `${props.before}/${props.total}`}
          </span>
        </div>
        <div className="ba-bar after">
          <div style={{ width: pct(props.after) }} />
          <span>
            After {props.doneA < props.total ? "…" : `${props.after}/${props.total}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function PhraseRow({ row, judges }: { row: RerunRow; judges: Judge[] }) {
  return (
    <div className="rr">
      <div className="calib-src">{row.phrase}</div>
      <div className="rr-sides">
        {(["before", "after"] as const).map((side) => {
          const m = row[side];
          return (
            <div key={side} className={`rr-side ${side}`}>
              <span className="rr-tag">{side === "before" ? "Before" : "After"}</span>
              <span className="rr-out">{m?.output ?? <span className="thinking">Translating</span>}</span>
              <span className="phrase-status">
                {judges.map((j) => {
                  const v = m?.verdicts[j.id];
                  return <span key={j.id} className={`dot ${v ? (v.pass ? "pass" : "fail") : m ? "pending" : ""}`} title={`${j.name}: ${v ? (v.pass ? "pass" : "fail") + " · " + v.reason : "…"}`} />;
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JudgeBlock({ name, rows }: { name: string; rows: JudgeCheckRow[] }) {
  const agree = (v: Verdict | undefined, r: JudgeCheckRow) => !!v && v.pass === r.expectPass;
  const b = rows.filter((r) => agree(r.before, r)).length;
  const a = rows.filter((r) => agree(r.after, r)).length;
  const doneB = rows.filter((r) => r.before).length;
  const doneA = rows.filter((r) => r.after).length;
  return (
    <div style={{ display: "grid", gap: "0.7rem" }}>
      <div className="ba">
        <BeforeAfter label={`“${name}” agrees with us`} before={b} after={a} total={rows.length} doneB={doneB} doneA={doneA} big />
      </div>
      <table className="plan jcheck">
        <thead>
          <tr>
            <th>Answer</th>
            <th>We say</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => {
            const changed = r.before && r.after && r.before.pass !== r.after.pass;
            return (
              <tr key={k} className={changed ? "changed" : ""}>
                <td>
                  <div className="calib-out">{r.output}</div>
                </td>
                <td>{r.expectPass ? "✓ pass" : "✗ fail"}</td>
                {[r.before, r.after].map((v, i) => (
                  <td key={i}>
                    {v ? (
                      <span className={`chip ${agree(v, r) ? "pass" : "fail"}`} tabIndex={0}>
                        {v.pass ? "✓ pass" : "✗ fail"}
                        <span className="tip" role="tooltip">
                          {v.reason}
                        </span>
                      </span>
                    ) : (
                      <span className="chip pending">◌</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
