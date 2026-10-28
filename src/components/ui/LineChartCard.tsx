import { Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors } from '../../lib/theme';
import { Card } from './index';
import { chartScale } from './chartScale';

export type Point = { date: string; weight_kg: number };

const label = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function LineChartCard({ title, points, unit = 'kg' }: { title: string; points: Point[]; unit?: string }) {
  const { width } = useWindowDimensions();
  const latest = points.at(-1);
  const first = points[0];
  const delta = latest && first ? latest.weight_kg - first.weight_kg : 0;
  const scale = points.length >= 2 ? chartScale(points.map((p) => p.weight_kg)) : null;

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-text">{title}</Text>
        {latest && points.length >= 2 ? (
          <Text style={{ color: delta >= 0 ? colors.accent : colors.warn }} className="text-sm font-bold">
            {`${delta >= 0 ? '+' : ''}${Math.round(delta * 10) / 10} ${unit}`}
          </Text>
        ) : null}
      </View>
      {!scale ? (
        <Text className="text-sm text-muted">{latest ? `${latest.weight_kg} ${unit}. Log more to see a trend.` : 'No data yet.'}</Text>
      ) : (
        <LineChart
          data={points.map((p) => ({ value: p.weight_kg }))}
          width={width - 136}
          height={170}
          curved
          areaChart
          startFillColor={colors.accent}
          endFillColor={colors.surface}
          startOpacity={0.35}
          endOpacity={0.02}
          color={colors.accent}
          dataPointsColor={colors.accent}
          thickness={3}
          yAxisOffset={scale.offset}
          maxValue={scale.range}
          noOfSections={scale.sections}
          initialSpacing={12}
          endSpacing={28}
          yAxisTextStyle={{ color: colors.textMuted, fontSize: 11 }}
          yAxisColor="transparent"
          xAxisColor={colors.border}
          rulesColor={colors.border}
          rulesType="dashed"
          backgroundColor={colors.surface}
          adjustToWidth
          disableScroll
        />
      )}
      {scale && latest ? (
        // Drawn outside the chart: the library clips the last x label.
        <View className="flex-row justify-between pl-11 pr-3">
          <Text className="text-xs text-muted">{label(first.date)}</Text>
          <Text className="text-xs text-muted">{label(latest.date)}</Text>
        </View>
      ) : null}
    </Card>
  );
}
