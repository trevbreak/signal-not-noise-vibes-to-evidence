import { useStore } from "./store";

// Keeps the projector window and the presenter window (?presenter) on the same scene.
// The presenter window can also send lab commands (run, fix…) that the projector window executes.

export type Command = "run" | "run10" | "fix" | "unfix" | "replay" | "judge" | "reset" | "all" | "up" | "down" | "compare" | `model:${string}` | `variant:${string}`;
type Msg = { type: "scene"; index: number; build: number } | { type: "command"; command: Command } | { type: "hello" };

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("strine-o-matic") : null;
export const isPresenter = new URLSearchParams(location.search).has("presenter");

export function startSync(onCommand: (c: Command) => void) {
  if (!channel) return;
  let applying = false;
  useStore.subscribe((s, prev) => {
    if (!applying && (s.sceneIndex !== prev.sceneIndex || s.build !== prev.build))
      channel.postMessage({ type: "scene", index: s.sceneIndex, build: s.build } satisfies Msg);
  });
  channel.onmessage = (e: MessageEvent<Msg>) => {
    const msg = e.data;
    if (msg.type === "scene") {
      const s = useStore.getState();
      if (msg.index === s.sceneIndex && msg.build === s.build) return;
      applying = true;
      s.goTo(msg.index, msg.build);
      applying = false;
    } else if (msg.type === "command" && !isPresenter) {
      onCommand(msg.command);
    } else if (msg.type === "hello" && !isPresenter) {
      const s = useStore.getState();
      channel.postMessage({ type: "scene", index: s.sceneIndex, build: s.build } satisfies Msg);
    }
  };
  if (isPresenter) channel.postMessage({ type: "hello" } satisfies Msg);
}

export function sendCommand(command: Command) {
  channel?.postMessage({ type: "command", command } satisfies Msg);
}
