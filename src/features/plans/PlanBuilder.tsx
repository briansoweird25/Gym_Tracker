import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ExerciseCatalog } from '../../components/exercise/ExerciseCatalog';
import { Button, Chip, Stepper, TextField } from '../../components/ui';
import { useExercises } from '../exercises/api';
import {
  addDay, addExercise, emptyDraft, moveExercise, removeDay, removeExercise, updateExercise, validateDraft, type PlanDraft,
} from './builder';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PlanBuilder({ onSave, onCancel, saving }: { onSave: (d: PlanDraft) => void; onCancel: () => void; saving: boolean }) {
  const [draft, setDraft] = useState<PlanDraft>(() => emptyDraft());
  const [picking, setPicking] = useState<string | null>(null); // day id the picker adds to
  const [errors, setErrors] = useState<string[]>([]);
  const { data: exercises } = useExercises();
  const nameOf = (id: string) => exercises?.find((e) => e.id === id)?.name ?? 'Exercise';

  function save() {
    const e = validateDraft(draft);
    setErrors(e);
    if (!e.length) onSave(draft);
  }

  return (
    <ScrollView contentContainerClassName="gap-4 pb-8">
      <TextField label="Routine name" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
      {draft.days.map((day) => (
        <View key={day.id} className="gap-3 rounded-xl border border-border bg-surface p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text">{day.name}</Text>
            <Pressable accessibilityRole="button" onPress={() => setDraft(removeDay(draft, day.id))}><Text className="text-danger">Remove day</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {WEEKDAYS.map((w, i) => (
              <Chip
                key={w}
                label={w}
                selected={day.weekday === i}
                onPress={() => setDraft({ ...draft, days: draft.days.map((x) => (x.id === day.id ? { ...x, weekday: x.weekday === i ? null : i } : x)) })}
              />
            ))}
          </ScrollView>
          {day.exercises.map((e, i) => (
            <View key={e.id} className="gap-2 border-t border-border pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-text">{nameOf(e.exercise_id)}</Text>
                <Pressable accessibilityLabel="Move up" className="h-11 w-11 items-center justify-center" onPress={() => setDraft(moveExercise(draft, day.id, i, -1))}><Text className="text-text">↑</Text></Pressable>
                <Pressable accessibilityLabel="Move down" className="h-11 w-11 items-center justify-center" onPress={() => setDraft(moveExercise(draft, day.id, i, 1))}><Text className="text-text">↓</Text></Pressable>
                <Pressable accessibilityLabel="Remove exercise" className="h-11 w-11 items-center justify-center" onPress={() => setDraft(removeExercise(draft, day.id, e.id))}><Text className="text-danger">✕</Text></Pressable>
              </View>
              <View className="flex-row flex-wrap justify-between gap-2">
                <Stepper label="Sets" value={e.target_sets} min={1} max={10} onChange={(v) => setDraft(updateExercise(draft, day.id, e.id, { target_sets: v }))} />
                <Stepper label="Min reps" value={e.min_reps} min={1} max={50} onChange={(v) => setDraft(updateExercise(draft, day.id, e.id, { min_reps: v }))} />
                <Stepper label="Max reps" value={e.max_reps} min={1} max={50} onChange={(v) => setDraft(updateExercise(draft, day.id, e.id, { max_reps: v }))} />
                <Stepper label="Rest (s)" value={e.rest_seconds} min={15} max={300} step={15} onChange={(v) => setDraft(updateExercise(draft, day.id, e.id, { rest_seconds: v }))} />
              </View>
            </View>
          ))}
          <Button title="Add exercise" variant="secondary" onPress={() => setPicking(day.id)} />
        </View>
      ))}
      <Button title="Add day" variant="secondary" onPress={() => setDraft(addDay(draft, `Day ${draft.days.length + 1}`, null))} />
      {errors.map((e) => <Text key={e} className="text-danger">{e}</Text>)}
      <Button title="Save routine" onPress={save} loading={saving} />
      <Button title="Cancel" variant="secondary" onPress={onCancel} />

      <Modal visible={!!picking} animationType="slide" onRequestClose={() => setPicking(null)}>
        <View className="flex-1 gap-3 bg-background p-4 pt-14">
          <Button title="Close" variant="secondary" onPress={() => setPicking(null)} />
          <ExerciseCatalog
            onSelect={(ex) => {
              if (picking) setDraft(addExercise(draft, picking, ex.id));
              setPicking(null);
            }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
