import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ActiveWorkoutScreen } from '../../src/components/workout/ActiveWorkoutScreen';
import { Button, EmptyState, ErrorState, Loading } from '../../src/components/ui';
import { usePlans } from '../../src/features/plans/api';
import { loadPlanDayInput } from '../../src/features/sessions/api';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useWorkoutStore } from '../../src/stores/workoutStore';

export default function Workout() {
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id);
  const active = useWorkoutStore((s) => s.session);
  const start = useWorkoutStore((s) => s.start);
  const plans = usePlans(userId);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (active) {
    return <ActiveWorkoutScreen onFinished={() => router.replace({ pathname: '/session/[id]', params: { id: useWorkoutStore.getState().finished!.id } })} />;
  }
  if (plans.isPending) return <Loading />;
  if (plans.error) return <ErrorState message="Could not load your routine." onRetry={plans.refetch} />;

  const plan = plans.data?.find((p) => p.is_active);
  if (!plan) {
    return <EmptyState title="No active routine" hint="Create a routine in Plans and set it active to start a workout." />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-4 pt-14">
      <Text className="text-2xl font-bold text-text">{plan.name}</Text>
      {error ? <Text className="text-danger">{error}</Text> : null}
      {plan.plan_days.map((day) => (
        <View key={day.id} className="gap-2 rounded-xl border border-border bg-surface p-3">
          <Text className="text-base font-semibold text-text">{day.name}</Text>
          <Text className="text-sm text-muted">{day.plan_exercises.length} exercises</Text>
          <Button
            title="Start workout"
            loading={starting === day.id}
            onPress={async () => {
              setStarting(day.id);
              setError(null);
              try {
                start(await loadPlanDayInput(day));
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not start the workout');
              } finally {
                setStarting(null);
              }
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
