import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ErrorState, Hero, Loading, SectionLabel, TextField } from '../../src/components/ui';
import { colors } from '../../src/lib/theme';
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
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-5 pt-14">
      <Hero>
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Text className="text-2xl font-extrabold text-white">{(p.name ?? 'A').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-extrabold text-white">{p.name}</Text>
            <Text className="text-sm text-white/70">{session?.user.email}</Text>
          </View>
        </View>
      </Hero>
      <Card className="gap-0 p-2">
        {([['flag', 'Goal', pretty(p.goal)], ['trending-up', 'Experience', pretty(p.experience_level)], ['calendar', 'Days per week', String(p.days_per_week ?? '—')]] as const).map(([icon, label, value]) => (
          <View key={label} className="flex-row items-center gap-3 p-3">
            <Ionicons name={icon} size={20} color={colors.accent} />
            <Text className="flex-1 text-muted">{label}</Text>
            <Text className="font-bold capitalize text-text">{value}</Text>
          </View>
        ))}
      </Card>
      <SectionLabel>Body weight</SectionLabel>
      <TextField label="Log body weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={error ?? undefined} />
      <Button title="Save weight" onPress={save} loading={saving} />
      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </ScrollView>
  );
}
