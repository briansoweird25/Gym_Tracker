import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, ErrorState, Loading } from '../../src/components/ui';
import { useProfile } from '../../src/features/auth/api';
import { usePlans } from '../../src/features/plans/api';
import { useHistory } from '../../src/features/progress/api';
import { sessionSummaries, weeklyCount } from '../../src/features/progress/stats';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useWorkoutStore } from '../../src/stores/workoutStore';

export default function Home() {
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id);
  const profile = useProfile(userId);
  const plans = usePlans(userId);
  const history = useHistory(userId);
  const resuming = useWorkoutStore((s) => !!s.session);

  if (profile.isPending || plans.isPending || history.isPending) return <Loading />;
  if (profile.error || plans.error || history.error) {
    return <ErrorState message="Could not load your dashboard." onRetry={() => { profile.refetch(); plans.refetch(); history.refetch(); }} />;
  }
  const active = plans.data?.find((p) => p.is_active);
  const done = weeklyCount(history.data, new Date());
  const last = sessionSummaries(history.data)[0];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pt-14">
      <Text className="text-2xl font-bold text-text">{`Hi${profile.data?.name ? `, ${profile.data.name}` : ''}`}</Text>
      <View className="gap-1 rounded-xl bg-surface p-4">
        <Text className="text-sm text-muted">This week</Text>
        <Text className="text-3xl font-bold text-text">{`${done} / ${profile.data?.days_per_week ?? '—'}`}</Text>
        <Text className="text-sm text-muted">workouts completed</Text>
      </View>
      <View className="gap-2 rounded-xl bg-surface p-4">
        <Text className="text-sm text-muted">{resuming ? 'Workout in progress' : 'Active routine'}</Text>
        <Text className="text-lg font-semibold text-text">{active?.name ?? 'None yet'}</Text>
        <Button title={resuming ? 'Resume workout' : active ? 'Go to workout' : 'Create a routine'} onPress={() => router.navigate(active || resuming ? '/(tabs)/workout' : '/(tabs)/plans')} />
      </View>
      {last && (
        <View className="gap-1 rounded-xl bg-surface p-4">
          <Text className="text-sm text-muted">Last workout</Text>
          <Text className="text-text">{`${new Date(last.date).toLocaleDateString()} · ${last.totalSets} sets · ${Math.round(last.volume)} kg`}</Text>
        </View>
      )}
    </ScrollView>
  );
}
