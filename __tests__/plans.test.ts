import {
  addDay, addExercise, emptyDraft, moveExercise, removeDay, removeExercise, toRows, validateDraft,
} from '../src/features/plans/builder';

const ids = (() => { let n = 0; return () => `id-${++n}`; })();

function sample() {
  let d = emptyDraft('Push', ids);
  d = addDay(d, 'Day A', 1, ids);
  d = addExercise(d, d.days[0].id, 'ex-1', ids);
  d = addExercise(d, d.days[0].id, 'ex-2', ids);
  return d;
}

describe('routine builder', () => {
  test('new exercises get sensible defaults and sequential positions', () => {
    const d = sample();
    expect(d.days[0].exercises.map((e) => e.position)).toEqual([0, 1]);
    expect(d.days[0].exercises[0]).toMatchObject({ target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 90 });
  });
  test('removing an exercise re-packs positions', () => {
    let d = sample();
    d = removeExercise(d, d.days[0].id, d.days[0].exercises[0].id);
    expect(d.days[0].exercises).toHaveLength(1);
    expect(d.days[0].exercises[0].position).toBe(0);
  });
  test('moveExercise swaps neighbours and ignores out-of-range moves', () => {
    let d = sample();
    const day = d.days[0].id;
    d = moveExercise(d, day, 0, 1);
    expect(d.days[0].exercises.map((e) => e.exercise_id)).toEqual(['ex-2', 'ex-1']);
    expect(d.days[0].exercises.map((e) => e.position)).toEqual([0, 1]);
    expect(moveExercise(d, day, 0, -1)).toEqual(d);
  });
  test('removeDay drops the day', () => {
    const d = sample();
    expect(removeDay(d, d.days[0].id).days).toHaveLength(0);
  });
  test('inputs are not mutated', () => {
    const d = sample();
    const snap = JSON.stringify(d);
    addExercise(d, d.days[0].id, 'ex-3', ids);
    expect(JSON.stringify(d)).toBe(snap);
  });
});

describe('validateDraft', () => {
  test('a complete draft is valid', () => {
    expect(validateDraft(sample())).toEqual([]);
  });
  test('requires a name, a day, and an exercise per day', () => {
    expect(validateDraft(emptyDraft(' ', ids))).toEqual(['Name your routine', 'Add at least one day']);
    const d = addDay(emptyDraft('X', ids), 'Day A', null, ids);
    expect(validateDraft(d)).toEqual(['"Day A" needs at least one exercise']);
  });
  test('rep range must be ordered', () => {
    const d = sample();
    d.days[0].exercises[0].min_reps = 12;
    d.days[0].exercises[0].max_reps = 8;
    expect(validateDraft(d)).toEqual(['Min reps cannot exceed max reps in "Day A"']);
  });
});

test('toRows flattens a draft into plan, day and exercise rows keyed by client ids', () => {
  const d = sample();
  const rows = toRows(d, 'user-1');
  expect(rows.plan).toEqual({ id: d.id, user_id: 'user-1', name: 'Push', is_active: false });
  expect(rows.days).toEqual([{ id: d.days[0].id, plan_id: d.id, name: 'Day A', weekday: 1 }]);
  expect(rows.exercises).toHaveLength(2);
  expect(rows.exercises[0]).toMatchObject({ plan_day_id: d.days[0].id, exercise_id: 'ex-1', position: 0 });
});
