import { Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors } from '../../lib/theme';

export type Point = { date: string; weight_kg: number };

const label = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function LineChartCard({ title, points, unit = 'kg' }: { title: string; points: Point[]; unit?: string }) {
  const { width } = useWindowDimensions();
  return (
    <View className="gap-2 rounded-xl border border-border bg-surface p-3">
      <Text className="text-base font-semibold text-text">{title}</Text>
      {points.length < 2 ? (
        <Text className="text-sm text-muted">{points.length ? `${points[0].weight_kg} ${unit} — log more to see a trend.` : 'No data yet.'}</Text>
      ) : (
        <LineChart
          data={points.map((p) => ({ value: p.weight_kg, label: label(p.date) }))}
          width={width - 120}
          height={160}
          color={colors.accent}
          dataPointsColor={colors.accent}
          thickness={2}
          yAxisTextStyle={{ color: colors.textMuted }}
          xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          rulesColor={colors.border}
          backgroundColor={colors.surface}
          adjustToWidth
          disableScroll
        />
      )}
    </View>
  );
}
