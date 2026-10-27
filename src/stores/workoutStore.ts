import { create } from 'zustand';
import { createSession, goTo, logSet, skipRest, type ActiveSession, type PlanDayInput } from '../features/sessions/workout';

type WorkoutState = {
  session: ActiveSession | null;
  /** Snapshot of the session that was just finished, for the summary screen. */
  finished: ActiveSession | null;
  finishedAt: number | null;
  start: (day: PlanDayInput) => void;
  log: (v: { weight_kg: number; reps: number }) => void;
  skipRest: () => void;
  goTo: (index: number) => void;
  finish: () => ActiveSession | null;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  session: null,
  finished: null,
  finishedAt: null,
  start: (day) => {
    if (get().session) return; // one active session per user
    set({ session: createSession(day, Date.now()), finished: null, finishedAt: null });
  },
  log: (v) => set((s) => (s.session ? { session: logSet(s.session, v, Date.now()) } : s)),
  skipRest: () => set((s) => (s.session ? { session: skipRest(s.session) } : s)),
  goTo: (index) => set((s) => (s.session ? { session: goTo(s.session, index) } : s)),
  finish: () => {
    const done = get().session;
    set({ session: null, finished: done, finishedAt: Date.now() });
    return done;
  },
}));
