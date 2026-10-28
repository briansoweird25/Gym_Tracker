import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { remainingRest, type ActiveSession, type SessionExercise } from '../../features/sessions/workout';
import { colors, muscleColor } from '../../lib/theme';
import { Button, Pill } from '../ui';

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
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-surface2 px-3 py-1.5">
      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
      <Text className="text-sm font-bold tabular-nums text-text">{mmss(Math.max(0, Math.floor((now - startedAt) / 1000)))}</Text>
    </View>
  );
}

export function WorkoutHeader({ session }: { session: ActiveSession }) {
  const pct = ((session.currentIndex + 1) / session.exercises.length) * 100;
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-muted">Exercise {session.currentIndex + 1} of {session.exercises.length}</Text>
        <SessionTimer startedAt={session.started_at} />
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-surface2">
        <View style={{ width: `${pct}%` }} className="h-full rounded-full bg-accent" />
      </View>
    </View>
  );
}

export function ExerciseInformation({ exercise }: { exercise: SessionExercise }) {
  return (
    <View className="gap-2">
      <Text className="text-3xl font-extrabold text-text">{exercise.name}</Text>
      <View className="flex-row items-center gap-2">
        <Pill label={exercise.muscle_group} color={muscleColor(exercise.muscle_group)} />
        <Text className="text-sm text-muted">{`${exercise.target_sets} × ${exercise.min_reps}-${exercise.max_reps}`}</Text>
      </View>
      <Text className="text-base leading-6 text-muted">{exercise.instructions}</Text>
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
  if (!resting || !session.rest) return null;
  const pct = Math.min(100, (left / session.rest.total) * 100);
  return (
    <View className="gap-3 rounded-3xl border border-accent/40 bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold tabular-nums text-accent">{`Rest ${mmss(left)}`}</Text>
        <View className="w-32"><Button title="Skip rest" variant="secondary" onPress={onSkip} /></View>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface2">
        <View style={{ width: `${pct}%` }} className="h-full rounded-full bg-accent" />
      </View>
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
