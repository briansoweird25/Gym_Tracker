import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { remainingRest, type ActiveSession, type SessionExercise } from '../../features/sessions/workout';
import { Button } from '../ui';

const mmss = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;

function useNow(active: boolean, ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [active, ms]);
  return now;
}

export function SessionTimer({ startedAt }: { startedAt: number }) {
  const now = useNow(true);
  return <Text className="text-base tabular-nums text-muted">{mmss(Math.max(0, Math.floor((now - startedAt) / 1000)))}</Text>;
}

export function WorkoutHeader({ session }: { session: ActiveSession }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted">Exercise {session.currentIndex + 1} of {session.exercises.length}</Text>
      <SessionTimer startedAt={session.started_at} />
    </View>
  );
}

export function ExerciseInformation({ exercise }: { exercise: SessionExercise }) {
  return (
    <View className="gap-1">
      <Text className="text-2xl font-bold text-text">{exercise.name}</Text>
      <Text className="text-sm text-muted">{exercise.muscle_group} · {exercise.target_sets} × {exercise.min_reps}-{exercise.max_reps}</Text>
      <Text className="text-base text-text">{exercise.instructions}</Text>
    </View>
  );
}

export function RestTimer({ session, onSkip }: { session: ActiveSession; onSkip: () => void }) {
  const resting = !!session.rest;
  const now = useNow(resting);
  const left = remainingRest(session, now);
  useEffect(() => {
    if (resting && left === 0) onSkip();
  }, [resting, left, onSkip]);
  if (!resting) return null;
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-surface p-3">
      <Text className="text-lg text-text">{`Rest ${mmss(left)}`}</Text>
      <Button title="Skip rest" variant="secondary" onPress={onSkip} />
    </View>
  );
}

export function PreviousNextExercise({ index, count, onGo }: { index: number; count: number; onGo: (i: number) => void }) {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1"><Button title="Previous" variant="secondary" disabled={index === 0} onPress={() => onGo(index - 1)} /></View>
      <View className="flex-1"><Button title="Next" variant="secondary" disabled={index === count - 1} onPress={() => onGo(index + 1)} /></View>
    </View>
  );
}
