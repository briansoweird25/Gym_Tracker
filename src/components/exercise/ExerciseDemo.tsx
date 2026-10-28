import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { loopT, poseAt, type Preset } from '../../features/exercises/demoPoses';
import { colors } from '../../lib/theme';

const PERIOD_MS = 2400;
const FRAME_MS = 33; // ~30 fps is plenty for a stick figure

/** Looping stick-figure demo. Time is accumulated so pausing and speed changes never jump the pose. */
export function ExerciseDemo({ preset, playing, speed }: { preset: Preset; playing: boolean; speed: number }) {
  const [elapsed, setElapsed] = useState(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      if (now - last >= FRAME_MS) {
        const dt = now - last;
        last = now;
        setElapsed((e) => e + dt * speedRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const t = loopT(elapsed, PERIOD_MS);
  const eased = t * t * (3 - 2 * t); // smoothstep: slow at the ends like a real rep
  const p = poseAt(preset, eased);
  const seg = (a: keyof typeof p, b: keyof typeof p) => (
    <Line x1={p[a][0]} y1={p[a][1]} x2={p[b][0]} y2={p[b][1]} stroke={colors.accent} strokeWidth={3.2} strokeLinecap="round" />
  );

  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <Line x1={4} y1={90} x2={96} y2={90} stroke={colors.border} strokeWidth={1.5} />
      {preset.bench ? <Rect x={14} y={62} width={50} height={5} rx={2} fill={colors.surface2} /> : null}
      {seg('neck', 'hip')}
      {seg('hip', 'knee')}
      {seg('knee', 'ankle')}
      {seg('neck', 'elbow')}
      {seg('elbow', 'wrist')}
      <Circle cx={p.head[0]} cy={p.head[1]} r={6} fill={colors.surface2} stroke={colors.accent} strokeWidth={3} />
      {preset.prop === 'bar' ? <Circle cx={p.wrist[0]} cy={p.wrist[1]} r={5} fill="none" stroke={colors.warn} strokeWidth={3} /> : null}
      {preset.prop === 'dumbbell' ? <Circle cx={p.wrist[0]} cy={p.wrist[1]} r={4} fill={colors.warn} /> : null}
    </Svg>
  );
}
