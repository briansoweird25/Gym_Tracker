import { FlatList, Text, View } from 'react-native';
import { Button, EmptyState, ErrorState, Loading } from '../../components/ui';
import { usePlans, type PlanWithDays } from './api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PlanList({ userId, onNew, onActivate, onDelete }: {
  userId: string; onNew: () => void; onActivate: (p: PlanWithDays) => void; onDelete: (p: PlanWithDays) => void;
}) {
  const { data, isPending, error, refetch } = usePlans(userId);
  if (isPending) return <Loading />;
  if (error) return <ErrorState message="Could not load routines." onRetry={refetch} />;
  return (
    <View className="flex-1 gap-3">
      <Button title="New routine" onPress={onNew} />
      <FlatList
        data={data}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<EmptyState title="No routines yet" hint="Create one to start working out." />}
        renderItem={({ item }) => (
          <View className="mb-3 gap-2 rounded-xl border border-border bg-surface p-3">
            <Text className="text-base font-semibold text-text">{item.name}{item.is_active ? '  · Active' : ''}</Text>
            {item.plan_days.map((d) => (
              <Text key={d.id} className="text-sm text-muted">
                {d.name}{d.weekday != null ? ` (${WEEKDAYS[d.weekday]})` : ''} · {d.plan_exercises.length} exercises
              </Text>
            ))}
            <View className="flex-row gap-2">
              {!item.is_active && <View className="flex-1"><Button title="Set active" variant="secondary" onPress={() => onActivate(item)} /></View>}
              <View className="flex-1"><Button title="Delete" variant="secondary" onPress={() => onDelete(item)} /></View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
