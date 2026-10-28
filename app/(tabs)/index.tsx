import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, ErrorState, Hero, IconBadge, Loading, SectionLabel, StatTile } from '../../src/components/ui';
import { useProfile } from '../../src/features/auth/api';
import { usePlans } from '../../src/features/plans/api';
import { useHistory } from '../../src/features/progress/api';
import { personalBests, sessionSummaries, weeklyCount } from '../../src/features/progress/stats';
import { colors } from '../../src/lib/theme';
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
  const name = profile.data?.name;
  const active = plans.data?.find((p) => p.is_active);
  const target = profile.data?.days_per_week ?? 0;
  const done = weeklyCount(history.data, new Date());
  const summaries = sessionSummaries(history.data);
  const last = summaries[0];
  const exerciseCount = active?.plan_days.reduce((n, d) => n + d.plan_exercises.length, 0) ?? 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-5 pt-14">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-muted">Welcome back</Text>
          <Text className="text-3xl font-extrabold text-text">{name ?? 'Athlete'}</Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface2">
          <Text className="text-lg font-extrabold text-accent">{(name ?? 'A').slice(0, 1).toUpperCase()}</Text>
        </View>
      </View>

      <Hero>
        <Text className="text-xs font-semibold uppercase tracking-widest text-white/70">{resuming ? 'Workout in progress' : 'Active routine'}</Text>
        <Text className="text-3xl font-extrabold text-white">{active?.name ?? 'No routine yet'}</Text>
        {active ? <Text className="text-sm text-white/70">{`${active.plan_days.length} days · ${exerciseCount} exercises`}</Text> : null}
        <View className="pt-2">
          <Button
            variant="light"
            title={resuming ? 'Resume workout' : active ? 'Start workout' : 'Create a routine'}
            onPress={() => router.navigate(active || resuming ? '/(tabs)/workout' : '/(tabs)/plans')}
          />
        </View>
      </Hero>

      <Card>
        <View className="flex-row items-center justify-between">
          <SectionLabel>This week</SectionLabel>
          <Text className="text-sm font-bold text-text">{`${done} of ${target || '—'}`}</Text>
        </View>
        <View className="flex-row gap-2 pt-1">
          {Array.from({ length: Math.max(target, done, 1) }, (_, i) => (
            <View key={i} className={`h-11 flex-1 items-center justify-center rounded-xl ${i < done ? 'bg-accent' : 'border border-border bg-surface2'}`}>
              {i < done ? <Ionicons name="checkmark" size={20} color={colors.background} /> : null}
            </View>
          ))}
        </View>
      </Card>

      <View className="flex-row gap-3">
        <StatTile icon="flame" label="Workouts" value={String(history.data.length)} color={colors.warn} />
        <StatTile icon="trophy" label="Personal bests" value={String(personalBests(history.data).length)} color={colors.accent2} />
        <StatTile icon="barbell" label="Last volume" value={last ? `${Math.round(last.volume / 10) / 100}t` : '—'} color={colors.accent} />
      </View>

      {last ? (
        <Card>
          <SectionLabel>Last workout</SectionLabel>
          <View className="flex-row items-center gap-3">
            <IconBadge icon="time-outline" color={colors.accent2} />
            <View>
              <Text className="text-base font-bold text-text">{new Date(last.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
              <Text className="text-sm text-muted">{`${last.totalSets} sets · ${Math.round(last.volume)} kg · ${last.minutes} min`}</Text>
            </View>
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}
