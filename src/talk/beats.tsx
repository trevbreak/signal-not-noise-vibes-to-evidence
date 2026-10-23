import { useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  APP_NAME, DEFAULT_RULES, DEFAULT_VOTES, ENDS, FINAL, FIVE_TRIES, FRIDAY, JUDGE_GUIDE, JUDGE_LINE_NEW, JUDGE_LINE_OLD, JUDGE_SHORT,
  JUDGES, KIND_LABEL, LEAVE, MONTAGE, MONTAGE_JUDGES, MONTAGE_ROOM_AT, NOT_NOW, OPENERS, PAIRS, REASONS, JOURNEY, STAMPED_FAIL,
  TECH_DEBT, TECH_DEBT_OUT, TECH_DEBT_STAMPS, TECH_DEBT_WALL, V1, V2_ADDED, V3_EXCERPT, VOTE_ITEMS, VOTE_SPLITS, WALL, stillHasNumber,
  vName, type Beat, type BeatKind, type JudgeKind, type VoteKey,
} from "./content";
import type { Notice, TalkState } from "./store";
import { d, Draft, Marked, Type, useInstant } from "./Stage";

type P = { beat: Beat; step: number; state: TalkState };

// ── Small shared pieces ──────────────────────────────────────────────────────

const kindOf = (id: string): JudgeKind => JUDGES.find((j) => j.id === id)?.kind ?? "ai";

/** The two names the whole talk uses for its two moving parts, always in the same colour and font. */
function Tag({ kind }: { kind: "prompt" | "judge" }) {
  return <span className={`ptag ${kind}`}>{kind === "prompt" ? "Prompt" : "Judge"}</span>;
}

/** A prompt (what we tell the PM Translator) or a judge's guide: same box, its own colour. */
function Note({ kind, title, aside, className = "", style, children }: {
  kind: "prompt" | "judge";
  title: string;
  aside?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`note ${kind} ${className}`} style={style} data-box="note">
      <div className="label">
        <span className="nt">
          <Tag kind={kind} />
          {title}
        </span>
        {aside && <span>{aside}</span>}
      </div>
      <div className="body">{children}</div>
    </div>
  );
}

/** A judge's verdict. `weak`: a pass we shouldn't trust (the cheap code check on the two-weeks answer). */
function Stamp({ id, pass, why, wait, weak }: { id: string; pass?: boolean; why: string; wait?: boolean; weak?: boolean }) {
  const kind = kindOf(id);
  return (
    <div className={`stamp ${wait ? "wait" : pass ? "ok" : "no"} ${weak ? "hl" : ""}`} data-box="stamp">
      <span className="glyph">{wait ? "?" : pass ? "✓" : "✗"}</span>
      <span className="who">{KIND_LABEL[kind]}</span>
      <span className="name">{JUDGE_SHORT[id]}</span>
      <span className="why">{why}</span>
    </div>
  );
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

// ── 1 · The demo ─────────────────────────────────────────────────────────────

function RoomRow({ n }: { n: Notice }) {
  return (
    <div className="row a-rise" data-box="row">
      <div className="en">
        <span className="from room">From the room</span>
        {n.text}
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
      <Note kind="prompt" title={vName(1)} className="a-rise">
        <Type text={V1} speed={14} delay={300} />
        {step >= 1 && <div className="foot a-fade">Two lines. No code.</div>}
      </Note>
      <div className={`app a-rise ${count > 3 ? "dense" : ""}`} style={d(0.15)} data-box="app">
        <div className="app-head">
          <span className="logo">☝</span>
          <span className="name">{APP_NAME}</span>
          <span className="label tag">Company notices → PM-speak</span>
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
              <div className="en">
                <span className="from">From the {r.from}</span>
                {r.en}
              </div>
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
                <span className="from room">From the room</span>
                <Draft text={state.draft} />
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
        Ship the PM Translator?
      </div>
      <div className="ship-sub">
        {step === 0 && <div className="t-s t-muted a-fade" style={d(0.8)}>Built on vibes, or built on evidence?</div>}
        {step === 1 && <div className="t-s t-muted">That much?</div>}
        {step === 2 && (
          <div className="t-m t-accent a-rise" style={d(0.6)}>
            Of course, this is all vibes.
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
            <div className="wm">{vName(1)} · our HR leave policy</div>
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
        <div className="reveal-foot a-rise" data-box="caption">
          <div className="t-m">One small change. A totally different policy.</div>
          <div className="t-s t-accent">Easy to build. Miss the small details, and the consequences are big.</div>
        </div>
      )}
    </>
  );
}

function TriesView({ step }: P) {
  return (
    <>
      <div className="headline" data-box="headline">
        <div className="label">{vName(1)} · same notice · same prompt · five tries</div>
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
            Passing once doesn't tell us how reliable it is.
          </div>
        </div>
      )}
    </>
  );
}

