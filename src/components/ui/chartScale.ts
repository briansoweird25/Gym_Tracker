const STEPS = [0.5, 1, 2, 5, 10, 20, 25, 50, 100];

/** Y-axis window that hugs the data so small trends stay visible (never starts at 0 unless the data does). */
export function chartScale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.2, max * 0.02, 0.5);
  const lo = min - pad;
  const hi = max + pad;
  const step = STEPS.find((s) => s >= (hi - lo) / 4) ?? STEPS[STEPS.length - 1];
  const offset = Math.max(0, Math.floor(lo / step) * step);
  const top = Math.ceil(hi / step) * step;
  return { offset, range: top - offset, sections: Math.max(1, Math.round((top - offset) / step)) };
}
