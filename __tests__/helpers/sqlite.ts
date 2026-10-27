import Database from 'better-sqlite3';
import type { Db, Statement } from '../../src/lib/database';

/** Real SQLite (in memory) behind the same async interface the app uses with expo-sqlite. */
export function memoryDb(file = ':memory:'): Db {
  const d = new Database(file);
  return {
    async exec(sql) { d.exec(sql); },
    async run(sql, params = []) { d.prepare(sql).run(...(params as never[])); },
    async all<T>(sql: string, params: unknown[] = []) { return d.prepare(sql).all(...(params as never[])) as T[]; },
    async batch(statements: Statement[]) {
      d.transaction(() => { for (const s of statements) d.prepare(s.sql).run(...((s.params ?? []) as never[])); })();
    },
  };
}
