import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Chip, Card, EmptyState, ErrorState, IconBadge, Loading, ScreenTitle, SectionLabel } from '../../src/components/ui';
import { colors } from '../../src/lib/theme';
import { LineChartCard } from '../../src/components/ui/LineChartCard';
import { useBodyMetrics, useHistory } from '../../src/features/progress/api';
import { bodyWeightSeries, exerciseSeries, personalBests, sessionSummaries } from '../../src/features/progress/stats';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function Progress() {
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id);
  const history = useHistory(userId);
  const body = useBodyMetrics(userId);
  const [picked, setPicked] = useState<string | null>(null);

  const bests = useMemo(() => personalBests(history.data ?? []), [history.data]);
  const summaries = useMemo(() => sessionSummaries(history.data ?? []), [history.data]);
  const exerciseId = picked ?? bests[0]?.exercise_id ?? null;

  if (history.isPending) return <Loading />;
  if (history.error) return <ErrorState message="Could not load your history." onRetry={history.refetch} />;
  if (!history.data.length) return <EmptyState icon="stats-chart-outline" title="No workouts yet" hint="Finish a workout and your history and progress appear here." />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-5 pt-14">
      <ScreenTitle title="Progress" subtitle="Heaviest set per workout" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {bests.map((b) => <Chip key={b.exercise_id} label={b.name} selected={b.exercise_id === exerciseId} onPress={() => setPicked(b.exercise_id)} />)}
      </ScrollView>
      {exerciseId && <LineChartCard title={bests.find((b) => b.exercise_id === exerciseId)?.name ?? ''} points={exerciseSeries(history.data, exerciseId)} />}

      <LineChartCard title="Body weight" points={bodyWeightSeries(body.data ?? [])} />

      <SectionLabel>Personal bests</SectionLabel>
      <Card className="gap-0 p-2">
        {bests.map((b) => (
          <View key={b.exercise_id} className="flex-row items-center gap-3 p-2">
            <IconBadge icon="trophy" color={colors.warn} size={36} />
            <Text className="flex-1 text-base text-text">{b.name}</Text>
            <Text className="text-base font-extrabold text-text">{`${b.weight_kg} kg × ${b.reps}`}</Text>
          </View>
        ))}
      </Card>

      <SectionLabel>History</SectionLabel>
      {summaries.map((s) => (
        <Pressable key={s.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/session/[id]', params: { id: s.id } })} className="min-h-[72px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <IconBadge icon="calendar-outline" color={colors.accent2} size={40} />
          <View className="flex-1">
          <Text className="text-base text-text">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
          <Text className="text-sm text-muted">{`${s.totalSets} sets · ${Math.round(s.volume)} kg volume · ${s.minutes} min`}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
