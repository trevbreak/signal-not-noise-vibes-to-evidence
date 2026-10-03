import { useEffect } from "react";
import { APP_CODES, JUDGE_CODES } from "../scenes";
import { hasExample, isVerdict, judgeFeedback, promptFeedback, respond, responseKey, runReviewJudges, applyExample, useFlow } from "../lib/flow";
import { KIND_LABEL } from "./Lab";
import type { Judge, ReviewItem, ReviewScene, Verdict } from "../lib/types";

export function Review({ scene }: { scene: ReviewScene }) {
  const flow = useFlow();
  const selected = scene.items.find((i) => i.id === flow.selected) ?? scene.items[0];
  const toPrompt = promptFeedback(scene).length;
  const toJudge = judgeFeedback(scene).length;

  // Mark the answers as soon as we arrive (recorded, so replay works too).
  useEffect(() => {
    const unmarked = scene.items.some((i) => scene.judges.some((j) => !flow.verdicts[i.id]?.[j.id]));
    if (unmarked && !flow.busy) runReviewJudges(scene);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  return (
    <div className="review">
      <section className="review-left">
        <div className="step-title">Answers from earlier</div>
        <div className="step-sub">Pick one. Do we agree with the judges?</div>
        <div className="review-items">
          {scene.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              judges={scene.judges}
              selected={item.id === selected.id}
              onSelect={() => useFlow.setState({ selected: item.id })}
            />
          ))}
        </div>
        <div className="tally">
          <div>
            <strong>{toPrompt}</strong> note{toPrompt === 1 ? "" : "s"} for the <span className="to-prompt">instructions</span>
          </div>
          <div>
            <strong>{toJudge}</strong> note{toJudge === 1 ? "" : "s"} for the <span className="to-judge">judges</span>
          </div>
        </div>
        {flow.busy && <div className="thinking">{flow.busy}</div>}
        {flow.error && <div className="error">{flow.error}</div>}
      </section>

      <section className="review-right">
        <div className="review-answer">
          <div className="calib-src">{selected.source}</div>
          <div className="review-out">{selected.output}</div>
          <button className="link example-all" disabled={!!flow.busy} onClick={() => applyExample(selected, scene.judges.map((j) => j.id))}>
            ✨ Use our example notes for this answer
          </button>
        </div>
        {scene.judges.map((j) => (
          <JudgeRow key={j.id} item={selected} judge={j} />
        ))}
      </section>
    </div>
  );
}

function ItemCard(props: { item: ReviewItem; judges: Judge[]; selected: boolean; onSelect: () => void }) {
  const verdicts = useFlow((s) => s.verdicts[props.item.id]);
  const responses = useFlow((s) => s.responses);
  const reviewed = props.judges.filter((j) => responses[responseKey(props.item.id, j.id)]).length;
  return (
    <button className={`phrase review-item ${props.selected ? "selected" : ""}`} onClick={props.onSelect}>
      <span className="phrase-text">
        <span className="calib-src">{props.item.source}</span>
        <span className="review-item-out">{props.item.output}</span>
      </span>
      <span className="phrase-status">
        {props.judges.map((j) => {
          const v = verdicts?.[j.id];
          return <span key={j.id} className={`dot ${v === "pending" ? "pending" : isVerdict(v) ? (v.pass ? "pass" : "fail") : ""}`} title={j.name} />;
        })}
        {reviewed > 0 && (
          <span className="tries-pill">
            {reviewed}/{props.judges.length}
          </span>
        )}
      </span>
    </button>
  );
}

function JudgeRow({ item, judge }: { item: ReviewItem; judge: Judge }) {
  const v = useFlow((s) => s.verdicts[item.id]?.[judge.id]);
  const r = useFlow((s) => s.responses[responseKey(item.id, judge.id)]);
  // Agree with a ✗: the translation is bad. Disagree: the judge is wrong.
  const target = r && isVerdict(v) ? (r.agree ? (v.pass ? null : "prompt") : "judge") : null;
  const codes = target === "prompt" ? APP_CODES : JUDGE_CODES;

  return (
    <div className={`jrow ${target ? `for-${target}` : ""}`}>
      <div className="jrow-main">
        <span className={`kind ${judge.kind}`}>{KIND_LABEL[judge.kind]}</span>
        <div className="jrow-text">
          <div>
            <strong>{judge.name}</strong>{" "}
            {v === "pending" || !v ? (
              <span className="muted">is marking…</span>
            ) : (
              <>
                gave it <span className={`verdict-word ${(v as Verdict).pass ? "pass" : "fail"}`}>{(v as Verdict).pass ? "✓ pass" : "✗ fail"}</span>
              </>
            )}
          </div>
          {isVerdict(v) && <div className="because">because {lowerFirst(v.reason)}</div>}
        </div>
        {isVerdict(v) && (
          <div className="agree">
            {hasExample(item, judge.id) && (
              <button className="example" title="Use our example note" aria-label="Use our example note" onClick={() => applyExample(item, [judge.id])}>
                ✨
              </button>
            )}
            <button className={r?.agree === true ? "on pass" : ""} onClick={() => respond(item.id, judge.id, { agree: true })}>
              👍 Agree
            </button>
            <button className={r?.agree === false ? "on fail" : ""} onClick={() => respond(item.id, judge.id, { agree: false })}>
              👎 Disagree
            </button>
          </div>
        )}
      </div>

      {target && (
        <div className="coding">
          <span className={`dest ${target}`}>{target === "prompt" ? "→ feedback for the instructions" : "→ feedback for the judge"}</span>
          <label>
            <span>{target === "prompt" ? "What went wrong with the translation?" : "What did the judge get wrong?"}</span>
            <select value={r?.code ?? ""} onChange={(e) => respond(item.id, judge.id, { code: e.target.value })}>
              <option value="" disabled>
                Pick one…
              </option>
              {codes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="grow">
            <span>
              Why? As much detail as you can.
              {hasExample(item, judge.id) && (
                <button className="link" onClick={() => applyExample(item, [judge.id])}>
                  ✨ use our example note
                </button>
              )}
            </span>
            <textarea
              value={r?.comment ?? ""}
              placeholder="e.g. 'Tinnies aren't standard drinks. Keep the number and the measure exactly.'"
              onChange={(e) => respond(item.id, judge.id, { comment: e.target.value })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);
