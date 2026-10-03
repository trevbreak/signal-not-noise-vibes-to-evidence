import { get, set } from "idb-keyval";

// Every API response is recorded in IndexedDB, keyed by its exact request.
// In replay mode we answer from those recordings instead of the network, picking at random
// so a Run×10 in replay reproduces the pass rate from rehearsal. A visible REPLAY badge keeps it honest.

let replayMode = false;
export const setReplayMode = (on: boolean) => (replayMode = on);

export class ApiError extends Error {}

async function key(route: string, body: unknown) {
  const bytes = new TextEncoder().encode(route + JSON.stringify(body));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "rec:" + Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function post<T>(route: string, body: unknown): Promise<T & { replayed?: boolean }> {
  const k = await key(route, body);
  if (replayMode) {
    const recorded = (await get<T[]>(k)) ?? [];
    if (!recorded.length) throw new ApiError("No rehearsal recording for this exact request. Turn off replay (P) to run it live.");
    return { ...recorded[Math.floor(Math.random() * recorded.length)], replayed: true };
  }
  const res = await fetch(route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new ApiError(json.error || `HTTP ${res.status}`);
  const recorded = (await get<T[]>(k)) ?? [];
  // Keep the most recent 20 recordings per request.
  await set(k, [...recorded, json].slice(-20));
  return json;
}

export type Health = {
  anthropic: boolean;
  openai: boolean;
  translatorModel: string;
  judgeModel: string;
  imageModel: string;
  ttsModel: string;
};

export async function health(): Promise<Health | null> {
  try {
    const res = await fetch("/api/health");
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}
