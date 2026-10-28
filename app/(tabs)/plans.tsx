import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ExerciseCatalog } from '../../src/components/exercise/ExerciseCatalog';
import { ScreenTitle, Segmented } from '../../src/components/ui';
import { deletePlan, savePlan, setActivePlan } from '../../src/features/plans/api';
import { PlanBuilder } from '../../src/features/plans/PlanBuilder';
import { PlanList } from '../../src/features/plans/PlanList';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function Plans() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);
  const [segment, setSegment] = useState<'routines' | 'exercises'>('routines');
  const [building, setBuilding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: ['plans'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  if (!userId) return null;
  return (
    <View className="flex-1 gap-4 bg-background p-5 pt-14">
      <ScreenTitle title="Plans" />
      <Segmented
        value={segment}
        onChange={setSegment}
        options={[{ value: 'routines', label: 'Routines' }, { value: 'exercises', label: 'Exercises' }]}
      />
      {error ? <Text className="text-danger">{error}</Text> : null}
      {segment === 'exercises' ? (
        <ExerciseCatalog onSelect={(e) => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })} />
      ) : building ? (
        <PlanBuilder
          saving={saving}
          onCancel={() => setBuilding(false)}
          onSave={async (d) => {
            setSaving(true);
            await run(async () => {
              await savePlan(userId, d);
              setBuilding(false);
            });
            setSaving(false);
          }}
        />
      ) : (
        <PlanList
          userId={userId}
          onNew={() => setBuilding(true)}
          onActivate={(p) => run(() => setActivePlan(userId, p.id))}
          onDelete={(p) => run(() => deletePlan(p.id))}
        />
      )}
    </View>
  );
}
