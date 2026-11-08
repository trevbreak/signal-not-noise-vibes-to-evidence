import { useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  APP_NAME, BRAND, BRANDS, CALL, CONTEXT_FAIL, DEFAULT_RULES, DEFAULT_VOTES, ENDS, FINAL, FIVE_TRIES, GUARD, JUDGE_GUIDE,
  JUDGE_LINE_NEW, JUDGE_LINE_OLD, JUDGE_SHORT, JUDGES, KIND_LABEL, MONTAGE, MONTAGE_JUDGES, MONTAGE_ROOM_AT, NOT_NOW,
  OPENERS, PAIRS, POLICY, PRICE, REASONS, JOURNEY, RUNS, SHARED_RULES, STAMPED_FAIL, TOOLS, TRACE, TRACE_JUDGES, TRACE_NOTE, V1,
  V2_ADDED, V3_EXCERPT, VOTE_ITEMS, VOTE_SPLITS, WALL, WALL_CULPRIT, WRONG_FAIL, WRONG_FAIL_STAMPS, stillHasNumber,
  vName, type Beat, type BeatKind, type JudgeKind, type VoteKey,
} from "./content";
import type { Notice, TalkState } from "./store";
import { d, Draft, Marked, Type, useInstant } from "./Stage";

type P = { beat: Beat; step: number; state: TalkState };

// ── Small shared pieces ──────────────────────────────────────────────────────

const kindOf = (id: string): JudgeKind => JUDGES.find((j) => j.id === id)?.kind ?? "ai";

