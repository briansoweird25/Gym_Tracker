import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { colors } from '../../lib/theme';
import type { SessionExercise } from '../../features/sessions/workout';
import { Button, Card, SectionLabel, TextField } from '../ui';

type Prior = { set_number: number; weight_kg: number; reps: number }[];
const num = (s: string) => parseFloat(s.replace(',', '.'));

export function SetLogger({ exercise, previous, onComplete }: {
  exercise: SessionExercise; previous: Prior; onComplete: (v: { weight_kg: number; reps: number }) => void;
}) {
  const last = exercise.sets.at(-1) ?? previous.at(0);
  const [weight, setWeight] = useState(last ? String(last.weight_kg) : '');
  const [reps, setReps] = useState(last ? String(last.reps) : '');
  const valid = num(weight) >= 0 && num(reps) >= 1;

  return (
    <Card className="gap-3">
      <SectionLabel>Log set</SectionLabel>
      {previous.length > 0 && (
        <Text className="text-sm text-muted">{`Last time: ${previous.map((s) => `${s.weight_kg} kg × ${s.reps}`).join(', ')}`}</Text>
      )}
      {exercise.sets.map((s) => (
        <View key={s.id} className="flex-row items-center gap-3 rounded-2xl bg-surface2 px-3 py-3">
          <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
          <Text className="text-base font-semibold text-text">{`Set ${s.set_number} · ${s.weight_kg} kg × ${s.reps}`}</Text>
        </View>
      ))}
      <View className="flex-row gap-3">
        <View className="flex-1"><TextField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
        <View className="flex-1"><TextField label="Reps" value={reps} onChangeText={setReps} keyboardType="number-pad" /></View>
      </View>
      <Button title="Complete set" disabled={!valid} onPress={() => onComplete({ weight_kg: num(weight), reps: Math.round(num(reps)) })} />
    </Card>
  );
}
