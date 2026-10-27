export const colors = {
  background: "#0b0f14",
  surface: '#151b23',
  border: '#232c37',
  text: '#e8edf2',
  textMuted: '#8b97a5',
  accent: '#3ddc97',
  danger: '#ff6b6b',
} as const;

export const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'plans', title: 'Plans', icon: 'list' },
  { name: 'workout', title: 'Workout', icon: 'barbell' },
  { name: 'progress', title: 'Progress', icon: 'stats-chart' },
  { name: 'profile', title: 'Profile', icon: 'person' },
] as const;
