import { useEffect, useState } from "react";
import { snapshot, useTalk, type ActionName, type TalkState } from "./store";

// Two windows, one talk. The projector window owns the state: it applies every action and
// broadcasts a snapshot. The presenter window (?presenter) sends actions and mirrors snapshots,
// so the two can never disagree. Live calls only ever run in the projector window.

type Msg =
  | { type: "state"; state: TalkState }
  | { type: "action"; name: ActionName; args: unknown[] }
  | { type: "hello" };

export const isPresenter = new URLSearchParams(location.search).has("presenter");
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("signal-talk") : null;
let lastSeen = 0;

/** Run an action: here in the projector window, or sent to it from the presenter window. */
export function dispatch(name: ActionName, ...args: unknown[]) {
  if (isPresenter) {
    channel?.postMessage({ type: "action", name, args } satisfies Msg);
    return;
  }
  (useTalk.getState()[name] as (...a: unknown[]) => void)(...args);
}

export function startSync() {
  if (!channel) return;
  if (isPresenter) {
    channel.onmessage = (e: MessageEvent<Msg>) => {
      if (e.data.type !== "state") return;
      lastSeen = Date.now();
      useTalk.setState(e.data.state);
    };
    channel.postMessage({ type: "hello" } satisfies Msg);
    return;
  }
  const send = () => channel.postMessage({ type: "state", state: snapshot(useTalk.getState()) } satisfies Msg);
  useTalk.subscribe(send);
  // Say hello straight away (a reloaded projector shouldn't wait for the heartbeat)…
  send();
  // …then a heartbeat, so the presenter window knows the projector is there.
  setInterval(send, 1500);
  channel.onmessage = (e: MessageEvent<Msg>) => {
    if (e.data.type === "hello") send();
    if (e.data.type === "action") {
      const fn = useTalk.getState()[e.data.name] as (...a: unknown[]) => void;
      if (typeof fn === "function") fn(...e.data.args);
    }
  };
}

/** For the presenter window: is the projector window open and talking? */
export function useConnected() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now - lastSeen < 4000;
}
