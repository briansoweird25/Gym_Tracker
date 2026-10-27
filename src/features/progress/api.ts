import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { newId } from '../../utils/uuid';
import type { HistorySession } from './stats';

export const useHistory = (userId: string | undefined) =>
  useQuery({
    queryKey: ['history', userId],
    enabled: !!userId,
    queryFn: async (): Promise<HistorySession[]> => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, started_at, ended_at, session_exercises(id, exercise_id, exercises(name), exercise_sets(set_number, weight_kg, reps))')
        .eq('user_id', userId!)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as HistorySession[];
    },
  });

export const useBodyMetrics = (userId: string | undefined) =>
  useQuery({
    queryKey: ['body-metrics', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('body_metrics').select('weight_kg, recorded_at').eq('user_id', userId!).order('recorded_at');
      if (error) throw error;
      return data as { weight_kg: number; recorded_at: string }[];
    },
  });

export async function addBodyWeight(userId: string, weightKg: number) {
  const { error } = await supabase.from('body_metrics').insert({ id: newId(), user_id: userId, weight_kg: weightKg });
  if (error) throw error;
}
