import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { saveProfile } from '../../src/features/auth/api';
import { validateOnboarding, type OnboardingErrors, type OnboardingInput } from '../../src/features/onboarding/validation';
import { Button, Chip, TextField } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/sessionStore';
import { GOALS, LEVELS } from '../../src/types';

const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export default function Onboarding() {
  const userId = useSessionStore((s) => s.session?.user.id);
  const qc = useQueryClient();
  const [v, setV] = useState<OnboardingInput>({ name: '', goal: null, experience_level: null, days_per_week: null });
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const e = validateOnboarding(v);
    setErrors(e);
    if (Object.keys(e).length || !userId) return;
    setLoading(true);
    setFormError(null);
    try {
      await saveProfile(userId, v);
      await qc.invalidateQueries({ queryKey: ['profile', userId] }); // the auth gate then routes to tabs
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save your profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-6 pt-14">
      <View className="gap-1">
        <Text className="text-3xl font-extrabold text-text">Set your goal</Text>
        <Text className="text-base text-muted">We use this to tailor your routine.</Text>
      </View>
      <TextField label="Name" value={v.name} onChangeText={(name) => setV({ ...v, name })} error={errors.name} />
      <Section title="Goal" error={errors.goal}>
        {GOALS.map((g) => <Chip key={g} label={label(g)} selected={v.goal === g} onPress={() => setV({ ...v, goal: g })} />)}
      </Section>
      <Section title="Experience" error={errors.experience_level}>
        {LEVELS.map((l) => <Chip key={l} label={label(l)} selected={v.experience_level === l} onPress={() => setV({ ...v, experience_level: l })} />)}
      </Section>
      <Section title="Days per week" error={errors.days_per_week}>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => <Chip key={d} label={String(d)} selected={v.days_per_week === d} onPress={() => setV({ ...v, days_per_week: d })} />)}
      </Section>
      {formError ? <Text className="text-danger">{formError}</Text> : null}
      <Button title="Continue" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

function Section({ title, error, children }: { title: string; error?: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
