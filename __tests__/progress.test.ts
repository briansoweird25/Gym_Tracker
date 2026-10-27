import {
  bodyWeightSeries, exerciseSeries, personalBests, sessionSummaries, weeklyCount, type HistorySession,
} from '../src/features/progress/stats';

const S = (id: string, started: string, ended: string | null, exs: { id: string; name: string; sets: [number, number][] }[]): HistorySession => ({
  id, started_at: started, ended_at: ended,
  session_exercises: exs.map((e, i) => ({
    id: `${id}-${i}`, exercise_id: e.id, exercises: { name: e.name },
    exercise_sets: e.sets.map(([w, r], n) => ({ set_number: n + 1, weight_kg: w, reps: r })),
  })),
});
const history = [
  S('s2', '2026-02-10T10:00:00Z', '2026-02-10T11:00:00Z', [{ id: 'sq', name: 'Squat', sets: [[100, 5], [100, 6]] }]),
  S('s1', '2026-02-03T10:00:00Z', '2026-02-03T10:45:00Z', [{ id: 'sq', name: 'Squat', sets: [[90, 8]] }, { id: 'bp', name: 'Bench', sets: [[60, 10], [65, 6]] }]),
];

test('sessionSummaries computes sets, volume and duration per session', () => {
  expect(sessionSummaries(history)[0]).toEqual({ id: 's2', date: '2026-02-10T10:00:00Z', totalSets: 2, volume: 1100, minutes: 60 });
  expect(sessionSummaries(history)[1]).toMatchObject({ totalSets: 3, volume: 90 * 8 + 600 + 390, minutes: 45 });
});

test('personalBests keeps the heaviest weight per exercise, breaking ties by reps', () => {
  expect(personalBests(history)).toEqual([
    { exercise_id: 'bp', name: 'Bench', weight_kg: 65, reps: 6, date: '2026-02-03T10:00:00Z' },
    { exercise_id: 'sq', name: 'Squat', weight_kg: 100, reps: 6, date: '2026-02-10T10:00:00Z' },
  ]);
});

test('exerciseSeries is the heaviest set per session, oldest first', () => {
  expect(exerciseSeries(history, 'sq')).toEqual([
    { date: '2026-02-03T10:00:00Z', weight_kg: 90 },
    { date: '2026-02-10T10:00:00Z', weight_kg: 100 },
  ]);
  expect(exerciseSeries(history, 'missing')).toEqual([]);
});

test('weeklyCount counts sessions in the ISO week (Mon-Sun) of the reference date', () => {
  expect(weeklyCount(history, new Date('2026-02-11T12:00:00Z'))).toBe(1); // Wed 11 Feb: week of Mon 9 Feb
  expect(weeklyCount(history, new Date('2026-02-04T12:00:00Z'))).toBe(1); // week of Mon 2 Feb
  expect(weeklyCount(history, new Date('2026-03-01T12:00:00Z'))).toBe(0);
});

test('bodyWeightSeries sorts oldest first', () => {
  expect(bodyWeightSeries([
    { weight_kg: 80, recorded_at: '2026-02-02T00:00:00Z' },
    { weight_kg: 81, recorded_at: '2026-02-01T00:00:00Z' },
  ])).toEqual([
    { date: '2026-02-01T00:00:00Z', weight_kg: 81 },
    { date: '2026-02-02T00:00:00Z', weight_kg: 80 },
  ]);
});
