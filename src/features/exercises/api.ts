import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Exercise, ExerciseMedia } from '../../types';

export const useExercises = () =>
  useQuery({
    queryKey: ['exercises'],
    queryFn: async (): Promise<Exercise[]> => {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

export const useExercise = (id: string | undefined) =>
  useQuery({
    queryKey: ['exercise', id],
    enabled: !!id,
    queryFn: async (): Promise<{ exercise: Exercise; media: ExerciseMedia[] }> => {
      const [e, m] = await Promise.all([
        supabase.from('exercises').select('*').eq('id', id!).single(),
        supabase.from('exercise_media').select('*').eq('exercise_id', id!),
      ]);
      if (e.error) throw e.error;
      if (m.error) throw m.error;
      return { exercise: e.data, media: m.data };
    },
  });
