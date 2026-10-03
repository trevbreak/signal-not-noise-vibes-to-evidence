import { useMemo, useState } from "react";
import { post } from "../lib/api";
import { useStore } from "../lib/store";
import { SCENES } from "../scenes";
import type { Trace, TracesScene } from "../lib/types";

type Category = { name: string; description: string; noteIds: string[]; evalIdea: string; evalType: "code" | "llm-judge" | "human" };

const sceneLabel = (id: string) => (id === "golden" ? "golden set" : SCENES.find((s) => s.id === id)?.act ?? id);

/** A trace "passes" if every automated judge that marked it passed. Human votes don't count here. */
function judgePass(t: Trace): boolean | null {
  const auto = Object.entries(t.verdicts).filter(([id]) => id !== "room");
  if (!auto.length) return null;
  return auto.every(([, v]) => v.pass);
}

export function Traces({ scene }: { scene: TracesScene }) {
  const traces = useStore((s) => s.traces);
  const updateTrace = useStore((s) => s.updateTrace);
  const clearTraces = useStore((s) => s.clearTraces);
  const [filter, setFilter] = useState<"all" | "fails" | "noted">("all");
  const [showGolden, setShowGolden] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      traces
        .filter((t) => t.output && (showGolden || t.sceneId !== "golden"))
        .filter((t) => (filter === "fails" ? judgePass(t) === false : filter === "noted" ? !!t.note : true))
        .slice(-80)
        .reverse(),
    [traces, filter, showGolden],
  );

  const noted = traces.filter((t) => t.note?.trim());
  const labelled = traces.filter((t) => t.human && judgePass(t) !== null);
  const m = { upPass: 0, upFail: 0, downPass: 0, downFail: 0 };
  for (const t of labelled) {
    const p = judgePass(t);
    if (t.human === "up") p ? m.upPass++ : m.upFail++;
    else p ? m.downPass++ : m.downFail++;
  }
  const agree = labelled.length ? Math.round((100 * (m.upPass + m.downFail)) / labelled.length) : null;

  const cluster = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ categories: Category[] }>("/api/cluster", {
        notes: noted.map((t) => ({ id: t.id, note: t.note, source: t.source, output: t.output })),
      });
      setCategories(res.categories);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(traces, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `traces-export-${new Date().toISOString().slice(0, 16)}.json`;
    a.click();
  };

  return (
    <div className="workbench">
      <h2>
        {scene.title} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {traces.length} calls</span>
      </h2>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Filter">
          {(["all", "fails", "noted"] as const).map((f) => (
            <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "fails" ? "Failed a check" : "With notes"}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", color: "var(--muted)" }}>
          <input type="checkbox" checked={showGolden} onChange={(e) => setShowGolden(e.target.checked)} /> include full test runs
        </label>
        <span style={{ flex: 1 }} />
        <button className="btn" onClick={exportJson}>
          Export JSON
        </button>
        <button
          className="btn"
          onClick={() => confirm("Delete every trace in this browser? Replay recordings are kept.") && clearTraces()}
        >
          Clear
        </button>
      </div>

      <div className="cols">
        <div className="trace-list">
          {visible.length === 0 && <div className="empty-state">No traces yet. Run something in the labs.</div>}
          {visible.map((t) => (
            <div className="trace" key={t.id}>
              <span className="v">
                {t.promptVersion}
                {t.promptEdited ? "*" : ""}
                <br />
                {sceneLabel(t.sceneId).split("·")[0]}
              </span>
              <span>{t.source}</span>
              <span className="o">{t.output}</span>
              <span className="acts">
                <button
                  className={t.human === "up" ? "on" : ""}
                  aria-label="Good output"
                  onClick={() => updateTrace(t.id, { human: t.human === "up" ? undefined : "up" })}
                >
                  👍
                </button>
                <button
                  className={t.human === "down" ? "on" : ""}
                  aria-label="Bad output"
                  onClick={() => updateTrace(t.id, { human: t.human === "down" ? undefined : "down" })}
                >
                  👎
                </button>
              </span>
              {Object.keys(t.verdicts).length > 0 && (
                <div className="verdicts">
                  {Object.entries(t.verdicts).map(([id, v]) => (
                    <span key={id} className={`chip ${v.pass ? "pass" : "fail"}`} tabIndex={0}>
                      {v.pass ? "✓" : "✗"} {t.judgeNames[id] ?? id}
                      <span className="tip" role="tooltip">
                        {v.reason}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {(t.human === "down" || t.note) && (
                <input
                  aria-label="Open-coding note"
                  placeholder="What went wrong? One line, plain words."
                  value={t.note ?? ""}
                  onChange={(e) => updateTrace(t.id, { note: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: "1rem", position: "sticky", top: 0 }}>
          <div className="card">
            <h3>Notes → patterns</h3>
            <p>
              {noted.length} note{noted.length === 1 ? "" : "s"} so far. Thumbs-down an answer and write what went wrong, in
              plain words. Then group the notes into patterns. Each pattern becomes a new check.
            </p>
            <div className="toolbar" style={{ marginTop: "0.5rem" }}>
              <button className="btn primary" disabled={busy || noted.length < 2} onClick={cluster}>
                {busy ? "Grouping…" : "Group my notes"}
              </button>
            </div>
            {error && <div className="error">{error}</div>}
          </div>
          {categories?.map((c) => (
            <div className="card" key={c.name}>
              <h3>
                <span className={`kind ${c.evalType === "llm-judge" ? "llm" : c.evalType}`}>
                  {c.evalType === "llm-judge" ? "LLM" : c.evalType}
                </span>
                {c.name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {c.noteIds.length}</span>
              </h3>
              <p>{c.description}</p>
              <p style={{ color: "var(--text)" }}>
                <strong>Eval:</strong> {c.evalIdea}
              </p>
            </div>
          ))}
          <div className="card">
            <h3>Do the checks agree with you?</h3>
            {agree === null ? (
              <p>Thumbs up or down some traces that a judge has marked, to see how often the judges agree with you.</p>
            ) : (
              <>
                <p>
                  Judges agree with you on <strong style={{ color: "var(--text)" }}>{agree}%</strong> of {labelled.length}{" "}
                  labelled traces.
                </p>
                <table className="matrix" style={{ marginTop: "0.5rem" }}>
                  <thead>
                    <tr>
                      <th />
                      <th>Checks ✓</th>
                      <th>Checks ✗</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>You 👍</th>
                      <td className="agree">{m.upPass}</td>
                      <td className="disagree">{m.upFail}</td>
                    </tr>
                    <tr>
                      <th>You 👎</th>
                      <td className="disagree">{m.downPass}</td>
                      <td className="agree">{m.downFail}</td>
                    </tr>
                  </tbody>
                </table>
                {m.downPass > 0 && (
                  <p>
                    {m.downPass} bad output{m.downPass === 1 ? "" : "s"} got past the judges. That's your next eval.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