function PairsView({ step }: P) {
  return (
    <>
      <Note kind="prompt" title={vName(2)} aside="more rules, by gut feel" className="a-rise">
        <span className="old">{V1}</span>
        {V2_ADDED.map((l, i) => (
          <div key={i} className="add">
            <Type text={`+ ${l}`} speed={14} delay={500 + i * 1400} />
          </div>
        ))}
      </Note>
      {step >= 1 && (
        <div className="pairs" data-box="pairs">
          <div className="head">
            <span className="label">{vName(1)}</span>
            <span />
            <span className="label">{vName(2)}</span>
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

type StationId = "define" | "build" | "measure" | "learn";
type StationState = "idle" | "lit" | "done" | "dashed";
const LOOP_MODES: Record<string, Record<StationId, StationState>> = {
  gap: { define: "dashed", build: "lit", measure: "idle", learn: "idle" },
  recap: { define: "done", build: "done", measure: "lit", learn: "idle" },
  learn: { define: "done", build: "done", measure: "done", learn: "lit" },
  lap: { define: "lit", build: "lit", measure: "lit", learn: "lit" },
};
const STATIONS = [
  { id: "define", label: "Define", x: 220, y: 55 },
  { id: "build", label: "Build", x: 380, y: 180 },
  { id: "measure", label: "Measure", x: 220, y: 305 },
  { id: "learn", label: "Learn", x: 60, y: 180 },
] as const;

function Loop({ st, lap = false, quick = false }: { st: Record<StationId, StationState>; lap?: boolean; quick?: boolean }) {
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
        const delay = quick ? 0.15 : lap ? 0.4 + i * 0.5 : state === "lit" ? 1.3 : 0.2 + i * 0.1;
        return (
          <g key={s.id} className="station">
            <circle cx={s.x} cy={s.y} r={46} fill={state === "dashed" ? "var(--ground)" : "var(--card)"} stroke={state === "dashed" ? "var(--faint)" : "var(--edge)"} strokeWidth={3} strokeDasharray={state === "dashed" ? "8 7" : undefined} />
            <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize={20} fill={state === "dashed" ? "var(--faint)" : "var(--ink)"}>
              {s.label}
            </text>
            {(state === "lit" || state === "done") && (
              // Keyed by state, so a station that changes colour fades into its new one.
              <g className="a-fade" style={d(delay)} key={state}>
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
  const text = (() => {
    if (mode === "gap")
      return (
        <>
          {step >= 1 && <div className="t-l a-rise">We skipped straight to Build.</div>}
          {step >= 2 && <div className="t-s a-rise">We never said what good looks like. So we can't measure it, and we can't learn from it.</div>}
        </>
      );
    if (mode === "recap")
      return (
        <>
          <div className="recap-row a-rise">
            <b>Define</b>
            <span>Four rules, two instant fails.</span>
          </div>
          <div className="recap-row a-rise" style={d(0.2)}>
            <b>Measure</b>
            <span>Three answers, marked by hand.</span>
          </div>
          {step >= 1 && <div className="t-l a-rise">You can't vote on ten thousand notices a day.</div>}
        </>
      );
    if (mode === "learn")
      return (
        <>
          <div className="t-l a-rise" style={d(1.4)}>
            Fix the <Tag kind="judge" /> first.
            <br />
            Then the <Tag kind="prompt" />.
          </div>
          <div className="t-s a-rise" style={d(2)}>
            If the judge is wrong, every score it gives is wrong.
          </div>
        </>
      );
    // lap: the loop, closed, with each station spelled out.
    const rows: [string, ReactNode][] = [
      ["Define", "what good looks like: rules and golden examples"],
      ["Build", <>the <Tag kind="prompt" /></>],
      ["Measure", <>every answer, checked by the <Tag kind="judge" /></>],
      ["Learn", "from the reasons: judge first, then the prompt"],
    ];
    return (
      <>
        <div className="label a-fade" style={d(0.4)}>
          The loop, closed
        </div>
        {rows.map(([k, v], i) => (
          <div key={k} className="recap-row lap a-rise" style={d(0.6 + i * 0.5)}>
            <b>{k}</b>
            <span>{v}</span>
          </div>
        ))}
        <div className="t-m a-rise" style={d(2.8)}>
          And round again, tonight.
        </div>
      </>
    );
  })();
  return (
    <div className="chapter" data-box="chapter">
      <Loop st={LOOP_MODES[mode]} lap={mode === "lap"} quick={mode === "recap"} />
      <div className={`text ${mode === "recap" || mode === "lap" ? "recap" : ""}`}>{text}</div>
    </div>
  );
}

// ── 2 · Say what good is ─────────────────────────────────────────────────────

function RulesView({ step, state }: P) {
  const editing = state.editing;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">What a good PM translation looks like</div>
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
            <div className="rule ghost not-now a-rise" data-box="rule">
              <span className="nn">Not now</span>
              {NOT_NOW.map((n, i) => (
                <span key={n} className="nn-chip a-rise" style={d(0.3 + i * 0.25)}>
                  {n}
                </span>
              ))}
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
        <div className="label">{vName(1)} · be the judge · good or bad?</div>
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
        <div className="wm">Answer B · the one the room split on</div>
        <div className="cmp">
          <span className="who">The notice</span>
          <span className="txt">
            <Marked text={FRIDAY} marks={[{ phrase: "Never", kind: "ok", on: true }]} />
          </span>
          <span className="kind ok a-fade" style={d(0.5)}>
            A hard rule
          </span>
          <span className="who">Answer B</span>
          <span className="txt">
            <Marked text={VOTE_ITEMS[1].out} marks={[{ phrase: "Let's avoid", kind: "mid", on: true }]} />
          </span>
          <span className="kind mid a-fade" style={d(0.9)}>
            A suggestion
          </span>
        </div>
      </div>
      {step >= 1 && (
        <div className="checks" data-box="checks">
          <span className="chk ok a-rise">✓ No made-up date</span>
          <span className="chk ok a-rise" style={d(0.3)}>
            ✓ Nothing promised
          </span>
          <span className="chk mid a-rise" style={d(0.6)}>
            ! “Never” became “try not to”
          </span>
        </div>
      )}
      {step >= 2 && (
        <div className="decide a-rise" data-box="decide">
          <div>
            <Bar split={splitOf(state, "B")} big />
            <div className="bar-legend">
              <span>Good</span>
              <span>Bad</span>
            </div>
          </div>
          <div>
            <div className="t-m">Is a softer rule still the rule?</div>
            <div className="t-s t-muted" style={{ marginTop: "0.6cqw" }}>
              That's a product decision, not the model's. The people who know the work decide, and write down why.
            </div>
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
        Golden examples · {step >= 1 ? <Count from={3} to={total} over={2.8} delay={0.2} /> : 3} marked
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

// ── 3 · Check every answer ───────────────────────────────────────────────────

type MRow = { key: string; en: string; out: string; v: (boolean | null)[]; room?: boolean };

function Montage({ notices }: { notices: Notice[] }) {
  const instant = useInstant();
  const rows = useMemo<MRow[]>(() => {
    const base: MRow[] = MONTAGE.map((m, i) => ({ key: `m${i}`, en: m.en, out: m.out, v: m.v }));
    const mine = notices.filter((n) => n.status === "done" && n.out);
    mine.forEach((n, j) => {
      const v = n.verdicts ?? [stillHasNumber(n.text, n.out!), null, null, null];
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
  const shown = rows.slice(Math.max(0, Math.min(n, rows.length) - 6), Math.min(n, rows.length));
  return (
    <>
      <div className="mcount" data-box="counter">
        {vName(2)} · {Math.min(n, rows.length)} notices checked · {Math.round(Math.min(n, rows.length) * 0.33)}s
      </div>
      <div className="mhead" data-box="mhead">
        <span>Notice → translation</span>
        <span className="mj">
          <Tag kind="judge" />
          <span className="cols">
            {MONTAGE_JUDGES.map((j) => (
              <i key={j}>{j}</i>
            ))}
          </span>
        </span>
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

function PromptJudgeView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Two different jobs</div>
        <div className="t-m">The prompt asks. The judge checks.</div>
      </div>
      <div className="pj" data-box="pj">
        <div className="note prompt pj-note a-rise">
          <div className="label">
            <span className="nt">
              <Tag kind="prompt" /> what we tell the translator
            </span>
          </div>
          <div className="pj-h">Tells it what to do.</div>
          <div className="body old">“Rewrite this like a pushy PM. Keep every number. Keep it short.”</div>
          <div className="pj-c">A request. The AI does its best, and we saw in version 2 that adding rules doesn't mean they're followed.</div>
        </div>
        {step >= 1 && (
          <div className="note judge pj-note a-rise">
            <div className="label">
              <span className="nt">
                <Tag kind="judge" /> a separate check, after
              </span>
            </div>
            <div className="pj-h">Checks what it actually did.</div>
            <div className="body old">
              “Is the notice period still 4 weeks?” → <span className="t-fail">✗ Fail: it became 2.</span>
            </div>
            <div className="pj-c">Runs on every answer, and gives a pass or fail with a reason. You don't mark your own homework.</div>
          </div>
        )}
      </div>
      {step >= 2 && (
        <div className="pj-strip a-rise" data-box="strip">
          <div className="card">
            <div className="label">A normal software test</div>
            <div className="t-s">
              Same input → <b>exactly</b> this output.
            </div>
          </div>
          <div className="card judge-edge">
            <div className="label">A judge</div>
            <div className="t-s">
              Five different answers → <b>do the rules still hold?</b>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JudgesView({ step, state }: P) {
  const instant = useInstant();
  return (
    <>
      {step === 0 && (
        <div className="judge-head" data-box="question">
          <div className="label">Our rules, as judges · cheapest first</div>
        </div>
      )}
      <div className={`judge-cards ${step >= 1 ? "small" : ""}`} data-box="stamps">
        <div className="stamps">
          {JUDGES.map((j, i) => (
            <div key={j.id} className="a-stamp" style={d(0.3 + i * 0.15)}>
              <div className="stamp kind-only" data-box="stamp">
                <span className="who">{KIND_LABEL[j.kind]}</span>
                <span className="name">{i === 0 ? JUDGE_SHORT.numbers : i < 4 ? ruleText(state, i) : "The room"}</span>
                <span className="why">{j.check}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {step === 0 && (
        <div className="cost cost-top a-fade" style={d(1.2)} data-box="cost">
          <span>Cheapest</span>
          <i />
          <span>Dearest</span>
        </div>
      )}
      {step >= 1 && <Montage notices={state.room.notices} />}
      {step >= 1 && (
        <div className="caption a-rise" style={{ top: "49cqw", ...d(instant ? 0 : 8.5) }} data-box="caption">
          Our rules. Every answer. Every time.
        </div>
      )}
    </>
  );
}

function StampedView({ step }: P) {
  return (
    <div className="judged" data-box="judged">
      <span className="chip a-fade">Zoomed in · {vName(2)} · our HR leave policy</span>
      <div className="card a-zoom">
        <div className="en">
          <Marked text={LEAVE} marks={[{ phrase: "4 weeks'", kind: "ok", on: step >= 1 }]} />
        </div>
        <div className="out">
          <Marked
            text={STAMPED_FAIL.out}
            marks={[
              { phrase: "2 weeks", kind: "bad", on: step >= 1 },
            ]}
          />
        </div>
      </div>
      <div className="stamps">
        {step >= 1 &&
          STAMPED_FAIL.stamps.map((s, i) => (
            <div key={s.id} className="a-stamp" style={d(0.2 + i * 1.1)}>
              <Stamp id={s.id} pass={s.pass} why={s.why} weak={"weak" in s} />
            </div>
          ))}
      </div>
      <div className="verdict-slot">
        {step >= 2 && (
          <div className="verdict fail a-stamp" style={d(0.2)}>
            Fail
            <small>caught automatically, with the reasons why</small>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 4 · Make it better ───────────────────────────────────────────────────────

function ExposeView({ step }: P) {
  if (step === 0) {
    return (
      <div className="judged" data-box="judged">
        <span className="chip a-fade">From our release notes · {vName(2)}</span>
        <div className="card a-rise">
          <div className="en">{TECH_DEBT}</div>
          <div className="out">{TECH_DEBT_OUT}</div>
        </div>
        <div className="stamps">
          {TECH_DEBT_STAMPS.map((s, i) => (
            <div key={s.id} className={s.pass ? "dim-late" : "lit"}>
              <div className="a-stamp" style={d(0.6 + i * 0.4)}>
                <div className={`expose-wrap ${s.pass ? "" : "on"}`}>
                  <Stamp id={s.id} pass={s.pass} why={s.why} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="t-s ask-q a-rise" style={{ ...d(2.6), textAlign: "center" }}>
          Same facts. Sounds like a PM. So why did it fail?
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Why did the judge fail it?</div>
        <div className="t-m">It learned the word, not the idea.</div>
      </div>
      <div className="why-pair" data-box="why">
        <div className="note judge a-rise">
          <div className="label">
            <span className="nt">
              <Tag kind="judge" /> Nothing added · its guide
            </span>
          </div>
          <div className="body old">
            <Marked text={JUDGE_GUIDE} marks={[{ phrase: "tech debt", kind: "mid", on: true }]} />
          </div>
        </div>
        <div className="card wall-ref a-rise" style={d(0.3)}>
          <div className="label">From the golden wall · bad</div>
          <div className="wr-out">
            “<Marked text={TECH_DEBT_WALL.out} marks={[{ phrase: "tech debt", kind: "mid", on: true }]} />”
          </div>
          <div className="wr-why">{TECH_DEBT_WALL.why}</div>
        </div>
      </div>
      {step >= 2 && (
        <div className="fix-first a-rise" data-box="fix">
          <div className="t-m">
            Paying down tech debt <i>is</i> the work. The judge is wrong.
          </div>
          <div className="t-s">Fix the judge first, or we'll “fix” the prompt to please a broken judge.</div>
        </div>
      )}
    </>
  );
}

function ReasonsView({ step }: P) {
  const row = (r: (typeof REASONS)[number], i: number) => (
    <div key={r.dropdown} className={`rrow a-rise ${r.agree ? "" : "dis"}`} style={d(i * 0.15)}>
      <span className="ans">{r.out}</span>
      <span className={`call ${r.agree ? "agree" : "dis"}`}>{r.agree ? "You agree" : "You disagree"}</span>
      <span className="txt">
        <Type text={r.text} speed={22} delay={600 + i * 700} />
      </span>
      <span className="dd-slot">
        {step >= 1 && (
          <span className={`dchip ${r.fix} a-stamp`} style={d(0.3 + i * 0.3)}>
            {r.dropdown} ▾
          </span>
        )}
      </span>
    </div>
  );
  const groups = [
    { fix: "judge" as const, n: "1", rows: REASONS.filter((r) => r.fix === "judge") },
    { fix: "prompt" as const, n: "2", rows: REASONS.filter((r) => r.fix === "prompt") },
  ];
  let i = 0;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Reasons · drop-downs</div>
        <div className="t-m">{step >= 2 ? "Judge first, then the prompt." : "Say why. Then sort it."}</div>
      </div>
      <div className="reasons" data-box="reasons">
        <div className={`rhead ${step >= 2 ? "gone" : ""}`}>
          <span>The answer</span>
          <span>
            <Tag kind="judge" /> said ✗
          </span>
          <span>Your reason</span>
          <span>Drop-down</span>
        </div>
        {groups.map((g, k) => (
          <div key={g.fix} className={`rgroup ${g.fix} ${step >= 2 ? "on" : ""}`} style={d(k * 1.4)}>
            {g.rows.map((r) => row(r, i++))}
            {step >= 2 && (
              <span className={`rg-label ${g.fix} a-stamp`} style={d(0.3 + k * 1.4)}>
                {g.n} · Fix the <Tag kind={g.fix} />
              </span>
            )}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="caption key-line a-fade" style={{ ...d(1.6), top: "47cqw" }} data-box="caption">
          <span className="dchip judge">blue</span> fixes the judge · <span className="dchip prompt">teal</span> fixes the prompt
        </div>
      )}
    </>
  );
}

function DiffsView({ step }: P) {
  const judgeIn = REASONS.filter((r) => r.fix === "judge");
  const promptIn = REASONS.filter((r) => r.fix === "prompt");
  // Inputs sit on the left, then fly into the AI box; the rewrite comes out on the right.
  const fly = (dx: number, dy: number, delay: number) => ({ "--dx": `${dx}cqw`, "--dy": `${dy}cqw`, "--fd": `${delay}s` }) as CSSProperties;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">We say what went wrong and why · the AI does the rewrite</div>
      </div>
      <div className="ai-in" data-box="feed" key={step}>
        {step === 0 ? (
          <>
            <div className="mini-note judge fly" style={fly(21, 5, 0.9)}>
              <Tag kind="judge" /> Nothing added · v1
              <small>{JUDGE_LINE_OLD}</small>
            </div>
            {judgeIn.map((r) => (
              <span key={r.dropdown} className={`dchip ${r.fix} fly`} style={fly(21, -3, 1.1)}>
                {r.dropdown}: {r.text}
              </span>
            ))}
          </>
        ) : (
          <>
            <div className="mini-note prompt fly" style={fly(21, 6, 0.9)}>
              <Tag kind="prompt" /> {vName(2)}
              <small>Rewrite this the way a pushy, know-it-all PM would say it…</small>
            </div>
            {promptIn.map((r, i) => (
              <span key={r.dropdown} className={`dchip ${r.fix} fly`} style={fly(21, -1 - i * 3.4, 1.05 + i * 0.12)}>
                {r.dropdown}
              </span>
            ))}
          </>
        )}
      </div>
      <div className="ai-arrow" style={{ left: "24.5cqw" }}>
        →
      </div>
      <div className="ai-box work" key={`ai${step}`} data-box="ai">
        AI
      </div>
      <div className="ai-arrow" style={{ left: "39.5cqw" }}>
        →
      </div>
      <div className="ai-out" data-box="diffs">
        <Note kind="judge" title="Nothing added · v2" aside="1 · first" className="a-rise" style={d(step === 0 ? 2 : 0)}>
          <div className="struck">{JUDGE_LINE_OLD}</div>
          <div className="add">
            <Type text={`+ ${JUDGE_LINE_NEW}`} speed={16} delay={step === 0 ? 2300 : 0} />
          </div>
        </Note>
        {step >= 1 && (
          <Note kind="prompt" title={vName(3)} aside="2 · then" className="a-rise" style={d(2)}>
            <div className="add">
              <Type text={V3_EXCERPT} speed={9} delay={2300} />
            </div>
          </Note>
        )}
      </div>
    </>
  );
}

function ResultsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Did it work? · same notices, all the way through</div>
        <div className="t-m">From no measurement to evidence on every answer.</div>
      </div>
      <div className="journey2" data-box="journey">
        <div className="j-track a-grow" />
        {JOURNEY.map((j, i) =>
          j.far && step < 1 ? null : (
            <div key={j.label} className={`j-stop ${j.far ? "far" : ""} ${j.result ? "best" : ""} a-rise`} style={d(j.far ? 0.2 : 0.4 + i * 0.9)}>
              <i className="j-dot" />
              <div className="j-label">{j.label}</div>
              <div className="j-when">{j.when}</div>
              <div className="j-how">{j.how}</div>
              {j.result && <div className="j-result">{j.result}</div>}
              {j.later && <div className="j-later">{j.later}</div>}
            </div>
          ),
        )}
      </div>
      {step >= 1 && (
        <div className="caption a-rise" style={{ ...d(0.8), top: "45cqw", color: "var(--muted)", fontSize: "1.9cqw" }} data-box="caption">
          The evals tell you whether that work is paying off.
        </div>
      )}
    </>
  );
}

// ── 5 · Ship it? ─────────────────────────────────────────────────────────────

function EndsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Good enough depends on</div>
        <div className="t-m">your goal, and the quality you need.</div>
      </div>
      <div className="spectrum a-grow" data-box="spectrum" />
      <div className="spectrum-l">
        <span className="v">Vibes</span>
        {step >= 2 && <span className="a-fade">most things sit somewhere in between</span>}
        <span className="e">Evidence</span>
      </div>
      <div className="ends" data-box="ends">
        {ENDS.map(
          (e, i) =>
            step >= i + 1 && (
              <div key={e.label} className={`end ${e.tone} a-rise`} style={{ gridColumn: i + 1 }}>
                <div className="t-m">{e.label}</div>
                <div className="bar-v">{e.bar}</div>
                <div className="t-s">{e.note}</div>
              </div>
            ),
        )}
      </div>
    </>
  );
}

function HomeView({ step }: P) {
  if (step >= 1) {
    return (
      <div className="ship" data-box="ship">
        <div className="t-xl a-rise" style={d(1.2)}>
          From vibes to evidence.
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
        <div className="wm">{vName(3)} · our HR leave policy</div>
        <div className="en">{LEAVE}</div>
        <div className="out">
          <Marked text={FINAL.out} marks={[{ phrase: "4 weeks'", kind: "ok", on: true }]} />
        </div>
      </div>
      <div className="stamps compact">
        {[...FINAL.stamps, { id: "room", pass: true, why: "" }].map((s, i) => (
          <div key={s.id} className="a-stamp" style={d(0.6 + i * 0.25)}>
            <div className="stamp ok" data-box="stamp">
              <span className="glyph">✓</span>
              <span className="name">{s.id === "room" ? "A human signs off" : JUDGE_SHORT[s.id]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="gate-line a-fade" style={d(2.2)}>
        Ready to ship, with the evidence to back it up.
      </div>
    </div>
  );
}

function CloseView({ step }: P) {
  return (
    <div className="title-card close" data-box="title">
      <div className="rule-line" />
      <div className="t-xl">A great demo doesn't mean a shippable product.</div>
      <div className="t-m" style={{ color: "var(--hold-ink)" }}>
        Say what good looks like. Then prove it.
      </div>
      <div className="thanks">{step >= 1 && <span className="t-l a-rise">Thank you.</span>}</div>
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
  promptJudge: PromptJudgeView,
  judges: JudgesView,
  stamped: StampedView,
  expose: ExposeView,
  reasons: ReasonsView,
  diffs: DiffsView,
  results: ResultsView,
  ends: EndsView,
  home: HomeView,
  close: CloseView,
};
