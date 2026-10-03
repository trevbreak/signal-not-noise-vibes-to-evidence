import { useEffect, useMemo, useRef, useState } from "react";
import { judgesOn, labKey, useStore, type LabState } from "../lib/store";
import { addCustomCase, judgeAllExisting, runScene, setHumanVerdict } from "../lib/runner";
import { APP_NAME, PROMPTS, V } from "../scenes";
import type { Case, Judge, LabScene, RunResult, Verdict } from "../lib/types";
import { Judging, type JudgeLine } from "./Judging";

export const KIND_LABEL = { code: "Rule", llm: "AI judge", human: "People" } as const;
export const TRIES = 5;

/** Models love markdown. Show it the way a real app would, not as raw # and ** characters. */
export function Pretty({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n+/).map((line, i) => {
        const heading = /^#{1,6}\s+/.test(line);
        const parts = line.replace(/^#{1,6}\s+/, "").split(/\*\*(.+?)\*\*/g);
        return (
          <span key={i} className={`pline ${heading ? "h" : ""}`}>
            {parts.map((p, k) => (k % 2 ? <strong key={k}>{p}</strong> : p.replace(/\*(.+?)\*/g, "$1")))}
          </span>
        );
      })}
    </>
  );
}

export const selectedCase = (scene: LabScene, lab: LabState): Case => {
  const all = [...scene.cases, ...lab.customCases];
  return all.find((c) => c.id === lab.selectedCaseId) ?? all[0];
};

export function Lab({ scene }: { scene: LabScene }) {
  const lab = useStore((s) => s.labs[labKey(scene)]) ?? useStore.getState().lab(scene);
  const running = useStore((s) => !!s.running[labKey(scene)]);
  const patchLab = useStore((s) => s.patchLab);
  const setVersion = useStore((s) => s.setVersion);
  const cases = [...scene.cases, ...lab.customCases];
  const selected = selectedCase(scene, lab);
  const judges = scene.judges.filter((j) => judgesOn(scene, lab).includes(j.id));
  const automated = judges.filter((j) => j.kind !== "human");

  useEffect(() => {
    if (!scene.enterVersion) return;
    const i = scene.versions.indexOf(scene.enterVersion);
    if (i > lab.versionIdx) setVersion(scene, i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // From the Test section on, every answer gets marked, including ones already on screen.
  // Keyed on how many answers still need marking, so answers restored after a refresh get marked too.
  const unmarked = Object.values(lab.results)
    .flat()
    .filter((r) => r.output && automated.some((j) => !r.verdicts[j.id])).length;
  useEffect(() => {
    if (unmarked) judgeAllExisting(scene);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, unmarked]);

  // Side by side: once the new version has answered something, compare it with the last one.
  const canCompare = !!scene.compare && Object.keys(lab.before).length > 0 && Object.values(lab.results).some((r) => r.length);
  const [view, setView] = useState<"compare" | "app">("compare");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "s" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("textarea, input")) return;
      setView((v) => (v === "compare" ? "app" : "compare"));
    };
    const toggle = () => setView((v) => (v === "compare" ? "app" : "compare"));
    window.addEventListener("keydown", onKey);
    window.addEventListener("toggle-compare", toggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("toggle-compare", toggle);
    };
  }, []);

  // Phrase-level score: a phrase passes if its latest answer passes every automated check.
  const firsts = cases.map((c) => lab.results[c.id]?.[0]).filter((r): r is RunResult => !!r?.output);
  const scored = firsts.filter((r) => automated.every((j) => isVerdict(r.verdicts[j.id])));
  const passed = scored.filter((r) => automated.every((j) => (r.verdicts[j.id] as Verdict).pass));

  return (
    <div className="lab2">
      <section className="panel">
        <div className="step">
          <div className="step-head">
            <span className="step-n">1</span>
            <div>
              <div className="step-title">The instructions</div>
              <div className="step-sub">What we told the AI. The same for every phrase.</div>
            </div>
          </div>
          {lab.maxVersionIdx > 0 && (
            <div className="versions" role="tablist" aria-label="Version of the instructions">
              {scene.versions.slice(0, lab.maxVersionIdx + 1).map((v, i) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={i === lab.versionIdx}
                  className={i === lab.versionIdx ? "on" : ""}
                  onClick={() => setVersion(scene, i)}
                >
                  {PROMPTS[v].label}
                </button>
              ))}
            </div>
          )}
          <Instructions
            value={lab.instructions}
            previous={lab.previousInstructions}
            revealKey={lab.revealKey}
            edited={lab.edited}
            onChange={(instructions) => patchLab(scene, { instructions, edited: true })}
          />
        </div>

        <div className="op" aria-hidden>
          +
        </div>

        <div className="step grow">
          <div className="step-head">
            <span className="step-n">2</span>
            <div>
              <div className="step-title">The English</div>
              <div className="step-sub">What someone types in. Pick one to try.</div>
            </div>
          </div>
          <div className="phrases" role="listbox" aria-label="Phrases">
            {cases.map((c) => (
              <PhraseRow
                key={c.id}
                phrase={c}
                result={lab.results[c.id]?.[0]}
                tries={lab.results[c.id]?.length ?? 0}
                judges={judges}
                selected={c.id === selected.id}
                onSelect={() => patchLab(scene, { selectedCaseId: c.id })}
              />
            ))}
          </div>
          <div className="actions">
            <button className="btn primary" disabled={running} onClick={() => runScene(scene, 1, selected.id)}>
              Translate <kbd>space</kbd>
            </button>
            <button className="btn" disabled={running} onClick={() => runScene(scene, TRIES, selected.id)}>
              Try it {TRIES} times <kbd>R</kbd>
            </button>
            <button className="btn" disabled={running} onClick={() => runScene(scene, 1)}>
              All phrases <kbd>A</kbd>
            </button>
            {automated.length > 0 && scored.length > 0 && (
              <span className="score">
                <strong style={{ color: passed.length === scored.length ? "var(--pass)" : "var(--fail)" }}>
                  {passed.length} of {scored.length}
                </strong>{" "}
                passed every check
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="op eq" aria-hidden>
        =
      </div>
      <section className="stagecol">
        <div className="step-head">
          <span className="step-n">3</span>
          <div>
            <div className="step-title">What comes out</div>
            <div className="step-sub">What the person using our app sees.</div>
          </div>
        </div>
        {canCompare && (
          <div className="seg small view-tabs" role="tablist" aria-label="View">
            <button role="tab" aria-selected={view === "compare"} className={view === "compare" ? "on" : ""} onClick={() => setView("compare")}>
              Side by side <kbd>S</kbd>
            </button>
            <button role="tab" aria-selected={view === "app"} className={view === "app" ? "on" : ""} onClick={() => setView("app")}>
              The app
            </button>
          </div>
        )}
        {canCompare && view === "compare" ? (
          <Compare
            cases={cases}
            lab={lab}
            selectedId={selected.id}
            onSelect={(id) => patchLab(scene, { selectedCaseId: id })}
            nowLabel={PROMPTS[scene.versions[lab.versionIdx]].label.split(" · ")[0] + (lab.edited ? " (edited)" : "")}
          />
        ) : (
          <AppMock
            scene={scene}
            phrase={selected}
            runs={lab.results[selected.id] ?? []}
            before={lab.before[selected.id]}
            judges={judges}
            running={running}
          />
        )}
        {judges.length > 0 && <Scorecard scene={scene} phrase={selected} runs={lab.results[selected.id] ?? []} judges={judges} />}
      </section>
    </div>
  );
}

