import { FlatList, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, Loading, Pill } from '../../components/ui';
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
        contentContainerClassName="gap-3 pb-6"
        ListEmptyComponent={<EmptyState icon="list-outline" title="No routines yet" hint="Create one to start working out." />}
        renderItem={({ item }) => (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-extrabold text-text">{item.name}</Text>
              {item.is_active ? <Pill label="Active" /> : null}
            </View>
            {item.plan_days.map((d) => (
              <View key={d.id} className="flex-row items-center justify-between rounded-xl bg-surface2 px-3 py-2.5">
                <Text className="text-text">{d.name}</Text>
                <Text className="text-sm text-muted">{`${d.weekday != null ? `${WEEKDAYS[d.weekday]} · ` : ''}${d.plan_exercises.length} exercises`}</Text>
              </View>
            ))}
            <View className="flex-row gap-2 pt-1">
              {!item.is_active && <View className="flex-1"><Button title="Set active" variant="secondary" onPress={() => onActivate(item)} /></View>}
              <View className="flex-1"><Button title="Delete" variant="secondary" onPress={() => onDelete(item)} /></View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
