import { runCheck } from "../lib/checks";
import { LIVE_CONTEXT, LIVE_CRITERIA, V1 } from "./content";
import { useTalk, type Notice } from "./store";

// The only live AI calls in the talk: the room's own notices, translated with Version 1 and then
// judged, so they can appear in the montage. Runs in the projector window only.
// ?mock answers without the network, for testing and offline rehearsal. Never present with it.

export const mock = new URLSearchParams(location.search).has("mock");
const TRANSLATE_TIMEOUT = 15000;
const JUDGE_TIMEOUT = 25000;

async function postJson<T>(route: string, body: unknown, timeout: number): Promise<T> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((json as { error?: string }).error || `HTTP ${res.status}`);
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clean = (s: string) => s.trim().replace(/^["“]|["”]$/g, "").trim();

export async function translate(text: string): Promise<string> {
  if (mock) {
    await wait(900);
    if (/fail/i.test(text)) throw new Error("mock failure");
    return `${text.replace(/[.!?]\s*$/, "")}. Obviously. I already told the client.`;
  }
  const res = await postJson<{ text: string }>("/api/translate", { user: `${V1.trimEnd()}\n\n${text}` }, TRANSLATE_TIMEOUT);
  const out = clean(res.text || "");
  if (!out) throw new Error("empty answer");
  return out;
}

export async function judge(source: string, output: string): Promise<(boolean | null)[]> {
  const numbers = runCheck("numbers", source, output).pass;
  if (mock) {
    await wait(700);
    return [numbers, true, false, true];
  }
  try {
    const res = await postJson<{ results: { id: string; pass: boolean }[] }>(
      "/api/judge",
      { source, output, context: LIVE_CONTEXT, criteria: LIVE_CRITERIA },
      JUDGE_TIMEOUT,
    );
    const by = (id: string) => res.results.find((r) => r.id === id)?.pass ?? null;
    return [numbers, by("rule"), by("scope"), by("voice")];
  } catch {
    return [numbers, null, null, null];
  }
}

/** Watches for the room's pending notices and runs each one once. */
export function startLiveWorker() {
  const started = new Set<string>();
  const run = async (n: Notice) => {
    const { patchNotice } = useTalk.getState();
    try {
      const out = await translate(n.text);
      patchNotice(n.id, { out, status: "done" });
      const verdicts = await judge(n.text, out);
      patchNotice(n.id, { verdicts });
    } catch {
      patchNotice(n.id, { status: "failed" });
    }
  };
  const check = () => {
    for (const n of useTalk.getState().room.notices) {
      // A retry sets the notice back to pending; forget the earlier attempt so it runs again.
      const key = `${n.id}:${n.status === "pending" ? "p" : "x"}`;
      if (n.status === "pending" && !started.has(key)) {
        started.add(key);
        void run(n).finally(() => {
          started.delete(key);
          check();
        });
      }
    }
  };
  useTalk.subscribe(check);
  check();
}
