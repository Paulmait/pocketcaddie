import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { GlassCard } from './GlassCard';
import { DifficultyBadge } from './DifficultyBadge';
import type { LibraryDrill } from '../data/drillLibrary';
import { ROOT_CAUSE_LABELS, ROOT_CAUSE_COLORS } from '../data/drillLibrary';

interface DrillCardProps {
  drill: LibraryDrill;
  practiceCount: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  showCauseBadge?: boolean;
}

export const DrillCard: React.FC<DrillCardProps> = ({
  drill,
  practiceCount,
  onPress,
  style,
  showCauseBadge = false,
}) => {
  const causeColor = ROOT_CAUSE_COLORS[drill.targetCause];
  const causeLabel = ROOT_CAUSE_LABELS[drill.targetCause];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={[styles.container, style]} padding="md">
        <View style={styles.header}>
          {/* Emoji Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Text style={styles.thumbnailEmoji}>{drill.thumbnailEmoji}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {drill.name}
              </Text>
              {practiceCount > 0 && (
                <View style={styles.practiceCountBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={colors.status.success}
                  />
                  <Text style={styles.practiceCountText}>{practiceCount}</Text>
                </View>
              )}
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {drill.description}
            </Text>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <DifficultyBadge difficulty={drill.difficulty} />

              <View style={styles.durationBadge}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.text.tertiary}
                />
                <Text style={styles.durationText}>
                  {drill.durationMinutes} min
                </Text>
              </View>

              {showCauseBadge && (
                <View
                  style={[
                    styles.causeBadge,
                    { backgroundColor: `${causeColor}20` },
                  ]}
                >
                  <Text style={[styles.causeText, { color: causeColor }]}>
                    {causeLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
            style={styles.chevron}
          />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  practiceCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    gap: 2,
  },
  practiceCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
    fontWeight: typography.fontWeight.medium,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  causeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  causeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
