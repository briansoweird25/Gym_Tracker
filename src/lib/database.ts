import * as SQLite from 'expo-sqlite';

export type Statement = { sql: string; params?: unknown[] };

/** Minimal async SQLite surface; the app uses expo-sqlite, tests use better-sqlite3. */
export interface Db {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<void>;
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Runs all statements in one transaction. */
  batch(statements: Statement[]): Promise<void>;
}

const SCHEMA = `
create table if not exists active_session (
  id text primary key check (id = 'current'),
  json text not null
);
create table if not exists outbox (
  id integer primary key autoincrement,
  table_name text not null,
  row_id text not null,
  payload text not null,
  attempts integer not null default 0,
  last_error text,
  created_at text not null
);
`;

export const migrate = (db: Db) => db.exec(SCHEMA);

export async function openDatabase(): Promise<Db> {
  const d = await SQLite.openDatabaseAsync('gym.db');
  const db: Db = {
    exec: (sql) => d.execAsync(sql),
    run: async (sql, params = []) => { await d.runAsync(sql, params as SQLite.SQLiteBindParams); },
    all: <T,>(sql: string, params: unknown[] = []) => d.getAllAsync<T>(sql, params as SQLite.SQLiteBindParams),
    batch: (statements) =>
      d.withTransactionAsync(async () => {
        for (const s of statements) await d.runAsync(s.sql, (s.params ?? []) as SQLite.SQLiteBindParams);
      }),
  };
  await migrate(db);
  return db;
}
