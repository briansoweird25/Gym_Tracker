import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, ErrorState, Loading, TextField } from '../../src/components/ui';
import { signOut, useProfile } from '../../src/features/auth/api';
import { addBodyWeight } from '../../src/features/progress/api';
import { useSessionStore } from '../../src/stores/sessionStore';

const pretty = (s: string | null) => (s ? s.replace(/_/g, ' ') : '—');

export default function Profile() {
  const session = useSessionStore((s) => s.session);
  const userId = session?.user.id;
  const profile = useProfile(userId);
  const qc = useQueryClient();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (profile.isPending) return <Loading />;
  if (profile.error || !profile.data) return <ErrorState message="Could not load your profile." onRetry={profile.refetch} />;
  const p = profile.data;
  const kg = parseFloat(weight.replace(',', '.'));

  async function save() {
    if (!userId || !(kg > 0 && kg < 500)) return setError('Enter a weight between 0 and 500 kg');
    setSaving(true);
    setError(null);
    try {
      await addBodyWeight(userId, kg);
      setWeight('');
      await qc.invalidateQueries({ queryKey: ['body-metrics'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your weight');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pt-14">
      <Text className="text-2xl font-bold text-text">{p.name}</Text>
      <View className="gap-1 rounded-xl bg-surface p-3">
        <Text className="text-text">{`Goal: ${pretty(p.goal)}`}</Text>
        <Text className="text-text">{`Experience: ${pretty(p.experience_level)}`}</Text>
        <Text className="text-text">{`Days per week: ${p.days_per_week ?? '—'}`}</Text>
        <Text className="text-muted">{session?.user.email}</Text>
      </View>
      <TextField label="Log body weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={error ?? undefined} />
      <Button title="Save weight" onPress={save} loading={saving} />
      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </ScrollView>
  );
}
