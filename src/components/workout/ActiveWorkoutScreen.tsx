import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { usePreviousSets } from '../../features/sessions/api';
import { useWorkoutStore } from '../../stores/workoutStore';
import { Button } from '../ui';
import { ExerciseAnimationPlayer } from '../exercise/ExerciseAnimationPlayer';
import { ExerciseInformation, PreviousNextExercise, RestTimer, WorkoutHeader } from './parts';
import { SetLogger } from './SetLogger';

export function ActiveWorkoutScreen({ onFinished }: { onFinished: () => void }) {
  const session = useWorkoutStore((s) => s.session);
  const { log, goTo, finish } = useWorkoutStore.getState();
  const error = useWorkoutStore((s) => s.error);
  const exercise = session?.exercises[session.currentIndex];
  const previous = usePreviousSets(exercise?.exercise_id ?? '', session?.id ?? '');
  const onSkip = useCallback(() => { void useWorkoutStore.getState().skipRest(); }, []);

  if (!session || !exercise) return null;
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
      <WorkoutHeader session={session} />
      <ExerciseAnimationPlayer media={exercise.media} />
      <RestTimer session={session} onSkip={onSkip} />
      <ExerciseInformation exercise={exercise} />
      {/* key resets the input fields per exercise without touching the player above */}
      <SetLogger key={exercise.id} exercise={exercise} previous={previous.data ?? []} onComplete={log} />
      {error ? <Text className="text-danger">{error}</Text> : null}
      <PreviousNextExercise index={session.currentIndex} count={session.exercises.length} onGo={goTo} />
      <View className="pt-2">
        <Button title="Finish workout" onPress={async () => { if (await finish()) onFinished(); }} />
      </View>
    </ScrollView>
  );
}
