import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export type TrendType = 'improving' | 'stable' | 'worsening';

interface RootCauseTrendProps {
  cause: string;
  trend: TrendType;
  occurrences: number;
  lastSeen?: string;
  color?: string;
}

const TREND_CONFIG: Record<
  TrendType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  improving: {
    icon: 'trending-down',
    color: colors.status.success,
    label: 'Improving',
  },
  stable: {
    icon: 'remove',
    color: colors.secondary.main,
    label: 'Stable',
  },
  worsening: {
    icon: 'trending-up',
    color: colors.status.error,
    label: 'Needs Work',
  },
};

export const RootCauseTrend: React.FC<RootCauseTrendProps> = ({
  cause,
  trend,
  occurrences,
  lastSeen,
  color,
}) => {
  const trendConfig = TREND_CONFIG[trend];
  const causeColor = color || colors.text.primary;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.indicator, { backgroundColor: `${causeColor}30` }]}>
          <View style={[styles.indicatorDot, { backgroundColor: causeColor }]} />
        </View>
        <View style={styles.causeInfo}>
          <Text style={styles.causeName} numberOfLines={1}>
            {cause}
          </Text>
          <Text style={styles.occurrences}>
            {occurrences} occurrence{occurrences !== 1 ? 's' : ''}
            {lastSeen && ` • Last: ${lastSeen}`}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.trendBadge,
          { backgroundColor: `${trendConfig.color}15` },
        ]}
      >
        <Ionicons
          name={trendConfig.icon}
          size={14}
          color={trendConfig.color}
        />
        <Text style={[styles.trendLabel, { color: trendConfig.color }]}>
          {trendConfig.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  causeInfo: {
    flex: 1,
  },
  causeName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  occurrences: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  trendLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
