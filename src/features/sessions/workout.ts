import type { ExerciseMedia } from '../../types';
import { newId } from '../../utils/uuid';

export type SetEntry = { id: string; set_number: number; weight_kg: number; reps: number; completed_at: number };
export type SessionExercise = {
  id: string;
  exercise_id: string;
  position: number;
  name: string;
  muscle_group: string;
  instructions: string;
  media: ExerciseMedia[];
  target_sets: number;
  min_reps: number;
  max_reps: number;
  rest_seconds: number;
  sets: SetEntry[];
};
export type ActiveSession = {
  id: string;
  plan_day_id: string | null;
  started_at: number;
  currentIndex: number;
  exercises: SessionExercise[];
  rest: { endsAt: number; total: number } | null;
};
export type PlanDayInput = {
  plan_day_id: string | null;
  exercises: Omit<SessionExercise, 'id' | 'position' | 'sets'>[];
};
type IdFn = () => string;

export function createSession(day: PlanDayInput, now: number, id: IdFn = newId): ActiveSession {
  return {
    id: id(),
    plan_day_id: day.plan_day_id,
    started_at: now,
    currentIndex: 0,
    rest: null,
    exercises: day.exercises.map((e, position) => ({ ...e, id: id(), position, sets: [] })),
  };
}

export function logSet(s: ActiveSession, v: { weight_kg: number; reps: number }, now: number, id: IdFn = newId): ActiveSession {
  if (!(v.reps >= 1) || !(v.weight_kg >= 0)) return s;
  const cur = s.exercises[s.currentIndex];
  const entry: SetEntry = { id: id(), set_number: cur.sets.length + 1, weight_kg: v.weight_kg, reps: v.reps, completed_at: now };
  return {
    ...s,
    exercises: s.exercises.map((e, i) => (i === s.currentIndex ? { ...e, sets: [...e.sets, entry] } : e)),
    rest: { endsAt: now + cur.rest_seconds * 1000, total: cur.rest_seconds },
  };
}

export const remainingRest = (s: ActiveSession, now: number): number =>
  s.rest ? Math.max(0, Math.ceil((s.rest.endsAt - now) / 1000)) : 0;

export const skipRest = (s: ActiveSession): ActiveSession => ({ ...s, rest: null });

export const goTo = (s: ActiveSession, index: number): ActiveSession => ({
  ...s,
  currentIndex: Math.min(Math.max(index, 0), s.exercises.length - 1),
});

export function summarize(s: ActiveSession, now: number) {
  const sets = s.exercises.flatMap((e) => e.sets);
  return {
    totalSets: sets.length,
    volume: sets.reduce((sum, x) => sum + x.weight_kg * x.reps, 0),
    durationMs: now - s.started_at,
  };
}

type PriorRow = {
  set_number: number;
  weight_kg: number;
  reps: number;
  session_exercises: { session_id: string; workout_sessions: { started_at: string } };
};

/** Sets from the most recent earlier session of an exercise, for "last time" hints. */
export function latestSessionSets(rows: PriorRow[]): { set_number: number; weight_kg: number; reps: number }[] {
  if (!rows.length) return [];
  const latest = rows.reduce((a, b) =>
    b.session_exercises.workout_sessions.started_at > a.session_exercises.workout_sessions.started_at ? b : a,
  );
  return rows
    .filter((r) => r.session_exercises.session_id === latest.session_exercises.session_id)
    .map(({ set_number, weight_kg, reps }) => ({ set_number, weight_kg, reps }))
    .sort((a, b) => a.set_number - b.set_number);
}
