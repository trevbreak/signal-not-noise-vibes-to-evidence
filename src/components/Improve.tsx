import { useMemo, useState } from "react";
import { improveJudge, improvePrompt, judgeFeedback, promptFeedback, useFlow, type Version } from "../lib/flow";
import type { ImproveScene } from "../lib/types";

export function Improve({ scene }: { scene: ImproveScene }) {
  const flow = useFlow();
  const s = scene;
  const pFeedback = promptFeedback(s);
  const jFeedback = judgeFeedback(s);
  const judgesWithFeedback = s.judges.filter((j) => j.kind === "llm" && jFeedback.some((f) => f.judge.id === j.id));

  // Dedupe prompt feedback by answer + code, so the same note from two judges shows once.
  const seen = new Set<string>();
  const promptNotes = pFeedback.filter((f) => !seen.has(f.item.id + f.code) && seen.add(f.item.id + f.code));

  return (
    <div className="improve">
      <section className="improve-col">
        <div className="col-head">
          <span className="dest prompt">The instructions</span>
          <span className="muted">What we told the translator</span>
        </div>
        <Versioned
          original={{ label: "Version 2 · what we had", text: s.instructions }}
          versions={flow.prompts}
          action={
            <button className="btn primary" disabled={!!flow.busy || !promptNotes.length} onClick={() => improvePrompt(s)}>
              ✨ Improve the instructions
            </button>
          }
        />
        <Feedback
          title="Our feedback on the translations"
          empty="No notes yet. On the last screen, agree with a ✗ and say what went wrong."
          notes={promptNotes.map((f) => ({ code: f.code, comment: f.comment, on: f.item.output }))}
        />
      </section>

      <section className="improve-col">
        <div className="col-head">
          <span className="dest judge">The judge</span>
          <span className="muted">{judgesWithFeedback.map((j) => j.name).join(", ") || "Whichever judge we disagreed with"}</span>
        </div>
        {judgesWithFeedback.length ? (
          judgesWithFeedback.map((j) => (
            <div key={j.id} style={{ display: "grid", gap: "0.8rem" }}>
              <Versioned
                original={{ label: "Guide 1 · what we had", text: j.kind === "llm" ? j.rubric : "" }}
                versions={flow.rubrics[j.id] ?? []}
                action={
                  <button className="btn primary" disabled={!!flow.busy} onClick={() => improveJudge(s, j.id)}>
                    ✨ Improve the judge
                  </button>
                }
              />
              <Feedback
                title={`Our feedback on "${j.name}"`}
                empty=""
                notes={jFeedback.filter((f) => f.judge.id === j.id).map((f) => ({ code: f.code, comment: f.comment, on: f.item.output }))}
              />
            </div>
          ))
        ) : (
          <div className="card">
            <p>No judge feedback yet. On the last screen, disagree with a judge and say why.</p>
          </div>
        )}
      </section>

      {(flow.busy || flow.error) && (
        <div className="improve-status">
          {flow.busy && <span className="thinking">{flow.busy}</span>}
          {flow.error && <span className="error">{flow.error}</span>}
        </div>
      )}
    </div>
  );
}

/** A text with its versions: the newest one shows what was added, and what changed. */
function Versioned(props: { original: Version; versions: Version[]; action: React.ReactNode }) {
  const all = [props.original, ...props.versions];
  const [pick, setPick] = useState<number | null>(null);
  const i = pick ?? all.length - 1;
  const cur = all[Math.min(i, all.length - 1)];
  const prev = i > 0 ? all[i - 1] : null;
  const lines = useMemo(() => {
    const before = new Set((prev?.text ?? "").split("\n").map((l) => l.trim()));
    return cur.text.split("\n").map((t) => ({ t, added: !!prev && t.trim() !== "" && !before.has(t.trim()) }));
  }, [cur, prev]);

  return (
    <div className="versioned">
      {all.length > 1 && (
        <div className="versions">
          {all.map((v, k) => (
            <button key={v.label} className={k === i ? "on" : ""} onClick={() => setPick(k)}>
              {v.label}
            </button>
          ))}
        </div>
      )}
      <div className="versioned-text" key={cur.label}>
        {lines.map((l, k) => (
          <div key={k} className={l.added ? "added-line" : ""}>
            {l.t || " "}
          </div>
        ))}
      </div>
      {cur.changes && (
        <ul className="changes">
          {cur.changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
      <div>{props.action}</div>
    </div>
  );
}

function Feedback(props: { title: string; empty: string; notes: { code: string; comment: string; on: string }[] }) {
  return (
    <div className="feedback">
      <div className="step-title small">{props.title}</div>
      {!props.notes.length && props.empty && <p className="muted">{props.empty}</p>}
      {props.notes.map((n, k) => (
        <div key={k} className="note">
          <span className="code-chip">{n.code}</span>
          <div className="note-comment">{n.comment || <span className="muted">(no comment)</span>}</div>
          <div className="note-on">on “{n.on}”</div>
        </div>
      ))}
    </div>
  );
}
