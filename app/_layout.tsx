import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { isProfileComplete, useProfile } from '../src/features/auth/api';
import { resolveRoute } from '../src/features/auth/gate';
import { initLocal } from '../src/services/bootstrap';
import { colors } from '../src/lib/theme';
import { supabase } from '../src/lib/supabase';
import { useSessionStore } from '../src/stores/sessionStore';

function AuthGate() {
  const { session, ready, setSession } = useSessionStore();
  const profile = useProfile(session?.user.id);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [setSession]);

  // Local storage (SQLite, interrupted-session restore, background sync) starts once signed in.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    initLocal().then((s) => (cancelled ? s() : (stop = s)));
    return () => { cancelled = true; stop?.(); };
  }, [userId]);

  useEffect(() => {
    if (!ready || (session && profile.isPending)) return;
    const target = resolveRoute({
      session: !!session,
      profileComplete: isProfileComplete(profile.data),
      group: segments[0],
      screen: (segments as string[])[1],
    });
    if (target) router.replace(target as never);
  }, [ready, session, profile.isPending, profile.data, segments, router]);

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <StatusBar style="light" />
      <AuthGate />
    </QueryClientProvider>
  );
}
