export const colors = {
  background: '#080c11',
  surface: '#121922',
  surface2: '#1a2430',
  border: '#243142',
  text: '#eef2f6',
  textMuted: '#8b97a5',
  accent: '#3ddc97',
  accent2: '#6d8bff',
  warn: '#ffb454',
  danger: '#ff6b6b',
} as const;

export const gradients = {
  primary: ['#3ddc97', '#22b8cf'],
  hero: ['#155e49', '#14315a'],
} as const;

export const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'plans', title: 'Plans', icon: 'list' },
  { name: 'workout', title: 'Workout', icon: 'barbell' },
  { name: 'progress', title: 'Progress', icon: 'stats-chart' },
  { name: 'profile', title: 'Profile', icon: 'person' },
] as const;

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#ff7a7a',
  back: '#6d8bff',
  legs: '#3ddc97',
  shoulders: '#ffb454',
  biceps: '#c084fc',
  triceps: '#f472b6',
  hamstrings: '#2dd4bf',
  core: '#fbbf24',
};

export const muscleColor = (group: string): string => MUSCLE_COLORS[group] ?? colors.accent2;
