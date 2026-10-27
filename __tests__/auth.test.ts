import { validateCredentials } from '../src/features/auth/validation';
import { validateOnboarding } from '../src/features/onboarding/validation';
import { resolveRoute } from '../src/features/auth/gate';

describe('validateCredentials', () => {
  test('accepts a valid email and 8+ char password', () => {
    expect(validateCredentials('a@b.co', 'password1')).toEqual({});
  });
  test('rejects a malformed email', () => {
    expect(validateCredentials('nope', 'password1').email).toBeDefined();
  });
  test('rejects a short password', () => {
    expect(validateCredentials('a@b.co', 'short').password).toBeDefined();
  });
});

describe('validateOnboarding', () => {
  const ok = { name: 'Sam', goal: 'build_muscle', experience_level: 'beginner', days_per_week: 3 } as const;
  test('accepts a complete profile', () => {
    expect(validateOnboarding(ok)).toEqual({});
  });
  test('requires name, goal, level and days between 1 and 7', () => {
    const e = validateOnboarding({ name: ' ', goal: null, experience_level: null, days_per_week: 8 });
    expect(Object.keys(e).sort()).toEqual(['days_per_week', 'experience_level', 'goal', 'name']);
  });
});

describe('resolveRoute (auth gate)', () => {
  test('signed out outside auth goes to sign-in', () => {
    expect(resolveRoute({ session: false, profileComplete: false, group: '(tabs)' })).toBe('/(auth)/sign-in');
  });
  test('signed out inside auth stays', () => {
    expect(resolveRoute({ session: false, profileComplete: false, group: '(auth)' })).toBeNull();
  });
  test('signed in without profile is sent to onboarding', () => {
    expect(resolveRoute({ session: true, profileComplete: false, group: '(tabs)' })).toBe('/(auth)/onboarding');
  });
  test('signed in with profile leaves auth screens', () => {
    expect(resolveRoute({ session: true, profileComplete: true, group: '(auth)' })).toBe('/(tabs)');
  });
  test('signed in without profile may stay on onboarding', () => {
    expect(resolveRoute({ session: true, profileComplete: false, group: '(auth)', screen: 'onboarding' })).toBeNull();
  });
});
