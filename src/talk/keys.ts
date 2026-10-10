import { useEffect } from "react";
import { stepOf, useTalk } from "./store";
import { dispatch, isPresenter } from "./sync";

// One key map for both windows. A clicker sends → ← (or PageDown PageUp), so those always work.
//
//   → PageDown Space   next step          ← PageUp   back one step
//   1–5                the room's vote     ↑ ↓        thumbs, or move the needle (1.3)
//   E  Enter           type the room's words where the step takes them (Enter again to keep, Esc to drop)
//   X                  remove the room's last notice (1.2)
//   B  .               black screen        F          full screen (projector)   O   open the presenter window

export function useKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el instanceof Element && el.closest("input, textarea, select")) return;
      const step = stepOf(useTalk.getState());
      const k = e.key;
      const go = (fn: () => void) => {
        e.preventDefault();
        fn();
      };
      if (k === "ArrowRight" || k === "PageDown" || k === " ") return go(() => dispatch("next"));
      if (k === "ArrowLeft" || k === "PageUp") return go(() => dispatch("prev"));
      if (/^[1-5]$/.test(k)) return go(() => dispatch("numberKey", Number(k)));
      if (k === "ArrowUp" || k === "ArrowDown") return go(() => dispatch("upDown", k === "ArrowUp"));
      if (k === "e" || k === "E") return go(() => dispatch("startEdit"));
      if (k === "Enter") return go(() => dispatch(step.field ? "startEdit" : "next"));
      if (k === "x" || k === "X") return go(() => dispatch("removeLastNotice"));
      if (k === "b" || k === "B" || k === ".") return go(() => dispatch("toggleBlackout"));
      if (!isPresenter && (k === "f" || k === "F")) return go(() => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()));
      if (!isPresenter && (k === "o" || k === "O")) return go(() => void window.open(`${location.pathname}?presenter`, "signal-presenter", "width=1440,height=900"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
