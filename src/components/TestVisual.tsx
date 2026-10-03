import { RUBRIC, V } from "../scenes";

// The worked example on "Turn the guide into judges": one bad answer, seen as a test,
// against the marking guide, by three kinds of judge, and against an invariant.

const { source: SOURCE, answer: ANSWER, marks: MARKS } = V.testExample;
const lineName = (id: string) => RUBRIC.find((d) => d.id === id)?.name ?? id;

function Answer() {
  return (
    <div className="tv-answer">
      <div className="calib-src">{SOURCE}</div>
      <div className="tv-out">{ANSWER}</div>
    </div>
  );
}

const Tick = ({ ok }: { ok: boolean }) => <span className={`tv-tick ${ok ? "pass" : "fail"}`}>{ok ? "✓" : "✗"}</span>;

/** step 1 = eval, 2 = rubric, 3 = judge, 4 = invariant. Shows the newest one. */
export function TestVisual({ step }: { step: number }) {
  if (step < 1) return <div className="tv" />;
  return (
    <div className="tv" key={step}>
      <Answer />
      {step === 1 && (
        <div className="tv-card">
          <div className="tv-label">The test</div>
          <div className="tv-q">
            Did it follow the rules? <Tick ok={false} />
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="tv-card">
          <div className="tv-label">The marking guide, line by line</div>
          {RUBRIC.map((d) => (
            <div key={d.id} className="tv-line">
              <span>{d.name}</span>
              <Tick ok={MARKS[d.id]} />
            </div>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="tv-card">
          <div className="tv-label">Three kinds of judge</div>
          <div className="tv-judge">
            <span className="kind code">Rule</span>
            <span>
              <strong>Numbers kept</strong>
              <em>{V.testExample.numbersReason}</em>
            </span>
            <Tick ok={false} />
          </div>
          <div className="tv-judge">
            <span className="kind llm">AI judge</span>
            <span>
              <strong>Still a rule</strong>
              <em>{V.testExample.ruleReason}</em>
            </span>
            <Tick ok={false} />
          </div>
          <div className="tv-judge">
            <span className="kind human">People</span>
            <span>
              <strong>The room</strong>
              <em>{V.testExample.roomReason}</em>
            </span>
            <span className="tv-tick fail">👎</span>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="tv-card">
          <div className="tv-label">The red lights</div>
          <div className="tv-line">
            <span>{lineName("voice")}</span>
            <Tick ok={true} />
          </div>
          <div className="tv-line">
            <span>{lineName("talk")}</span>
            <Tick ok={true} />
          </div>
          <div className="tv-line red">
            <span>🚦 {lineName("numbers")}</span>
            <Tick ok={false} />
          </div>
          <div className="tv-verdict">Fail. Ran a red light, however good the rest was.</div>
        </div>
      )}
    </div>
  );
}
