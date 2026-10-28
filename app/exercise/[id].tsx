import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { ExerciseAnimationPlayer } from '../../src/components/exercise/ExerciseAnimationPlayer';
import { Card, ErrorState, Loading, Pill, SectionLabel } from '../../src/components/ui';
import { useExercise } from '../../src/features/exercises/api';
import { muscleColor } from '../../src/lib/theme';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, error, refetch } = useExercise(id);

  if (isPending) return <Loading />;
  if (error || !data) return <ErrorState message="Could not load this exercise." onRetry={refetch} />;
  const e = data.exercise;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-5 pt-14">
      <Text className="text-3xl font-extrabold text-text">{e.name}</Text>
      <View className="flex-row flex-wrap gap-2">
        <Pill label={e.muscle_group} color={muscleColor(e.muscle_group)} />
        <Pill label={e.equipment} color="#8b97a5" />
        <Pill label={e.difficulty} color="#ffb454" />
      </View>
      <ExerciseAnimationPlayer media={data.media} exerciseName={e.name} />
      <Card>
        <SectionLabel>How to</SectionLabel>
        <Text className="text-base leading-6 text-text">{e.instructions}</Text>
      </Card>
    </ScrollView>
  );
}
