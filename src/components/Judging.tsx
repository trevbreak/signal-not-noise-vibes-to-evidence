import { useEffect, useRef, useState } from "react";
import type { Verdict } from "../lib/types";

// After every answer, the judges mark it, one after another, where the audience can see it.
// The same panel is used for text, pictures and voice, so the idea carries across.

export type JudgeLine = {
  id: string;
  name: string;
  kind: "code" | "llm" | "human";
  /** What it checks, shown until it has marked the answer. */
  blurb?: string;
  verdict?: Verdict | "pending";
  /** For tries: how many of them passed this judge. */
  tally?: { passed: number; total: number };
  /** The room votes by hand: render the buttons here. */
  vote?: React.ReactNode;
};

const KIND = { code: "Rule", llm: "AI judge", human: "People" } as const;
const STEP_MS = 550;

const done = (v: JudgeLine["verdict"]): v is Verdict => !!v && v !== "pending";

/**
 * `runKey` identifies the answer being marked: a new key replays the marking one judge at a time.
 * Coming back to an answer that's already marked shows it straight away.
 */
export function Judging(props: { lines: JudgeLine[]; runKey: string | null; title?: string; overall?: React.ReactNode; compact?: boolean }) {
  const auto = props.lines.filter((l) => l.kind !== "human");
  const allDone = auto.every((l) => done(l.verdict) || l.tally);
  const [shown, setShown] = useState(allDone ? props.lines.length : 0);
  const lastKey = useRef(props.runKey);

  useEffect(() => {
    if (props.runKey === lastKey.current) return;
    lastKey.current = props.runKey;
    setShown(allDone ? props.lines.length : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.runKey]);

  useEffect(() => {
    if (!props.runKey || shown >= props.lines.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 250 : STEP_MS);
    return () => clearTimeout(t);
  }, [shown, props.runKey, props.lines.length]);

  if (!props.runKey) return null;
  // A judge only shows its mark once its turn comes round, so the room can follow along.
  const visible = (i: number) => i < shown;
  const finished = auto.length > 0 && props.lines.every((l, i) => l.kind === "human" || (visible(i) && (done(l.verdict) || l.tally)));
  const failed = auto.filter((l) => (l.tally ? l.tally.passed < l.tally.total : done(l.verdict) && !l.verdict.pass));

  return (
    <div className={`judging ${props.compact ? "compact" : ""}`}>
      <div className="judging-head">
        <span className="judging-arrow" aria-hidden>
          ↓
        </span>
        {props.title ?? "Then the judges mark it"}
      </div>
      <div className="jlines">
      {props.lines.map((l, i) => {
        const v = visible(i) ? l.verdict : l.verdict ? "pending" : undefined;
        const marking = l.kind !== "human" && (!visible(i) || v === "pending" || (!done(v) && !l.tally));
        const state = l.tally
          ? visible(i)
            ? l.tally.passed === l.tally.total
              ? "pass"
              : "fail"
            : "pending"
          : done(v)
            ? v.pass
              ? "pass"
              : "fail"
            : marking
              ? "pending"
              : "";
        return (
          <div key={l.id} className={`jline ${state} ${i < shown ? "in" : ""}`}>
            <span className={`kind ${l.kind}`}>{KIND[l.kind]}</span>
            <span className="jline-text">
              <strong>{l.name}</strong>
              <span>
                {l.tally && visible(i)
                  ? `${l.tally.passed} of ${l.tally.total} tries passed`
                  : done(v)
                    ? v.reason
                    : marking && visible(i)
                      ? "marking…"
                      : l.blurb}
              </span>
            </span>
            {l.vote ?? (
              <span className={`mark ${state}`}>
                {state === "pending" ? "◌" : state === "pass" ? "✓" : state === "fail" ? "✗" : "–"}
              </span>
            )}
          </div>
        );
      })}
      </div>
      {finished && (
        <div className={`judging-verdict ${failed.length ? "fail" : "pass"}`}>
          {props.overall ??
            (failed.length ? (
              <>
                ✗ Fail <span>{failed.map((f) => f.name).join(" · ")}</span>
              </>
            ) : (
              <>✓ Pass <span>every check</span></>
            ))}
        </div>
      )}
    </div>
  );
}
