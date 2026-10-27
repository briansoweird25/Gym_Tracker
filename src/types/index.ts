export const GOALS = ['build_muscle', 'lose_fat', 'strength', 'general_fitness'] as const;
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type Goal = (typeof GOALS)[number];
export type ExperienceLevel = (typeof LEVELS)[number];

export type Profile = {
  id: string;
  name: string | null;
  goal: Goal | null;
  experience_level: ExperienceLevel | null;
  days_per_week: number | null;
};
