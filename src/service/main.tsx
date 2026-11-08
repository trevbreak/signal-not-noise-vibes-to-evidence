import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./talk.css";
import { createRoot } from "react-dom/client";
import { Talk } from "./Talk";
import { Presenter } from "./Presenter";
import { persist, restore } from "./store";
import { claimOwnership, isPresenter, startSync } from "./sync";
import { startLiveWorker } from "./live";

export async function start() {
  // Only the owner restores, saves and runs live calls; the presenter and any extra projector window mirror it.
  if (await claimOwnership()) {
    restore();
    persist();
    startLiveWorker();
  }
  startSync();
  createRoot(document.getElementById("root")!).render(isPresenter ? <Presenter /> : <Talk />);
}
