import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./presenter.css";
import { BEATS, DEFAULT_RULES, DEFAULT_VOTES, MOVEMENTS, movementEnds, type Field } from "./content";
import { Stage } from "./Stage";
import { MAX_NOTICE_LENGTH, stepOf, useTalk, type TalkState } from "./store";
import { dispatch, useConnected } from "./sync";
import { useKeys } from "./keys";
import { mock } from "./live";

// The presenter window (?presenter, or O on the projector). Previews of now and next, the line to
// say, the keys that matter on this step, and a control for every moment the room takes part.

const VOTE_LABELS = ["Mostly good", "Leaning good", "Split", "Leaning bad", "Mostly bad"];
const FIELD_LABEL: Record<Field, string> = {
  notice: "The room's notice",
  "rule:0": "Card 1, in the room's words",
  "rule:1": "Card 2, in the room's words",
  "rule:2": "Card 3, in the room's words",
  "rule:3": "Card 4, in the room's words",
};

const FIT_MAX = 36;
const FIT_MIN = 18;

const clock = (n: number) => `${Math.floor(Math.max(0, n) / 60)}:${String(Math.floor(Math.max(0, n)) % 60).padStart(2, "0")}`;

function nextOf(s: TalkState): TalkState | null {
  if (s.step < BEATS[s.beat].steps.length - 1) return { ...s, step: s.step + 1, dir: 0, editing: null, draft: "" };
  if (s.beat < BEATS.length - 1) return { ...s, beat: s.beat + 1, step: 0, dir: 0, editing: null, draft: "" };
  return null;
}

type Health = { anthropic: boolean; translatorModel: string; judgeModel: string } | null;

