import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface ChecklistItemProps {
  text: string;
  completed: boolean;
  onToggle: () => void;
  index: number;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  text,
  completed,
  onToggle,
  index,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          completed && styles.checkboxCompleted,
        ]}
      >
        {completed && (
          <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.index}>{index + 1}.</Text>
        <Text
          style={[
            styles.text,
            completed && styles.textCompleted,
          ]}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxCompleted: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  index: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
    minWidth: 20,
  },
  text: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  textCompleted: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
