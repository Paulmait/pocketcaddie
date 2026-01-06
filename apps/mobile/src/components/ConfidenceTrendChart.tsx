/**
 * Confidence Trend Chart for SliceFix AI
 *
 * A simple visual chart showing confidence scores over time.
 * Uses a bar chart approach for clarity.
 *
 * No performance claims - purely visual representation.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import { SwingAnalysis } from '../store/useAppStore';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface ConfidenceTrendChartProps {
  analyses: SwingAnalysis[];
  maxPoints?: number;
}

// Convert confidence to numeric for chart
const CONFIDENCE_VALUES = {
  low: 1,
  medium: 2,
  high: 3,
};

const CONFIDENCE_COLORS = {
  low: colors.status.warning,
  medium: colors.secondary.main,
  high: colors.primary.light,
};

const CHART_HEIGHT = 80;
const BAR_WIDTH = 16;
const BAR_GAP = 8;

export const ConfidenceTrendChart: React.FC<ConfidenceTrendChartProps> = ({
  analyses,
  maxPoints = 7,
}) => {
  // Take the most recent analyses (reversed so oldest is first = left to right time flow)
  const chartData = useMemo(() => {
    const points = analyses.slice(0, maxPoints).reverse();
    return points.map((analysis) => ({
      id: analysis.id,
      confidence: analysis.rootCause.confidence,
      value: CONFIDENCE_VALUES[analysis.rootCause.confidence],
      color: CONFIDENCE_COLORS[analysis.rootCause.confidence],
      date: new Date(analysis.createdAt),
    }));
  }, [analyses, maxPoints]);

  if (chartData.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Analyze more swings to see your trend
        </Text>
      </View>
    );
  }

  const maxValue = 3; // High confidence
  const barMaxHeight = CHART_HEIGHT - 20; // Leave room for labels

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={styles.yLabel}>High</Text>
        <Text style={styles.yLabel}>Med</Text>
        <Text style={styles.yLabel}>Low</Text>
      </View>

      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Grid lines */}
        <View style={styles.gridLines}>
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {chartData.map((point, index) => {
            const height = (point.value / maxValue) * barMaxHeight;
            return (
              <View
                key={point.id}
                style={styles.barWrapper}
                accessibilityLabel={`Analysis ${index + 1}: ${point.confidence} confidence`}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: point.color,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        <Text style={styles.xLabel}>Older</Text>
        <Text style={styles.xLabel}>Recent</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  yLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
    marginLeft: spacing.sm,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.surface.glassBorder,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: spacing.xs,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: BAR_WIDTH + BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  xAxis: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
