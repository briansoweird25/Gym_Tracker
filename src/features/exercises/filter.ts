import type { Exercise } from '../../types';

export type ExerciseFilters = Partial<Pick<Exercise, 'muscle_group' | 'equipment' | 'difficulty'>> & { query?: string };

export function filterExercises(list: Exercise[], f: ExerciseFilters): Exercise[] {
  const q = f.query?.trim().toLowerCase();
  return list.filter(
    (e) =>
      (!f.muscle_group || e.muscle_group === f.muscle_group) &&
      (!f.equipment || e.equipment === f.equipment) &&
      (!f.difficulty || e.difficulty === f.difficulty) &&
      (!q || e.name.toLowerCase().includes(q)),
  );
}

export function filterOptions(list: Exercise[], key: 'muscle_group' | 'equipment' | 'difficulty'): string[] {
  return [...new Set(list.map((e) => e[key]))].sort();
}
