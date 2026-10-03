import { useEffect } from "react";
import { SCENES } from "./scenes";
import { useStore } from "./lib/store";
import { revealJudge, runScene } from "./lib/runner";
import { selectedCase, TRIES } from "./components/Lab";
import { movePhrase } from "./lib/store";
import type { LabScene } from "./lib/types";
import { Slide } from "./components/Slide";
import { Lab } from "./components/Lab";
import { ImageLab } from "./components/ImageLab";
import { AudioLab } from "./components/AudioLab";
import { Traces } from "./components/Traces";
import { Scoreboard } from "./components/Scoreboard";
import { TopBar } from "./components/TopBar";
import { Golden } from "./components/Golden";
import { Review } from "./components/Review";
import { Improve } from "./components/Improve";
import { Rerun } from "./components/Rerun";
import { toggleStageSize } from "./lib/stage";

export function App() {
  const sceneIndex = useStore((s) => s.sceneIndex);
  const theme = useStore((s) => s.theme);
  const notesOpen = useStore((s) => s.notesOpen);
  const build = useStore((s) => s.build);
  const scene = SCENES[sceneIndex];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.tagName === "SELECT";
      if (typing) {
        if (e.key === "Escape") el.blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useStore.getState();
      const current = SCENES[s.sceneIndex];
      const lab = current.kind === "lab" ? (current as LabScene) : null;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          s.go(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          s.go(-1);
          break;
        case " ":
        case "Enter":
          if (lab) {
            e.preventDefault();
            runScene(lab, 1, selectedCase(lab, s.lab(lab)).id);
          }
          break;
        case "r":
          if (lab) runScene(lab, TRIES, selectedCase(lab, s.lab(lab)).id);
          break;
        case "a":
          if (lab) runScene(lab, 1);
          break;
        case "ArrowDown":
        case "ArrowUp":
          if (lab) {
            e.preventDefault();
            movePhrase(lab, e.key === "ArrowDown" ? 1 : -1);
          }
          break;
        case "f":
          if (lab) s.setVersion(lab, s.lab(lab).versionIdx + 1);
          break;
        case "b":
          if (lab) s.setVersion(lab, s.lab(lab).versionIdx - 1);
          break;
        case "j":
          if (lab) revealJudge(lab);
          break;
        case "p":
          s.toggleReplay();
          break;
        case "n":
          s.toggleNotes();
          break;
        case "t":
          s.toggleTheme();
          break;
        case "z":
          toggleStageSize();
          break;
        case "o":
          window.open(`/?presenter#${s.sceneIndex}`, "strine-presenter", "width=1100,height=800");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <TopBar scene={scene} />
      <main className="stage" key={scene.id}>
        {scene.kind === "slide" && <Slide scene={scene} />}
        {scene.kind === "lab" && <Lab scene={scene} />}
        {scene.kind === "image" && <ImageLab scene={scene} />}
        {scene.kind === "audio" && <AudioLab scene={scene} />}
        {scene.kind === "traces" && <Traces scene={scene} />}
        {scene.kind === "scoreboard" && <Scoreboard scene={scene} />}
        {scene.kind === "golden" && <Golden scene={scene} />}
        {scene.kind === "review" && <Review scene={scene} />}
        {scene.kind === "improve" && <Improve scene={scene} />}
        {scene.kind === "rerun" && <Rerun scene={scene} />}
      </main>
      <Footer />
      {notesOpen && (scene.notes || ("talk" in scene && scene.talk)) && (
        <aside className="notes" aria-label="Speaker notes">
          <h4>Speaker notes · {scene.act}</h4>
          {("talk" in scene && scene.talk?.[build]) || scene.notes}
        </aside>
      )}
    </div>
  );
}

function Footer() {
  const sceneIndex = useStore((s) => s.sceneIndex);
  const goTo = useStore((s) => s.goTo);
  return (
    <footer className="footer">
      <div className="dots">
        {SCENES.map((sc, i) => (
          <button
            key={sc.id}
            className={`dot ${i === sceneIndex ? "on" : ""}`}
            title={`${i + 1}. ${sc.act}`}
            aria-label={`Go to scene ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <span>
        {sceneIndex + 1}/{SCENES.length}
      </span>
    </footer>
  );
}
