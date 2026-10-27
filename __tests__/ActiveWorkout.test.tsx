import { fireEvent, render, screen } from '@testing-library/react-native';
import { createSession } from '../src/features/sessions/workout';
import { useWorkoutStore } from '../src/stores/workoutStore';

const mockCounts = { mounts: 0, sources: [] as unknown[] };
jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: (source: unknown) => {
      mockCounts.sources.push(source);
      return { loop: false, muted: false, playbackRate: 1, play: jest.fn(), pause: jest.fn() };
    },
    VideoView: () => {
      React.useEffect(() => { mockCounts.mounts += 1; }, []);
      return <View testID="video" />;
    },
  };
});
jest.mock('../src/features/sessions/api', () => ({ usePreviousSets: () => ({ data: [{ set_number: 1, weight_kg: 55, reps: 10 }] }) }));

import { ActiveWorkoutScreen } from '../src/components/workout/ActiveWorkoutScreen';

const media = (id: string, path: string) => [{ id, exercise_id: id, storage_path: path, angle: 'front' as const, media_type: 'video' as const }];
const exercise = (id: string, name: string, path: string) => ({
  exercise_id: id, name, muscle_group: 'legs', instructions: `How to ${name}`, media: media(id, path),
  target_sets: 3, min_reps: 8, max_reps: 12, rest_seconds: 90,
});

beforeEach(() => {
  mockCounts.mounts = 0;
  mockCounts.sources = [];
  useWorkoutStore.setState({
    session: createSession({ plan_day_id: null, exercises: [exercise('e1', 'Squat', 'squat.mp4'), exercise('e2', 'Press', 'press.mp4')] }, Date.now()),
    finished: null,
  });
});

test('video stays mounted while typing weight/reps, completing sets and changing exercise', async () => {
  await render(<ActiveWorkoutScreen onFinished={() => {}} />);
  expect(mockCounts.mounts).toBe(1);

  await fireEvent.changeText(screen.getByLabelText('Weight (kg)'), '62.5');
  await fireEvent.changeText(screen.getByLabelText('Reps'), '8');
  await fireEvent.press(screen.getByText('Complete set'));
  await fireEvent.press(screen.getByText('Complete set'));
  expect(screen.getByText('Set 1 · 62.5 kg × 8')).toBeTruthy();
  expect(screen.getByText('Set 2 · 62.5 kg × 8')).toBeTruthy();
  expect(mockCounts.mounts).toBe(1);

  await fireEvent.press(screen.getByText('Next'));
  expect(screen.getByText('Press')).toBeTruthy();
  expect(mockCounts.mounts).toBe(1);
  expect(JSON.stringify(mockCounts.sources.at(-1))).toContain('press.mp4');
});

test('completing a set starts the rest timer and it can be skipped', async () => {
  await render(<ActiveWorkoutScreen onFinished={() => {}} />);
  await fireEvent.changeText(screen.getByLabelText('Weight (kg)'), '40');
  await fireEvent.changeText(screen.getByLabelText('Reps'), '10');
  await fireEvent.press(screen.getByText('Complete set'));
  expect(screen.getByText(/Rest/)).toBeTruthy();
  await fireEvent.press(screen.getByText('Skip rest'));
  expect(screen.queryByText('Skip rest')).toBeNull();
});

test('shows prior performance for the current exercise', async () => {
  await render(<ActiveWorkoutScreen onFinished={() => {}} />);
  expect(screen.getByText(/Last time/)).toBeTruthy();
  expect(screen.getByText(/55 kg × 10/)).toBeTruthy();
});

test('finishing stores a summary and notifies the screen', async () => {
  const onFinished = jest.fn();
  await render(<ActiveWorkoutScreen onFinished={onFinished} />);
  await fireEvent.changeText(screen.getByLabelText('Weight (kg)'), '40');
  await fireEvent.changeText(screen.getByLabelText('Reps'), '10');
  await fireEvent.press(screen.getByText('Complete set'));
  await fireEvent.press(screen.getByText('Finish workout'));
  expect(onFinished).toHaveBeenCalledTimes(1);
  expect(useWorkoutStore.getState().session).toBeNull();
  expect(useWorkoutStore.getState().finished?.exercises[0].sets).toHaveLength(1);
});
