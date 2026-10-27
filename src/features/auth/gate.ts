type GateInput = { session: boolean; profileComplete: boolean; group?: string; screen?: string };

/** Returns the route to redirect to, or null when the user is already in the right place. */
export function resolveRoute({ session, profileComplete, group, screen }: GateInput): string | null {
  const inAuth = group === '(auth)';
  if (!session) return inAuth ? null : '/(auth)/sign-in';
  if (!profileComplete) return inAuth && screen === 'onboarding' ? null : '/(auth)/onboarding';
  return inAuth ? '/(tabs)' : null;
}
