import { Fragment, useEffect, useMemo, useState, type ComponentType } from "react";
import { runCheck } from "../lib/checks";
import {
  AFTER, APP_NAME, DEFAULT_NOT_NOW, DEFAULT_RULES, DEFAULT_VOTES, FEEDBACK, FIVE_EACH, FIVE_TRIES, FRIDAY, GATES, HOMEWORK,
  INSTRUCTIONS_ADDED, INSTRUCTIONS_EXCERPT, JUDGE_ADDED, JUDGE_EXCERPT, JUDGES, KIND_LABEL, LEAVE, MONTAGE, MONTAGE_ROOM_AT,
  OPENERS, PAIRS, STAMPED_FAIL, STAMPED_PASS, TECH_DEBT, TECH_DEBT_OUT, TECH_DEBT_STAMPS, V1, V2_ADDED, V3_LABEL, VERSIONS,
  VOTE_ITEMS, VOTE_SPLITS, WALL, type Beat, type BeatKind, type JudgeKind, type VoteKey,
} from "./content";
import type { Notice, TalkState } from "./store";
import { d, Draft, Marked, Type, useInstant } from "./Stage";

type P = { beat: Beat; step: number; state: TalkState };

// ── Small shared pieces ──────────────────────────────────────────────────────

const JUDGE_SHORT: Record<string, string> = { numbers: "Numbers kept", rule: "Still a rule", scope: "Nothing added", voice: "Sounds like a PM", room: "The room" };
const kindOf = (id: string): JudgeKind => JUDGES.find((j) => j.id === id)?.kind ?? "ai";

function Stamp({ id, pass, why, wait }: { id: string; pass?: boolean; why: string; wait?: boolean }) {
  const kind = kindOf(id);
  return (
    <div className={`stamp ${wait ? "wait" : pass ? "ok" : "no"} k-${kind}`} data-box="stamp">
      <span className="glyph">{wait ? "?" : pass ? "✓" : "✗"}</span>
      <span className="who">{KIND_LABEL[kind]}</span>
      <span className="name">{JUDGE_SHORT[id]}</span>
      <span className="why">{why}</span>
    </div>
  );
}

/** A bar that grows from zero when it first appears, and slides when its value changes. */
function Fill({ pct, className = "", delay = 0 }: { pct: number; className?: string; delay?: number }) {
  const instant = useInstant();
  const [w, setW] = useState(instant ? pct : 0);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setW(pct)));
    return () => cancelAnimationFrame(r);
  }, [pct]);
  return <b className={className} style={{ width: `${w}%`, transitionDelay: `${delay}s` }} />;
}

function Bar({ split, agree, big }: { split: [number, number] | null; agree?: boolean; big?: boolean }) {
  const [g, b] = split ?? [0, 0];
  const room = big ? 12 : 26;
  return (
    <div className={`bar ${agree ? "agree" : ""} ${big ? "big" : ""}`} data-box="bar">
      <span className="g" style={{ width: `${g}%` }}>{g >= room && <em>{`${g}% ${agree ? "agree" : "good"}`}</em>}</span>
      <span className="b" style={{ width: `${b}%` }}>{b >= room && <em>{`${b}% ${agree ? "disagree" : "bad"}`}</em>}</span>
    </div>
  );
}

const splitOf = (state: TalkState, key: VoteKey) => VOTE_SPLITS[state.room.votes[key] ?? DEFAULT_VOTES[key]];
const ruleText = (state: TalkState, i: number) => state.room.rules[i] || DEFAULT_RULES[i];

/** Counts up from `from` to `to` when it mounts (or shows `to` at once). */
function Count({ from, to, over, delay = 0 }: { from: number; to: number; over: number; delay?: number }) {
  const instant = useInstant();
  const [n, setN] = useState(instant ? to : from);
  useEffect(() => {
    if (instant) return setN(to);
    const start = performance.now() + delay * 1000;
    let r = 0;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start) / (over * 1000)));
      setN(Math.round(from + (to - from) * p));
      if (p < 1) r = requestAnimationFrame(tick);
    };
    r = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return <>{n}</>;
}

// ── Title cards and holds ────────────────────────────────────────────────────

function TitleView({ beat }: P) {
  const drop = beat.props?.variant === "drop";
  return (
    <div className="title-card" data-box="title">
      <div className={`rule-line ${drop ? "a-grow" : ""}`} />
      <div className={`t-xl ${drop ? "a-rise" : ""}`} style={d(0.15)}>
        Your AI feature works in the demo.
        <br />
        <span style={{ color: "var(--hold-ink)" }}>Now prove it.</span>
      </div>
      <div className={`meta ${drop ? "a-fade" : ""}`} style={d(0.7)}>
        Signal not Noise · Brisbane
      </div>
    </div>
  );
}

