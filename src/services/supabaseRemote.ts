import { supabase } from '../lib/supabase';
import type { Remote } from './sync';

/** Writes are upserts keyed by client-generated UUIDs, so retrying is always safe. */
export const supabaseRemote: Remote = {
  async upsert(table, row) {
    const { error } = await supabase.from(table).upsert(row);
    if (error) throw new Error(error.message);
  },
};
