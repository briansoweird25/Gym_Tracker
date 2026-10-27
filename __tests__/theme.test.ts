import { colors, tabs } from '../src/lib/theme';

test('theme is dark-first with a dark background', () => {
  expect(colors.background).toMatch(/^#0[0-9a-f]{5}$/i);
});

test('there are exactly five tabs in the specified order', () => {
  expect(tabs.map((t) => t.name)).toEqual(['index', 'plans', 'workout', 'progress', 'profile']);
});
