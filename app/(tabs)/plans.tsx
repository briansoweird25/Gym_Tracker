import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ExerciseCatalog } from '../../src/components/exercise/ExerciseCatalog';
import { Chip } from '../../src/components/ui';

export default function Plans() {
  const router = useRouter();
  const [segment, setSegment] = useState<'routines' | 'exercises'>('routines');
  return (
    <View className="flex-1 gap-3 bg-background p-4 pt-14">
      <View className="flex-row gap-2">
        <Chip label="Routines" selected={segment === 'routines'} onPress={() => setSegment('routines')} />
        <Chip label="Exercises" selected={segment === 'exercises'} onPress={() => setSegment('exercises')} />
      </View>
      {segment === 'exercises' ? (
        <ExerciseCatalog onSelect={(e) => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })} />
      ) : (
        <Text className="text-muted">Routines</Text>
      )}
    </View>
  );
}
