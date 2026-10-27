import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, EmptyState } from '../../src/components/ui';
import { summarize } from '../../src/features/sessions/workout';
import { useWorkoutStore } from '../../src/stores/workoutStore';

export default function SessionSummary() {
  const router = useRouter();
  const { finished, finishedAt } = useWorkoutStore();
  if (!finished || !finishedAt) return <EmptyState title="Session not found" />;
  const { totalSets, volume, durationMs } = summarize(finished, finishedAt);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pt-14">
      <Text className="text-3xl font-bold text-text">Workout complete</Text>
      <Text className="text-base text-muted">{`${Math.round(durationMs / 60000)} min · ${totalSets} sets · ${Math.round(volume)} kg volume`}</Text>
      {finished.exercises.map((e) => (
        <View key={e.id} className="gap-1 rounded-xl bg-surface p-3">
          <Text className="text-base font-semibold text-text">{e.name}</Text>
          {e.sets.map((s) => <Text key={s.id} className="text-muted">{`Set ${s.set_number} · ${s.weight_kg} kg × ${s.reps}`}</Text>)}
        </View>
      ))}
      <Button title="Done" onPress={() => router.replace('/(tabs)')} />
    </ScrollView>
  );
}
