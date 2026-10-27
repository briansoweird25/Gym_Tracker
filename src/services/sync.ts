import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import type { Db } from '../lib/database';

export interface Remote {
  upsert(table: string, row: object): Promise<void>;
}

type OutboxRow = { id: number; table_name: string; payload: string };
export type SyncResult = { synced: number; remaining: number; error: string | null };

/** Pushes queued changes oldest-first. Stops at the first failure so parent rows always precede children. */
export async function syncOutbox(db: Db, remote: Remote): Promise<SyncResult> {
  let synced = 0;
  let error: string | null = null;
  for (;;) {
    const [row] = await db.all<OutboxRow>('select id, table_name, payload from outbox order by id limit 1');
    if (!row) break;
    try {
      await remote.upsert(row.table_name, JSON.parse(row.payload));
      await db.run('delete from outbox where id = ?', [row.id]);
      synced += 1;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      await db.run('update outbox set attempts = attempts + 1, last_error = ? where id = ?', [error, row.id]);
      break;
    }
  }
  const [{ n }] = await db.all<{ n: number }>('select count(*) as n from outbox');
  return { synced, remaining: n, error };
}

/** Coalesces concurrent triggers into a single in-flight sync. */
export function createSyncRunner(db: Db, remote: Remote) {
  let inFlight: Promise<SyncResult> | null = null;
  return () => {
    inFlight ??= syncOutbox(db, remote).finally(() => { inFlight = null; });
    return inFlight;
  };
}

/** Syncs when connectivity returns and when the app comes to the foreground. Returns an unsubscribe. */
export function startAutoSync(run: () => Promise<unknown>) {
  const net = NetInfo.addEventListener((s) => { if (s.isConnected) void run(); });
  const app = AppState.addEventListener('change', (st) => { if (st === 'active') void run(); });
  return () => { net(); app.remove(); };
}
