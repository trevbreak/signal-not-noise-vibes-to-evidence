import { useState } from "react";
import { post } from "../lib/api";
import { compose, currentModel, judgeOutput } from "../lib/runner";
import { PROMPTS, V } from "../scenes";
import type { AudioScene, Judge, Verdict } from "../lib/types";
import { Judging } from "./Judging";

// One story: the same judges we use on text work on voice too, but only once the audio has been
// turned back into text. And that transcription step can be the thing that fails.

const { notice: NOTICE, context: CONTEXT, voice: VOICE } = V.audio;

const LISTENERS = [
  { id: "gpt-4o-transcribe", label: "Best listener" },
  { id: "whisper-1", label: "Cheaper listener" },
] as const;

// The same judges as the text lab: a simple rule and an AI judge with the marking guide.
const JUDGES: Judge[] = [
  { id: "numbers", name: "Numbers kept", kind: "code", check: "numbers", blurb: "Every number is still there" },
  {
    id: "obligation",
    name: "Still a rule",
    kind: "llm",
    withContext: true,
    blurb: "Still a clear rule, same limit",
    rubric:
      "Every rule keeps its strength and its details. 'Do not' stays a clear 'do not'. Changing a limit, number or measure fails. Softening the rule fails.",
  },
];

type Verdicts = Record<string, Verdict>;