function HoldView({ beat, step }: P) {
  const lines = beat.props?.lines as string[];
  const sub = beat.props?.sub as string[] | undefined;
  const subAt = beat.steps.length > 1 ? 1 : 0;
  return (
    <div className="hold" data-box="hold">
      <div className="t-xl">{lines.join(" ")}</div>
      {sub && step >= subAt && (
        <div className={`sub ${beat.props?.quiet ? "quiet" : ""} ${subAt ? "a-rise" : "a-fade"}`} style={subAt ? undefined : d(1)}>
          {sub.join(" ")}
        </div>
      )}
    </div>
  );
}

// ── 1 · Fooled ───────────────────────────────────────────────────────────────

function RoomRow({ n }: { n: Notice }) {
  return (
    <div className="row a-rise" data-box="row">
      <div className="en">
        {n.text}
        <span className="who">from the room</span>
      </div>
      <div className={`out ${n.status === "done" ? "" : "wait"}`}>
        {n.status === "pending" && <span className="dots">Thinking</span>}
        {n.status === "failed" && "The PM is in another meeting. Next!"}
        {n.status === "done" && <Type text={n.out ?? ""} speed={20} />}
      </div>
    </div>
  );
}

function BuildView({ step, state }: P) {
  const rows = OPENERS.slice(0, Math.min(step, 3));
  const room = step >= 4 ? state.room.notices : [];
  const drafting = state.editing === "notice";
  const count = rows.length + room.length + (drafting ? 1 : 0);
  return (
    <>
      <div className="note a-rise" data-box="note">
        <div className="label">
          <span>What we told it</span>
          <span>Version 1</span>
        </div>
        <div className="body">
          <Type text={V1} speed={9} delay={300} />
        </div>
        {step >= 1 && <div className="foot a-fade">One paragraph. No code.</div>}
      </div>
      <div className={`app a-rise ${count > 3 ? "dense" : ""}`} style={d(0.15)} data-box="app">
        <div className="app-head">
          <span className="logo">☝</span>
          <span className="name">{APP_NAME}</span>
          <span className="label tag">PM-speak</span>
        </div>
        <div className="rows">
          {rows.length === 0 && (
            <div className="row">
              <div className="en" style={{ color: "var(--faint)" }}>
                Paste a notice…
              </div>
            </div>
          )}
          {rows.map((r) => (
            <div className="row a-rise" key={r.id} data-box="row">
              <div className="en">{r.en}</div>
              <div className="out">
                <Type text={r.out} speed={20} delay={350} />
              </div>
            </div>
          ))}
          {room.map((n) => (
            <RoomRow key={n.id} n={n} />
          ))}
          {drafting && (
            <div className="row draft" data-box="row">
              <div className="en">
                <Draft text={state.draft} />
                <span className="who">from the room</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NeedleView({ step }: P) {
  return (
    <div className="ship" data-box="ship">
      <div className="t-xl a-rise" style={d(0.3)}>
        Ship it?
      </div>
      <div className="ship-sub">
        {step === 0 && <div className="t-s t-muted a-fade" style={d(0.8)}>Tell me when to stop.</div>}
        {step === 1 && <div className="t-s t-muted">That much?</div>}
        {step === 2 && (
          <div className="t-m t-accent a-rise" style={d(0.6)}>
            That's not evidence. That's vibes.
          </div>
        )}
      </div>
    </div>
  );
}

function RevealView({ step }: P) {
  const focus = step >= 1;
  return (
    <>
      <div className="trio" data-box="trio">
        {OPENERS.map((o, i) => (
          <div key={o.id} className={focus ? (i === 2 ? "gone" : "dim") : "lit"}>
            <div className="card mini a-deal" style={d(i * 0.2)}>
              <div className="en">{o.en}</div>
              <div className="out">{o.out}</div>
            </div>
          </div>
        ))}
      </div>
      {focus && (
        <div className="spot" data-box="spot">
          <div className="card a-grow" style={d(0.1)}>
            <div className="wm">{APP_NAME}</div>
            <div className="en">
              <Marked text={LEAVE} marks={[{ phrase: "4 weeks'", kind: "ok", on: step >= 2 }]} />
            </div>
            <div className="out">
              <Marked
                text={OPENERS[2].out}
                marks={[
                  { phrase: "two weeks", kind: "bad", on: step >= 3 },
                  { phrase: "already told the team", kind: "bad", on: step >= 3 },
                ]}
              />
            </div>
          </div>
        </div>
      )}
      {step >= 4 && (
        <div className="caption a-rise" style={{ top: "42cqw" }} data-box="caption">
          You all just approved this.
        </div>
      )}
    </>
  );
}

function TriesView({ step }: P) {
  return (
    <>
      <div className="headline" data-box="headline">
        <div className="label">Same notice · five tries</div>
        <div className="t-m">{FRIDAY}</div>
      </div>
      <div className="fan" data-box="fan">
        {FIVE_TRIES.map((t, i) => (
          <div key={i} className={t.bad.length === 0 && step >= 1 ? "right" : ""}>
            <div className="card a-deal" style={d(0.15 + i * 0.35)}>
              <span className="n">
                Try {i + 1}
                {t.bad.length === 0 && <span className={`ok-tag ${step >= 1 ? "on" : ""}`}>✓</span>}
              </span>
              <Marked text={t.out} marks={t.bad.map((p) => ({ phrase: p, kind: "bad" as const, on: step >= 1 }))} />
            </div>
          </div>
        ))}
      </div>
      {step >= 2 && (
        <div className="tries-foot" data-box="foot">
          <div className="t-l a-rise">5 tries. 5 answers.</div>
          <div className="t-s t-muted a-rise" style={d(0.6)}>
            One right. Four different kinds of wrong.
          </div>
        </div>
      )}
    </>
  );
}

function PairsView({ step }: P) {
  const first = V1.split(". ")[0] + ".";
  return (
    <>
      <div className="note a-rise" data-box="note">
        <div className="label">
          <span>What we told it</span>
          <span>Version 2</span>
        </div>
        <div className="body">
          <span className="old">{first} …</span>
          {V2_ADDED.map((l, i) => (
            <div key={i} className="add">
              <Type text={`+ ${l}`} speed={14} delay={500 + i * 1400} />
            </div>
          ))}
        </div>
      </div>
      {step >= 1 && (
        <div className="pairs" data-box="pairs">
          <div className="head">
            <span className="label">Version 1</span>
            <span />
            <span className="label">Version 2</span>
          </div>
          {PAIRS.map((p, i) => (
            <div className="pair" key={i}>
              <div className="en a-fade" style={d(i * 0.55)}>
                {p.en}
              </div>
              <div className="two">
                <div className="card a-deal" style={d(0.1 + i * 0.55)}>
                  {p.v1}
                </div>
                <div className="q">{step >= 2 && <span className="a-stamp" style={d(i * 0.3)}>?</span>}</div>
                <div className="card a-deal" style={d(0.3 + i * 0.55)}>
                  {p.v2}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── The loop ─────────────────────────────────────────────────────────────────

type StationState = "idle" | "lit" | "done" | "dashed";
const LOOP_MODES: Record<string, Record<"define" | "build" | "measure" | "learn", StationState>> = {
  gap: { define: "dashed", build: "lit", measure: "idle", learn: "idle" },
  measure: { define: "done", build: "done", measure: "lit", learn: "idle" },
  learn: { define: "done", build: "done", measure: "done", learn: "lit" },
  lap: { define: "lit", build: "lit", measure: "lit", learn: "lit" },
};
const STATIONS = [
  { id: "define", label: "Define", x: 220, y: 55 },
  { id: "build", label: "Build", x: 380, y: 180 },
  { id: "measure", label: "Measure", x: 220, y: 305 },
  { id: "learn", label: "Learn", x: 60, y: 180 },
] as const;

function Loop({ mode }: { mode: string }) {
  const st = LOOP_MODES[mode];
  const lap = mode === "lap";
  const cx = 220, cy = 180, rx = 160, ry = 125;
  const arrows = [-45, 45, 135, 225].map((deg) => {
    const t = (deg * Math.PI) / 180;
    const x = cx + rx * Math.cos(t), y = cy + ry * Math.sin(t);
    const a = (Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180) / Math.PI;
    return { x, y, a };
  });
  return (
    <svg viewBox="0 0 440 360" role="img" aria-label="The loop: define, build, measure, learn" data-box="loop">
      <path
        className="loop-path"
        pathLength={1}
        d={`M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy - ry}`}
        fill="none"
        stroke={lap ? "var(--accent)" : "var(--faint)"}
        strokeWidth={lap ? 5 : 3}
        style={lap ? { animationDuration: "2.2s" } : undefined}
      />
      {arrows.map((p, i) => (
        <path key={i} d="M -7 -8 L 9 0 L -7 8 Z" fill={lap ? "var(--accent)" : "var(--faint)"} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`} className="a-fade" style={d(1.2)} />
      ))}
      {STATIONS.map((s, i) => {
        const state = st[s.id];
        const delay = lap ? 0.4 + i * 0.5 : state === "lit" ? 1.3 : 0.2 + i * 0.1;
        return (
          <g key={s.id} className="station">
            <circle cx={s.x} cy={s.y} r={46} fill={state === "dashed" ? "var(--ground)" : "var(--card)"} stroke={state === "dashed" ? "var(--faint)" : "var(--edge)"} strokeWidth={3} strokeDasharray={state === "dashed" ? "8 7" : undefined} />
            <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize={20} fill={state === "dashed" ? "var(--faint)" : "var(--ink)"}>
              {s.label}
            </text>
            {(state === "lit" || state === "done") && (
              <g className="a-fade" style={d(delay)}>
                <circle cx={s.x} cy={s.y} r={46} fill={state === "lit" ? "var(--accent)" : "var(--ink)"} />
                <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize={20} fill="#fff">
                  {s.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ChapterView({ beat, step }: P) {
  const mode = beat.props?.mode as string;
  const kicker = beat.props?.kicker as string;
  if (mode === "gap") {
    return (
      <div className="chapter" data-box="chapter">
        <Loop mode={mode} />
        <div className="text">
          <div className="label a-fade" style={d(0.4)}>
            {kicker}
          </div>
          {step >= 1 && <div className="t-l a-rise">We skipped straight to Build.</div>}
          {step >= 2 && (
            <div className="t-s a-rise">
              We never said what good looks like. So we can't measure. So we can't learn.
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="chapter" data-box="chapter">
      <Loop mode={mode} />
      <div className="text">
        <div className="label a-fade" style={d(0.4)}>
          {kicker}
        </div>
        <div className="t-l a-rise" style={d(mode === "lap" ? 2.2 : 1.4)}>
          {beat.props?.text as string}
        </div>
        <div className="t-s a-rise" style={d(mode === "lap" ? 2.8 : 2)}>
          {beat.props?.sub as string}
        </div>
      </div>
    </div>
  );
}

// ── 2 · Say what good is ─────────────────────────────────────────────────────

function RulesView({ step, state }: P) {
  const editing = state.editing;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">What good looks like</div>
        <div className="t-m">
          What must <span className="t-accent">never</span> change when we rewrite a notice?
        </div>
      </div>
      <div className="rules" data-box="rules">
        {[0, 1, 2, 3].map(
          (i) =>
            step >= i && (
              <div key={i}>
                <div className="rule a-rise" data-box="rule">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  {editing === `rule:${i}` ? <Draft text={state.draft} /> : <Type text={ruleText(state, i)} speed={28} delay={i === 0 ? 300 : 150} retype={false} still={!!state.room.rules[i]} />}
                  {step >= 4 && i < 2 && (
                    <span className="seal a-stamp" style={d(0.2 + i * 0.45)}>
                      Instant fail
                    </span>
                  )}
                </div>
              </div>
            ),
        )}
        {step >= 5 && (
          <div className="span2">
            <div className="rule ghost a-rise" data-box="rule">
              {editing === "notNow" ? (
                <>
                  Not now: <Draft text={state.draft} />
                </>
              ) : (
                <Type text={state.room.notNow ? `Not now: ${state.room.notNow}` : DEFAULT_NOT_NOW} speed={22} retype={false} still={!!state.room.notNow} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function VoteView({ step, state }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Be the judge · good or bad?</div>
        <div className="t-m">{FRIDAY}</div>
      </div>
      <div className="votes" data-box="votes">
        {VOTE_ITEMS.map(
          (v, i) =>
            step >= i * 2 && (
              <div key={v.key} className="vote a-rise" data-box="vote">
                <div>
                  <div className="ans">
                    <span className="k">{v.key}</span>
                    {v.out}
                  </div>
                  <div className="why">{step >= i * 2 + 1 ? <span className="a-fade">{v.why}</span> : " "}</div>
                </div>
                <div>
                  <Bar split={step >= i * 2 + 1 ? splitOf(state, v.key) : null} />
                  <div className="bar-legend">
                    <span>Good</span>
                    <span>Bad</span>
                  </div>
                </div>
              </div>
            ),
        )}
      </div>
    </>
  );
}

function SplitView({ step, state }: P) {
  return (
    <div className="split" data-box="split">
      <div className="card a-grow">
        <div className="wm">Answer B · the room's split</div>
        <div className="en">{FRIDAY}</div>
        <div className="out">{VOTE_ITEMS[1].out}</div>
      </div>
      <div>
        <Bar split={splitOf(state, "B")} big />
        <div className="bar-legend">
          <span>Good</span>
          <span>Bad</span>
        </div>
      </div>
      {step >= 1 && (
        <div className="a-rise">
          <div className="t-m">That's a product decision.</div>
          <div className="t-s t-muted" style={{ marginTop: "0.6cqw" }}>
            No model makes it for you. The people who know the work do.
          </div>
        </div>
      )}
    </div>
  );
}

function roomLine(state: TalkState, key: VoteKey) {
  const [g, b] = splitOf(state, key);
  if (Math.abs(g - b) < 30) return `The room split ${g} / ${b}`;
  return g > b ? `The room: ${g}% good` : `The room: ${b}% bad`;
}

function WallView({ step, state }: P) {
  const room = (i: 0 | 1 | 2) => ({ out: VOTE_ITEMS[i].out, why: roomLine(state, VOTE_ITEMS[i].key), room: true });
  const cols = {
    good: [room(0), ...WALL.good],
    borderline: [room(1), ...WALL.borderline],
    bad: [room(2), ...WALL.bad],
  };
  const total = cols.good.length + cols.borderline.length + cols.bad.length;
  // The rest rain in with the bad column growing fastest.
  const order = ["bad:1", "good:1", "bad:2", "borderline:1", "bad:3", "good:2", "bad:4", "borderline:2", "bad:5"];
  const delayOf = (col: string, i: number) => {
    const k = order.indexOf(`${col}:${i}`);
    return 0.2 + Math.max(0, k) * 0.28;
  };
  const card = (col: keyof typeof cols, c: { out: string; why: string; room?: boolean }, i: number) => {
    if (!c.room && step < 1) return null;
    return (
      <div key={i} className={`k ${c.room ? "room a-drop" : "a-deal"}`} style={c.room ? d(0.3 + ["good", "borderline", "bad"].indexOf(col) * 0.3) : d(delayOf(col, i))} data-box="wall-card">
        {c.out}
        <small>{c.why}</small>
      </div>
    );
  };
  return (
    <>
      <div className="counter" data-box="counter">
        {step >= 1 ? <Count from={3} to={total} over={2.8} delay={0.2} /> : 3} marked
      </div>
      {step >= 2 && (
        <div className="wall-caption t-s t-accent a-rise" data-box="caption">
          Twelve here. In a real product, hundreds.
        </div>
      )}
      <div className="wall" data-box="wall">
        <div className="col good">
          <h3>Good</h3>
          <div className="stack">{cols.good.map((c, i) => card("good", c, i))}</div>
        </div>
        <div className="col mid">
          <h3>Borderline</h3>
          <div className="stack">{cols.borderline.map((c, i) => card("borderline", c, i))}</div>
        </div>
        <div className="col bad">
          <h3>Bad, each with why</h3>
          <div className="stack">{cols.bad.map((c, i) => card("bad", c, i))}</div>
        </div>
      </div>
    </>
  );
}

// ── 3 · Make it tireless ─────────────────────────────────────────────────────

type MRow = { key: string; en: string; out: string; v: (boolean | null)[]; room?: boolean };

function Montage({ notices }: { notices: Notice[] }) {
  const instant = useInstant();
  const rows = useMemo<MRow[]>(() => {
    const base: MRow[] = MONTAGE.map((m, i) => ({ key: `m${i}`, en: m.en, out: m.out, v: m.v }));
    const mine = notices.filter((n) => n.status === "done" && n.out);
    mine.forEach((n, j) => {
      const v = n.verdicts ?? [runCheck("numbers", n.text, n.out!).pass, null, null, null];
      base.splice(MONTAGE_ROOM_AT[j] ?? base.length - 1, 0, { key: `r${n.id}`, en: n.text, out: n.out!, v, room: true });
    });
    return base;
  }, [notices]);
  const [n, setN] = useState(instant ? rows.length : 0);
  useEffect(() => {
    if (instant) return;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= rows.length) clearInterval(iv);
    }, 330);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shown = rows.slice(Math.max(0, Math.min(n, rows.length) - 7), Math.min(n, rows.length));
  return (
    <>
      <div className="mcount" data-box="counter">
        {Math.min(n, rows.length)} notices · {Math.round(Math.min(n, rows.length) * 0.33)}s
      </div>
      <div className="montage" data-box="montage">
        {shown.map((r) => (
          <div className="mrow" key={r.key}>
            <div className={`t ${r.room ? "room" : ""}`}>
              {r.room && <span className="tag">The room</span>}
              <b>{r.en}</b>
              <span className="arrow">→</span>
              {r.out}
            </div>
            <div className="sq">
              {r.v.map((p, k) => (
                <i key={k} className={p === null ? "" : p ? "ok" : "no"} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function JudgesView({ step, state }: P) {
  const instant = useInstant();
  return (
    <>
      {step < 2 && (
        <div className="judge-head" data-box="question">
          <div className="label">{step === 0 ? "Your rules" : "Your rules, as judges"}</div>
        </div>
      )}
      {(step === 0 || (step === 1 && !instant)) && (
        <div className="judge-row" data-box={step === 0 ? "rules" : undefined}>
          <div className={`rules-row ${step === 1 ? "a-descend" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rule a-rise" style={d(i * 0.12)}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {ruleText(state, i)}
              </div>
            ))}
          </div>
        </div>
      )}
      {step >= 1 && (
        <div className="judge-bottom" data-box="stamps">
          <div className="stamps">
            {JUDGES.map((j, i) => (
              <div key={j.id} className="a-stamp" style={d((step === 1 ? 0.55 : 0) + i * 0.15)}>
                <div className={`stamp kind-only k-${j.kind}`} data-box="stamp">
                  <span className="who">{KIND_LABEL[j.kind]}</span>
                  <span className="name">{i < 4 ? ruleText(state, i) : "The room"}</span>
                  <span className="why">{j.check}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="cost a-fade" style={d(1.6)} data-box="cost">
          <span>Cheapest</span>
          <i />
          <span>Dearest</span>
        </div>
      )}
      {step >= 2 && <Montage notices={state.room.notices} />}
      {step >= 3 && (
        <div className="caption a-rise" style={{ top: "51cqw" }} data-box="caption">
          Your rules. Every answer. Every time.
        </div>
      )}
    </>
  );
}

function StampedView({ step, state }: P) {
  const pass = step >= 4;
  const data = pass ? STAMPED_PASS : STAMPED_FAIL;
  // The room's call on this answer. On Version 1's, → without one counts as thumbs down.
  const call = state.room.thumbs[pass ? "pass" : "fail"] ?? (pass ? undefined : "down");
  const roomAnswered = pass ? step >= 4 && !!call : step >= 3;
  const fails = pass ? call === "down" : true;
  return (
    <div className="judged" data-box="judged">
      <span className="chip a-fade" key={pass ? "v3" : "v1"}>
        {pass ? V3_LABEL : "Version 1"}
      </span>
      <div className="card a-rise">
        <div className="en">{LEAVE}</div>
        <div className="out">{pass ? <Type text={data.out} speed={20} /> : data.out}</div>
      </div>
      <div className="stamps" key={pass ? "p" : "f"}>
        {step >= 1 &&
          data.stamps.map((s, i) => (
            <div key={s.id} className="a-stamp" style={d(pass ? 1.6 + i * 0.35 : 0.2 + i * 1.1)}>
              <Stamp id={s.id} pass={s.pass} why={s.why} />
            </div>
          ))}
        {step >= 1 && (
          <div className="a-stamp" style={d(pass ? 3.1 : 4.6)}>
            {roomAnswered ? (
              // Keyed by the call, so a new answer lands with its own stamp, straight away.
              <div className="a-stamp" key={call} style={d(0)}>
                <Stamp id="room" pass={call === "up"} why={call === "up" ? "thumbs up" : "thumbs down"} />
              </div>
            ) : (
              <Stamp id="room" wait why="thumbs?" />
            )}
          </div>
        )}
      </div>
      <div className="verdict-slot">
        {step >= 3 && (
          <div className={`verdict ${fails ? "fail" : "pass"} a-stamp`} key={`${pass}-${fails}`} style={d(pass && !call ? 3.6 : fails && !pass ? 0.9 : 0.3)}>
            {fails ? "Fail" : "Pass"}
          </div>
        )}
      </div>
    </div>
  );
}

function FiveEachView({ step }: P) {
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Same notice · five tries each · every judge</div>
        <div className="t-m">{LEAVE}</div>
      </div>
      <div className="bars" data-box="bars">
        {FIVE_EACH.map((r, i) => (
          <Fragment key={i}>
            <div className="lbl a-rise" style={d(i * 0.2)}>
              {r.label}
              <small>{r.sub}</small>
            </div>
            <div className="track a-rise" style={d(i * 0.2)}>
              <Fill pct={r.pass * 20} className={i < 2 ? "muted" : ""} delay={0.4 + i * 0.35} />
            </div>
            <div className="val a-rise" style={d(i * 0.2)}>
              {r.pass} / 5
            </div>
          </Fragment>
        ))}
      </div>
      {step >= 1 && (
        <div className="caption a-rise" style={{ top: "38cqw", fontSize: "3.4cqw" }} data-box="caption">
          Better. And proven.
        </div>
      )}
    </>
  );
}

// ── 4 · Check the checker ────────────────────────────────────────────────────

function ExposeView({ step, state }: P) {
  return (
    <div className="judged" data-box="judged">
      <span className="chip a-fade">From the release notes</span>
      <div className="card a-rise">
        <div className="en">{TECH_DEBT}</div>
        <div className="out">{TECH_DEBT_OUT}</div>
      </div>
      <div className="stamps">
        {step >= 1 &&
          TECH_DEBT_STAMPS.map((s, i) => (
            <div key={s.id} className={step >= 2 && s.pass ? "dim" : "lit"}>
              <div className="a-stamp" style={d(0.2 + i * 0.45)}>
                <div className={`expose-wrap ${step >= 2 && !s.pass ? "on" : ""}`}>
                  <Stamp id={s.id} pass={s.pass} why={s.why} />
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="ask-slot">
        {step >= 3 && (
          <div className="ask a-rise" data-box="ask">
            <div className="t-s ask-q">{step >= 4 ? <span className="t-accent">The judge checked the wrong thing.</span> : "Agree with the judge, or disagree?"}</div>
            <div>
              <Bar split={step >= 4 ? splitOf(state, "judge") : null} agree />
              <div className="bar-legend">
                <span>Agree</span>
                <span>Disagree</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BinsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Two kinds of feedback</div>
        <div className="t-m">Every “agree” or “disagree” goes somewhere.</div>
      </div>
      <div className="bins" data-box="bins">
        <div className="bin inst a-rise">
          <h3>Fix the instructions</h3>
          <div className="when">When you agree with a fail: the answer really is bad.</div>
          {step >= 1 && (
            <div className="slip a-drop">
              <span className="from">{FEEDBACK.instructions.from}</span>
              <Type text={FEEDBACK.instructions.text} speed={24} delay={350} />
            </div>
          )}
        </div>
        <div className="bin judge a-rise" style={d(0.15)}>
          <h3>Fix the judge</h3>
          <div className="when">When you disagree: the judge got it wrong.</div>
          {step >= 2 && (
            <div className="slip a-drop">
              <span className="from">{FEEDBACK.judge.from}</span>
              <Type text={FEEDBACK.judge.text} speed={24} delay={350} />
            </div>
          )}
        </div>
      </div>
      {step >= 3 && (
        <div className="caption a-rise" style={{ top: "44.5cqw" }} data-box="caption">
          “Wrong” teaches nothing. The reason teaches everything.
        </div>
      )}
    </>
  );
}

function DiffsView({ step }: P) {
  return (
    <>
      <div className="diffs" data-box="diffs">
        <div className="note a-rise">
          <div className="label">
            <span>What we told it</span>
            <span>Version 4</span>
          </div>
          <div className="body">
            <span className="old">{INSTRUCTIONS_EXCERPT}</span>
            {step >= 1 && (
              <div className="add">
                <Type text={INSTRUCTIONS_ADDED} speed={16} delay={200} />
              </div>
            )}
          </div>
        </div>
        <div className="note judge a-rise" style={d(0.15)}>
          <div className="label">
            <span>The judge · nothing added</span>
            <span>Version 2</span>
          </div>
          <div className="body">
            <span className="old">{JUDGE_EXCERPT}</span>
            {step >= 2 && (
              <div className="add">
                <Type text={JUDGE_ADDED} speed={16} delay={200} />
              </div>
            )}
          </div>
        </div>
      </div>
      {step >= 3 && (
        <div className="after-bars" data-box="bars">
          {AFTER.map((r, i) => (
            <Fragment key={i}>
              <div className="lbl a-rise" style={d(i * 0.25)}>
                {r.label}
              </div>
              <div className="track a-rise" style={d(i * 0.25)}>
                <Fill pct={(r.value / r.of) * 100} className={r.muted ? "muted" : ""} delay={0.4 + i * 0.4} />
              </div>
              <div className="val a-rise" style={d(i * 0.25)}>
                {r.value} / {r.of}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}

function VersionsView({ step }: P) {
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Every notice · every version · every judge · from rehearsal</div>
        <div className="t-m">Passed every judge</div>
      </div>
      <div className="bars" data-box="bars">
        {VERSIONS.map((r, i) => (
          <Fragment key={i}>
            <div className="lbl a-rise" style={d(i * 0.2)}>
              {r.label}
              <small>{r.sub}</small>
            </div>
            <div className="track a-rise" style={d(i * 0.2)}>
              <Fill pct={r.pct} className={r.pct < 50 ? "muted" : ""} delay={0.4 + i * 0.35} />
            </div>
            <div className="val a-rise" style={d(i * 0.2)}>
              {r.pct}%
            </div>
          </Fragment>
        ))}
      </div>
      {step >= 1 && (
        <div className="months a-rise" data-box="caption">
          <div className="t-l">Getting to 80% takes an afternoon.</div>
          <div className="t-m t-accent">The last 20 points take months.</div>
        </div>
      )}
    </>
  );
}

// ── 5 · Ship it? ─────────────────────────────────────────────────────────────

function GatesView({ step }: P) {
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Good enough to ship</div>
        <div className="t-m">Ship it? Depends who it's for.</div>
      </div>
      <div className="bars gates" data-box="bars">
        {GATES.map(
          (g, i) =>
            step >= i + 1 && (
              <Fragment key={i}>
                <div className="lbl a-rise">
                  {g.label}
                  <small>{g.sub}</small>
                </div>
                <div className="track a-rise">
                  <Fill pct={g.pct} className={g.strict ? "strict" : ""} delay={0.3} />
                </div>
                <div className="val a-rise">{g.val}</div>
              </Fragment>
            ),
        )}
      </div>
      {step >= 4 && (
        <div className="owners a-rise" data-box="caption">
          Product owns the rules. The people who know the work own the labels. Delivery owns the gate.
          <span className="t-accent"> Set the bar before you see the results.</span>
        </div>
      )}
    </>
  );
}

function HomeView({ step }: P) {
  if (step === 0) {
    return (
      <div className="ship" data-box="ship">
        <div className="t-xl a-rise" style={d(1.2)}>
          You moved it.
        </div>
        <div className="ship-sub">
          <div className="t-s t-muted a-rise" style={d(1.8)}>
            Rules, examples, judges, and a reason for every call.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="home-card" data-box="home">
      <div className="card a-grow">
        <div className="wm">{APP_NAME} · the notice we started with</div>
        <div className="en">{LEAVE}</div>
        <div className="out">{STAMPED_PASS.out}</div>
      </div>
      <div className="stamps compact">
        {[...STAMPED_PASS.stamps, { id: "room", pass: true, why: "" }].map((s, i) => (
          <div key={s.id} className="a-stamp" style={d(0.6 + i * 0.25)}>
            <div className="stamp ok" data-box="stamp">
              <span className="glyph">✓</span>
              <span className="name">{s.id === "room" ? "A human signs off" : JUDGE_SHORT[s.id]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="gate-line a-fade" style={d(2.2)}>
        Ships behind the strictest gate: 100% on the instant fails, and a human signs off.
      </div>
    </div>
  );
}

function CloseView({ step }: P) {
  return (
    <div className="title-card close" data-box="title">
      <div className="rule-line" />
      <div className="t-xl">The demo is not the evidence.</div>
      <div className="t-m" style={{ color: "var(--hold-ink)" }}>
        Say what good looks like. Then prove it.
      </div>
      <div className="home">{step >= 1 && <Type text={HOMEWORK} speed={28} caret />}</div>
      <div className="thanks">{step >= 2 && <span className="t-l a-rise">Thank you.</span>}</div>
    </div>
  );
}

export const BEAT_VIEWS: Record<BeatKind, ComponentType<P>> = {
  title: TitleView,
  hold: HoldView,
  build: BuildView,
  needle: NeedleView,
  reveal: RevealView,
  tries: TriesView,
  pairs: PairsView,
  chapter: ChapterView,
  rules: RulesView,
  vote: VoteView,
  split: SplitView,
  wall: WallView,
  judges: JudgesView,
  stamped: StampedView,
  fiveEach: FiveEachView,
  expose: ExposeView,
  bins: BinsView,
  diffs: DiffsView,
  versions: VersionsView,
  gates: GatesView,
  home: HomeView,
  close: CloseView,
};
