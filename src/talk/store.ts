import { create } from "zustand";
import { BEATS, HAND_START, type Field, type VoteKey } from "./content";

// The talk's state: where we are, and what the room has said.
// The projector window owns it. The presenter window sends actions and mirrors snapshots (sync.ts).

export type Notice = {
  id: string;
  text: string;
  out?: string;
  status: "pending" | "done" | "failed";
  /** [numbers, rule, nothing added, sounds PM]; null where a judge couldn't answer. */
  verdicts?: (boolean | null)[];
};

export type Room = {
  notices: Notice[];
  /** The room's wording for each rule card; "" keeps the default. */
  rules: string[];
  votes: Partial<Record<VoteKey, number>>;
  /** Where the presenter moved the needle in 1.3. */
  needleHand: number | null;
};

export type TalkState = {
  beat: number;
  step: number;
  /** 1 forward, -1 back, 0 a jump. Back and jumps show the end state at once, without animation. */
  dir: 1 | -1 | 0;
  room: Room;
  blackout: boolean;
  /** What's being typed right now, shown live on the stage with a caret. */
  editing: Field | null;
  draft: string;
};

export const MAX_ROOM_NOTICES = 2;
export const MAX_NOTICE_LENGTH = 90;

export const freshRoom = (): Room => ({ notices: [], rules: ["", "", "", ""], votes: {}, needleHand: null });

const initial = (): TalkState => ({ beat: 0, step: 0, dir: 0, room: freshRoom(), blackout: false, editing: null, draft: "" });

const uid = () => Math.random().toString(36).slice(2, 9);

type Actions = {
  next: () => void;
  prev: () => void;
  goTo: (beat: number, step?: number) => void;
  setVote: (key: VoteKey, n: number) => void;
  nudge: (delta: number) => void;
  startEdit: () => void;
  setDraft: (text: string) => void;
  commitEdit: () => void;
  cancelEdit: () => void;
  removeLastNotice: () => void;
  removeNotice: (id: string) => void;
  retryNotice: (id: string) => void;
  patchNotice: (id: string, patch: Partial<Notice>) => void;
  toggleBlackout: () => void;
  reset: () => void;
  /** Number keys: a vote where the step takes one. */
  numberKey: (n: number) => void;
  /** ↑ ↓: move the needle (1.3). */
  upDown: (up: boolean) => void;
};

export type Talk = TalkState & Actions;
export const ACTIONS = [
  "next", "prev", "goTo", "setVote", "nudge", "startEdit", "setDraft", "commitEdit",
  "cancelEdit", "removeLastNotice", "removeNotice", "retryNotice", "patchNotice", "toggleBlackout", "reset", "numberKey", "upDown",
] as const;
export type ActionName = (typeof ACTIONS)[number];

export const stepOf = (s: { beat: number; step: number }) => BEATS[s.beat].steps[s.step];

export const useTalk = create<Talk>((set, get) => {
  const room = (patch: Partial<Room>) => set((s) => ({ room: { ...s.room, ...patch } }));
  const leave = { editing: null, draft: "" } as const;
  return {
    ...initial(),

    next: () => {
      const { beat, step } = get();
      if (step < BEATS[beat].steps.length - 1) return set({ step: step + 1, dir: 1, ...leave });
      if (beat < BEATS.length - 1) set({ beat: beat + 1, step: 0, dir: 1, ...leave });
    },
    prev: () => {
      const { beat, step } = get();
      if (step > 0) return set({ step: step - 1, dir: -1, ...leave });
      if (beat > 0) set({ beat: beat - 1, step: BEATS[beat - 1].steps.length - 1, dir: -1, ...leave });
    },
    goTo: (beat, step = 0) => {
      const b = Math.max(0, Math.min(BEATS.length - 1, beat));
      set({ beat: b, step: Math.max(0, Math.min(BEATS[b].steps.length - 1, step)), dir: 0, ...leave });
    },

    setVote: (key, n) => room({ votes: { ...get().room.votes, [key]: Math.max(1, Math.min(5, n)) } }),
    nudge: (delta) => {
      const v = get().room.needleHand ?? HAND_START;
      room({ needleHand: Math.max(0, Math.min(100, v + delta)) });
    },

    startEdit: () => {
      const st = stepOf(get());
      if (st.field) set({ editing: st.field, draft: "" });
    },
    setDraft: (text) => set({ draft: text.slice(0, MAX_NOTICE_LENGTH) }),
    commitEdit: () => {
      const { editing, draft } = get();
      const text = draft.trim();
      set({ ...leave });
      if (!editing || !text) return;
      const r = get().room;
      if (editing === "notice") {
        const mine: Notice = { id: uid(), text, status: "pending" };
        // Two at most: a third replaces the oldest, so the app never overflows.
        const kept = r.notices.length >= MAX_ROOM_NOTICES ? r.notices.slice(1) : r.notices;
        room({ notices: [...kept, mine] });
      } else {
        const i = Number(editing.split(":")[1]);
        const rules = [...r.rules];
        rules[i] = text;
        room({ rules });
      }
    },
    cancelEdit: () => set({ ...leave }),

    removeLastNotice: () => room({ notices: get().room.notices.slice(0, -1) }),
    removeNotice: (id) => room({ notices: get().room.notices.filter((n) => n.id !== id) }),
    retryNotice: (id) => get().patchNotice(id, { status: "pending", out: undefined, verdicts: undefined }),
    patchNotice: (id, patch) => room({ notices: get().room.notices.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),

    toggleBlackout: () => set({ blackout: !get().blackout }),
    reset: () => set({ ...initial() }),

    numberKey: (n) => {
      const st = stepOf(get());
      if (!st.vote) return;
      get().setVote(st.vote, n);
      if (st.advance) get().next();
    },
    upDown: (up) => {
      if (stepOf(get()).nudge) get().nudge(up ? 4 : -4);
    },
  };
});

// ── Saving: the projector keeps its place and the room's input across a refresh ──

const KEY = "talk-state-v4";

export function restore() {
  // A hash like #12.3 (beat 12, step 3) jumps there: handy for rehearsing one beat.
  const hash = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as Pick<TalkState, "beat" | "step" | "room"> | null;
    if (saved && BEATS[saved.beat]) {
      useTalk.setState({
        beat: saved.beat,
        step: Math.min(saved.step, BEATS[saved.beat].steps.length - 1),
        room: { ...freshRoom(), ...saved.room },
        dir: 0,
      });
    }
  } catch {
    /* nothing saved, or storage blocked: start at the top */
  }
  if (hash) useTalk.getState().goTo(Number(hash[1]), Number(hash[2] ?? 0));
  // Typing a new #beat.step into the address bar jumps there too.
  window.addEventListener("hashchange", () => {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
    const s = useTalk.getState();
    if (m && (Number(m[1]) !== s.beat || Number(m[2] ?? 0) !== s.step)) s.goTo(Number(m[1]), Number(m[2] ?? 0));
  });
}

export function persist() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  useTalk.subscribe((s) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ beat: s.beat, step: s.step, room: s.room }));
      } catch {
        /* storage blocked: the talk still runs, it just won't survive a refresh */
      }
      history.replaceState(null, "", `${location.pathname}${location.search}#${s.beat}.${s.step}`);
    }, 150);
  });
}

export const snapshot = (s: TalkState): TalkState => ({
  beat: s.beat, step: s.step, dir: s.dir, room: s.room, blackout: s.blackout, editing: s.editing, draft: s.draft,
});
