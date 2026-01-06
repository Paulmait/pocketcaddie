import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import type { DrillDifficulty } from '../data/drillLibrary';

interface DifficultyBadgeProps {
  difficulty: DrillDifficulty;
  size?: 'sm' | 'md';
}

const DIFFICULTY_CONFIG: Record<
  DrillDifficulty,
  { label: string; color: string; bgColor: string }
> = {
  beginner: {
    label: 'Beginner',
    color: colors.status.success,
    bgColor: 'rgba(34, 197, 94, 0.15)',
  },
  intermediate: {
    label: 'Intermediate',
    color: colors.status.warning,
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  advanced: {
    label: 'Advanced',
    color: colors.status.error,
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'sm',
}) => {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bgColor },
        size === 'md' && styles.containerMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          size === 'md' && styles.textMd,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  containerMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  textMd: {
    fontSize: typography.fontSize.sm,
  },
});
