import { create } from 'zustand';
import {
  createSession, goTo, logSet, skipRest, type ActiveSession, type PlanDayInput,
} from '../features/sessions/workout';
import type { LocalStore } from '../services/persistence';

type WorkoutState = {
  session: ActiveSession | null;
  /** Snapshot of the session that was just finished, for the summary screen. */
  finished: ActiveSession | null;
  finishedAt: number | null;
  error: string | null;
  /** True once an interrupted session (if any) has been loaded from SQLite. */
  hydrated: boolean;
  attach: (local: LocalStore) => void;
  restore: () => Promise<void>;
  start: (day: PlanDayInput, userId: string) => Promise<void>;
  log: (v: { weight_kg: number; reps: number }) => Promise<void>;
  skipRest: () => Promise<void>;
  goTo: (index: number) => Promise<void>;
  finish: () => Promise<ActiveSession | null>;
};

let local: LocalStore | null = null;
let chain: Promise<unknown> = Promise.resolve();
/** Serializes actions so quick taps never race on stale state. */
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const p = chain.then(fn, fn);
  chain = p.catch(() => undefined);
  return p;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  /** Persists first; the UI state only changes once the write succeeded. */
  async function commit(next: ActiveSession, persist: (l: LocalStore) => Promise<void>) {
    try {
      if (local) await persist(local);
      set({ session: next, error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not save your workout' });
    }
  }

  return {
    session: null,
    finished: null,
    finishedAt: null,
    error: null,
    hydrated: false,
    attach: (l) => { local = l; },
    restore: async () => {
      try {
        const s = local ? await local.loadActive() : null;
        set({ session: s ?? get().session, hydrated: true });
      } catch (e) {
        set({ hydrated: true, error: e instanceof Error ? e.message : 'Could not restore your workout' });
      }
    },
    start: (day, userId) => serial(async () => {
      if (get().session) return; // one active session per user
      const next = createSession(day, Date.now(), undefined, userId);
      await commit(next, (l) => l.recordStart(next));
      set({ finished: null, finishedAt: null });
    }),
    log: (v) => serial(async () => {
      const cur = get().session;
      if (!cur) return;
      const next = logSet(cur, v, Date.now());
      if (next === cur) return;
      const entry = next.exercises[next.currentIndex].sets.at(-1)!;
      await commit(next, (l) => l.recordSet(next, entry));
    }),
    skipRest: () => serial(async () => {
      const cur = get().session;
      if (cur?.rest) { const next = skipRest(cur); await commit(next, (l) => l.saveActive(next)); }
    }),
    goTo: (index) => serial(async () => {
      const cur = get().session;
      if (!cur) return;
      const next = goTo(cur, index);
      await commit(next, (l) => l.saveActive(next));
    }),
    finish: () => serial(async () => {
      const cur = get().session;
      if (!cur) return null;
      const endedAt = Date.now();
      try {
        if (local) await local.recordFinish(cur, endedAt);
      } catch (e) {
        set({ error: e instanceof Error ? e.message : 'Could not save your workout' });
        return null;
      }
      set({ session: null, finished: cur, finishedAt: endedAt, error: null });
      return cur;
    }),
  };
});
