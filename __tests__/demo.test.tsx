import { render, screen } from '@testing-library/react-native';
import { loopT, poseAt, presetFor, PRESETS, JOINTS } from '../src/features/exercises/demoPoses';

jest.mock('expo-video', () => ({
  useVideoPlayer: () => ({ loop: false, muted: false, playbackRate: 1, play: jest.fn(), pause: jest.fn() }),
  VideoView: () => null,
}));

import { ExerciseAnimationPlayer } from '../src/components/exercise/ExerciseAnimationPlayer';

const SEEDED = [
  'Barbell Back Squat', 'Goblet Squat', 'Leg Press', 'Romanian Deadlift', 'Barbell Bench Press', 'Push-Up',
  'Dumbbell Shoulder Press', 'Dumbbell Lateral Raise', 'Lat Pulldown', 'Seated Cable Row',
  'Dumbbell Biceps Curl', 'Triceps Pushdown', 'Plank',
];

describe('presetFor', () => {
  test.each(SEEDED)('every seeded exercise has an animation: %s', (name) => {
    expect(presetFor(name)).not.toBeNull();
  });
  test('different movements map to different presets', () => {
    expect(presetFor('Barbell Back Squat')).not.toBe(presetFor('Barbell Bench Press'));
    expect(presetFor('Dumbbell Biceps Curl')).not.toBe(presetFor('Triceps Pushdown'));
  });
  test('unknown exercises have no animation rather than a wrong one', () => {
    expect(presetFor('Underwater Basket Weaving')).toBeNull();
  });
});

describe('poses', () => {
  test('every preset defines finite joints inside the 100x100 canvas', () => {
    for (const p of Object.values(PRESETS)) {
      for (const pose of [p.a, p.b]) {
        for (const j of JOINTS) {
          const [x, y] = pose[j];
          expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(100);
          expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(100);
        }
      }
    }
  });
  test('poseAt returns the end poses at 0 and 1 and the midpoint at 0.5', () => {
    const p = PRESETS.squat;
    expect(poseAt(p, 0)).toEqual(p.a);
    expect(poseAt(p, 1)).toEqual(p.b);
    expect(poseAt(p, 0.5).hip[1]).toBeCloseTo((p.a.hip[1] + p.b.hip[1]) / 2);
  });
  test('loopT goes 0 -> 1 -> 0 over one period', () => {
    expect(loopT(0, 2000)).toBe(0);
    expect(loopT(1000, 2000)).toBe(1);
    expect(loopT(2000, 2000)).toBeCloseTo(0);
    expect(loopT(500, 2000)).toBeCloseTo(0.5);
    expect(loopT(1500, 2000)).toBeCloseTo(0.5);
  });
});

describe('player fallback', () => {
  test('without media, a known exercise shows the animated guide', async () => {
    await render(<ExerciseAnimationPlayer media={[]} exerciseName="Plank" />);
    expect(screen.getByText('Animated guide')).toBeTruthy();
    expect(screen.queryByText('No demo available')).toBeNull();
    expect(screen.getByText('Pause')).toBeTruthy();
  });
  test('without media, an unknown exercise still says no demo', async () => {
    await render(<ExerciseAnimationPlayer media={[]} exerciseName="Mystery Move" />);
    expect(screen.getByText('No demo available')).toBeTruthy();
  });
});
