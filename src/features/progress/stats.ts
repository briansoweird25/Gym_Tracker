export type HistorySet = { set_number: number; weight_kg: number; reps: number };
export type HistorySession = {
  id: string;
  started_at: string;
  ended_at: string | null;
  session_exercises: { id: string; exercise_id: string; exercises: { name: string } | null; exercise_sets: HistorySet[] }[];
};

const allSets = (s: HistorySession) => s.session_exercises.flatMap((e) => e.exercise_sets);

export function sessionSummaries(history: HistorySession[]) {
  return history.map((s) => {
    const sets = allSets(s);
    return {
      id: s.id,
      date: s.started_at,
      totalSets: sets.length,
      volume: sets.reduce((sum, x) => sum + x.weight_kg * x.reps, 0),
      minutes: s.ended_at ? Math.round((Date.parse(s.ended_at) - Date.parse(s.started_at)) / 60000) : 0,
    };
  });
}

/** Heaviest weight per exercise; ties go to more reps, then the earlier session. */
export function personalBests(history: HistorySession[]) {
  const best = new Map<string, { exercise_id: string; name: string; weight_kg: number; reps: number; date: string }>();
  for (const s of [...history].sort((a, b) => a.started_at.localeCompare(b.started_at))) {
    for (const e of s.session_exercises) {
      for (const set of e.exercise_sets) {
        const cur = best.get(e.exercise_id);
        if (!cur || set.weight_kg > cur.weight_kg || (set.weight_kg === cur.weight_kg && set.reps > cur.reps)) {
          best.set(e.exercise_id, { exercise_id: e.exercise_id, name: e.exercises?.name ?? 'Exercise', weight_kg: set.weight_kg, reps: set.reps, date: s.started_at });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function exerciseSeries(history: HistorySession[], exerciseId: string) {
  return [...history]
    .sort((a, b) => a.started_at.localeCompare(b.started_at))
    .flatMap((s) => {
      const weights = s.session_exercises.filter((e) => e.exercise_id === exerciseId).flatMap((e) => e.exercise_sets.map((x) => x.weight_kg));
      return weights.length ? [{ date: s.started_at, weight_kg: Math.max(...weights) }] : [];
    });
}

/** Sessions started in the Monday-to-Sunday week (UTC) containing `ref`. */
export function weeklyCount(history: HistorySession[], ref: Date): number {
  const day = (ref.getUTCDay() + 6) % 7; // Monday = 0
  const start = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate() - day);
  const end = start + 7 * 86_400_000;
  return history.filter((s) => { const t = Date.parse(s.started_at); return t >= start && t < end; }).length;
}

export const bodyWeightSeries = (rows: { weight_kg: number; recorded_at: string }[]) =>
  [...rows].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)).map((r) => ({ date: r.recorded_at, weight_kg: r.weight_kg }));
