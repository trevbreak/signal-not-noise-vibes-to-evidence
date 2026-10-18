import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BEATS, HAND_START, NEEDLE_AT } from "./content";
import { stepOf, type TalkState } from "./store";
import { BEAT_VIEWS } from "./beats";

// The canvas: a fixed 16:9 stage in cqw units. Everything on it is a pure function of
// (beat, step, the room's input), so ← and → always land on exactly the right picture.

export const Instant = createContext(false);
/** Everything that plays an entrance animation. */
const ENTRANCES = '[class*="a-"], .loop-path, .mrow, .beat-in';
export const useInstant = () => useContext(Instant);

export function Stage({ state, instant, className = "" }: {
  state: TalkState;
  /** Show the end state at once (going back, jumping, the presenter's "next" preview). */
  instant?: boolean;
  className?: string;
}) {
  const beat = BEATS[state.beat];
  const step = stepOf(state);
  const View = BEAT_VIEWS[beat.kind];
  const still = instant ?? state.dir !== 1;
  const mode = step.needleMode ?? beat.needle;
  // Anything shown at its end state (going back, or a jump) is finished for good. Without this, the next
  // → would let it replay its entrance delay and blink out for a few seconds.
  const canvas = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!still || !canvas.current) return;
    canvas.current.querySelectorAll(ENTRANCES).forEach((el) => el.setAttribute("data-done", ""));
  });
  const target = NEEDLE_AT[state.beat][state.step];
  return (
    <Instant.Provider value={still}>
      <div ref={canvas} className={`canvas ${beat.dark ? "dark" : ""} ${still ? "instant" : ""} ${className}`} data-beat={beat.id} data-step={state.step}>
        <div className={`layer ${beat.dark ? "" : "beat-in"}`} key={beat.id}>
          <View beat={beat} step={state.step} state={state} />
        </div>
        <Needle mode={mode} target={target === "hand" ? (state.room.needleHand ?? HAND_START) : target} instant={still} />
        {beat.loop && <LoopBadge at={beat.loop} />}
        {state.blackout && <div className="blackout" />}
      </div>
    </Instant.Provider>
  );
}

// ── The needle ───────────────────────────────────────────────────────────────
// One dial for the whole talk: VIBES on the left, EVIDENCE on the right. A spring drives it,
// so it overshoots and settles like a real needle. In 1.3 the presenter moves it with ↑ ↓.

const angle = (v: number) => -90 + Math.max(-4, Math.min(104, v)) * 1.8;

