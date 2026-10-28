import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ActiveWorkoutScreen } from '../../src/components/workout/ActiveWorkoutScreen';
import { Card, Button, EmptyState, ErrorState, IconBadge, Loading, ScreenTitle } from '../../src/components/ui';
import { syncNow } from '../../src/services/bootstrap';
import { usePlans } from '../../src/features/plans/api';
import { loadPlanDayInput } from '../../src/features/sessions/api';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useWorkoutStore } from '../../src/stores/workoutStore';

export default function Workout() {
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id);
  const active = useWorkoutStore((s) => s.session);
  const start = useWorkoutStore((s) => s.start);
  const hydrated = useWorkoutStore((s) => s.hydrated);
  const plans = usePlans(userId);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return <Loading />;
  if (active) {
    return <ActiveWorkoutScreen onFinished={() => { syncNow(); router.replace({ pathname: '/session/[id]', params: { id: useWorkoutStore.getState().finished!.id } }); }} />;
  }
  if (plans.isPending) return <Loading />;
  if (plans.error) return <ErrorState message="Could not load your routine." onRetry={plans.refetch} />;

  const plan = plans.data?.find((p) => p.is_active);
  if (!plan) {
    return <EmptyState icon="barbell-outline" title="No active routine" hint="Create a routine in Plans and set it active to start a workout." />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-5 pt-14">
      <ScreenTitle title="Workout" subtitle={plan.name} />
      {error ? <Text className="text-danger">{error}</Text> : null}
      {plan.plan_days.map((day) => (
        <Card key={day.id}>
          <View className="flex-row items-center gap-3">
            <IconBadge icon="flash" />
            <View>
              <Text className="text-lg font-extrabold text-text">{day.name}</Text>
              <Text className="text-sm text-muted">{day.plan_exercises.length} exercises</Text>
            </View>
          </View>
          <Button
            title="Start workout"
            loading={starting === day.id}
            onPress={async () => {
              setStarting(day.id);
              setError(null);
              try {
                await start(await loadPlanDayInput(day), userId!);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not start the workout');
              } finally {
                setStarting(null);
              }
            }}
          />
        </Card>
      ))}
    </ScrollView>
  );
}
