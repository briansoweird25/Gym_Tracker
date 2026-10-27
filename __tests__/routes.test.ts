import fs from 'fs';
import path from 'path';

const files = [
  '_layout.tsx',
  '(auth)/sign-in.tsx', '(auth)/sign-up.tsx', '(auth)/onboarding.tsx',
  '(tabs)/_layout.tsx', '(tabs)/index.tsx', '(tabs)/plans.tsx',
  '(tabs)/workout.tsx', '(tabs)/progress.tsx', '(tabs)/profile.tsx',
  'exercise/[id].tsx', 'session/[id].tsx',
];

test.each(files)('route app/%s exists', (f) => {
  expect(fs.existsSync(path.join(__dirname, '..', 'app', f))).toBe(true);
});
