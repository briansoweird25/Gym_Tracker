import fs from 'fs';
import path from 'path';

const dir = path.join(__dirname, '..', 'supabase', 'migrations');
const sql = () =>
  fs
    .readdirSync(dir)
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join('\n');

const TABLES = [
  'profiles', 'exercises', 'exercise_media', 'workout_plans', 'plan_days',
  'plan_exercises', 'workout_sessions', 'session_exercises', 'exercise_sets',
  'body_metrics',
];
const USER_OWNED = [
  'profiles', 'workout_plans', 'plan_days', 'plan_exercises',
  'workout_sessions', 'session_exercises', 'exercise_sets', 'body_metrics',
];

test('migration creates every architecture table with uuid primary keys', () => {
  for (const t of TABLES) {
    expect(sql()).toMatch(new RegExp(`create table public\\.${t}\\s*\\(\\s*id uuid primary key`, 'i'));
  }
});

test('row level security is enabled on every table', () => {
  for (const t of TABLES) {
    expect(sql()).toMatch(new RegExp(`alter table public\\.${t} enable row level security`, 'i'));
  }
});

test('user-owned tables have an owner policy using auth.uid()', () => {
  for (const t of USER_OWNED) {
    expect(sql()).toMatch(new RegExp(`create policy "${t}_owner" on public\\.${t}[\\s\\S]*?auth\\.uid\\(\\)`, 'i'));
  }
});

test('curated exercises and media are read-only to users', () => {
  for (const t of ['exercises', 'exercise_media']) {
    expect(sql()).toMatch(new RegExp(`create policy "${t}_read" on public\\.${t} for select`, 'i'));
    expect(sql()).not.toMatch(new RegExp(`on public\\.${t} for (insert|update|delete|all)`, 'i'));
  }
});

test('only one active workout session is allowed per user', () => {
  expect(sql()).toMatch(/create unique index[\s\S]*workout_sessions \(user_id\) where status = 'active'/i);
});
