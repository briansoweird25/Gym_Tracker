import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useExercises } from '../../features/exercises/api';
import { filterExercises, filterOptions, type ExerciseFilters } from '../../features/exercises/filter';
import { colors, muscleColor } from '../../lib/theme';
import type { Exercise } from '../../types';
import { Chip, EmptyState, ErrorState, IconBadge, Loading, Pill, TextField } from '../ui';

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
        <ScrollView key={key} horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4" style={{ flexGrow: 0, flexShrink: 0 }}>
          <Chip label={`All ${title.toLowerCase()}`} selected={!filters[key]} onPress={() => setFilters({ ...filters, [key]: undefined })} />
          {filterOptions(data, key).map((o) => (
            <Chip key={o} label={o} selected={filters[key] === o} onPress={() => setFilters({ ...filters, [key]: o })} />
          ))}
        </ScrollView>
      ))}
      <FlatList
        data={shown}
        keyExtractor={(e) => e.id}
        contentContainerClassName="gap-2 pb-6"
        ListEmptyComponent={<EmptyState icon="search-outline" title="No exercises match" hint="Try clearing a filter." />}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => onSelect(item)} className="min-h-[72px] flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3">
            <IconBadge icon="barbell" color={muscleColor(item.muscle_group)} />
            <View className="flex-1 gap-1">
              <Text className="text-base font-bold text-text">{item.name}</Text>
              <View className="flex-row gap-2">
                <Pill label={item.muscle_group} color={muscleColor(item.muscle_group)} />
                <Text className="self-center text-xs text-muted">{`${item.equipment} · ${item.difficulty}`}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}
