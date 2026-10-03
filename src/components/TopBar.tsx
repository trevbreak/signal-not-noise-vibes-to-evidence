import { useStore } from "../lib/store";
import { LOOP } from "../scenes";
import type { Scene } from "../lib/types";

export function TopBar({ scene }: { scene: Scene }) {
  const health = useStore((s) => s.health);
  const replay = useStore((s) => s.replay);

  return (
    <header className="topbar">
      <div className="act">
        {scene.act}
        {scene.kind !== "slide" && <small>{scene.title}</small>}
      </div>
      <div className="spacer" />
      {scene.stage && (
        <ol className="stepper" aria-label="Where we are in the loop">
          {LOOP.map((st) => (
            <li key={st.id} className={st.id === scene.stage ? "on" : ""} aria-current={st.id === scene.stage ? "step" : undefined}>
              {st.label}
            </li>
          ))}
        </ol>
      )}
      {replay && <span className="badge replay">REPLAY · recorded responses</span>}
      {health && (!health.anthropic || !health.openai) && (
        <span className="badge bad" title="Add the missing key to .env and restart">
          {!health.anthropic && !health.openai ? "No API keys" : !health.anthropic ? "No Claude key" : "No OpenAI key"}
        </span>
      )}
      <Meters vibes={scene.meters.vibes} evidence={scene.meters.evidence} />
    </header>
  );
}

function Meters({ vibes, evidence }: { vibes: number; evidence: number }) {
  return (
    <div className="meters" aria-label={`Vibes ${vibes}%, evidence ${evidence}%`}>
      <div className="meter vibes">
        <span className="label">Vibes</span>
        <div className="track">
          <div className="fill" style={{ width: `${vibes}%` }} />
        </div>
        <span className="num">{vibes}%</span>
      </div>
      <div className="meter evidence">
        <span className="label">Evidence</span>
        <div className="track">
          <div className="fill" style={{ width: `${evidence}%` }} />
        </div>
        <span className="num">{evidence}%</span>
      </div>
    </div>
  );
}
