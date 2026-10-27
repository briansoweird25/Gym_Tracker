import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Exercise, ExerciseMedia } from '../../types';
import type { PlanWithDays } from '../plans/api';
import { latestSessionSets, type PlanDayInput } from './workout';

/** Snapshots exercise details and media into the session so it can run (and survive restarts) without refetching. */
export async function loadPlanDayInput(day: PlanWithDays['plan_days'][number]): Promise<PlanDayInput> {
  const ids = day.plan_exercises.map((e) => e.exercise_id);
  const [ex, media] = await Promise.all([
    supabase.from('exercises').select('*').in('id', ids),
    supabase.from('exercise_media').select('*').in('exercise_id', ids),
  ]);
  if (ex.error) throw ex.error;
  if (media.error) throw media.error;
  const byId = new Map((ex.data as Exercise[]).map((e) => [e.id, e]));
  return {
    plan_day_id: day.id,
    exercises: [...day.plan_exercises]
      .sort((a, b) => a.position - b.position)
      .map((pe) => {
        const e = byId.get(pe.exercise_id)!;
        return {
          exercise_id: e.id, name: e.name, muscle_group: e.muscle_group, instructions: e.instructions,
          media: (media.data as ExerciseMedia[]).filter((m) => m.exercise_id === e.id),
          target_sets: pe.target_sets, min_reps: pe.min_reps, max_reps: pe.max_reps, rest_seconds: pe.rest_seconds,
        };
      }),
  };
}

export const usePreviousSets = (exerciseId: string, currentSessionId: string) =>
  useQuery({
    queryKey: ['previous-sets', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_sets')
        .select('set_number, weight_kg, reps, session_exercises!inner(session_id, exercise_id, workout_sessions!inner(started_at, status))')
        .eq('session_exercises.exercise_id', exerciseId)
        .eq('session_exercises.workout_sessions.status', 'completed')
        .neq('session_exercises.session_id', currentSessionId)
        .limit(200);
      if (error) throw error;
      return latestSessionSets(data as never);
    },
  });