/** The two names the whole talk uses for its two moving parts, always in the same colour and font. */
function Tag({ kind }: { kind: "prompt" | "judge" | "context" | "trace" }) {
  return <span className={`ptag ${kind === "trace" ? "trace-tag" : kind}`}>{kind === "prompt" ? "Prompt" : kind === "judge" ? "Judge" : kind === "context" ? "Context" : "Trace"}</span>;
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
        Your AI agent works in the demo.
        <br />
        <span style={{ color: "var(--hold-ink)" }}>Now prove it.</span>
      </div>
      <div className={`meta ${drop ? "a-fade" : ""}`} style={d(0.7)}>
        Evals for agentic customer service
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
        {n.status === "failed" && "The agent's on a break. Next!"}
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
        <div className="tools-line a-fade" style={d(1.2)}>
          <span className="label">Tools</span>
          {TOOLS.map((t) => (
            <span key={t} className="tool-chip">{t}</span>
          ))}
        </div>
        {step >= 1 && <div className="foot a-fade">A few lines. Three tools. No code.</div>}
      </Note>
      <div className={`app a-rise ${count > 3 ? "dense" : ""}`} style={d(0.15)} data-box="app">
        <div className="app-head">
          <span className="logo">⛺</span>
          <span className="name">{BRAND}</span>
          <span className="label tag">Website chat · {APP_NAME}</span>
        </div>
        <div className="rows">
          {rows.length === 0 && (
            <div className="row">
              <div className="en" style={{ color: "var(--faint)" }}>
                Ask us anything…
              </div>
            </div>
          )}
          {rows.map((r) => (
            <div className="row a-rise" key={r.id} data-box="row">
              <div className="en">
                <span className="from">{r.from}</span>
                {r.en}
              </div>
              <div className="out">
                <Type text={r.out} speed={20} delay={350} />
              </div>
              {r.ctx && (
                <div className="ctx-line a-fade" style={d(1.6)}>
                  {r.ctx} <Tag kind="context" />
                </div>
              )}
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
        Ship the Service Agent?
      </div>
      <div className="ship-sub">
        {step === 0 && <div className="t-s t-muted a-fade" style={d(0.8)}>Built on vibes, or built on evidence?</div>}
        {step === 1 && (
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
            <div className="wm">{vName(1)} · {OPENERS[2].from}</div>
            <div className="en">{CALL}</div>
            <div className="out">
              <Marked
                text={OPENERS[2].out}
                marks={[
                  { phrase: "booked a callback", kind: "bad", on: step >= 3 },
                  { phrase: "9:00pm tonight", kind: "bad", on: step >= 3 },
                ]}
              />
            </div>
            <div className="policy-row">
              {step >= 2 && (
                <span className="policy-chip ok a-stamp">Our policy · {POLICY.callbacks.replace("Callbacks: ", "callbacks ")}</span>
              )}
              {step >= 3 && <span className="policy-chip tool a-stamp" style={d(0.4)}>book_callback("9:00pm tonight")</span>}
              {step >= 3 && <span className="policy-chip ctx a-stamp" style={d(1.2)}>What it was told about our hours · nothing</span>}
            </div>
          </div>
        </div>
      )}
      {step >= 4 && (
        <div className="reveal-foot a-rise" data-box="caption">
          <div className="t-m">One small booking. A customer waiting by the phone.</div>
          <div className="t-s t-accent">Easy to build. Miss the small details, and with an agent, they're things it actually does.</div>
        </div>
      )}
    </>
  );
}

function TriesView({ step }: P) {
  return (
    <>
      <div className="headline" data-box="headline">
        <div className="label">{vName(1)} · same question · same prompt · five tries</div>
        <div className="t-m">{PRICE}</div>
        <div className={`policy-chip ok ${step >= 1 ? "a-stamp" : "pj-wait"}`} style={{ marginTop: "1cqw" }}>
          Our policy · {POLICY.price.replace("Price beat: ", "price beat ")}
        </div>
      </div>
      <div className="fan" data-box="fan">
        {FIVE_TRIES.map((t, i) => (
          <div key={i} className={t.bad.length === 0 && step >= 1 ? "right" : ""}>
            <div className="card a-deal" style={d(0.15 + i * 0.35)}>
              <span className="n">
                Try {i + 1}
                {t.bad.length === 0 && <span className={`ok-tag ${step >= 1 ? "on" : ""}`}>✓</span>}
                {step >= 1 && <span className={`says ${t.bad.length ? "bad" : "ok"} a-fade`}>{t.says}</span>}
              </span>
              <Marked text={t.out} marks={t.bad.map((p) => ({ phrase: p, kind: "bad" as const, on: step >= 1 }))} />
            </div>
          </div>
        ))}
      </div>
      {step >= 2 && (
        <div className="tries-foot" data-box="foot">
          <div className="t-l a-rise">5 tries. 3 different price policies.</div>
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
      <Note kind="prompt" title={vName(2)} aside="more rules, by gut feel" className="a-rise pairs-note">
        <span className="old">{V1}</span>
        {V2_ADDED.map((l, i) => (
          <div key={i} className="add">
            <Type text={`+ ${l}`} speed={14} delay={500 + i * 1400} />
          </div>
        ))}
      </Note>
      {step >= 1 && (
      <div className="pairs" data-box="pairs">
        <div className="head a-fade" style={d(0)}>
          <span className="label">{vName(1)}</span>
          <span />
          <span className="label">{vName(2)}</span>
        </div>
        {PAIRS.map((p, i) => (
          <div className="pair" key={i}>
            <div className="en a-fade" style={d(0.2 + i * 0.55)}>
              {p.en}
            </div>
            <div className="two">
              <div className="card a-deal" style={d(0.3 + i * 0.55)}>
                {p.v1}
              </div>
              <div className="q">{step >= 2 && <span className="a-stamp" style={d(i * 0.3)}>?</span>}</div>
              <div className="card a-deal" style={d(0.5 + i * 0.55)}>
                {p.v2}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      {step >= 2 && (
        <div className="no-check top a-rise" style={d(1.1)} data-box="caption">
          We asked for better – but can't confirm if it really is better
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

/** `upTo` (the end-of-talk recap): how many stations are lit so far, one per press, each with the link into it. */
function Loop({ st, lap = false, quick = false, upTo }: { st: Record<StationId, StationState>; lap?: boolean; quick?: boolean; upTo?: number }) {
  const cx = 220, cy = 180, rx = 160, ry = 125;
  const arrows = [-45, 45, 135, 225].map((deg) => {
    const t = (deg * Math.PI) / 180;
    const x = cx + rx * Math.cos(t), y = cy + ry * Math.sin(t);
    const a = (Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180) / Math.PI;
    return { x, y, a };
  });
  if (upTo !== undefined) {
    // The links between stations, clockwise from Define. Link k joins station k to the next; the last closes the loop.
    const at = (deg: number) => [cx + rx * Math.cos((deg * Math.PI) / 180), cy + ry * Math.sin((deg * Math.PI) / 180)];
    const shown = (k: number) => (k < 3 ? upTo >= k + 2 : upTo >= 4);
    return (
      <svg viewBox="0 0 440 360" role="img" aria-label="The loop: define, build, measure, learn" data-box="loop">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--edge)" strokeWidth={3} />
        {[0, 1, 2, 3].map((k) => {
          if (!shown(k)) return null;
          const [x1, y1] = at(-90 + 90 * k), [x2, y2] = at(90 * k);
          const delay = k === 3 ? 1.2 : 0.2;
          return (
            <g key={k}>
              <path className="loop-path" pathLength={1} d={`M ${x1} ${y1} A ${rx} ${ry} 0 0 1 ${x2} ${y2}`} fill="none" stroke="var(--accent)" strokeWidth={5} style={{ ...d(delay), animationDuration: "0.8s" }} />
              <path d="M -7 -8 L 9 0 L -7 8 Z" fill="var(--accent)" transform={`translate(${arrows[k].x} ${arrows[k].y}) rotate(${arrows[k].a})`} className="a-fade" style={d(delay + 0.5)} />
            </g>
          );
        })}
        {STATIONS.map((s, i) => {
          const lit = i < upTo;
          return (
            <g key={s.id} className="station">
              <circle cx={s.x} cy={s.y} r={46} fill="var(--card)" stroke="var(--edge)" strokeWidth={3} />
              <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize={20} fill="var(--muted)">
                {s.label}
              </text>
              {lit && (
                <g className="a-fade" style={d(i === 0 ? 0.3 : 0.6)}>
                  <circle cx={s.x} cy={s.y} r={46} fill="var(--accent)" />
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
        const delay = quick ? 0.15 : lap ? 0.8 + i * 3.2 : state === "lit" ? 1.3 : 0.2 + i * 0.1;
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
          {step >= 1 && <div className="t-s a-rise" style={d(0.8)}>We never said what good looks like. So we can't measure it, and we can't learn from it.</div>}
        </>
      );
    if (mode === "recap")
      return (
        <>
          <div className="recap-row a-rise">
            <b>Define</b>
            <span>Four rules, two of them hard rules.</span>
          </div>
          <div className="recap-row a-rise" style={d(0.2)}>
            <b>Measure</b>
            <span>Three answers, marked by hand.</span>
          </div>
          <div className="t-l a-rise" style={d(1.4)}>
            You can't vote on ten thousand chats a day.
          </div>
        </>
      );
    if (mode === "learn")
      return step === 0 ? (
        <>
          <div className="label a-fade" style={d(0.6)}>
            Where we are
          </div>
          <div className="t-l a-rise" style={d(1.4)}>
            The loop, connected.
          </div>
          <div className="t-s a-rise" style={d(2)}>
            Define it. Build it. Measure every answer. <b className="t-accent">Now we can learn.</b>
          </div>
        </>
      ) : (
        <>
          <div className="t-m heur a-rise" style={d(0.2)}>
            Wrong answer → fix the <Tag kind="prompt" />
          </div>
          <div className="t-m heur a-rise" style={d(0.8)}>
            Wrong test → fix the <Tag kind="judge" />
          </div>
          <div className="t-s t-accent a-rise" style={{ ...d(1.6), fontWeight: 700 }}>
            Check the test first. If the test is wrong, every score is wrong.
          </div>
        </>
      );
    // lap: the end-of-talk recap, one station per press, the loop closing on the last. It carries before and after go-live.
    const rows: [string, ReactNode][] = [
      ["Define", "The behaviours we want, the hard rules it can't break, and golden examples with the reasons why"],
      ["Build", <>The <Tag kind="prompt" />, v1 → v3. The <Tag kind="context" /> it works from. A <Tag kind="judge" /> for every rule.</>],
      ["Measure", <>Every change, through the judges. People read each <Tag kind="trace" />, and the judges' calls.</>],
      [
        "Learn",
        <>
          <span className="sub">The test missed it → fix the <Tag kind="judge" /></span>
          <span className="sub">It behaved wrong → fix the <Tag kind="prompt" /></span>
          <span className="sub">It didn't have the facts → fix the <Tag kind="context" /></span>
        </>,
      ],
    ];
    return (
      <>
        <div className="label a-fade" style={d(0.2)}>
          What we did today
        </div>
        <div className="t-m a-rise" style={d(0.3)}>
          The whole loop, connected.
        </div>
        {/* Every row is laid out from the start (a waiting one is hidden), so the block never shifts as rows land. */}
        {rows.map(([k, v], i) => (
          <div key={k} className={`recap-row lap ${step >= i ? "a-rise" : "waiting"}`} style={d(i === 0 ? 0.5 : 0.2)}>
            <b>{k}</b>
            <span>{v}</span>
          </div>
        ))}
      </>
    );
  })();
  return (
    <div className={`chapter ${mode === "lap" ? "lap" : ""}`} data-box="chapter">
      <div className="loop-wrap">
        <Loop st={LOOP_MODES[mode]} lap={mode === "lap"} quick={mode === "recap"} upTo={mode === "lap" ? step + 1 : undefined} />
      </div>
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
        <div className="label">What a good reply looks like</div>
        <div className="t-m">
          What must <span className="t-accent">never</span> happen when our agent talks to a customer?
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
                      Hard rule
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
        <div className="label">Friday 8:40pm · be the judge · good or bad?</div>
        <div className="t-m vote-q">{CALL}</div>
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
      {/* The room's rules from 2.2, kept on screen so the marking has something to mark against. */}
      <div className="vote-rules a-fade" style={d(0.4)} data-box="rules">
        <span className="vr-label">Our rules</span>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`vr-rule ${i < 2 ? "hard" : ""}`}>
            <b>{String(i + 1).padStart(2, "0")}</b> {ruleText(state, i)}
            {i < 2 && <i>Hard rule</i>}
          </span>
        ))}
      </div>
    </>
  );
}

function SplitView({ state }: P) {
  return (
    <div className="split2" data-box="split">
      <div className="card a-grow">
        <div className="en">
          <Marked text={CALL} marks={[{ phrase: "tonight", kind: "ok", on: true }]} />
        </div>
        <div className="out">
          <Marked text={VOTE_ITEMS[1].out} marks={[{ phrase: "as soon as possible", kind: "mid", on: true }]} />
        </div>
      </div>
      <div className="decide2">
        <div className="a-rise" style={d(0.6)}>
          <Bar split={splitOf(state, "B")} big />
          <div className="bar-legend">
            <span>The room, on answer B</span>
          </div>
        </div>
        <div className="a-rise" style={d(1.4)}>
          <div className="t-m">Which side does it land on?</div>
          <div className="t-s t-accent human">That's a human call.</div>
        </div>
      </div>
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
        Golden samples · {step >= 1 ? <Count from={3} to={total} over={2.8} delay={0.2} /> : 3} marked
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
        {vName(2)} · {Math.min(n, rows.length)} chats checked · {Math.round(Math.min(n, rows.length) * 0.33)}s
      </div>
      <div className="mhead" data-box="mhead">
        <span>Customer → reply</span>
        <span className="mj">
          <span>Tests</span>
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

const PJ_JUDGES = [
  { id: "rule", pass: false, why: "“9:00pm tonight”: nobody's in" },
  { id: "scope", pass: true, why: "nothing to hand over" },
  { id: "voice", pass: true, why: "warm, on brand" },
];

/** 3.1: the brief and the editor side by side, then they move into place: prompt → answer → judges. */
function PromptJudgeView({ step }: P) {
  const flow = step >= 2;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Testing the AI · two different jobs</div>
        <div className="t-m">
          {flow ? (
            <span className="a-fade" key="flow">The prompt makes the answer. The judges check it.</span>
          ) : (
            <>
              The prompt is the brief.{step >= 1 && <span className="a-fade"> The judge is the editor.</span>}
            </>
          )}
        </div>
      </div>
      <div className={`pj-card prompt note ${flow ? "flow" : ""} a-rise`} data-box="pj">
        <div className="label">
          <span className="nt">
            <Tag kind="prompt" /> the brief
          </span>
        </div>
        {flow ? (
          <div className="body a-fade" key="flow">You're the friendly online chat agent for Bunyip Outdoors…</div>
        ) : (
          <>
            <div className="pj-h">Tells it what to do.</div>
            <div className="pj-c">A request. It does its best.</div>
          </>
        )}
      </div>
      {flow && (
        <>
          <span className="pj-arrow a-fade" style={{ left: "28.4cqw", ...d(0.7) }}>→</span>
          <div className="card pj-answer a-rise" style={d(0.8)}>
            <div className="en">{CALL}</div>
            <div className="out">{OPENERS[2].out}</div>
          </div>
          <span className="pj-arrow judge a-fade" style={{ left: "58.6cqw", ...d(1.4) }}>→</span>
        </>
      )}
      {step >= 1 && (
        <div className={`pj-card judge note ${flow ? "flow" : ""} a-rise`} data-box="pj">
          <div className="label">
            <span className="nt">
              <Tag kind="judge" /> {flow ? "the editors" : "the editor"}
            </span>
          </div>
          {flow ? (
            <div className="pj-judges" key="flow">
              {PJ_JUDGES.map((j, i) => (
                <div key={j.id} className="pj-judge a-rise" style={d(1 + i * 0.35)}>
                  <span>
                    <b>{JUDGE_SHORT[j.id]}</b>
                    <small>{j.why}</small>
                  </span>
                  <span className={`pj-mark ${j.pass ? "ok" : "no"} a-stamp`} style={d(2.2 + i * 0.45)}>
                    {j.pass ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="pj-h">Checks what it actually did.</div>
              <div className="pj-c">Just another AI, with its own prompt: a pass or fail on our rules, and why.</div>
            </>
          )}
        </div>
      )}
      <div className="pj-two" data-box="why">
        {/* Always laid out (just hidden while it waits), so nothing shifts when it lands. */}
        <div className={`card ${step >= 2 ? "a-rise" : "pj-wait"}`} style={d(3.2)}>
          <span className="t-s">
            Change the prompt, and the judges <b>stay the same</b>: did the answers get better or worse?
          </span>
        </div>
      </div>
    </>
  );
}

function JudgesView({ step, state }: P) {
  const instant = useInstant();
  return (
    <>
      {step === 0 && (
        <div className="judge-head" data-box="question">
          <div className="label">Our rules, as tests · cheapest first</div>
        </div>
      )}
      <div className={`judge-cards ${step >= 1 ? "small" : ""}`} data-box="stamps">
        <div className="stamps">
          {JUDGES.map((j, i) => (
            <div key={j.id} className="a-stamp" style={d(0.3 + i * 0.15)}>
              <div className={`stamp kind-only kind-${j.kind}`} data-box="stamp">
                <span className="who">{KIND_LABEL[j.kind]}</span>
                <span className="name">{i === 0 ? JUDGE_SHORT.numbers : i < 4 ? ruleText(state, i) : "Expert review"}</span>
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

/** When each stamp lands on 3.3: in the order you say them, the code test first and the fail last. */
const STAMP_AT: Record<string, number> = { numbers: 0.8, scope: 4.5, voice: 5.7, rule: 7.5 };

function StampedView({ step }: P) {
  return (
    <div className="judged" data-box="judged">
      <span className="chip a-fade">Zoomed in · {vName(2)} · a return question</span>
      <div className="card a-zoom">
        <div className="en">
          <Marked text={STAMPED_FAIL.en} marks={[{ phrase: "used once", kind: "ok", on: step >= 1 }]} />
        </div>
        <div className="out">
          <Marked
            text={STAMPED_FAIL.out}
            marks={[
              { phrase: "30 days", kind: "mid", on: step >= 1 },
              { phrase: "used or not", kind: "bad", on: step >= 1 },
            ]}
          />
        </div>
      </div>
      <div className="stamps">
        {step >= 1 &&
          STAMPED_FAIL.stamps.map((s) => (
            <div key={s.id} className="a-stamp" style={d(STAMP_AT[s.id] ?? 0)}>
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
        <span className="chip a-fade">Friday 8:40pm · {vName(2)}</span>
        <div className="card a-rise">
          <div className="en">{WRONG_FAIL.en}</div>
          <div className="out">{WRONG_FAIL.out}</div>
          <span className="policy-chip tool">{WRONG_FAIL.tool}</span>
        </div>
        <div className="stamps">
          {WRONG_FAIL_STAMPS.map((s, i) => (
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
          Inside our hours. Sounds like us. So why did it fail?
        </div>
      </div>
    );
  }
  const debt = (text: string) => (
    <Marked text={text} marks={["callback bookings", "callback", "Booked!"].filter((p) => text.includes(p)).slice(0, 1).map((phrase) => ({ phrase, kind: "mid" as const, on: true }))} />
  );
  const failed = WRONG_FAIL_STAMPS.find((x) => !x.pass)!;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Why did the judge fail it?</div>
        <div className="t-m">It learned the words, not the idea.</div>
      </div>
      <div className="ex-top" data-box="judged">
        <div className="card ex-answer a-rise">
          <div className="label">Friday 8:40pm · {vName(2)} · {WRONG_FAIL.tool}</div>
          <div className="out">{debt(WRONG_FAIL.out)}</div>
        </div>
        <div className="a-stamp" style={d(0.2)}>
          <Stamp id={failed.id} pass={false} why={failed.why} />
        </div>
      </div>
      <div className="ex-follow label a-fade" style={d(0.8)}>
        ↓ Why? Follow the words ↓
      </div>
      <div className="ex-bottom" data-box="why">
        <div className="card wall-ref a-rise" style={d(1.2)}>
          <div className="label">1 · From the golden wall · bad</div>
          <div className="wr-out">“{debt(WALL_CULPRIT.out)}”</div>
        </div>
        <span className="ex-arrow a-fade" style={d(2)}>
          →
        </span>
        <div className="note judge a-rise" style={d(2.2)}>
          <div className="label">
            <span className="nt">
              <Tag kind="judge" /> 2 · {JUDGE_SHORT[failed.id]} · its prompt
            </span>
          </div>
          <div className="body">{debt(JUDGE_GUIDE)}</div>
        </div>
      </div>
      <div className="ex-caption" data-box="caption">
        {step >= 2 ? (
          <span className="ex-judge a-rise" key="fix">
            The judge is wrong. <b>Check the judge first,</b> then fix the prompt.
          </span>
        ) : (
          <span className="a-fade" style={d(3)} key="why">
            But here, booking a callback inside our hours <b>is</b> the job.
          </span>
        )}
      </div>
    </>
  );
}

function ReasonsView({ step }: P) {
  const row = (r: (typeof REASONS)[number], i: number) => (
    <div key={r.dropdown} className={`rrow a-rise ${r.agree ? "" : "dis"}`} style={d(i * 0.35)}>
      <span className="ans">{r.out}</span>
      <span className={`call ${r.agree ? "agree" : "dis"}`}>{r.agree ? "Agree" : "Disagree"}</span>
      <span className="dd-slot">
        <span className={`dchip ${r.fix} a-stamp`} style={d(0.4 + i * 0.35)}>
          {r.dropdown} ▾
        </span>
      </span>
      <span className="txt">
        <Type text={r.text} speed={18} delay={900 + i * 1200} />
      </span>
    </div>
  );
  const groups = [
    { fix: "judge" as const, label: "1 · Wrong test → fix the", rows: REASONS.filter((r) => r.fix === "judge") },
    { fix: "prompt" as const, label: "2 · Wrong answer → fix the", rows: REASONS.filter((r) => r.fix === "prompt") },
  ];
  let i = 0;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">{step >= 1 ? "Sort them" : "How people review the answers"}</div>
        <div className="t-m">{step >= 1 ? "Check the tests first. Then the answers." : "Pick a category. Write the reason."}</div>
      </div>
      <div className="reasons" data-box="reasons">
        <div className={`rhead ${step >= 1 ? "gone" : ""}`}>
          <span>The answer</span>
          <span>
            <Tag kind="judge" /> said ✗
          </span>
          <span>Category</span>
          <span>Reason · more words is better</span>
        </div>
        {groups.map((g, k) => (
          <div key={g.fix} className={`rgroup ${g.fix} ${step >= 1 ? "on" : ""}`} style={d(k * 1.4)}>
            {g.rows.map((r) => row(r, i++))}
            {step >= 1 && (
              <span className={`rg-label ${g.fix} a-stamp`} style={d(0.3 + k * 1.4)}>
                {g.label} <Tag kind={g.fix} />
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function DiffsView({ step: press }: P) {
  // Proposal: one press per fix, so press 0 plays the old step 1 (judge) and press 1 the old step 3 (prompt).
  const step = press === 0 ? 1 : 3;
  // Two rounds, judge first: 0 judge feedback waits, 1 it goes through; 2 prompt feedback waits, 3 it goes through.
  const judgeIn = REASONS.filter((r) => r.fix === "judge");
  const promptIn = REASONS.filter((r) => r.fix === "prompt");
  // Where the AI box's centre is, from each input's centre (cqw), for the fly into it.
  const into = (dx: number, dy: number, delay: number) => ({ "--dx": `${dx}cqw`, "--dy": `${dy}cqw`, "--fd": `${delay}s` }) as CSSProperties;
  const oldJudge = (
    <Note kind="judge" title={`${JUDGE_SHORT.rule} · v1`}>
      {JUDGE_GUIDE}
    </Note>
  );
  const oldPrompt = (
    <Note kind="prompt" title={vName(2)}>
      <span className="old">You're the friendly online chat agent for Bunyip Outdoors…</span>
      {V2_ADDED.map((l) => `\n+ ${l}`).join("")}
    </Note>
  );
  const feedback = (rows: typeof REASONS) => rows.map((r) => (
    <div key={r.dropdown} className="fb-row">
      <span className={`dchip ${r.fix}`}>{r.dropdown}</span>
      <span>{r.text}</span>
    </div>
  ));
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">We say what went wrong and why · the AI does the rewrite</div>
      </div>
      <div className="df-old judge">{oldJudge}</div>
      <div className="df-old prompt">{oldPrompt}</div>
      {step === 1 && (
        <div className="df-old judge fly" style={into(29.5, 3.7, 0.3)}>
          {oldJudge}
        </div>
      )}
      {step === 3 && (
        <div className="df-old prompt fly" style={into(29.5, -16.2, 0.3)}>
          {oldPrompt}
        </div>
      )}
      <span className="df-arrow" style={{ left: "35cqw" }}>→</span>
      <div className={`ai-box df-ai ${step % 2 ? "work" : ""}`} key={`ai${step}`} data-box="ai">
        AI
      </div>
      <span className="df-arrow" style={{ left: "60.5cqw" }}>→</span>
      <div
        className={`df-feed ${step % 2 ? "fly" : "a-rise"}`}
        // A fresh element on every step, so the fly always plays (one shown at its end state is marked done).
        key={`feed${step}`}
        style={step % 2 ? into(0, step < 2 ? -14.2 : -20.2, 0.45) : d(0.4)}
        data-box="feed"
      >
        <div className="label">Feedback · {step < 2 ? `${judgeIn.length} review` : `${promptIn.length} reviews`}</div>
        {feedback(step < 2 ? judgeIn : promptIn)}
      </div>
      {step >= 1 && (
        <div className="df-new judge">
          <Note kind="judge" title={`${JUDGE_SHORT.rule} · v2`} aside="1 · first" className="a-rise" style={d(step === 1 ? 2.2 : 0)}>
            <div className="struck">{JUDGE_LINE_OLD}</div>
            <div className="add">
              <Type text={`+ ${JUDGE_LINE_NEW}`} speed={16} delay={step === 1 ? 2500 : 0} />
            </div>
          </Note>
        </div>
      )}
      {step >= 3 && (
        <div className="df-new prompt">
          <Note kind="prompt" title={vName(3)} aside="2 · then" className="a-rise" style={d(2.2)}>
            <div className="old">You're the friendly online chat agent for Bunyip Outdoors…</div>
            <div className="add">
              <Type text={V3_EXCERPT} speed={9} delay={2500} />
            </div>
          </Note>
        </div>
      )}
    </>
  );
}

function ResultsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Look how far we've come</div>
        <div className="t-m">From vibes to judged, automatically.</div>
      </div>
      <div className="journey2" data-box="journey">
        <div className="j-track a-grow" />
        {JOURNEY.map((j, i) =>
          j.far && step < 1 ? null : (
            <div key={j.label} className={`j-stop ${j.far ? "far" : ""} ${j.best ? "best" : ""} a-rise`} style={d(j.far ? 0.2 : 0.4 + i * 0.8)}>
              <i className="j-dot" />
              <div className="j-when">{j.label}</div>
              <div className="j-big">{j.line}</div>
              {j.sub && <div className="j-how">{j.sub}</div>}
            </div>
          ),
        )}
      </div>
    </>
  );
}

// ── 5 · Ship it? ─────────────────────────────────────────────────────────────

function EndsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Should we ship it?</div>
        <div className="t-m">It depends on your goal, and the quality you need.</div>
      </div>
      <div className="spectrum a-grow" data-box="spectrum" />
      <div className="spectrum-l">
        <span className="v">Vibes</span>
        {step >= 2 && <span className="a-fade">most things sit somewhere in between</span>}
        <span className="e">Evidence</span>
      </div>
      {step >= 3 && (
        <div className="golive" data-box="golive">
          <div className="a-rise">
            <b>Before go-live</b>
            <span>Every change runs the golden conversations through the judges. Hard rules pass every time, or it doesn't ship.</span>
          </div>
          <span className="golive-arrow a-fade" style={d(0.5)}>→</span>
          <div className="a-rise" style={d(0.7)}>
            <b>After go-live</b>
            <span>The same judges check real conversations every day. A broken hard rule raises an alert for a person.</span>
          </div>
        </div>
      )}
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

function HomeView({ beat }: P) {
  if (beat.props?.variant === "evidence") {
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
        <div className="wm">{vName(3)} · Friday 8:40pm</div>
        <div className="en">{CALL}</div>
        <div className="out">
          <Marked text={FINAL.out} marks={[{ phrase: "9am to 5pm on weekdays", kind: "ok", on: true }]} />
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
      <div className="t-xl">
        Your AI agent works in the demo.
        <br />
        <span style={{ color: "var(--hold-ink)" }}>Now you can prove it.</span>
      </div>
      <div className="t-m" style={{ color: "var(--hold-ink)" }}>
        Define what good looks like. Judge every conversation. Learn from every fail.
      </div>
      <div className="thanks">{step >= 1 && <span className="t-l a-rise">Thank you.</span>}</div>
    </div>
  );
}

// ── 6 · From replies to conversations ────────────────────────────────────────

/** A tool call the agent made, between a customer message and its reply. */
function ToolCall({ call, result, bad, lit, style, className = "" }: { call: string; result: string; bad?: boolean; lit?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <div className={`tcall ${bad && lit ? "bad" : ""} ${className}`} style={style}>
      <span className="tc-call">{call}</span>
      <span className="tc-res">→ {result}</span>
    </div>
  );
}

/** 6.1: a real conversation, then the actions behind it (now boxed and named a trace), then each reply judged alone, then the two replies that don't agree. */
function TraceView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">{vName(3)} · one real conversation · Friday 8:40pm</div>
        <div className="t-m">{step >= 1 ? "A trace: every message, every reply, every action." : "Customers don't send one message."}</div>
      </div>
      <div className={`trace ${step >= 1 ? "boxed" : ""}`} data-box="trace">
        {step >= 1 && (
          <span className="trace-pill a-stamp" style={d(0.1)}>
            <Tag kind="trace" />
          </span>
        )}
        <div className="tr-head">
          <span>Customer</span>
          <span>{step >= 1 ? <>What it did → <span className="ctx-word">its context</span></> : ""}</span>
          <span>Agent</span>
          <span>{step >= 2 ? "Reply alone" : ""}</span>
        </div>
        {TRACE.map((t, i) => (
          <div key={i} className={`tr-row a-rise ${step >= 3 && !t.mark ? "dim" : ""}`} style={d(0.3 + i * 0.5)}>
            <div className="bub cust">
              <span className="tr-n">{i + 1}</span>
              {t.customer}
            </div>
            <div className="tr-tools">
              {step >= 1 &&
                t.tools.map((c, k) => (
                  <ToolCall key={k} call={c.call} result={c.result} className="a-fade ctx" style={d(0.2 + i * 0.35)} />
                ))}
            </div>
            <div className="bub agent">
              {t.mark ? <Marked text={t.reply} marks={[{ phrase: t.mark.phrase, kind: t.mark.kind, on: step >= 3 }]} /> : t.reply}
            </div>
            <div className="tr-mark">{step >= 2 && <span className="pj-mark ok a-stamp" style={d(0.3 + i * 0.35)}>✓</span>}</div>
          </div>
        ))}
      </div>
      {step >= 3 && (
        <div className="caption a-rise" style={{ top: "50.6cqw", ...d(0.6) }} data-box="caption">
          Every reply passes. Together, they promise ‘shortly’, then ‘Monday’.
        </div>
      )}
    </>
  );
}

/** 6.2: judge the whole trace. Code tests on the actions, AI judges on the thread, a person's note on the first thing that went wrong. */
function TraceJudgeView({ step }: P) {
  const shown = TRACE_JUDGES.filter((j) => (j.kind === "rule" ? true : step >= 1));
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Judging the whole conversation</div>
        <div className="t-m">Not each reply. The whole trace.</div>
      </div>
      <div className="tj-trace card" data-box="trace">
        <div className="label"><Tag kind="trace" /> {vName(3)}</div>
        {TRACE.map((t, i) => (
          <div key={i} className="tj-turn">
            <div className="tj-c">
              <b>{i + 1}</b> {t.customer}
            </div>
            {t.tools.map((c, k) => (
              <ToolCall key={k} call={c.call} result={c.result} />
            ))}
            <div className="tj-a">{t.mark ? <Marked text={t.reply} marks={[{ phrase: t.mark.phrase, kind: t.mark.kind, on: true }]} /> : t.reply}</div>
          </div>
        ))}
      </div>
      <div className="tj-judges" data-box="judges">
        {shown.map((j, i) => (
          <div key={j.name} className={`tj-judge kind-${j.kind} a-rise`} style={d(0.3 + (j.kind === "rule" ? i : i - 2) * 0.45)}>
            <span className="who">{KIND_LABEL[j.kind]}{j.kind === "rule" ? " · on the actions" : " · on the whole thread"}</span>
            <b>{j.name}</b>
            <small>{j.why}</small>
            <span className={`pj-mark ${j.pass ? "ok" : "no"} a-stamp`} style={d(0.9 + (j.kind === "rule" ? i : i - 2) * 0.45)}>
              {j.pass ? "✓" : "✗"}
            </span>
          </div>
        ))}
        {step >= 2 && (
          <div className="tj-note a-rise" style={d(0.2)}>
            <span className="who">Human review · one note per trace</span>
            <span className="txt">
              <Type text={TRACE_NOTE} speed={18} delay={500} />
            </span>
          </div>
        )}
      </div>
    </>
  );
}

/** 6.3: six real conversations with the same pushy customer. The first message is fine; the later ones break. */
function RunsView({ step }: P) {
  const shown = Math.min(step + 1, 3);
  const broke = RUNS.filter((r) => r.turns.slice(0, shown).some((t) => t.fail)).length;
  const firstFail = (r: (typeof RUNS)[number]) => r.turns.findIndex((t) => t.fail);
  const LINES = [
    "Message 1: most look fine.",
    "Push a little, and another gives way.",
    `${broke} of ${RUNS.length} broke a rule. Only 1 on message one.`,
  ];
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">{vName(3)} · four pushy customers · four traces</div>
        <div className="t-m">{LINES[Math.min(step, 2)]}</div>
      </div>
      <div className="runs" data-box="runs">
        {RUNS.map((r, i) => {
          const f = firstFail(r);
          const held = step >= 2 && f < 0;
          return (
            <div key={i} className={`rn-col ${held ? "held" : ""}`}>
              <span className="trace-pill a-stamp" style={d(0.1 + i * 0.1)}>
                <Tag kind="trace" />
              </span>
              <div className="rn-who a-rise" style={d(0.1 + i * 0.1)}>
                <b>{r.who}</b>
                <span>wants {r.wants}</span>
              </div>
              {r.turns.map((t, k) => {
                if (k >= shown) return <div key={k} className="rn-turn" />;
                const after = f >= 0 && k > f;
                const fresh = k === step;
                const lag = fresh ? 0.3 + i * 0.25 : 0;
                return (
                  <div key={k} className={`rn-turn ${after ? "dim" : ""} ${fresh ? "a-rise" : ""}`} style={d(lag)}>
                    <div className="rn-cust">
                      <span className="tr-n">{k + 1}</span>
                      {t.customer}
                    </div>
                    <div className={`rn-agent ${t.fail ? "no" : after ? "" : "ok"}`}>
                      {t.tool && <span className={`tool-chip ${t.fail ? "bad" : ""}`}>{t.tool}</span>}
                      {t.reply}
                      {!after && (
                        <span className={`rn-mark ${t.fail ? "no" : "ok"} ${fresh ? "a-stamp" : ""}`} style={d(fresh ? lag + 1.1 : 0)}>
                          {t.fail ? "✗" : "✓"}
                        </span>
                      )}
                    </div>
                    {t.fail && (
                      <div className={`rn-why ${fresh ? "a-fade" : ""}`} style={d(fresh ? lag + 1.3 : 0)}>
                        {t.fail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {step >= 3 && (
        <div className="rn-foot a-rise" data-box="caption">
          <span className="t-s">Golden conversations, not just messages:</span>
          {["The pushy one", "The confused one", "The one who changes their mind"].map((c, i) => (
            <span key={c} className="nn-chip a-stamp" style={d(0.4 + i * 0.25)}>{c}</span>
          ))}
        </div>
      )}
    </>
  );
}

/** 6.4: the prompt asks, the tool enforces; then one engine, two brands. */
function GuardView({ step }: P) {
  if (step >= 2) {
    return (
      <>
        <div className="question" data-box="question">
          <div className="label">One engine, many brands</div>
          <div className="t-m">Same rules and judges. Each brand's facts as data.</div>
        </div>
        <div className="shared a-rise" data-box="shared">
          <span className="label">Shared · same judges, every brand</span>
          {SHARED_RULES.map((r, i) => (
            <span key={r} className="vr-rule hard a-stamp" style={d(0.3 + i * 0.2)}>{r}</span>
          ))}
        </div>
        <div className="brands" data-box="brands">
          {BRANDS.map((b, i) => (
            <div key={b.name} className="brand card a-rise" style={d(0.6 + i * 0.4)}>
              <div className="br-name">{b.name}</div>
              <div className="br-what">{b.what}</div>
              <div className="br-sec">
                <span className="label">Its facts · data the tools use</span>
                <div className="br-facts">
                  {b.facts.map((f) => (
                    <span key={f} className="tool-chip">{f}</span>
                  ))}
                </div>
              </div>
              <div className="br-sec">
                <span className="label">Its voice · its own judge</span>
                <div className="br-voice">{b.voice}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Hard rules</div>
        <div className="t-m">
          The prompt asks.{step >= 1 && <span className="a-fade"> The tool enforces.</span>}
        </div>
      </div>
      <div className="g-col left">
        <Note kind="prompt" title="The prompt" aside="a request" className="a-rise">
          {GUARD.prompt}
        </Note>
        <div className="g-say a-fade" style={d(0.6)}>It does its best. Under pressure, its best gives way.</div>
      </div>
      {step >= 1 && (
        <div className="g-col right">
          <div className="g-tools card a-rise">
            <div className="label">The tools · a rule it can't break</div>
            {GUARD.tools.map((t, i) => (
              <div key={t.name} className="g-tool a-rise" style={d(0.4 + i * 0.45)}>
                <span className={`tool-chip ${t.name === "issue_refund" ? "gone" : ""}`}>{t.name}</span>
                <span>{t.how}</span>
              </div>
            ))}
          </div>
          <div className="g-say a-fade" style={d(2)}>An agent only gets the tools it needs.</div>
        </div>
      )}
    </>
  );
}

/** 6.5: a v3 reply that's wrong because of what the tool told it. Then the third answer: wrong data → fix the context. */
function ContextView({ step }: P) {
  const reply = (fixed: boolean) => (
    <div className={`card ctx-card ${fixed ? "fixed" : ""}`}>
      <div className="label">{fixed ? "Fix the data" : <><Tag kind="trace" /> {vName(3)} · Friday 8:40pm</>}</div>
      {!fixed && <div className="en">{CONTEXT_FAIL.customer}</div>}
      <ToolCall call={CONTEXT_FAIL.call} result={fixed ? CONTEXT_FAIL.fixedResult : CONTEXT_FAIL.result} />
      <div className="out">
        {fixed ? (
          <Marked text={CONTEXT_FAIL.fixedReply} marks={[{ phrase: "back Monday at 9am", kind: "ok", on: true }]} />
        ) : (
          <Marked text={CONTEXT_FAIL.reply} marks={[{ phrase: "with you shortly", kind: "bad", on: true }]} />
        )}
      </div>
    </div>
  );
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">{step >= 2 ? "When something fails, ask" : "It did what we asked. It's still wrong."}</div>
        <div className="t-m">{step >= 2 ? "Wrong answer, wrong test, or wrong data?" : step >= 1 ? "The tool never said the team had gone home." : "Nobody's in until Monday."}</div>
      </div>
      <div className={`ctx-top ${step >= 2 ? "small" : ""}`}>
        <div className="a-rise">{reply(false)}</div>
        {step >= 1 && (
          <>
            <span className="ctx-arrow a-fade">→</span>
            <div className="a-rise" style={d(0.4)}>{reply(true)}</div>
          </>
        )}
      </div>
      {step >= 2 && (
        <div className="heur3" data-box="heur">
          {[
            { k: "prompt" as const, a: "Wrong answer", b: "the instructions" },
            { k: "judge" as const, a: "Wrong test", b: "the marking" },
            { k: "context" as const, a: "Wrong data", b: "tools, orders, policies, articles" },
          ].map((h, i) => (
            <div key={h.k} className={`h3 ${h.k} a-rise`} style={d(0.2 + i * 0.5)}>
              <div className="t-s">
                {h.a} → fix the <Tag kind={h.k} />
              </div>
              <small>{h.b}</small>
              {h.k === "context" && (
                <div className="per-brand a-fade" style={d(1.8)}>
                  <b>Per brand</b> Bunyip: weekdays 9–5 · Maison Hart: Mon–Sat 8–8
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const LANES = [
  {
    label: "Before go-live · on every change: prompt, model, tool, policy, knowledge article",
    boxes: [
      ["Golden conversations", "per brand: the pushy, the confused, the mind-changer"],
      ["Code tests", "on every action it takes"],
      ["AI judges", "on every conversation"],
      ["Instant fails: 100%", "or it doesn't ship"],
    ],
  },
  {
    label: "After go-live · every day",
    boxes: [
      ["Real conversations", "a sample, every day, every brand"],
      ["The same judges", "code tests and AI judges"],
      ["Alert", "on any instant fail"],
      ["People review", "the flagged ones: the first thing that went wrong"],
    ],
  },
];

/** 6.6: continuous testing. The same judges before and after go-live, and every real failure comes back as a new test. */
function MonitorView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Continuous testing and observability</div>
        <div className="t-m">Not just “is it up?” but “is it good?”</div>
      </div>
      {LANES.map((l, li) =>
        step >= li ? (
          <div key={li} className={`lane lane-${li}`} data-box="lane">
            <div className="label a-fade">{l.label}</div>
            <div className="lane-boxes">
              {l.boxes.map(([a, b], i) => (
                <div key={a} className={`lbox card a-rise ${li === 0 && i === 3 ? "gate" : ""} ${li === 1 && i === 2 ? "alert" : ""}`} style={d(0.3 + i * 0.35)}>
                  <b>{a}</b>
                  <small>{b}</small>
                </div>
              ))}
            </div>
          </div>
        ) : null,
      )}
      {step >= 2 && (
        <>
          <svg className="return-arrow" viewBox="0 0 100 56.25" preserveAspectRatio="none" aria-hidden>
            <path className="loop-path" pathLength={1} d="M 85.85 41.2 L 85.85 45.6 L 3.4 45.6 L 3.4 18.3 L 6 18.3" fill="none" stroke="var(--accent)" strokeWidth={0.35} />
            <path d="M 5.5 17.5 L 6.7 18.3 L 5.5 19.1 Z" fill="var(--accent)" className="a-fade" style={d(1.4)} />
          </svg>
          <div className="caption a-rise" style={{ top: "47.6cqw", ...d(0.8) }} data-box="caption">
            Every real failure becomes a new golden conversation.
          </div>
        </>
      )}
    </>
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
  trace: TraceView,
  traceJudge: TraceJudgeView,
  runs: RunsView,
  guard: GuardView,
  context: ContextView,
  monitor: MonitorView,
};
