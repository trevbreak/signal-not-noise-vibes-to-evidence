import { Fragment, useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { runCheck } from "../lib/checks";
import {
  AFTER, APP_NAME, DEFAULT_RULES, DEFAULT_VOTES, DROPDOWNS, FAILURES, FINAL, FIVE_EACH, FIVE_TRIES, FRIDAY, GATES, HOMEWORK,
  JUDGE_SCOPE_OLD, JUDGE_V3_ADDED, JUDGES, KIND_LABEL, LEAVE, MONTAGE, MONTAGE_JUDGES, MONTAGE_ROOM_AT, NOT_NOW, OPENERS, PAIRS,
  REASONS, STAMPED_FAIL, TECH_DEBT, TECH_DEBT_OUT, TECH_DEBT_RULE, TECH_DEBT_STAMPS, THEMES, V1, V2_ADDED, V3_ADDED, V4_EXCERPT,
  VERSIONS, VOTE_ITEMS, VOTE_SPLITS, WALL, vName, type Beat, type BeatKind, type JudgeKind, type VoteKey,
} from "./content";
import type { Notice, TalkState } from "./store";
import { d, Draft, Marked, Type, useInstant } from "./Stage";

type P = { beat: Beat; step: number; state: TalkState };

// ── Small shared pieces ──────────────────────────────────────────────────────

const JUDGE_SHORT: Record<string, string> = { numbers: "Numbers kept", rule: "Still a rule", scope: "Nothing added", voice: "Sounds like a PM", room: "The room" };
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

function Stamp({ id, pass, why, wait }: { id: string; pass?: boolean; why: string; wait?: boolean }) {
  const kind = kindOf(id);
  return (
    <div className={`stamp ${wait ? "wait" : pass ? "ok" : "no"}`} data-box="stamp">
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

/** Labelled bars: one row per thing measured, with its plain-words label underneath. */
function Bars({ rows, className = "" }: { rows: { label: string; sub: string; pct: number; val: string; muted?: boolean }[]; className?: string }) {
  return (
    <div className={`bars ${className}`} data-box="bars">
      {rows.map((r, i) => (
        <Fragment key={i}>
          <div className="lbl a-rise" style={d(i * 0.2)}>
            {r.label}
            <small>{r.sub}</small>
          </div>
          <div className="track a-rise" style={d(i * 0.2)}>
            <Fill pct={r.pct} className={r.muted ? "muted" : ""} delay={0.4 + i * 0.35} />
          </div>
          <div className="val a-rise" style={d(i * 0.2)}>
            {r.val}
          </div>
        </Fragment>
      ))}
    </div>
  );
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
            It passed once. That proves almost nothing.
          </div>
        </div>
      )}
    </>
  );
}

