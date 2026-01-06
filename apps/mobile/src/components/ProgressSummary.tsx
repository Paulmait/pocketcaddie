/**
 * Progress Summary Component for SliceFix AI
 *
 * Displays:
 * - Confidence trend over time
 * - Total analyses count
 * - Streak indicator
 * - Improvement message
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from './GlassCard';
import { ConfidenceTrendChart } from './ConfidenceTrendChart';
import { SwingAnalysis } from '../store/useAppStore';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface ProgressSummaryProps {
  analyses: SwingAnalysis[];
}

// Convert confidence to numeric for calculations
const CONFIDENCE_VALUES = {
  low: 1,
  medium: 2,
  high: 3,
};

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ analyses }) => {
  const stats = useMemo(() => {
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageConfidence: 0,
        trend: 'neutral' as const,
        trendMessage: 'Start analyzing to track progress',
        recentAvg: 0,
        olderAvg: 0,
      };
    }

    // Calculate average confidence
    const totalConfidence = analyses.reduce(
      (sum, a) => sum + CONFIDENCE_VALUES[a.rootCause.confidence],
      0
    );
    const averageConfidence = totalConfidence / analyses.length;

    // Calculate trend (compare last 3 vs previous 3)
    const recentCount = Math.min(3, analyses.length);
    const recentAnalyses = analyses.slice(0, recentCount);
    const olderAnalyses = analyses.slice(recentCount, recentCount * 2);

    const recentAvg =
      recentAnalyses.reduce((sum, a) => sum + CONFIDENCE_VALUES[a.rootCause.confidence], 0) /
      recentAnalyses.length;

    let olderAvg = recentAvg; // Default to same if no older data
    if (olderAnalyses.length > 0) {
      olderAvg =
        olderAnalyses.reduce((sum, a) => sum + CONFIDENCE_VALUES[a.rootCause.confidence], 0) /
        olderAnalyses.length;
    }

    const diff = recentAvg - olderAvg;
    let trend: 'improving' | 'stable' | 'needs_work' | 'neutral';
    let trendMessage: string;

    if (analyses.length < 2) {
      trend = 'neutral';
      trendMessage = 'Analyze more swings to see your trend';
    } else if (diff > 0.3) {
      trend = 'improving';
      trendMessage = 'Your consistency is improving';
    } else if (diff < -0.3) {
      trend = 'needs_work';
      trendMessage = 'Keep practicing - consistency takes time';
    } else {
      trend = 'stable';
      trendMessage = 'Your swing is staying consistent';
    }

    return {
      totalAnalyses: analyses.length,
      averageConfidence,
      trend,
      trendMessage,
      recentAvg,
      olderAvg,
    };
  }, [analyses]);

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'improving':
        return 'trending-up';
      case 'needs_work':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'improving':
        return colors.primary.light;
      case 'needs_work':
        return colors.status.warning;
      default:
        return colors.text.secondary;
    }
  };

  if (analyses.length === 0) {
    return null;
  }

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{stats.totalAnalyses}</Text>
          <Text style={styles.countLabel}>analyses</Text>
        </View>
      </View>

      {analyses.length >= 3 && (
        <ConfidenceTrendChart analyses={analyses.slice(0, 14)} />
      )}

      <View style={styles.trendContainer}>
        <View style={[styles.trendIconContainer, { backgroundColor: getTrendColor() + '20' }]}>
          <Ionicons name={getTrendIcon()} size={20} color={getTrendColor()} />
        </View>
        <Text style={styles.trendMessage}>{stats.trendMessage}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats.averageConfidence >= 2.5 ? 'High' : stats.averageConfidence >= 1.5 ? 'Medium' : 'Low'}
          </Text>
          <Text style={styles.statLabel}>Avg. Confidence</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {analyses.filter((a) => {
              const completed = a.challenge.completedItems.filter(Boolean).length;
              return completed >= a.challenge.completedItems.length * 0.8;
            }).length}
          </Text>
          <Text style={styles.statLabel}>Challenges Done</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  countText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  countLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  trendIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.surface.glassBorder,
    marginHorizontal: spacing.md,
  },
});
