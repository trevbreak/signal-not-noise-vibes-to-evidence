import { useEffect, useRef } from "react";
import { BEATS } from "./content";
import { Stage } from "./Stage";
import { useTalk } from "./store";
import { useKeys } from "./keys";

// The projector window: the stage, full window, and nothing else.

export function Talk() {
  const state = useTalk();
  useKeys();
  const dark = !!BEATS[state.beat].dark || state.blackout;
  return (
    <div className={`frame-fill ${dark ? "dark" : ""}`}>
      <Stage state={state} onFreeze={(v) => useTalk.getState().setNeedleFrozen(v)} />
      {state.editing && <EditCapture />}
    </div>
  );
}

/** While the room's words are being typed on the projector itself, an off-screen box catches the keys. */
function EditCapture() {
  const ref = useRef<HTMLInputElement>(null);
  const draft = useTalk((s) => s.draft);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <input
      ref={ref}
      className="edit-capture"
      aria-label="Type the room's words"
      value={draft}
      onChange={(e) => useTalk.getState().setDraft(e.target.value)}
      onBlur={() => setTimeout(() => ref.current?.focus(), 0)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          useTalk.getState().commitEdit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          useTalk.getState().cancelEdit();
        }
      }}
    />
  );
}
