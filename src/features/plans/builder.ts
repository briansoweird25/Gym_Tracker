import { newId } from '../../utils/uuid';

export type DraftExercise = {
  id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  min_reps: number;
  max_reps: number;
  rest_seconds: number;
};
export type DraftDay = { id: string; name: string; weekday: number | null; exercises: DraftExercise[] };
export type PlanDraft = { id: string; name: string; days: DraftDay[] };
type IdFn = () => string;

export const emptyDraft = (name = '', id: IdFn = newId): PlanDraft => ({ id: id(), name, days: [] });

export const addDay = (d: PlanDraft, name: string, weekday: number | null, id: IdFn = newId): PlanDraft => ({
  ...d,
  days: [...d.days, { id: id(), name, weekday, exercises: [] }],
});

export const removeDay = (d: PlanDraft, dayId: string): PlanDraft => ({ ...d, days: d.days.filter((x) => x.id !== dayId) });

const mapDay = (d: PlanDraft, dayId: string, fn: (day: DraftDay) => DraftDay): PlanDraft => ({
  ...d,
  days: d.days.map((x) => (x.id === dayId ? fn(x) : x)),
});
const repack = (xs: DraftExercise[]): DraftExercise[] => xs.map((e, i) => ({ ...e, position: i }));

export const addExercise = (d: PlanDraft, dayId: string, exerciseId: string, id: IdFn = newId): PlanDraft =>
  mapDay(d, dayId, (day) => ({
    ...day,
    exercises: repack([
      ...day.exercises,
      { id: id(), exercise_id: exerciseId, position: 0, target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 90 },
    ]),
  }));

export const removeExercise = (d: PlanDraft, dayId: string, planExerciseId: string): PlanDraft =>
  mapDay(d, dayId, (day) => ({ ...day, exercises: repack(day.exercises.filter((e) => e.id !== planExerciseId)) }));

export function moveExercise(d: PlanDraft, dayId: string, index: number, delta: 1 | -1): PlanDraft {
  const day = d.days.find((x) => x.id === dayId);
  const to = index + delta;
  if (!day || to < 0 || to >= day.exercises.length) return d;
  return mapDay(d, dayId, (x) => {
    const xs = [...x.exercises];
    [xs[index], xs[to]] = [xs[to], xs[index]];
    return { ...x, exercises: repack(xs) };
  });
}

export const updateExercise = (d: PlanDraft, dayId: string, planExerciseId: string, patch: Partial<DraftExercise>): PlanDraft =>
  mapDay(d, dayId, (day) => ({ ...day, exercises: day.exercises.map((e) => (e.id === planExerciseId ? { ...e, ...patch } : e)) }));

export function validateDraft(d: PlanDraft): string[] {
  const errors: string[] = [];
  if (!d.name.trim()) errors.push('Name your routine');
  if (!d.days.length) errors.push('Add at least one day');
  for (const day of d.days) {
    if (!day.exercises.length) errors.push(`"${day.name}" needs at least one exercise`);
    else if (day.exercises.some((e) => e.min_reps > e.max_reps)) errors.push(`Min reps cannot exceed max reps in "${day.name}"`);
  }
  return errors;
}

export function toRows(d: PlanDraft, userId: string) {
  return {
    plan: { id: d.id, user_id: userId, name: d.name.trim(), is_active: false },
    days: d.days.map((x) => ({ id: x.id, plan_id: d.id, name: x.name, weekday: x.weekday })),
    exercises: d.days.flatMap((x) =>
      x.exercises.map((e) => ({
        id: e.id, plan_day_id: x.id, exercise_id: e.exercise_id, position: e.position,
        target_sets: e.target_sets, min_reps: e.min_reps, max_reps: e.max_reps, rest_seconds: e.rest_seconds,
      })),
    ),
  };
}
