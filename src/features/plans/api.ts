import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toRows, type PlanDraft } from './builder';

export type PlanWithDays = {
  id: string;
  name: string;
  is_active: boolean;
  plan_days: {
    id: string;
    name: string;
    weekday: number | null;
    plan_exercises: {
      id: string; exercise_id: string; position: number; target_sets: number;
      min_reps: number; max_reps: number; rest_seconds: number; exercises: { name: string } | null;
    }[];
  }[];
};

export const usePlans = (userId: string | undefined) =>
  useQuery({
    queryKey: ['plans', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PlanWithDays[]> => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, name, is_active, plan_days(id, name, weekday, plan_exercises(id, exercise_id, position, target_sets, min_reps, max_reps, rest_seconds, exercises(name)))')
        .order('name');
      if (error) throw error;
      return data as unknown as PlanWithDays[];
    },
  });

/** Client-generated UUIDs make this upsert safe to retry without duplicates. */
export async function savePlan(userId: string, draft: PlanDraft) {
  const rows = toRows(draft, userId);
  const r1 = await supabase.from('workout_plans').upsert(rows.plan);
  if (r1.error) throw r1.error;
  const r2 = await supabase.from('plan_days').upsert(rows.days);
  if (r2.error) throw r2.error;
  const r3 = await supabase.from('plan_exercises').upsert(rows.exercises);
  if (r3.error) throw r3.error;
}

export async function setActivePlan(userId: string, planId: string) {
  const off = await supabase.from('workout_plans').update({ is_active: false }).eq('user_id', userId);
  if (off.error) throw off.error;
  const on = await supabase.from('workout_plans').update({ is_active: true }).eq('id', planId);
  if (on.error) throw on.error;
}

export async function deletePlan(planId: string) {
  const { error } = await supabase.from('workout_plans').delete().eq('id', planId);
  if (error) throw error;
}

export const usePlansInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['plans'] });
};
