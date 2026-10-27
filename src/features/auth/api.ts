import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';
import type { OnboardingInput } from '../onboarding/validation';

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email: email.trim(), password });

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email: email.trim(), password });

export const signOut = () => supabase.auth.signOut();

export async function saveProfile(userId: string, v: OnboardingInput) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name: v.name.trim(), goal: v.goal, experience_level: v.experience_level, days_per_week: v.days_per_week });
  if (error) throw error;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export const isProfileComplete = (p: Profile | null | undefined) =>
  !!p && !!p.name && !!p.goal && !!p.experience_level && !!p.days_per_week;
