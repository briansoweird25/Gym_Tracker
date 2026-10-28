/**
 * Simple side-view stick-figure animations used when an exercise has no video.
 * Each preset is two key poses on a 100x100 canvas (ground at y=90) that are interpolated back and forth.
 * They are illustrative guides, not technique footage.
 */
export const JOINTS = ['head', 'neck', 'hip', 'knee', 'ankle', 'elbow', 'wrist'] as const;
export type Joint = (typeof JOINTS)[number];
export type Pose = Record<Joint, [number, number]>;
export type Prop = 'bar' | 'dumbbell' | 'none';
export type Preset = { a: Pose; b: Pose; prop: Prop; bench?: boolean };

const pose = (head: [number, number], neck: [number, number], hip: [number, number], knee: [number, number], ankle: [number, number], elbow: [number, number], wrist: [number, number]): Pose =>
  ({ head, neck, hip, knee, ankle, elbow, wrist });

export const PRESETS = {
  squat: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [46, 30], [54, 22]),
    b: pose([50, 35], [46, 43], [34, 66], [56, 66], [50, 90], [44, 52], [52, 44]),
    prop: 'bar',
  },
  goblet: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [50, 36], [56, 30]),
    b: pose([50, 35], [46, 43], [34, 66], [56, 66], [50, 90], [52, 56], [56, 48]),
    prop: 'dumbbell',
  },
  legpress: {
    a: pose([10, 49], [16, 56], [30, 76], [46, 62], [58, 76], [24, 66], [32, 70]),
    b: pose([10, 49], [16, 56], [30, 76], [58, 58], [68, 50], [24, 66], [32, 70]),
    prop: 'none',
  },
  hinge: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [52, 34], [54, 48]),
    b: pose([18, 40], [26, 44], [56, 50], [54, 70], [52, 90], [30, 58], [40, 72]),
    prop: 'bar',
  },
  bench: {
    a: pose([14, 58], [22, 58], [56, 58], [72, 50], [76, 78], [24, 46], [24, 34]),
    b: pose([14, 58], [22, 58], [56, 58], [72, 50], [76, 78], [28, 64], [24, 52]),
    prop: 'bar',
    bench: true,
  },
  pushup: {
    a: pose([12, 50], [20, 52], [56, 60], [72, 66], [88, 74], [22, 64], [22, 78]),
    b: pose([12, 66], [20, 68], [56, 72], [72, 74], [88, 78], [34, 74], [22, 78]),
    prop: 'none',
  },
  plank: {
    a: pose([12, 56], [20, 58], [56, 64], [72, 68], [88, 74], [20, 74], [32, 76]),
    b: pose([12, 56], [20, 58], [56, 62], [72, 67], [88, 74], [20, 74], [32, 76]),
    prop: 'none',
  },
  press: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [64, 34], [62, 22]),
    b: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [64, 16], [62, 3]),
    prop: 'dumbbell',
  },
  lateral: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [52, 40], [54, 56]),
    b: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [62, 28], [76, 26]),
    prop: 'dumbbell',
  },
  pull: {
    a: pose([42, 38], [42, 46], [44, 72], [62, 70], [64, 90], [46, 26], [50, 6]),
    b: pose([42, 38], [42, 46], [44, 72], [62, 70], [64, 90], [36, 52], [50, 44]),
    prop: 'bar',
  },
  row: {
    a: pose([42, 38], [42, 46], [44, 72], [62, 70], [64, 90], [56, 50], [70, 52]),
    b: pose([42, 38], [42, 46], [44, 72], [62, 70], [64, 90], [34, 56], [48, 54]),
    prop: 'bar',
  },
  curl: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [58, 42], [60, 62]),
    b: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [58, 42], [68, 34]),
    prop: 'dumbbell',
  },
  pushdown: {
    a: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [54, 40], [60, 30]),
    b: pose([50, 12], [50, 20], [50, 46], [50, 68], [50, 90], [54, 40], [56, 60]),
    prop: 'bar',
  },
} satisfies Record<string, Preset>;

export type PresetKey = keyof typeof PRESETS;

const RULES: [RegExp, PresetKey][] = [
  [/leg press/i, 'legpress'],
  [/goblet/i, 'goblet'],
  [/squat/i, 'squat'],
  [/deadlift|romanian/i, 'hinge'],
  [/bench/i, 'bench'],
  [/push-?up/i, 'pushup'],
  [/plank/i, 'plank'],
  [/shoulder press|overhead press/i, 'press'],
  [/lateral raise/i, 'lateral'],
  [/pulldown|pull-?up/i, 'pull'],
  [/\brow\b/i, 'row'],
  [/curl/i, 'curl'],
  [/pushdown|triceps/i, 'pushdown'],
];

/** Animation for an exercise name, or null when there is no honest match. */
export function presetFor(name: string | undefined): Preset | null {
  if (!name) return null;
  const hit = RULES.find(([re]) => re.test(name));
  return hit ? PRESETS[hit[1]] : null;
}

export function poseAt(p: Preset, t: number): Pose {
  const out = {} as Pose;
  for (const j of JOINTS) {
    out[j] = [p.a[j][0] + (p.b[j][0] - p.a[j][0]) * t, p.a[j][1] + (p.b[j][1] - p.a[j][1]) * t];
  }
  return out;
}

/** Triangle wave: 0 -> 1 -> 0 over one period (ms). */
export function loopT(elapsedMs: number, periodMs: number): number {
  const phase = (elapsedMs % periodMs) / periodMs;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}