function PairsView({ step }: P) {
  return (
    <>
      <Note kind="prompt" title={vName(2)} className="a-rise">
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
  learn: { define: "done", build: "done", measure: "done", learn: "lit" },
  lap: { define: "lit", build: "lit", measure: "lit", learn: "lit" },
};
/** The recap colours in the loop one station per step. */
const RECAP: Record<StationId, StationState>[] = [
  { define: "dashed", build: "done", measure: "idle", learn: "idle" },
  { define: "lit", build: "done", measure: "idle", learn: "idle" },
  { define: "done", build: "done", measure: "lit", learn: "idle" },
  { define: "done", build: "done", measure: "lit", learn: "idle" },
  { define: "done", build: "done", measure: "lit", learn: "idle" },
];
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
  if (mode === "gap") {
    return (
      <div className="chapter" data-box="chapter">
        <Loop st={LOOP_MODES.gap} />
        <div className="text">
          {step >= 1 && <div className="t-l a-rise">We skipped straight to Build.</div>}
          {step >= 2 && (
            <div className="t-s a-rise">
              We never said what good looks like. So we can't measure it, and we can't learn from it.
            </div>
          )}
        </div>
      </div>
    );
  }
  if (mode === "recap") {
    const items = [
      { at: 0, label: "Build", text: "The PM Translator, versions 1 and 2" },
      { at: 1, label: "Define", text: "Four rules for a good translation. Two are instant fails." },
      { at: 2, label: "Measure", text: "We marked real answers against them, by hand." },
    ];
    return (
      <div className="chapter" data-box="chapter">
        <Loop st={RECAP[step]} quick />
        <div className="text recap">
          {step < 3 ? (
            items.map(
              (it) =>
                step >= it.at && (
                  <div key={it.label} className={`recap-row a-rise ${step === it.at && it.at > 0 ? "now" : ""}`}>
                    <b>{it.label}</b>
                    <span>{it.text}</span>
                  </div>
                ),
            )
          ) : (
            <>
              <div className="t-l a-rise">You can't vote on ten thousand notices a day.</div>
              {step >= 4 && (
                <div className="t-s a-rise judge-line">
                  So every rule becomes an automatic check, run on every translation. That check is a <Tag kind="judge" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="chapter" data-box="chapter">
      <Loop st={LOOP_MODES[mode]} lap={mode === "lap"} />
      <div className="text">
        {beat.props?.kicker ? (
          <div className="label a-fade" style={d(0.4)}>
            {beat.props.kicker as string}
          </div>
        ) : null}
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

function Montage({ notices, mark }: { notices: Notice[]; mark: boolean }) {
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
              <Marked text={r.out} marks={[{ phrase: "tech debt", kind: "mid", on: mark }]} />
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
          <div className="label">{step === 0 ? "Our rules for a good PM translation" : "Our rules, as judges"}</div>
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
      {step === 1 && (
        <div className="judge-bottom" data-box="stamps">
          <div className="stamps">
            {JUDGES.map((j, i) => (
              <div key={j.id} className="a-stamp" style={d(0.55 + i * 0.15)}>
                <div className="stamp kind-only" data-box="stamp">
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
      {step >= 2 && <Montage notices={state.room.notices} mark={step >= 3} />}
      {step >= 3 && (
        <div className="caption a-rise" style={{ top: "50.5cqw" }} data-box="caption">
          Your rules. Every answer. Every time.
        </div>
      )}
    </>
  );
}

function StampedView({ step, state }: P) {
  // The room's call on the leave answer. → without one counts as thumbs down.
  const call = state.room.thumbs.fail ?? "down";
  return (
    <div className="judged" data-box="judged">
      <span className="chip a-fade">Zoomed in · {vName(2)} · from the HR wall</span>
      <div className="card a-zoom">
        <div className="en">{LEAVE}</div>
        <div className="out">{STAMPED_FAIL.out}</div>
      </div>
      <div className="stamps">
        {step >= 1 &&
          STAMPED_FAIL.stamps.map((s, i) => (
            <div key={s.id} className="a-stamp" style={d(0.2 + i * 1.1)}>
              <Stamp id={s.id} pass={s.pass} why={s.why} />
            </div>
          ))}
        {step >= 1 && (
          <div className="a-stamp" style={d(4.6)}>
            {step >= 3 ? (
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
          <div className="verdict fail a-stamp" style={d(0.9)}>
            Fail
            <small>caught automatically, with the reasons why</small>
          </div>
        )}
      </div>
    </div>
  );
}

function HoneView({ step }: P) {
  const lit = (t: string) => (t === "techdebt" ? step >= 2 : step >= 1);
  const fixing = step >= 3;
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">{fixing ? "Fixing it by hand" : `What the judges caught · ${vName(2)}`}</div>
        <div className="t-m">{fixing ? "We read the failures. Then we edit." : "Read the failures. Look for patterns."}</div>
      </div>
      <div className="hone-left" data-box="hone-left">
        {!fixing ? (
          <div className="fails">
            {FAILURES.map((f, i) => (
              <div key={i} className={`fail-row a-rise t-${f.theme} ${lit(f.theme) ? "lit" : ""}`} style={d(i * 0.12)}>
                <span className="en">{f.en}</span>
                <span className="out">→ {f.out}</span>
                <span className="why">✗ {f.why}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="hone-notes">
            <Note kind="prompt" title={vName(3)} aside="edited by hand" className="a-rise">
              <span className="old">{V1}</span>
              {V2_ADDED.map((l) => (
                <div key={l} className="old">
                  {l}
                </div>
              ))}
              {V3_ADDED.map((l, i) => (
                <div key={l} className="add">
                  <Type text={`+ ${l}`} speed={16} delay={500 + i * 1300} />
                </div>
              ))}
            </Note>
            {step >= 4 && (
              <Note kind="judge" title="Nothing added" aside="edited by hand" className="a-rise">
                <span className="old">{JUDGE_SCOPE_OLD}</span>
                <div className="add flag">
                  <Type text={`+ ${TECH_DEBT_RULE}`} speed={22} delay={400} />
                </div>
              </Note>
            )}
          </div>
        )}
      </div>
      <div className="themes" data-box="themes">
        {THEMES.map(
          (t) =>
            lit(t.id) && (
              <div key={t.id} className={`theme t-${t.id} a-drop`}>
                <b>{t.label}</b>
                <span className="n">× {t.count}</span>
                {fixing && (t.id !== "techdebt" || step >= 4) && (
                  <span className="to a-fade">
                    → fix the <Tag kind={t.id === "techdebt" ? "judge" : "prompt"} />
                  </span>
                )}
              </div>
            ),
        )}
        {step >= 4 && <div className="remember a-stamp" style={d(2)}>Remember this rule.</div>}
      </div>
    </>
  );
}

function FiveEachView({ step }: P) {
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">The leave notice · five tries per version · out of 5, how many passed every judge?</div>
        <div className="t-m">{LEAVE}</div>
      </div>
      <Bars rows={FIVE_EACH.map((r, i) => ({ label: r.label, sub: r.sub, pct: r.pass * 20, val: `${r.pass} / 5`, muted: i < 2 }))} />
      {step >= 1 && (
        <div className="caption a-rise" style={{ top: "36cqw", fontSize: "3cqw" }} data-box="caption">
          Better. And this time, we can prove it.
        </div>
      )}
      {step >= 2 && (
        <div className="caption sub a-rise" style={{ top: "42cqw" }} data-box="caption">
          But two in five isn't shippable. And we made those fixes by hand.
        </div>
      )}
    </>
  );
}

// ── 4 · Learn from the reasons ───────────────────────────────────────────────

function ExposeView({ step, state }: P) {
  return (
    <div className="judged" data-box="judged">
      <div className="chip-row">
        <span className="chip a-fade">Release notes · {vName(3)}</span>
        {step >= 2 && (
          <span className="callback a-rise">
            <Tag kind="judge" /> Our rule from earlier: {TECH_DEBT_RULE}
          </span>
        )}
      </div>
      <div className="card a-rise">
        <div className="en">{TECH_DEBT}</div>
        <div className="out">
          <Marked text={TECH_DEBT_OUT} marks={[{ phrase: "tech debt", kind: "mid", on: step >= 2 }]} />
        </div>
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
            <div className="t-s ask-q">{step >= 4 ? <span className="t-accent">The judge did what we told it. We told it the wrong thing.</span> : "Agree with the judge, or disagree?"}</div>
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

function ReasonsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Reasoning · every call gets a reason</div>
        <div className="t-m">Don't just agree or disagree. Say why, in your own words.</div>
      </div>
      <div className="reasons" data-box="reasons">
        <div className="rhead">
          <span>The answer</span>
          <span>
            <Tag kind="judge" /> said ✗. You…
          </span>
          <span>Your reason</span>
        </div>
        {REASONS.map((r, i) => (
          <div key={i} className={`rrow a-rise ${r.agree ? "" : "dis"}`} style={d(i * 0.15)}>
            <span className="ans">{r.out}</span>
            <span className={`call ${r.agree ? "agree" : "dis"}`}>{r.agree ? "Agree" : "Disagree"}</span>
            <span className="txt">{(i === 0 || step >= 1) && <Type text={r.text} speed={22} delay={i === 0 ? 900 : 300 + (i - 1) * 900} />}</span>
          </div>
        ))}
      </div>
      {step >= 2 && (
        <div className="caption a-rise" style={{ top: "47cqw" }} data-box="caption">
          “Wrong” teaches nothing. The reason teaches everything.
        </div>
      )}
    </>
  );
}

function DropdownsView({ step }: P) {
  const max = Math.max(...DROPDOWNS.map((x) => x.count));
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Drop-downs · group the reasons</div>
        <div className="t-m">The handful of ways the PM Translator goes wrong</div>
      </div>
      <div className="dd-left" data-box="dd-left">
        {REASONS.map((r, i) => (
          <div key={i} className="dd-reason a-rise" style={d(i * 0.1)}>
            <span className="txt">{r.text}</span>
            <span className="pick a-stamp" style={d(0.6 + i * 0.3)}>
              {r.dropdown} <em>▾</em>
            </span>
          </div>
        ))}
      </div>
      <div className="dd-right" data-box="dd-right">
        {DROPDOWNS.map((x, i) => (
          <div key={x.label} className={`dd a-rise ${step >= 2 ? `to-${x.fix}` : ""}`} style={d(1.8 + i * 0.2)}>
            <div className="dd-top">
              <b>{x.label}</b>
              <span className="n">{step >= 1 ? `× ${x.count}` : ""}</span>
            </div>
            <div className="dd-bar">{step >= 1 && <Fill pct={(x.count / max) * 100} delay={i * 0.15} className={x.fix} />}</div>
            {step >= 2 && (
              <div className="dd-to a-fade" style={d(i * 0.2)}>
                {x.fix === "prompt" ? "Agreed with the fail" : "Disagreed with the judge"} → fix the <Tag kind={x.fix} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function DiffsView({ step }: P) {
  return (
    <>
      <div className="question" data-box="question">
        <div className="label">Hand the reasons to an AI · it rewrites, we never say how</div>
        <div className="feed">
          {DROPDOWNS.map((x) => (
            <span key={x.label} className={`feed-chip ${x.fix}`}>
              {x.label} × {x.count}
            </span>
          ))}
        </div>
      </div>
      <div className="diffs" data-box="diffs">
        <Note kind="prompt" title={vName(4)} aside="from your reasons" className="a-rise">
          {step < 1 ? (
            <>
              <span className="old">{V1}</span>
              {[...V2_ADDED, ...V3_ADDED].map((l) => (
                <div key={l} className="old">
                  {l}
                </div>
              ))}
            </>
          ) : (
            <div className="add">
              <Type text={V4_EXCERPT} speed={9} delay={200} />
            </div>
          )}
        </Note>
        <Note kind="judge" title="Nothing added" aside="from your reasons" className="a-rise" style={d(0.15)}>
          <span className="old">{JUDGE_SCOPE_OLD}</span>
          <div className={step >= 2 ? "struck" : "old flag-old"}>{TECH_DEBT_RULE}</div>
          {step >= 2 && (
            <div className="add">
              <Type text={`+ ${JUDGE_V3_ADDED}`} speed={16} delay={600} />
            </div>
          )}
        </Note>
      </div>
    </>
  );
}

function AfterView({ step }: P) {
  const row = (r: { label: string; sub: string; value: number; of: number; muted: boolean }) => ({ label: r.label, sub: r.sub, pct: (r.value / r.of) * 100, val: `${r.value} / ${r.of}`, muted: r.muted });
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Did it work? · same notices, same judges, a fair fight</div>
      </div>
      <div className="after" data-box="after">
        <div className="after-group a-rise">
          <div className="gh">
            <Tag kind="prompt" /> How often the PM Translator passes every judge <small>6 notices × 5 tries</small>
          </div>
          <Bars rows={AFTER.prompt.map(row)} className="tight" />
        </div>
        {step >= 1 && (
          <div className="after-group a-rise">
            <div className="gh">
              <Tag kind="judge" /> How often the judge agrees with the room <small>6 answers the room reviewed</small>
            </div>
            <Bars rows={AFTER.judge.map(row)} className="tight" />
          </div>
        )}
      </div>
    </>
  );
}

function VersionsView({ step }: P) {
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Every version · 6 notices × 5 tries · from rehearsal</div>
        <div className="t-m">How often each version passed every judge</div>
      </div>
      <Bars className="four" rows={VERSIONS.map((r) => ({ label: r.label, sub: r.sub, pct: r.pct, val: `${r.pct}%`, muted: r.pct < 50 }))} />
      {step >= 1 && (
        <div className="months a-rise" data-box="caption">
          <div className="t-m">Getting to 70 or 80% takes an afternoon.</div>
          <div className="t-m t-accent">The last 20 points take months.</div>
        </div>
      )}
    </>
  );
}

// ── 5 · Ship it? ─────────────────────────────────────────────────────────────

function GatesView({ step, state }: P) {
  const ours = [0, 1, 2, 3].map((i) => ruleText(state, i));
  return (
    <>
      <div className="bars-title" data-box="question">
        <div className="label">Good enough to ship</div>
        <div className="t-m">Ship it? Depends who it's for.</div>
      </div>
      <div className="gates" data-box="gates">
        {GATES.map((g, i) => {
          const rules = g.rules === "ours" ? ours : g.rules;
          const fails = g.fails === "ours" ? ours.slice(0, 2) : g.fails;
          return (
            step >= i + 1 && (
              <div key={g.label} className={`gate ${g.tone} a-rise`} data-box="gate">
                <h3>{g.label}</h3>
                <div className="gl">Rules</div>
                <div className="chips">{rules.length ? rules.map((r) => <span key={r} className="rchip">{r}</span>) : <span className="none">None</span>}</div>
                <div className="gl">Instant fails</div>
                <div className="chips">{fails.length ? fails.map((r) => <span key={r} className="rchip fail">{r}</span>) : <span className="none">None</span>}</div>
                <div className="gbar">{g.bar}</div>
                <div className="gnote">{g.note}</div>
              </div>
            )
          );
        })}
      </div>
      {step >= 4 && (
        <div className="owners a-rise" data-box="caption">
          <b>Different things need different rules.</b> Decide which, write them down before you see the results, and measure every change against them.
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
        <div className="wm">{vName(4)} · the notice we started with</div>
        <div className="en">{LEAVE}</div>
        <div className="out">{FINAL.out}</div>
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
        Ships behind the strictest gate: 100% on the instant fails, and a human signs off.
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
  hone: HoneView,
  fiveEach: FiveEachView,
  expose: ExposeView,
  reasons: ReasonsView,
  dropdowns: DropdownsView,
  diffs: DiffsView,
  after: AfterView,
  versions: VersionsView,
  gates: GatesView,
  home: HomeView,
  close: CloseView,
};
