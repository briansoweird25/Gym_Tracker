import type { Db, Statement } from '../lib/database';
import type { ActiveSession, SetEntry } from '../features/sessions/workout';

const iso = (ms: number) => new Date(ms).toISOString();

const saveActiveSql = (s: ActiveSession): Statement => ({
  sql: "insert into active_session (id, json) values ('current', ?) on conflict (id) do update set json = excluded.json",
  params: [JSON.stringify(s)],
});

type Row = { id: string } & Record<string, unknown>;

const queue = (table: string, row: Row): Statement => ({
  sql: 'insert into outbox (table_name, row_id, payload, created_at) values (?, ?, ?, ?)',
  params: [table, row.id, JSON.stringify(row), iso(Date.now())],
});

const sessionRow = (s: ActiveSession, status: 'active' | 'completed', endedAt?: number) => ({
  id: s.id,
  user_id: s.user_id,
  plan_day_id: s.plan_day_id,
  started_at: iso(s.started_at),
  ended_at: endedAt ? iso(endedAt) : null,
  status,
});

/** On-device source of truth for the active workout plus the queue of changes waiting to sync. */
export class LocalStore {
  constructor(private db: Db) {}

  async loadActive(): Promise<ActiveSession | null> {
    const rows = await this.db.all<{ json: string }>("select json from active_session where id = 'current'");
    return rows[0] ? (JSON.parse(rows[0].json) as ActiveSession) : null;
  }

  saveActive(s: ActiveSession) {
    return this.db.batch([saveActiveSql(s)]);
  }

  recordStart(s: ActiveSession) {
    return this.db.batch([
      saveActiveSql(s),
      queue('workout_sessions', sessionRow(s, 'active')),
      ...s.exercises.map((e) => queue('session_exercises', { id: e.id, session_id: s.id, exercise_id: e.exercise_id, position: e.position })),
    ]);
  }

  recordSet(s: ActiveSession, set: SetEntry) {
    const exercise = s.exercises.find((e) => e.sets.some((x) => x.id === set.id))!;
    return this.db.batch([
      saveActiveSql(s),
      queue('exercise_sets', {
        id: set.id, session_exercise_id: exercise.id, set_number: set.set_number,
        weight_kg: set.weight_kg, reps: set.reps, completed_at: iso(set.completed_at),
      }),
    ]);
  }

  recordFinish(s: ActiveSession, endedAt: number) {
    return this.db.batch([
      { sql: "delete from active_session where id = 'current'" },
      queue('workout_sessions', sessionRow(s, 'completed', endedAt)),
    ]);
  }
}
