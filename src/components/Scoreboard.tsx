import { useMemo, useState } from "react";
import { runGolden, testCaseCount, type GoldenCell } from "../lib/runner";
import { useStore } from "../lib/store";
import { PROMPTS } from "../scenes";
import type { ScoreboardScene } from "../lib/types";

const VERSIONS = Object.keys(PROMPTS);
const caseCount = testCaseCount();

export function Scoreboard({ scene }: { scene: ScoreboardScene }) {
  const traces = useStore((s) => s.traces);
  const [times, setTimes] = useState(1);
  const [live, setLive] = useState<Record<string, GoldenCell> | null>(null);
  const [running, setRunning] = useState(false);

  // Without a live run, show the most recent golden batch per version from saved traces.
  const fromTraces = useMemo(() => {
    const golden = traces.filter((t) => t.sceneId === "golden" && t.output);
    const latestBatch: Record<string, string> = {};
    for (const t of golden) latestBatch[t.promptVersion] = t.batchId;
    const cells: Record<string, GoldenCell> = {};
    for (const v of VERSIONS) {
      const ts = golden.filter((t) => t.promptVersion === v && t.batchId === latestBatch[v]);
      if (!ts.length) continue;
      const passed = ts.filter((t) => Object.values(t.verdicts).every((x) => x.pass)).length;
      const latencyMs = ts.reduce((n, t) => n + (t.latencyMs ?? 0), 0);
      cells[v] = { version: v, done: ts.length, total: ts.length, passed, latencyMs, inputTokens: ts.reduce((n, t) => n + (t.inputTokens ?? 0), 0) };
    }
    return cells;
  }, [traces]);

  const cells = live ?? fromTraces;

  const go = async () => {
    setRunning(true);
    setLive({});
    await runGolden(VERSIONS, times, setLive);
    setRunning(false);
  };

  return (
    <div className="workbench">
      <h2>{scene.title}</h2>
      <div className="toolbar">
        <button className="btn primary" disabled={running} onClick={go}>
          {running ? "Running the full test…" : "Run the full test"}
        </button>
        <div className="seg" role="group" aria-label="Runs per case">
          {[1, 3, 5].map((n) => (
            <button key={n} className={times === n ? "on" : ""} onClick={() => setTimes(n)}>
              ×{n}
            </button>
          ))}
        </div>
        <span style={{ color: "var(--muted)" }}>
          {caseCount} phrases × {VERSIONS.length} versions of the instructions × {times} = {caseCount * VERSIONS.length * times}{" "}
          translations, each marked by every check.
        </span>
      </div>

      <div className="bars">
        {VERSIONS.map((v) => {
          const c = cells[v];
          const pct = c && c.done ? Math.round((100 * c.passed) / c.done) : null;
          return (
            <div className="col" key={v}>
              <div className="pct">{pct === null ? "–" : `${pct}%`}</div>
              <div className="bar" style={{ height: `${pct ?? 0}%` }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        {VERSIONS.map((v) => {
          const c = cells[v];
          return (
            <div className="bars-label" key={v} style={{ flex: 1, textAlign: "center" }}>
              <div className="mono" style={{ fontWeight: 600 }}>
                {PROMPTS[v].label}
              </div>
              <div className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                {c ? `${c.passed}/${c.done}${c.total > c.done ? ` · ${c.total - c.done} to go` : ""}` : "not run"}
              </div>
              {c && c.done > 0 && (
                <div className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                  {(c.latencyMs / c.done / 1000).toFixed(1)}s avg
                  {c.inputTokens > 0 && ` · ${Math.round(c.inputTokens / c.done)} tokens in`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