export function AudioLab({ scene }: { scene: AudioScene }) {
  const [english, setEnglish] = useState(NOTICE);
  const [aussie, setAussie] = useState("");
  const [textVerdicts, setTextVerdicts] = useState<Verdicts>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [room, setRoom] = useState<boolean | null>(null);
  const [listener, setListener] = useState<(typeof LISTENERS)[number]["id"]>("gpt-4o-transcribe");
  const [heard, setHeard] = useState<Record<string, string>>({});
  const [heardVerdicts, setHeardVerdicts] = useState<Record<string, Verdicts>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcript = heard[listener];
  const tv = heardVerdicts[listener] ?? {};

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const aussify = () =>
    run(V.verbing, async () => {
      const res = await post<{ text: string }>("/api/translate", { model: currentModel(), user: compose(PROMPTS.v3.instructions, english) });
      const text = res.text.trim();
      setAussie(text);
      setTextVerdicts({});
      setAudioUrl(null);
      setRoom(null);
      setHeard({});
      setHeardVerdicts({});
      await judgeOutput(JUDGES, english, text, CONTEXT, (id, v) => setTextVerdicts((x) => ({ ...x, [id]: v })));
    });

  const speak = () =>
    run("Speaking…", async () => {
      const res = await post<{ url: string }>("/api/tts", { text: aussie, instructions: VOICE });
      setAudioUrl(res.url);
      // Autoplay can be blocked; the player is right there if so.
      new Audio(res.url).play().catch(() => {});
    });

  const listen = () =>
    run("Listening back…", async () => {
      if (!audioUrl) return;
      const res = await post<{ text: string }>("/api/transcribe", { url: audioUrl, model: listener });
      setHeard((h) => ({ ...h, [listener]: res.text }));
      setHeardVerdicts((h) => ({ ...h, [listener]: {} }));
      await judgeOutput(JUDGES, english, res.text, CONTEXT, (id, v) =>
        setHeardVerdicts((h) => ({ ...h, [listener]: { ...h[listener], [id]: v } })),
      );
    });

  const textPassed = JUDGES.every((j) => textVerdicts[j.id]?.pass);
  const heardDone = JUDGES.every((j) => tv[j.id]);
  const heardPassed = JUDGES.every((j) => tv[j.id]?.pass);
  const match = transcript ? wordMatch(aussie, transcript) : null;

  return (
    <div className="workbench audio2">
      <h2>{scene.title}</h2>
      <p className="setup">Same judges as before. But a judge can only read text, so first we have to turn the voice back into words.</p>

      <div className="pipeline">
        <Stage n={1} title="The English">
          <textarea className="textbox" rows={3} value={english} onChange={(e) => setEnglish(e.target.value)} />
        </Stage>

        <Stage n={2} title={V.audio.textTitle} action={<button className="btn primary" disabled={!!busy} onClick={aussify}>{V.verb}</button>}>
          {aussie ? <div className="stage-text">{aussie}</div> : <div className="stage-empty">The translation</div>}
          <Marks verdicts={textVerdicts} runKey={aussie || null} title="Then the judges mark it" />
        </Stage>

        <Stage
          n={3}
          title="The voice"
          action={
            <button className="btn primary" disabled={!!busy || !aussie} onClick={speak}>
              ▶ Speak it
            </button>
          }
        >
          {audioUrl ? (
            <>
              <audio className="player" src={audioUrl} controls />
              <div className="room">
                <span>The room: did it say the same thing?</span>
                <button className={room === true ? "on pass" : ""} onClick={() => setRoom(true)} aria-label="Yes">
                  👍
                </button>
                <button className={room === false ? "on fail" : ""} onClick={() => setRoom(false)} aria-label="No">
                  👎
                </button>
              </div>
            </>
          ) : (
            <div className="stage-empty">{V.audio.spokenBlurb}</div>
          )}
        </Stage>

        <Stage
          n={4}
          title="What the AI heard"
          action={
            <button className="btn primary" disabled={!!busy || !audioUrl} onClick={listen}>
              👂 Listen back
            </button>
          }
        >
          <div className="seg small" role="group" aria-label="Listener">
            {LISTENERS.map((l) => (
              <button key={l.id} className={l.id === listener ? "on" : ""} onClick={() => setListener(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
          {transcript ? (
            <>
              <div className="stage-text">
                <Diff said={aussie} heard={transcript} />
              </div>
              {match && (
                <div className="heard-same">
                  <span className="kind code">Rule</span> Heard = said: {match.same} of {match.total} words
                </div>
              )}
            </>
          ) : (
            <div className="stage-empty">The voice, turned back into text</div>
          )}
          <Marks verdicts={tv} runKey={transcript ? listener + transcript : null} title="The same judges mark what it heard" />
        </Stage>
      </div>

      {busy && <div className="thinking">{busy}</div>}
      {error && <div className="error">{error}</div>}

      {heardDone && (
        <div className="diagnosis">
          {textPassed && !heardPassed ? (
            <>
              <strong>The text passed{room ? " and the room heard it fine" : ""}. The judge failed what the AI heard.</strong>
              <span>
                It's not the voice that broke. It's the listening step: the step we added so we could mark it. Highlighted words are
                where the transcript and the text don't match.
              </span>
            </>
          ) : heardPassed ? (
            <>
              <strong>Passed this time.</strong>
              <span>Try the other listener, or speak it again. Each step can fail on its own, and each one needs checking.</span>
            </>
          ) : (
            <>
              <strong>The text failed before it was ever spoken.</strong>
              <span>Fix the translation first: the voice can't fix it for you.</span>
            </>
          )}
          <em>Test the output, and every step that turns it into something you can mark.</em>
        </div>
      )}
    </div>
  );
}

function Stage(props: { n: number; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="pstage">
      <div className="step-head">
        <span className="step-n">{props.n}</span>
        <div className="step-title">{props.title}</div>
      </div>
      <div className="pstage-body">{props.children}</div>
      {props.action && <div className="pstage-action">{props.action}</div>}
    </section>
  );
}

function Marks({ verdicts, runKey, title }: { verdicts: Verdicts; runKey: string | null; title: string }) {
  return <Judging runKey={runKey} title={title} lines={JUDGES.map((j) => ({ id: j.id, name: j.name, kind: j.kind, blurb: j.blurb, verdict: verdicts[j.id] ?? "pending" }))} />;
}

const key = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
// Dashes join words in writing ("team—if") but not in speech: split on them too.
const words = (s: string) => s.replace(/[*#]/g, "").split(/[\s—–]+/).filter((w) => key(w));

/** Longest common subsequence over words: which heard words line up with what was said. */
function align(said: string[], heard: string[]) {
  const a = said.map(key);
  const b = heard.map(key);
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const matched = new Set<number>();
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      matched.add(j);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { matched, same: dp[0][0] };
}

function wordMatch(said: string, heard: string) {
  const s = words(said);
  return { same: align(s, words(heard)).same, total: s.length };
}

function Diff({ said, heard }: { said: string; heard: string }) {
  const h = words(heard);
  const { matched } = align(words(said), h);
  return (
    <>
      {h.map((w, i) => (
        <span key={i}>
          {matched.has(i) ? w : <mark className="misheard">{w}</mark>}{" "}
        </span>
      ))}
    </>
  );
}
