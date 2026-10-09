// The earlier, lab-based version of the talk. Open it with ?legacy (and ?legacy&presenter).
import "@fontsource-variable/bricolage-grotesque";
import { switchVariant, type VariantId } from "./variants";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { Presenter } from "./components/Presenter";
import { bootStore, useStore } from "./lib/store";
import { bootFlow, resetFlow } from "./lib/flow";
import { isPresenter, startSync } from "./lib/sync";
import { revealJudge, runScene } from "./lib/runner";
import { selectedCase, TRIES } from "./components/Lab";
import { movePhrase } from "./lib/store";
import { SCENES } from "./scenes";
import { applyStageSize, toggleStageSize } from "./lib/stage";


export function start() {
// Commands sent from the presenter window run here, in the projector window that owns the lab state.
if (!isPresenter) applyStageSize();

startSync((command) => {
  const s = useStore.getState();
  const scene = SCENES[s.sceneIndex];
  if (command === "replay") return s.toggleReplay();
  if (command === "reset") return s.resetLabs(), resetFlow();
  if (command === "zoom") return toggleStageSize();
  if (command.startsWith("model:")) return s.setModelOverride(command.slice(6));
  if (command.startsWith("variant:")) return switchVariant(command.slice(8) as VariantId);
  if (scene.kind !== "lab") return;
  if (command === "compare") window.dispatchEvent(new Event("toggle-compare"));
  if (command === "run") runScene(scene, 1, selectedCase(scene, s.lab(scene)).id);
  if (command === "run10") runScene(scene, TRIES, selectedCase(scene, s.lab(scene)).id);
  if (command === "all") runScene(scene, 1);
  if (command === "up") movePhrase(scene, -1);
  if (command === "down") movePhrase(scene, 1);
  if (command === "fix") s.setVersion(scene, s.lab(scene).versionIdx + 1);
  if (command === "unfix") s.setVersion(scene, s.lab(scene).versionIdx - 1);
  if (command === "judge") revealJudge(scene);
});

if (isPresenter) document.documentElement.dataset.theme = useStore.getState().theme;
// Load saved state before the first render, so nothing on screen starts work that a late load would overwrite.
Promise.all([bootStore(), bootFlow()])
  .catch((e) => console.error("Couldn't restore saved state", e))
  .finally(() => createRoot(document.getElementById("root")!).render(isPresenter ? <Presenter /> : <App />));
}
