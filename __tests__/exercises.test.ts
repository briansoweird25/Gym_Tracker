import fs from 'fs';
import path from 'path';
import { filterExercises, filterOptions } from '../src/features/exercises/filter';
import { pickMedia } from '../src/services/media';
import type { Exercise, ExerciseMedia } from '../src/types';

const ex = (o: Partial<Exercise>): Exercise => ({
  id: 'x', name: 'X', muscle_group: 'chest', equipment: 'barbell', difficulty: 'beginner', instructions: 'i', ...o,
});
const list = [
  ex({ id: '1', name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell', difficulty: 'intermediate' }),
  ex({ id: '2', name: 'Push-Up', muscle_group: 'chest', equipment: 'bodyweight', difficulty: 'beginner' }),
  ex({ id: '3', name: 'Goblet Squat', muscle_group: 'legs', equipment: 'dumbbell', difficulty: 'beginner' }),
];

describe('filterExercises', () => {
  test('returns everything with no filters', () => {
    expect(filterExercises(list, {})).toHaveLength(3);
  });
  test('filters by muscle group, equipment and difficulty together', () => {
    expect(filterExercises(list, { muscle_group: 'chest', difficulty: 'beginner' }).map((e) => e.id)).toEqual(['2']);
    expect(filterExercises(list, { equipment: 'dumbbell' }).map((e) => e.id)).toEqual(['3']);
  });
  test('search is case-insensitive on name', () => {
    expect(filterExercises(list, { query: 'push' }).map((e) => e.id)).toEqual(['2']);
  });
  test('filterOptions lists distinct sorted values', () => {
    expect(filterOptions(list, 'muscle_group')).toEqual(['chest', 'legs']);
  });
});

describe('pickMedia', () => {
  const m = (o: Partial<ExerciseMedia>): ExerciseMedia => ({ id: 'm', exercise_id: '1', storage_path: 'p', angle: null, media_type: 'video', ...o });
  const media = [m({ id: 'f', angle: 'front', storage_path: 'f.mp4' }), m({ id: 's', angle: 'side', storage_path: 's.mp4' }), m({ id: 'p', media_type: 'poster', storage_path: 'p.jpg' })];
  test('picks the video for the requested angle', () => {
    expect(pickMedia(media, 'side').video?.storage_path).toBe('s.mp4');
  });
  test('falls back to the first video when the angle is missing', () => {
    expect(pickMedia([media[0], media[2]], 'side').video?.storage_path).toBe('f.mp4');
  });
  test('returns the poster and angles available', () => {
    const r = pickMedia(media, 'front');
    expect(r.poster?.storage_path).toBe('p.jpg');
    expect(r.angles).toEqual(['front', 'side']);
  });
  test('no media yields nothing to play', () => {
    expect(pickMedia([], 'front')).toEqual({ video: null, poster: null, angles: [] });
  });
});

test('seed migration curates a small set of beginner-friendly exercises', () => {
  const dir = path.join(__dirname, '..', 'supabase', 'migrations');
  const sql = fs.readdirSync(dir).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const rows = sql.match(/insert into public\.exercises[\s\S]*?on conflict/i)?.[0].match(/^\s*\('/gm) ?? [];
  expect(rows.length).toBeGreaterThanOrEqual(10);
  expect(rows.length).toBeLessThanOrEqual(20);
});
