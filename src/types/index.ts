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

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: ExperienceLevel;
  instructions: string;
};

export type Angle = 'front' | 'side';
export type ExerciseMedia = {
  id: string;
  exercise_id: string;
  storage_path: string;
  angle: Angle | null;
  media_type: 'video' | 'poster';
};
