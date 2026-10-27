import { openDatabase } from '../lib/database';
import { useWorkoutStore } from '../stores/workoutStore';
import { LocalStore } from './persistence';
import { supabaseRemote } from './supabaseRemote';
import { createSyncRunner, startAutoSync } from './sync';

let runner: (() => Promise<unknown>) | null = null;

/** Triggers a sync if local storage is ready (no-op otherwise). */
export const syncNow = () => { void runner?.(); };

/** Opens SQLite, restores an interrupted workout and starts background sync. Returns a cleanup function. */
export async function initLocal(): Promise<() => void> {
  const db = await openDatabase();
  const store = useWorkoutStore.getState();
  store.attach(new LocalStore(db));
  await store.restore();
  const run = createSyncRunner(db, supabaseRemote);
  runner = run;
  void run();
  const stop = startAutoSync(run);
  return () => { stop(); runner = null; };
}
