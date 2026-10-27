import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

type SessionState = { session: Session | null; ready: boolean; setSession: (s: Session | null) => void };

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  ready: false,
  setSession: (session) => set({ session, ready: true }),
}));
