import { useEffect, useState } from "react";
import { snapshot, useTalk, type ActionName, type TalkState } from "./store";

// Two windows, one talk. One projector window owns the state: it applies every action and
// broadcasts a snapshot. The presenter window (?presenter) sends actions and mirrors snapshots,
// so the two can never disagree. Live calls only ever run in the owner.
//
// Only one projector window may own the talk (a browser lock decides). Any other projector
// window, say one left open from an earlier rehearsal, becomes a mirror like the presenter:
// two owners would each run the room's notices and the presenter would flip between them.
// If the owner closes, a waiting mirror reloads and takes over.

type Msg =
  | { type: "state"; state: TalkState }
  | { type: "action"; name: ActionName; args: unknown[] }
  | { type: "hello" };

export const isPresenter = new URLSearchParams(location.search).has("presenter");
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("signal-talk") : null;
let lastSeen = 0;
/** True in the one window that owns the talk's state. Set by claimOwnership() before anything renders. */
export let isOwner = false;
const LOCK = "signal-talk-owner";

/** Projector windows: try to own the talk. Resolves true for the owner, false for a mirror. */
export function claimOwnership(): Promise<boolean> {
  if (isPresenter) return Promise.resolve(false);
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return Promise.resolve((isOwner = true));
  return new Promise((resolve) => {
    void locks.request(LOCK, { ifAvailable: true }, (lock) => {
      if (!lock) {
        resolve(false);
        // Wait our turn: when the owner closes, reload and take over cleanly.
        void locks.request(LOCK, () => {
          location.reload();
          return new Promise(() => {});
        });
        return;
      }
      isOwner = true;
      resolve(true);
      return new Promise(() => {}); // hold the lock for as long as this window is open
    });
  });
}

/** Run an action: here in the projector window, or sent to it from the presenter window. */
export function dispatch(name: ActionName, ...args: unknown[]) {
  if (!isOwner) {
    channel?.postMessage({ type: "action", name, args } satisfies Msg);
    return;
  }
  (useTalk.getState()[name] as (...a: unknown[]) => void)(...args);
}

export function startSync() {
  if (!channel) return;
  if (!isOwner) {
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
