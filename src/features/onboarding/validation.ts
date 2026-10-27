import { GOALS, LEVELS, type ExperienceLevel, type Goal } from '../../types';

export type OnboardingInput = {
  name: string;
  goal: Goal | null;
  experience_level: ExperienceLevel | null;
  days_per_week: number | null;
};
export type OnboardingErrors = Partial<Record<keyof OnboardingInput, string>>;

export function validateOnboarding(v: OnboardingInput): OnboardingErrors {
  const errors: OnboardingErrors = {};
  if (!v.name.trim()) errors.name = 'Enter your name';
  if (!v.goal || !GOALS.includes(v.goal)) errors.goal = 'Choose a goal';
  if (!v.experience_level || !LEVELS.includes(v.experience_level)) errors.experience_level = 'Choose your experience';
  if (!v.days_per_week || v.days_per_week < 1 || v.days_per_week > 7) errors.days_per_week = 'Choose 1 to 7 days';
  return errors;
}
