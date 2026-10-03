import { useEffect, useState } from "react";
import { SCENES } from "../scenes";
import { buildCount, useStore } from "../lib/store";
import { sendCommand } from "../lib/sync";
import { VARIANT, VARIANTS, switchVariant, type VariantId } from "../variants";

export function Presenter() {
  const sceneIndex = useStore((s) => s.sceneIndex);
  const goTo = useStore((s) => s.goTo);
  const [start, setStart] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const scene = SCENES[sceneIndex];
  const next = SCENES[sceneIndex + 1];
  const build = useStore((s) => s.build);
  const builds = buildCount(scene);
  const talk = "talk" in scene ? scene.talk : undefined;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useStore.getState();
      const keys: Record<string, () => void> = {
        ArrowRight: () => s.go(1),
        PageDown: () => s.go(1),
        ArrowLeft: () => s.go(-1),
        PageUp: () => s.go(-1),
        " ": () => sendCommand("run"),
        Enter: () => sendCommand("run"),
        r: () => sendCommand("run10"),
        f: () => sendCommand("fix"),
        b: () => sendCommand("unfix"),
        p: () => sendCommand("replay"),
        j: () => sendCommand("judge"),
        a: () => sendCommand("all"),
        s: () => sendCommand("compare"),
        ArrowUp: () => sendCommand("up"),
        ArrowDown: () => sendCommand("down"),
      };
      const fn = keys[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const secs = Math.floor((now - start) / 1000);
  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="presenter">
      <div className="row">
        <button className="btn" onClick={() => setStart(Date.now())} title="Reset timer">
          <span className="timer" style={{ color: secs > 25 * 60 ? "var(--fail)" : undefined }}>
            {mmss}
          </span>
          <span style={{ color: "var(--muted)" }}>/ 25:00</span>
        </button>
        <div>
          <div style={{ color: "var(--muted)" }}>
            {sceneIndex + 1}/{SCENES.length} · {scene.act}
          </div>
          <div className="now">{scene.title}</div>
        </div>
        <span style={{ flex: 1 }} />
        <select
          className="badge"
          aria-label="Which translator the talk uses"
          value={VARIANT.id}
          onChange={(e) => {
            const id = e.target.value as VariantId;
            if (!confirm(`Switch the whole talk to the ${VARIANTS.find((v) => v.id === id)?.label} translator? Both windows reload. Each translator keeps its own demo state.`)) return;
            sendCommand(`variant:${id}`);
            switchVariant(id);
          }}
        >
          {VARIANTS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.logo} {v.label}
            </option>
          ))}
        </select>
        <select className="badge" aria-label="Model the translator uses" defaultValue="" onChange={(e) => e.target.value && sendCommand(`model:${e.target.value}`)}>
          <option value="">translator model…</option>
          {["claude-haiku-4-5", "claude-sonnet-5-5", "claude-opus-5-5"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() => confirm("Clear every translator back to Version 1, with no answers? Use this between rehearsal and the real talk.") && sendCommand("reset")}
        >
          Reset demo
        </button>
        <div style={{ color: "var(--muted)", textAlign: "right" }}>
          Next: <strong style={{ color: "var(--text)" }}>{next ? next.title : "the end"}</strong>
          <br />
          <span className="mono" style={{ fontSize: "0.8rem" }}>
            ← → scenes · ↑↓ phrase · space translate · R try 5× · A all phrases · S side by side · F next version · B back · J next check · P replay
          </span>
        </div>
      </div>
      {talk ? (
        <div className="talk">
          <div className="talk-now">
            <span className="talk-label">
              Now{builds > 0 && ` · step ${build + 1} of ${builds + 1}`}
            </span>
            {talk[build] ?? ""}
          </div>
          <div className="talk-next">
            <span className="talk-label">Next click</span>
            {build < builds ? (talk[build + 1] ?? "Reveal the next item") : next ? `→ ${next.title}` : "The end"}
          </div>
        </div>
      ) : (
        <div className="notes-body">{scene.notes ?? <span style={{ color: "var(--muted)" }}>No notes for this scene.</span>}</div>
      )}
      {talk && scene.notes && <div className="notes-body small">{scene.notes}</div>}
      {scene.kind === "lab" && scene.judges.length > 0 && (
        <div style={{ color: "var(--muted)" }}>
          Checks, in order (J): {scene.judges.map((j) => j.name).join(" → ")}
        </div>
      )}
      {scene.kind === "lab" && (
        <div className="hints">
          {scene.cases.map((c) => (
            <div key={c.id}>
              <b>{c.text}</b>
              {c.hint && <span>{c.hint}</span>}
            </div>
          ))}
        </div>
      )}
      <div className="list">
        {SCENES.map((s, i) => (
          <button key={s.id} className={i === sceneIndex ? "on" : ""} onClick={() => goTo(i)}>
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
