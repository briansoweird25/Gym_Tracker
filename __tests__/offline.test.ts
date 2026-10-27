import { migrate } from '../src/lib/database';
import { LocalStore } from '../src/services/persistence';
import { createSyncRunner, syncOutbox, type Remote } from '../src/services/sync';
import { createSession, logSet, goTo, type PlanDayInput } from '../src/features/sessions/workout';
import { useWorkoutStore } from '../src/stores/workoutStore';
import { memoryDb } from './helpers/sqlite';

const day: PlanDayInput = {
  plan_day_id: null,
  exercises: [
    { exercise_id: 'e1', name: 'Squat', muscle_group: 'legs', instructions: 'i', media: [], target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 90 },
    { exercise_id: 'e2', name: 'Press', muscle_group: 'chest', instructions: 'i', media: [], target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 60 },
  ],
};
const T0 = Date.UTC(2026, 0, 1, 10);

async function setup() {
  const db = memoryDb();
  await migrate(db);
  return { db, local: new LocalStore(db) };
}

/** A server stand-in with upsert-by-id semantics, like Postgres `insert ... on conflict (id) do update`. */
function fakeRemote(failFirst = 0) {
  const rows = new Map<string, Record<string, unknown>>();
  let calls = 0;
  const remote: Remote = {
    async upsert(table, row) {
      if (++calls <= failFirst) throw new Error('offline');
      rows.set(`${table}:${(row as { id: string }).id}`, row as Record<string, unknown>);
    },
  };
  return { remote, rows, calls: () => calls };
}

describe('local persistence', () => {
  test('migrate is idempotent', async () => {
    const { db } = await setup();
    await migrate(db);
  });

  test('an active session survives a restart (new LocalStore on the same db)', async () => {
    const { db, local } = await setup();
    let s = createSession(day, T0, undefined, 'user-1');
    await local.recordStart(s);
    s = logSet(s, { weight_kg: 60, reps: 10 }, T0 + 1000);
    await local.recordSet(s, s.exercises[0].sets[0]);
    s = goTo(s, 1);
    await local.saveActive(s);

    const restored = await new LocalStore(db).loadActive();
    expect(restored).toEqual(s);
  });

  test('start and sets queue upserts in foreign-key order', async () => {
    const { db, local } = await setup();
    let s = createSession(day, T0, undefined, 'user-1');
    await local.recordStart(s);
    s = logSet(s, { weight_kg: 60, reps: 10 }, T0 + 1000);
    await local.recordSet(s, s.exercises[0].sets[0]);
    const q = await db.all<{ table_name: string }>('select table_name from outbox order by id');
    expect(q.map((r) => r.table_name)).toEqual(['workout_sessions', 'session_exercises', 'session_exercises', 'exercise_sets']);
  });

  test('finishing queues the completed session and clears the active snapshot', async () => {
    const { db, local } = await setup();
    const s = createSession(day, T0, undefined, 'user-1');
    await local.recordStart(s);
    await local.recordFinish(s, T0 + 60_000);
    expect(await local.loadActive()).toBeNull();
    const last = (await db.all<{ table_name: string; payload: string }>('select * from outbox order by id desc limit 1'))[0];
    expect(last.table_name).toBe('workout_sessions');
    expect(JSON.parse(last.payload)).toMatchObject({ id: s.id, status: 'completed', ended_at: new Date(T0 + 60_000).toISOString() });
  });
});

