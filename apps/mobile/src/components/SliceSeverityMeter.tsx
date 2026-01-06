/**
 * Slice Severity Meter Component
 * Visual indicator showing slice severity from mild to "banana ball"
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export type SliceSeverity = 'mild' | 'moderate' | 'severe' | 'banana';

interface SliceSeverityMeterProps {
  severity: SliceSeverity;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig = {
  mild: {
    color: colors.status.success,
    label: 'Mild',
    description: 'Almost straight!',
    icon: 'arrow-forward',
    position: 0.15,
    emoji: '🎯',
  },
  moderate: {
    color: colors.secondary.main,
    label: 'Moderate',
    description: 'Noticeable curve',
    icon: 'arrow-forward',
    position: 0.4,
    emoji: '↗️',
  },
  severe: {
    color: colors.status.warning,
    label: 'Severe',
    description: 'Big slice',
    icon: 'arrow-redo',
    position: 0.65,
    emoji: '↩️',
  },
  banana: {
    color: colors.status.error,
    label: 'Banana Ball',
    description: 'Maximum slice!',
    icon: 'sync',
    position: 0.9,
    emoji: '🍌',
  },
};

export const SliceSeverityMeter: React.FC<SliceSeverityMeterProps> = ({
  severity,
  showLabel = true,
  size = 'md',
}) => {
  const config = severityConfig[severity];

  const sizeConfig = {
    sm: { height: 8, width: 150, indicatorSize: 16 },
    md: { height: 12, width: 220, indicatorSize: 24 },
    lg: { height: 16, width: 280, indicatorSize: 32 },
  };

  const { height, width, indicatorSize } = sizeConfig[size];

  return (
    <View style={styles.container}>
      {/* Meter bar */}
      <View style={[styles.meterContainer, { width }]}>
        <View style={[styles.meterTrack, { height }]}>
          {/* Gradient segments */}
          <View style={[styles.segment, styles.segmentMild, { height }]} />
          <View style={[styles.segment, styles.segmentModerate, { height }]} />
          <View style={[styles.segment, styles.segmentSevere, { height }]} />
          <View style={[styles.segment, styles.segmentBanana, { height }]} />
        </View>

        {/* Indicator */}
        <View
          style={[
            styles.indicator,
            {
              left: config.position * width - indicatorSize / 2,
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              backgroundColor: config.color,
            },
          ]}
        >
          <Text style={[styles.indicatorEmoji, { fontSize: indicatorSize * 0.5 }]}>
            {config.emoji}
          </Text>
        </View>
      </View>

      {/* Labels */}
      <View style={[styles.labelsRow, { width }]}>
        <Text style={styles.labelText}>Straight</Text>
        <Text style={styles.labelText}>Banana</Text>
      </View>

      {/* Severity label */}
      {showLabel && (
        <View style={styles.severityLabelContainer}>
          <View style={[styles.severityBadge, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon as any} size={18} color={config.color} />
            <Text style={[styles.severityLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.severityDescription}>{config.description}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Compact severity indicator for cards/lists
 */
interface SeverityBadgeProps {
  severity: SliceSeverity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const config = severityConfig[severity];

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
      <Text style={styles.badgeEmoji}>{config.emoji}</Text>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  meterContainer: {
    position: 'relative',
  },
  meterTrack: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
  },
  segmentMild: {
    backgroundColor: colors.status.success,
  },
  segmentModerate: {
    backgroundColor: colors.secondary.main,
  },
  segmentSevere: {
    backgroundColor: colors.status.warning,
  },
  segmentBanana: {
    backgroundColor: colors.status.error,
  },
  indicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorEmoji: {
    textAlign: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  severityLabelContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  severityLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  severityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeEmoji: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});