function Needle({ mode, target, instant }: { mode: "hidden" | "corner" | "big"; target: number; instant: boolean }) {
  const hand = useRef<SVGGElement>(null);
  const sim = useRef({ v: target, vel: 0, goal: target });

  // Where the needle is heading for this step.
  useEffect(() => {
    const s = sim.current;
    s.goal = target;
    if (instant) Object.assign(s, { v: target, vel: 0 });
  }, [target, instant]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const acc = 70 * (s.goal - s.v) - 9 * s.vel;
      s.vel += acc * dt;
      s.v += s.vel * dt;
      hand.current?.setAttribute("transform", `rotate(${angle(s.v).toFixed(2)} 100 100)`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`needle ${mode}`} aria-hidden={mode === "hidden"} data-box="needle">
      <svg viewBox="0 0 200 112" role="img" aria-label="A needle from vibes to evidence">
        <defs>
          <linearGradient id="needle-track" x1="0" x2="1">
            <stop offset="0" stopColor="var(--vibes)" />
            <stop offset="0.5" stopColor="#e9b44c" />
            <stop offset="1" stopColor="var(--pass)" />
          </linearGradient>
        </defs>
        <path d="M 22 100 A 78 78 0 0 1 178 100" fill="none" stroke="url(#needle-track)" strokeWidth="13" strokeLinecap="round" opacity="0.32" />
        {[0, 25, 50, 75, 100].map((t) => {
          const a = ((angle(t) - 90) * Math.PI) / 180;
          return <line key={t} x1={100 + Math.cos(a) * 62} y1={100 + Math.sin(a) * 62} x2={100 + Math.cos(a) * 70} y2={100 + Math.sin(a) * 70} stroke="var(--faint)" strokeWidth="2" />;
        })}
        <g ref={hand} transform={`rotate(${angle(sim.current.v)} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="26" stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="7.5" fill="var(--ink)" />
      </svg>
      <div className="scale">
        <span>Vibes</span>
        <span>Evidence</span>
      </div>
    </div>
  );
}

// ── The loop badge ───────────────────────────────────────────────────────────
// During section 2 a small loop in the corner shows where we are, so the recap in 3.0
// repeats what the room watched happen rather than telling them.

const BADGE_STATIONS = [
  { id: "define", label: "Define", x: 120, y: 32 },
  { id: "build", label: "Build", x: 208, y: 100 },
  { id: "measure", label: "Measure", x: 120, y: 168 },
  { id: "learn", label: "Learn", x: 32, y: 100 },
] as const;

function LoopBadge({ at }: { at: "define" | "measure" }) {
  return (
    <div className="loop-badge" data-box="loop-badge">
      <span className="a-fade" key={at}>
        {at === "define" ? "Define · what good looks like" : "Measure · by hand"}
      </span>
      <svg viewBox="0 0 240 200" aria-hidden>
        <ellipse cx="120" cy="100" rx="88" ry="68" fill="none" stroke="var(--faint)" strokeWidth="2" />
        {BADGE_STATIONS.map((s) => {
          const on = s.id === at;
          return (
            <g key={s.id}>
              <circle cx={s.x} cy={s.y} r="30" fill={on ? "var(--accent)" : "var(--card)"} stroke="var(--edge)" strokeWidth="2" style={{ transition: "fill 0.5s" }} />
              <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={on ? "#fff" : "var(--ink)"} fontFamily="var(--display)">
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Moves shared by the beats ────────────────────────────────────────────────

/** Type: a person (or the instructions) saying this. Space for the full text is reserved, so nothing reflows. */
export function Type({ text, speed = 26, delay = 0, caret = false, retype = true, still = false, className }: {
  text: string;
  speed?: number;
  delay?: number;
  caret?: boolean;
  /** false: if the text changes after it has typed once (the room's wording replacing ours), show it at once. */
  retype?: boolean;
  /** Show it whole, now: words the room already watched being typed. */
  still?: boolean;
  className?: string;
}) {
  const instant = useInstant() || still;
  const startInstant = useRef(instant);
  const typedOnce = useRef(false);
  const [n, setN] = useState(startInstant.current ? text.length : 0);
  useEffect(() => {
    if (startInstant.current || (typedOnce.current && !retype)) {
      setN(text.length);
      startInstant.current = false;
      typedOnce.current = true;
      return;
    }
    typedOnce.current = true;
    setN(0);
    let i = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
    // Retype only when the text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  const typing = n < text.length;
  return (
    <span className={className} style={{ display: "inline-grid" }}>
      <span style={{ gridArea: "1 / 1", visibility: "hidden" }} aria-hidden>
        {text}
      </span>
      <span style={{ gridArea: "1 / 1" }} className={caret && typing ? "caret" : ""}>
        {text.slice(0, n)}
      </span>
    </span>
  );
}

/** Live typing from the presenter: the draft, with a caret. */
export function Draft({ text }: { text: string }) {
  return <span className="caret">{text}</span>;
}

/** Expose: text with phrases outlined when `on`. */
export function Marked({ text, marks }: { text: string; marks: { phrase: string; kind: "ok" | "bad" | "mid"; on: boolean }[] }) {
  const parts: ReactNode[] = [];
  let rest = text;
  let k = 0;
  while (rest) {
    let best: { i: number; m: (typeof marks)[number] } | null = null;
    for (const m of marks) {
      const i = rest.indexOf(m.phrase);
      if (i >= 0 && (!best || i < best.i)) best = { i, m };
    }
    if (!best) {
      parts.push(rest);
      break;
    }
    if (best.i) parts.push(rest.slice(0, best.i));
    parts.push(
      <span key={k++} className={`mark ${best.m.kind} ${best.m.on ? "on" : ""}`}>
        {best.m.phrase}
      </span>,
    );
    rest = rest.slice(best.i + best.m.phrase.length);
  }
  return <>{parts}</>;
}

/** Entrance with a delay, in seconds. */
export const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
