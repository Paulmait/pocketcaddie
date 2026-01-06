import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';

interface DataPoint {
  label: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  height?: number;
  showLabels?: boolean;
  accentColor?: string;
  emptyMessage?: string;
}

const CHART_PADDING = 24;

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  height = 150,
  showLabels = true,
  accentColor = colors.primary.light,
  emptyMessage = 'No data yet',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 2 - CHART_PADDING * 2;
  const chartHeight = height - (showLabels ? 40 : 16);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  if (data.length === 1) {
    // Single point - show as centered dot with value
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.singlePointContainer}>
          <Text style={[styles.singlePointValue, { color: accentColor }]}>
            {Math.round(data[0].value)}%
          </Text>
          <Text style={styles.singlePointLabel}>{data[0].label}</Text>
        </View>
      </View>
    );
  }

  // Calculate min/max for scaling
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Add padding to range
  const paddedMin = Math.max(0, minValue - valueRange * 0.1);
  const paddedMax = Math.min(100, maxValue + valueRange * 0.1);
  const paddedRange = paddedMax - paddedMin || 1;

  // Calculate points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth + CHART_PADDING;
    const normalizedValue = (d.value - paddedMin) / paddedRange;
    const y = chartHeight - normalizedValue * (chartHeight - 16) + 8;
    return { x, y, value: d.value, label: d.label };
  });

  // Create smooth path using cubic bezier curves
  const createPath = () => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const tension = 0.3;

      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * tension;
      const cp2y = curr.y;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  // Create gradient area path
  const createAreaPath = () => {
    const linePath = createPath();
    if (!linePath) return '';

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${linePath} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;
  };

  // Determine trend
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const isPositiveTrend = lastValue >= firstValue;
  const trendColor = isPositiveTrend ? colors.status.success : colors.status.error;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={chartWidth + CHART_PADDING * 2} height={chartHeight + (showLabels ? 24 : 0)}>
        {/* Grid lines */}
        <Line
          x1={CHART_PADDING}
          y1={8}
          x2={chartWidth + CHART_PADDING}
          y2={8}
          stroke={colors.surface.glassBorder}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <Line
          x1={CHART_PADDING}
          y1={chartHeight / 2}
          x2={chartWidth + CHART_PADDING}
          y2={chartHeight / 2}
          stroke={colors.surface.glassBorder}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <Line
          x1={CHART_PADDING}
          y1={chartHeight}
          x2={chartWidth + CHART_PADDING}
          y2={chartHeight}
          stroke={colors.surface.glassBorder}
          strokeWidth={1}
        />

        {/* Area fill */}
        <Path
          d={createAreaPath()}
          fill={`${accentColor}15`}
        />

        {/* Line */}
        <Path
          d={createPath()}
          stroke={accentColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={i === points.length - 1 ? 6 : 4}
            fill={i === points.length - 1 ? accentColor : colors.background.primary}
            stroke={accentColor}
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {showLabels && data.length <= 6 && points.map((point, i) => (
          <SvgText
            key={`label-${i}`}
            x={point.x}
            y={chartHeight + 18}
            fontSize={10}
            fill={colors.text.tertiary}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
      </Svg>

      {/* Trend Indicator */}
      <View style={styles.trendContainer}>
        <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {isPositiveTrend ? '↑' : '↓'} {Math.abs(lastValue - firstValue).toFixed(0)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  singlePointContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singlePointValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  singlePointLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  trendContainer: {
    position: 'absolute',
    top: 0,
    right: CHART_PADDING,
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
