import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { ExerciseAnimationPlayer } from '../../src/components/exercise/ExerciseAnimationPlayer';
import { ErrorState, Loading } from '../../src/components/ui';
import { useExercise } from '../../src/features/exercises/api';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, error, refetch } = useExercise(id);

  if (isPending) return <Loading />;
  if (error || !data) return <ErrorState message="Could not load this exercise." onRetry={refetch} />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <Text className="text-2xl font-bold text-text">{data.exercise.name}</Text>
      <Text className="text-muted">{data.exercise.muscle_group} · {data.exercise.equipment} · {data.exercise.difficulty}</Text>
      <ExerciseAnimationPlayer media={data.media} />
      <Text className="text-base text-text">{data.exercise.instructions}</Text>
    </ScrollView>
  );
}