describe('sync', () => {
  async function queued() {
    const { db, local } = await setup();
    let s = createSession(day, T0, undefined, 'user-1');
    await local.recordStart(s);
    s = logSet(s, { weight_kg: 60, reps: 10 }, T0 + 1000);
    await local.recordSet(s, s.exercises[0].sets[0]);
    await local.recordFinish(s, T0 + 2000);
    return { db };
  }

  test('pushes everything in order and empties the queue', async () => {
    const { db } = await queued();
    const { remote, rows } = fakeRemote();
    const r = await syncOutbox(db, remote);
    expect(r).toEqual({ synced: 5, remaining: 0, error: null });
    expect(rows.size).toBe(4); // session (upserted twice -> one row), 2 session exercises, 1 set
    expect([...rows.keys()].filter((k) => k.startsWith('exercise_sets:'))).toHaveLength(1);
  });

  test('a failure stops the run, keeps order, and a retry creates no duplicates', async () => {
    const { db } = await queued();
    const { remote, rows } = fakeRemote(2); // first two attempts in total fail
    const first = await syncOutbox(db, remote);
    expect(first).toMatchObject({ synced: 0, remaining: 5, error: 'offline' });
    const second = await syncOutbox(db, remote); // one more failure? calls 2 fails
    expect(second.synced + second.remaining).toBe(5);
    const third = await syncOutbox(db, remote);
    expect(third.remaining).toBe(0);
    expect(rows.size).toBe(4);
    // re-running a fully synced queue is a no-op
    expect(await syncOutbox(db, remote)).toEqual({ synced: 0, remaining: 0, error: null });
  });

  test('retried rows are not sent twice once acknowledged', async () => {
    const { db } = await queued();
    const { remote, calls } = fakeRemote();
    await syncOutbox(db, remote);
    await syncOutbox(db, remote);
    expect(calls()).toBe(5);
  });

  test('the runner never runs two syncs at once', async () => {
    const { db } = await queued();
    const { remote, calls } = fakeRemote();
    const run = createSyncRunner(db, remote);
    await Promise.all([run(), run(), run()]);
    expect(calls()).toBe(5);
  });
});

describe('workout store persists before reflecting success', () => {
  beforeEach(() => {
    useWorkoutStore.setState({ session: null, finished: null, finishedAt: null, error: null, hydrated: true });
  });

  test('log writes to SQLite before state updates, and the set survives a restart', async () => {
    const { db, local } = await setup();
    useWorkoutStore.getState().attach(local);
    await useWorkoutStore.getState().start(day, 'user-1');
    const seen: number[] = [];
    const orig = local.recordSet.bind(local);
    local.recordSet = async (s, e) => { seen.push(useWorkoutStore.getState().session!.exercises[0].sets.length); await orig(s, e); };

    await useWorkoutStore.getState().log({ weight_kg: 50, reps: 5 });

    expect(seen).toEqual([0]); // store still empty when persistence ran
    expect(useWorkoutStore.getState().session!.exercises[0].sets).toHaveLength(1);
    useWorkoutStore.setState({ session: null });
    await useWorkoutStore.getState().restore();
    expect(useWorkoutStore.getState().session!.exercises[0].sets[0]).toMatchObject({ weight_kg: 50, reps: 5 });
    expect(await db.all('select 1 from outbox where table_name = ?', ['exercise_sets'])).toHaveLength(1);
  });

  test('if the write fails the set is not shown as saved', async () => {
    const { local } = await setup();
    useWorkoutStore.getState().attach(local);
    await useWorkoutStore.getState().start(day, 'user-1');
    local.recordSet = async () => { throw new Error('disk full'); };
    await useWorkoutStore.getState().log({ weight_kg: 50, reps: 5 });
    expect(useWorkoutStore.getState().session!.exercises[0].sets).toHaveLength(0);
    expect(useWorkoutStore.getState().error).toMatch(/disk full/);
  });

  test('finish queues the session for sync and keeps a summary snapshot', async () => {
    const { db, local } = await setup();
    useWorkoutStore.getState().attach(local);
    await useWorkoutStore.getState().start(day, 'user-1');
    await useWorkoutStore.getState().log({ weight_kg: 50, reps: 5 });
    await useWorkoutStore.getState().finish();
    expect(useWorkoutStore.getState().session).toBeNull();
    expect(useWorkoutStore.getState().finished?.exercises[0].sets).toHaveLength(1);
    expect(await local.loadActive()).toBeNull();
    expect((await db.all('select 1 from outbox')).length).toBeGreaterThan(0);
  });
});