export function Presenter() {
  const state = useTalk();
  const connected = useConnected();
  useKeys();
  const beat = BEATS[state.beat];
  const step = stepOf(state);
  const next = nextOf(state);
  const nextStep = next ? stepOf(next) : null;

  // The clock starts when you leave the title card, and can be restarted.
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (start === null && state.beat > 0) setStart(Date.now());
  }, [state.beat, start]);
  const secs = start === null ? 0 : (now - start) / 1000;
  const due = movementEnds(beat.movement || 1);
  const late = start !== null && beat.movement > 0 && secs > due;

  const [health, setHealth] = useState<Health>(null);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : null))
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  // Keep the current beat in view in the strip along the bottom.
  useEffect(() => {
    document.querySelector(".pv-beats button.on")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [state.beat]);

  // The script panel uses the biggest text that fits without scrolling: start large, step down until it fits.
  const scriptRef = useRef<HTMLElement>(null);
  const [fit, setFit] = useState(FIT_MAX);
  useLayoutEffect(() => {
    const el = scriptRef.current;
    if (!el) return;
    const refit = () => {
      let size = FIT_MAX;
      el.style.setProperty("--fit", `${size}px`);
      while (size > FIT_MIN && el.scrollHeight > el.clientHeight + 1) {
        size -= 1;
        el.style.setProperty("--fit", `${size}px`);
      }
      setFit(size);
    };
    refit();
    const ro = new ResizeObserver(refit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step, nextStep, state.room.notices, state.editing]);

  const total = BEATS.reduce((n, b) => n + b.steps.length, 0);
  const done = BEATS.slice(0, state.beat).reduce((n, b) => n + b.steps.length, 0) + state.step + 1;

  return (
    <div className="pv">
      <header className="pv-top">
        <button className="pv-clock" onClick={() => setStart(Date.now())} title="Restart the clock">
          <span className={secs > 25 * 60 ? "late" : ""}>{clock(secs)}</span>
          <small>/ 25:00</small>
        </button>
        <div className={`pv-check ${late ? "late" : ""}`}>
          {beat.movement > 0 ? (
            <>
              {beat.movement} · {MOVEMENTS.find((m) => m.n === beat.movement)?.name} · finish by <b>{clock(due)}</b>
              {late && <span> · {clock(secs - due)} behind</span>}
            </>
          ) : (
            "Before the talk"
          )}
        </div>
        <div className="pv-where">
          <span className="num">{beat.num}</span> {beat.title}
          <small>
            step {state.step + 1} of {beat.steps.length} · {done}/{total}
          </small>
        </div>
        <span className="pv-spacer" />
        {mock && <span className="pv-badge warn">Mock answers</span>}
        <span className={`pv-badge ${health?.anthropic || mock ? "ok" : "bad"}`} title={health ? `Translator ${health.translatorModel}, judge ${health.judgeModel}` : "The dev server didn't answer"}>
          {mock ? "Live calls mocked" : health?.anthropic ? "Live calls ready" : "No API key: room notices will show the fallback"}
        </span>
        <span className={`pv-badge ${connected ? "ok" : "bad"}`}>{connected ? "Projector connected" : "Projector not connected"}</span>
        <button className={`pv-btn ${state.blackout ? "on" : ""}`} onClick={() => dispatch("toggleBlackout")} title="B or . on either window">
          Black screen
        </button>
        <button
          className="pv-btn"
          onClick={() => {
            if (confirm("Reset the talk to the title card and clear everything the room typed and voted?")) {
              dispatch("reset");
              setStart(null);
            }
          }}
        >
          Reset talk
        </button>
      </header>

      <main className="pv-main">
        <section className="pv-previews">
          <div className="pv-label">Now</div>
          <div className="pv-stage now">
            <Stage state={state} />
          </div>
          <div className="pv-under">
            <div className="pv-upnext">
              <div className="pv-label">Next screen</div>
              <div className="pv-stage next">{next ? <Stage state={next} instant /> : <div className="pv-end">The end</div>}</div>
            </div>
            <div className="pv-nav">
              <button className="pv-btn big" onClick={() => dispatch("prev")}>
                ← Back
              </button>
              <button className="pv-btn big primary" onClick={() => dispatch("next")}>
                Next →
              </button>
            </div>
          </div>
        </section>

        <section className="pv-script" ref={scriptRef} style={{ "--fit": `${fit}px` } as React.CSSProperties}>
          <div className="pv-label">Say</div>
          <div className="pv-say">
            <Bold text={step.say} />
          </div>
          <div className="pv-label">Then</div>
          <div className="pv-next">{nextStep ? <Bold text={nextStep.say} /> : "That's the talk."}</div>

          <div className="pv-keys">
            <kbd>→</kbd> next <kbd>←</kbd> back
            {step.keys && (
              <>
                <span className="sep" />
                <b>{step.keys}</b>
              </>
            )}
          </div>

          <Controls state={state} />
        </section>
      </main>

      <nav className="pv-beats" aria-label="Jump to a beat">
        {MOVEMENTS.map((m) => (
          <div key={m.n} className="pv-movement">
            <span className="pv-mname">
              {m.n} · {m.name}
            </span>
            {BEATS.map((b, i) =>
              b.movement === m.n ? (
                <button key={b.id} className={i === state.beat ? "on" : i < state.beat ? "past" : ""} onClick={() => dispatch("goTo", i, 0)} title={b.title}>
                  {b.num} {b.title}
                </button>
              ) : null,
            )}
          </div>
        ))}
        <div className="pv-movement">
          <span className="pv-mname">Before</span>
          <button className={state.beat === 0 ? "on" : ""} onClick={() => dispatch("goTo", 0, 0)}>
            Title card
          </button>
        </div>
      </nav>
    </div>
  );
}

function Controls({ state }: { state: TalkState }) {
  const step = stepOf(state);
  const beat = BEATS[state.beat];
  const showNotices = beat.id === "build" || state.room.notices.length > 0;
  return (
    <div className="pv-controls">
      {step.field && <FieldBox field={step.field} state={state} />}
      {step.vote && (
        <div className="pv-ctl">
          <div className="pv-label">The room's call {state.room.votes[step.vote] ? "" : `(→ uses ${VOTE_LABELS[DEFAULT_VOTES[step.vote] - 1].toLowerCase()})`}</div>
          <div className="pv-row">
            {VOTE_LABELS.map((l, i) => (
              <button key={l} className={`pv-btn ${state.room.votes[step.vote!] === i + 1 ? "on" : ""}`} onClick={() => dispatch("numberKey", i + 1)}>
                <kbd>{i + 1}</kbd> {l}
              </button>
            ))}
          </div>
        </div>
      )}
      {step.nudge && (
        <div className="pv-ctl">
          <div className="pv-label">The needle · at {state.room.needleHand ?? 50} of 100 · → locks it in</div>
          <div className="pv-row">
            <button className="pv-btn" onClick={() => dispatch("upDown", false)}>
              <kbd>↓</kbd> Toward vibes
            </button>
            <button className="pv-btn" onClick={() => dispatch("upDown", true)}>
              <kbd>↑</kbd> Toward evidence
            </button>
          </div>
        </div>
      )}
      {showNotices && (
        <div className="pv-ctl">
          <div className="pv-label">The room's notices (two at most; a third replaces the first)</div>
          {state.room.notices.length === 0 && <div className="pv-muted">None yet.</div>}
          {state.room.notices.map((n) => (
            <div key={n.id} className="pv-notice">
              <div>
                <b>{n.text}</b>
                <div className={n.status === "failed" ? "pv-fail" : "pv-muted"}>
                  {n.status === "pending" ? "Translating…" : n.status === "failed" ? "No answer (shown as “in another meeting”)" : n.out}
                </div>
                {n.verdicts && (
                  <div className="pv-muted small">
                    Judged: {["numbers", "rule", "nothing added", "PM"].map((l, i) => `${l} ${n.verdicts![i] === null ? "–" : n.verdicts![i] ? "✓" : "✗"}`).join(" · ")}
                  </div>
                )}
              </div>
              <div className="pv-row">
                {n.status === "failed" && (
                  <button className="pv-btn" onClick={() => dispatch("retryNotice", n.id)}>
                    Retry
                  </button>
                )}
                <button className="pv-btn" onClick={() => dispatch("removeNotice", n.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldBox({ field, state }: { field: Field; state: TalkState }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  // A fresh box for every field.
  useEffect(() => setText(""), [field]);
  const current = field.startsWith("rule:") ? state.room.rules[Number(field.split(":")[1])] || DEFAULT_RULES[Number(field.split(":")[1])] : "";
  return (
    <div className="pv-ctl">
      <div className="pv-label">
        {FIELD_LABEL[field]} · type, Enter to put it on screen{current ? ` · now: “${current}”` : ""}
      </div>
      <input
        ref={ref}
        className="pv-input"
        value={text}
        maxLength={MAX_NOTICE_LENGTH}
        placeholder={field === "notice" ? "e.g. The fridge gets cleared every Friday at 4pm." : "Their words…"}
        onFocus={() => state.editing !== field && dispatch("startEdit")}
        onChange={(e) => {
          setText(e.target.value);
          if (useTalk.getState().editing !== field) dispatch("startEdit");
          dispatch("setDraft", e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            dispatch("setDraft", text);
            dispatch("commitEdit");
            setText("");
          } else if (e.key === "Escape") {
            e.preventDefault();
            dispatch("cancelEdit");
            setText("");
            ref.current?.blur();
          }
        }}
        onBlur={() => !text && dispatch("cancelEdit")}
      />
    </div>
  );
}

function Bold({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>;
}
