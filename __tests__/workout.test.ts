import {
  createSession, goTo, logSet, remainingRest, skipRest, summarize, latestSessionSets, type PlanDayInput,
} from '../src/features/sessions/workout';

let n = 0;
const id = () => `id-${++n}`;
const day: PlanDayInput = {
  plan_day_id: 'pd-1',
  exercises: [
    { exercise_id: 'e1', name: 'Squat', muscle_group: 'legs', instructions: 'i', media: [], target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 90 },
    { exercise_id: 'e2', name: 'Press', muscle_group: 'chest', instructions: 'i', media: [], target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 60 },
  ],
};
const T0 = 1_000_000;

describe('workout session', () => {
  test('createSession builds ordered session exercises starting at the first', () => {
    const s = createSession(day, T0, id);
    expect(s.exercises.map((e) => e.exercise_id)).toEqual(['e1', 'e2']);
    expect(s.exercises.map((e) => e.position)).toEqual([0, 1]);
    expect(s.currentIndex).toBe(0);
    expect(s.rest).toBeNull();
  });

  test('logSet appends a numbered set to the current exercise and starts that exercise\'s rest', () => {
    let s = createSession(day, T0, id);
    s = logSet(s, { weight_kg: 60, reps: 10 }, T0 + 5_000, id);
    s = logSet(s, { weight_kg: 62.5, reps: 8 }, T0 + 100_000, id);
    expect(s.exercises[0].sets.map((x) => [x.set_number, x.weight_kg, x.reps])).toEqual([[1, 60, 10], [2, 62.5, 8]]);
    expect(s.rest).toEqual({ endsAt: T0 + 100_000 + 90_000, total: 90 });
  });

  test('logSet rejects zero reps and negative weight without changing state', () => {
    const s = createSession(day, T0, id);
    expect(logSet(s, { weight_kg: 10, reps: 0 }, T0, id)).toBe(s);
    expect(logSet(s, { weight_kg: -1, reps: 5 }, T0, id)).toBe(s);
  });

  test('remainingRest counts down in whole seconds and floors at zero', () => {
    let s = createSession(day, T0, id);
    expect(remainingRest(s, T0)).toBe(0);
    s = logSet(s, { weight_kg: 1, reps: 1 }, T0, id);
    expect(remainingRest(s, T0 + 1_500)).toBe(89);
    expect(remainingRest(s, T0 + 999_999)).toBe(0);
  });

  test('skipRest clears the timer', () => {
    let s = logSet(createSession(day, T0, id), { weight_kg: 1, reps: 1 }, T0, id);
    expect(skipRest(s).rest).toBeNull();
  });

  test('goTo clamps to the exercise range', () => {
    const s = createSession(day, T0, id);
    expect(goTo(s, 1).currentIndex).toBe(1);
    expect(goTo(s, 5).currentIndex).toBe(1);
    expect(goTo(s, -1).currentIndex).toBe(0);
  });

  test('summarize totals sets and volume (weight x reps) with duration', () => {
    let s = createSession(day, T0, id);
    s = logSet(s, { weight_kg: 60, reps: 10 }, T0, id);
    s = goTo(s, 1);
    s = logSet(s, { weight_kg: 20, reps: 5 }, T0, id);
    expect(summarize(s, T0 + 600_000)).toEqual({ totalSets: 2, volume: 700, durationMs: 600_000 });
  });
});

describe('latestSessionSets (prior performance)', () => {
  const row = (session_id: string, started_at: string, set_number: number, weight_kg: number, reps: number) => ({
    set_number, weight_kg, reps, session_exercises: { session_id, workout_sessions: { started_at } },
  });
  test('returns the sets of the most recent session only, ordered by set number', () => {
    const rows = [
      row('old', '2026-01-01T10:00:00Z', 1, 50, 10),
      row('new', '2026-02-01T10:00:00Z', 2, 62.5, 8),
      row('new', '2026-02-01T10:00:00Z', 1, 60, 10),
    ];
    expect(latestSessionSets(rows)).toEqual([
      { set_number: 1, weight_kg: 60, reps: 10 },
      { set_number: 2, weight_kg: 62.5, reps: 8 },
    ]);
  });
  test('empty history yields no prior sets', () => {
    expect(latestSessionSets([])).toEqual([]);
  });
});
