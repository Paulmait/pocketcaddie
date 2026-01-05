import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface ConfidenceBadgeProps {
  level: 'low' | 'medium' | 'high';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level }) => {
  const getColor = () => {
    switch (level) {
      case 'low':
        return colors.confidence.low;
      case 'medium':
        return colors.confidence.medium;
      case 'high':
        return colors.confidence.high;
      default:
        return colors.text.tertiary;
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'low':
        return 'Low Confidence';
      case 'medium':
        return 'Medium Confidence';
      case 'high':
        return 'High Confidence';
      default:
        return 'Unknown';
    }
  };

  const color = getColor();

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{getLabel()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
