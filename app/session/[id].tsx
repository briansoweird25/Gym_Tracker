import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, Hero, IconBadge, Loading } from '../../src/components/ui';
import { useHistory } from '../../src/features/progress/api';
import { sessionSummaries } from '../../src/features/progress/stats';
import { summarize } from '../../src/features/sessions/workout';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useWorkoutStore } from '../../src/stores/workoutStore';

type View_ = { stats: string; exercises: { id: string; name: string; sets: { id: string; line: string }[] }[] };

export default function SessionSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id);
  const { finished, finishedAt } = useWorkoutStore();
  const justFinished = finished?.id === id;
  const history = useHistory(justFinished ? undefined : userId);

  let view: View_ | null = null;
  if (justFinished && finished && finishedAt) {
    const t = summarize(finished, finishedAt);
    view = {
      stats: `${Math.round(t.durationMs / 60000)} min · ${t.totalSets} sets · ${Math.round(t.volume)} kg volume`,
      exercises: finished.exercises.map((e) => ({ id: e.id, name: e.name, sets: e.sets.map((s) => ({ id: s.id, line: `Set ${s.set_number} · ${s.weight_kg} kg × ${s.reps}` })) })),
    };
  } else if (history.data) {
    const s = history.data.find((x) => x.id === id);
    const sum = s && sessionSummaries([s])[0];
    if (s && sum) {
      view = {
        stats: `${sum.minutes} min · ${sum.totalSets} sets · ${Math.round(sum.volume)} kg volume`,
        exercises: s.session_exercises.map((e) => ({ id: e.id, name: e.exercises?.name ?? 'Exercise', sets: e.exercise_sets.map((x) => ({ id: `${e.id}-${x.set_number}`, line: `Set ${x.set_number} · ${x.weight_kg} kg × ${x.reps}` })) })),
      };
    }
  }

  if (!justFinished && history.isPending) return <Loading />;
  if (!justFinished && history.error) return <ErrorState message="Could not load this workout." onRetry={history.refetch} />;
  if (!view) return <EmptyState icon="search-outline" title="Workout not found" hint="It may still be syncing. Try again shortly." />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-5 pt-14">
      <Hero>
        <Text className="text-xs font-semibold uppercase tracking-widest text-white/70">{justFinished ? 'Nice work' : 'Past session'}</Text>
        <Text className="text-3xl font-extrabold text-white">{justFinished ? 'Workout complete' : 'Workout'}</Text>
        <Text className="text-base text-white/80">{view.stats}</Text>
      </Hero>
      {view.exercises.map((e) => (
        <Card key={e.id}>
          <View className="flex-row items-center gap-3">
            <IconBadge icon="barbell" size={36} />
            <Text className="text-base font-extrabold text-text">{e.name}</Text>
          </View>
          {e.sets.map((s) => <Text key={s.id} className="text-muted">{s.line}</Text>)}
        </Card>
      ))}
      <Button title="Done" onPress={() => (justFinished ? router.replace('/(tabs)') : router.back())} />
    </ScrollView>
  );
}
