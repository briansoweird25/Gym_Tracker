import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useExercises } from '../../features/exercises/api';
import { filterExercises, filterOptions, type ExerciseFilters } from '../../features/exercises/filter';
import type { Exercise } from '../../types';
import { Chip, EmptyState, ErrorState, Loading, TextField } from '../ui';

const FILTERS = [
  ['muscle_group', 'Muscle'],
  ['equipment', 'Equipment'],
  ['difficulty', 'Level'],
] as const;

export function ExerciseCatalog({ onSelect }: { onSelect: (e: Exercise) => void }) {
  const { data, isPending, error, refetch } = useExercises();
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const shown = useMemo(() => filterExercises(data ?? [], filters), [data, filters]);

  if (isPending) return <Loading />;
  if (error) return <ErrorState message="Could not load exercises. Check your connection." onRetry={refetch} />;

  return (
    <View className="flex-1 gap-3">
      <TextField label="Search" value={filters.query ?? ''} onChangeText={(query) => setFilters({ ...filters, query })} />
      {FILTERS.map(([key, title]) => (
        <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          <Chip label={`All ${title.toLowerCase()}`} selected={!filters[key]} onPress={() => setFilters({ ...filters, [key]: undefined })} />
          {filterOptions(data, key).map((o) => (
            <Chip key={o} label={o} selected={filters[key] === o} onPress={() => setFilters({ ...filters, [key]: o })} />
          ))}
        </ScrollView>
      ))}
      <FlatList
        data={shown}
        keyExtractor={(e) => e.id}
        ListEmptyComponent={<EmptyState title="No exercises match" hint="Try clearing a filter." />}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onSelect(item)} className="min-h-16 justify-center border-b border-border px-1 py-2">
            <Text className="text-base text-text">{item.name}</Text>
            <Text className="text-sm text-muted">{item.muscle_group} · {item.equipment} · {item.difficulty}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
