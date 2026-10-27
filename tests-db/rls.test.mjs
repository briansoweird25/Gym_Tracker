// Runs the real migrations on Postgres (PGlite) with a minimal Supabase stand-in (auth.uid, roles, storage).
// Uses node:test because PGlite's ESM loader does not run inside the React Native jest environment.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations');
const A = '00000000-0000-0000-0000-00000000000a';
const B = '00000000-0000-0000-0000-00000000000b';

const SUPABASE_STUB = `
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
create role authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean);
grant usage on schema auth, public to authenticated;
`;

let db;

/** Runs fn as the given user under RLS (the `authenticated` role). */
async function as(uid, fn) {
  await db.exec(`set app.uid = '${uid}'; set role authenticated;`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
}

before(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const f of fs.readdirSync(dir).sort()) await db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
  await db.exec('grant select, insert, update, delete on all tables in schema public to authenticated;');
  await db.exec(`insert into auth.users values ('${A}'), ('${B}');`);
  await db.exec(`insert into profiles (id, name) values ('${A}', 'A'), ('${B}', 'B');`);
});
after(() => db.close());

test('migrations apply and seed the curated exercises', async () => {
  const r = await db.query('select count(*)::int as n from exercises');
  assert.ok(r.rows[0].n >= 10);
});

test('users cannot read or write another user\'s workout records', async () => {
  const sess = '10000000-0000-0000-0000-000000000001';
  await as(A, () => db.query(`insert into workout_sessions (id, user_id, status) values ('${sess}', '${A}', 'completed')`));
  assert.equal((await as(A, () => db.query('select * from workout_sessions'))).rows.length, 1);
  assert.equal((await as(B, () => db.query('select * from workout_sessions'))).rows.length, 0);
  await assert.rejects(as(B, () => db.query(`insert into workout_sessions (id, user_id) values (gen_random_uuid(), '${A}')`)), /row-level security/);
});

test('child rows (sets) inherit ownership through their session', async () => {
  const ex = (await db.query('select id from exercises limit 1')).rows[0].id;
  const sess = '10000000-0000-0000-0000-000000000002';
  const se = '20000000-0000-0000-0000-000000000002';
  const set = '30000000-0000-0000-0000-000000000002';
  await as(A, async () => {
    await db.query(`insert into workout_sessions (id, user_id) values ('${sess}', '${A}')`);
    await db.query(`insert into session_exercises (id, session_id, exercise_id, position) values ('${se}', '${sess}', '${ex}', 0)`);
    await db.query(`insert into exercise_sets (id, session_exercise_id, set_number, weight_kg, reps) values ('${set}', '${se}', 1, 50, 5)`);
  });
  assert.equal((await as(B, () => db.query('select * from exercise_sets'))).rows.length, 0);
  await assert.rejects(as(B, () => db.query(`insert into exercise_sets (id, session_exercise_id, set_number, reps) values (gen_random_uuid(), '${se}', 2, 5)`)), /row-level security/);
});

test('upserting the same set twice (sync retry) leaves exactly one row', async () => {
  const se = '20000000-0000-0000-0000-000000000002';
  const set = '30000000-0000-0000-0000-000000000002';
  await as(A, async () => {
    for (let i = 0; i < 2; i++) {
      await db.query(
        `insert into exercise_sets (id, session_exercise_id, set_number, weight_kg, reps) values ('${set}', '${se}', 1, 50, 5)
         on conflict (id) do update set weight_kg = excluded.weight_kg, reps = excluded.reps`,
      );
    }
  });
  const r = await db.query(`select count(*)::int as n from exercise_sets where id = '${set}'`);
  assert.equal(r.rows[0].n, 1);
});

test('only one active session per user is allowed', async () => {
  await db.exec(`delete from workout_sessions where user_id = '${B}'`);
  await as(B, () => db.query(`insert into workout_sessions (id, user_id, status) values (gen_random_uuid(), '${B}', 'active')`));
  await assert.rejects(as(B, () => db.query(`insert into workout_sessions (id, user_id, status) values (gen_random_uuid(), '${B}', 'active')`)), /one_active_session_per_user|duplicate key/);
});

test('curated exercises are readable but not writable by users', async () => {
  assert.ok((await as(A, () => db.query('select * from exercises'))).rows.length >= 10);
  await assert.rejects(as(A, () => db.query(`insert into exercises (name, muscle_group, equipment, difficulty, instructions) values ('X','x','x','beginner','x')`)), /row-level security|permission denied/);
  await as(A, () => db.query(`update exercises set name = 'Hacked'`));
  assert.equal((await db.query("select * from exercises where name = 'Hacked'")).rows.length, 0);
});