// ── Side by side: every phrase, the previous version vs this one ─────────────

function Compare(props: { cases: Case[]; lab: LabState; selectedId: string; onSelect: (id: string) => void; nowLabel: string }) {
  const beforeLabel = Object.values(props.lab.before)[0]?.label ?? "Before";
  return (
    <div className="compare" aria-label="Side by side">
      <div className="compare-head">
        <span />
        <span>{beforeLabel}</span>
        <span className="now">{props.nowLabel}</span>
      </div>
      {props.cases.map((c) => {
        const before = props.lab.before[c.id];
        const run = props.lab.results[c.id]?.[0];
        return (
          <button key={c.id} className={`compare-row ${c.id === props.selectedId ? "selected" : ""}`} onClick={() => props.onSelect(c.id)}>
            <span className="compare-src">{c.text}</span>
            <span className="compare-out before">{before ? <Pretty text={before.output} /> : <span className="placeholder">–</span>}</span>
            <span className="compare-out now">
              {run?.error ? (
                <span className="err">{run.error}</span>
              ) : run?.output ? (
                <Pretty text={run.output} />
              ) : run ? (
                <span className="placeholder thinking">Translating</span>
              ) : (
                <span className="placeholder">Not run yet</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── The app: what the person using our translator sees ───────────────────────

function AppMock(props: {
  scene: LabScene;
  phrase: Case;
  runs: RunResult[];
  before?: { label: string; output: string };
  judges: Judge[];
  running: boolean;
}) {
  const [draft, setDraft] = useState(props.phrase.text);
  useEffect(() => setDraft(props.phrase.text), [props.phrase.id, props.phrase.text]);
  const isNew = draft.trim() !== "" && draft.trim() !== props.phrase.text;
  const result = props.runs[0];
  const many = props.runs.length > 1;

  const translate = () => {
    if (!draft.trim()) return;
    if (isNew) addCustomCase(props.scene, draft.trim());
    else runScene(props.scene, 1, props.phrase.id);
  };

  return (
    <div className="appmock tall" aria-label={APP_NAME}>
      <div className="appmock-bar">
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="brand">
          <span className="logo" aria-hidden>
            {V.logo}
          </span>
          {APP_NAME}
        </span>
      </div>
      <div className="pane">
        <div className="lang">English</div>
        <textarea
          aria-label="English text"
          rows={2}
          placeholder="Type something…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              translate();
            }
          }}
        />
        <div className="appmock-foot">
          <button className="translate" disabled={props.running || !draft.trim()} onClick={translate}>
            Translate ✨
          </button>
        </div>
      </div>
      <div className="pane out">
        <div className="lang">
          {V.outLabel}
          {many && <span className="tries-count">{triesHeadline(props.runs)}</span>}
        </div>
        {isNew ? (
          <div className="result placeholder">Press Translate</div>
        ) : many ? (
          <Tries runs={props.runs} judges={props.judges} />
        ) : (
          <div className="result" aria-live="polite">
            {result?.error ? (
              <span className="err">{result.error}</span>
            ) : result?.output ? (
              <Pretty text={result.output} />
            ) : result ? (
              <span className="placeholder thinking">Translating</span>
            ) : (
              <span className="placeholder">Press Translate</span>
            )}
          </div>
        )}
        {props.before && !isNew && (
          <div className="before">
            <span className="before-label">{props.before.label} said</span>
            <Pretty text={props.before.output} />
          </div>
        )}
      </div>
    </div>
  );
}

function triesHeadline(runs: RunResult[]) {
  const done = runs.filter((r) => r.output);
  if (done.length < runs.length) return `${runs.length} tries…`;
  const distinct = new Set(done.map((r) => normalise(r.output!))).size;
  return distinct === 1 ? `${runs.length} tries, the same answer every time` : `${runs.length} tries, ${distinct} different answers`;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ")
    .trim();
const wordKey = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");

/** Every try, with the words that differ between tries highlighted. */
function Tries({ runs, judges }: { runs: RunResult[]; judges: Judge[] }) {
  const done = runs.filter((r) => r.output);
  // How many tries use each word. Words in every try stay plain; the rest light up.
  const counts = new Map<string, number>();
  for (const r of done) for (const k of new Set(r.output!.split(/\s+/).map(wordKey))) counts.set(k, (counts.get(k) ?? 0) + 1);
  const auto = judges.filter((j) => j.kind !== "human");

  return (
    <ol className="tries">
      {runs.map((r, i) => {
        const status = runStatus(r, judges);
        return (
          <li key={r.runId} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={`try-n ${auto.length ? status : ""}`}>{i + 1}</span>
            {r.error ? (
              <span className="err">{r.error}</span>
            ) : r.output ? (
              <span>
                {r.output
                  .replace(/^#+\s*/gm, "")
                  .replace(/\*\*/g, "")
                  .split(/(\s+)/)
                  .map((w, k) => {
                    if (/^\s+$/.test(w)) return w;
                    // Only words that no other try used light up: enough to see each answer went its own way.
                    const unique = done.length > 1 && (counts.get(wordKey(w)) ?? 0) === 1;
                    return unique ? <mark key={k}>{w}</mark> : w;
                  })}
              </span>
            ) : (
              <span className="placeholder thinking">Translating</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── How the selected answer scored ──────────────────────────────────────────

function Scorecard(props: { scene: LabScene; phrase: Case; runs: RunResult[]; judges: Judge[] }) {
  const run = props.runs[0];
  const many = props.runs.length > 1;
  const marked = (r: RunResult, j: Judge) => isVerdict(r.verdicts[j.id]);
  // Five answers can't share one vote: the room marks a single answer.
  const lines: JudgeLine[] = props.judges.filter((j) => !many || j.kind !== "human").map((j) => {
    const v = run?.verdicts[j.id];
    if (j.kind === "human") {
      return {
        id: j.id,
        name: j.name,
        kind: j.kind,
        blurb: j.blurb,
        verdict: v,
        vote: (
          <span className="vote">
            {(["yes", "no"] as const).map((x) => (
              <button
                key={x}
                className={isVerdict(v) && v.pass === (x === "yes") ? `on ${x === "yes" ? "pass" : "fail"}` : ""}
                aria-label={`The room says ${x}`}
                disabled={!run?.output}
                onClick={() => setHumanVerdict(props.scene, props.phrase.id, run!.runId, j.id, x === "yes")}
              >
                {x === "yes" ? "👍" : "👎"}
              </button>
            ))}
          </span>
        ),
      };
    }
    // Several tries: how many passed this judge, once every try has been marked.
    if (many && props.runs.every((r) => r.error || marked(r, j))) {
      return { id: j.id, name: j.name, kind: j.kind, blurb: j.blurb, tally: { passed: props.runs.filter((r) => (r.verdicts[j.id] as Verdict | undefined)?.pass).length, total: props.runs.length } };
    }
    return { id: j.id, name: j.name, kind: j.kind, blurb: j.blurb, verdict: many ? "pending" : v };
  });
  const auto = props.judges.filter((j) => j.kind !== "human");
  const allPassed = props.runs.filter((r) => auto.every((j) => (r.verdicts[j.id] as Verdict | undefined)?.pass)).length;
  return (
    <Judging
      lines={lines}
      runKey={run?.output ? props.runs.map((r) => r.runId).join() : null}
      title={many ? `Then the judges mark all ${props.runs.length} tries` : undefined}
      compact={many}
      overall={
        many ? (
          <>
            {allPassed === props.runs.length ? "✓" : "✗"} {allPassed} of {props.runs.length} tries <span>passed every check</span>
          </>
        ) : undefined
      }
    />
  );
}

// ── Instructions box, with a typewriter reveal for whatever a new version adds ──

function Instructions(props: {
  value: string;
  previous: string;
  revealKey: number;
  edited: boolean;
  onChange: (v: string) => void;
}) {
  const [revealing, setRevealing] = useState(false);
  const [shown, setShown] = useState(0);
  // Only animate version changes that happen while this scene is on screen, not on arrival.
  const mountedKey = useRef(props.revealKey);

  const lines = useMemo(() => {
    const prev = new Set(props.previous.split("\n"));
    return props.value.split("\n").map((text) => ({ text, added: !prev.has(text) && text.trim() !== "" }));
  }, [props.value, props.previous]);
  const addedChars = lines.filter((l) => l.added).reduce((n, l) => n + l.text.length, 0);

  useEffect(() => {
    if (props.revealKey === mountedKey.current || !addedChars) return;
    setRevealing(true);
    setShown(0);
    const step = Math.max(2, Math.ceil(addedChars / 110));
    const t = setInterval(() => {
      setShown((n) => {
        if (n + step >= addedChars) {
          clearInterval(t);
          setTimeout(() => setRevealing(false), 1400);
          return addedChars;
        }
        return n + step;
      });
    }, 22);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.revealKey]);

  if (revealing) {
    let budget = shown;
    return (
      <div className="instructions">
        <div className="reveal" onClick={() => setRevealing(false)}>
          {lines.map((l, i) => {
            if (!l.added) return <div key={i}>{l.text || " "}</div>;
            const visible = l.text.slice(0, Math.max(0, budget));
            const typing = budget > 0 && budget < l.text.length;
            budget -= l.text.length;
            return visible ? (
              <div key={i}>
                <span className="added">{visible}</span>
                {typing && <span className="caret">&nbsp;</span>}
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="instructions">
      {props.edited && <span className="edited-flag">edited live</span>}
      <textarea aria-label="Instructions" value={props.value} spellCheck={false} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  );
}

// ── A phrase in the list, with a dot per check ──────────────────────────────

function isVerdict(v: Verdict | "pending" | undefined): v is Verdict {
  return !!v && v !== "pending";
}

function runStatus(r: RunResult, judges: Judge[]): "pass" | "fail" | "pending" | "none" {
  if (r.error) return "fail";
  const auto = judges.filter((j) => j.kind !== "human");
  if (!auto.length) return r.output ? "none" : "pending";
  if (!r.output || auto.some((j) => !isVerdict(r.verdicts[j.id]))) return "pending";
  return auto.every((j) => (r.verdicts[j.id] as Verdict).pass) ? "pass" : "fail";
}

function PhraseRow(props: {
  phrase: Case;
  result?: RunResult;
  tries: number;
  judges: Judge[];
  selected: boolean;
  onSelect: () => void;
}) {
  const r = props.result;
  return (
    <button role="option" aria-selected={props.selected} className={`phrase ${props.selected ? "selected" : ""}`} onClick={props.onSelect}>
      <span className="phrase-text">{props.phrase.text}</span>
      <span className="phrase-status">
        {props.tries > 1 && <span className="tries-pill">×{props.tries}</span>}
        {r && !r.output && !r.error && <span className="dot pending" title="Translating" />}
        {r?.output &&
          (props.judges.length ? (
            props.judges.map((j) => {
              const v = r.verdicts[j.id];
              const cls = v === "pending" ? "pending" : isVerdict(v) ? (v.pass ? "pass" : "fail") : "";
              return (
                <span key={j.id} className={`dot ${cls}`} title={`${j.name}: ${isVerdict(v) ? (v.pass ? "pass" : "fail") : "not marked"}`} />
              );
            })
          ) : (
            <span className="dot done" title="Translated" />
          ))}
        {r?.error && <span className="dot fail" title={r.error} />}
      </span>
    </button>
  );
}
