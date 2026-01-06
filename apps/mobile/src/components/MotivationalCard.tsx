import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface MotivationalCardProps {
  improvement: number; // -100 to 100
  timeframeDays: number;
  primaryCause?: string | null;
  streakDays?: number;
  totalAnalyses?: number;
}

interface MessageConfig {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

function getMotivationalMessage({
  improvement,
  timeframeDays,
  primaryCause,
  streakDays = 0,
  totalAnalyses = 0,
}: MotivationalCardProps): MessageConfig {
  // First analysis - welcome message
  if (totalAnalyses <= 1) {
    return {
      emoji: '🎯',
      title: 'Great Start!',
      subtitle: 'Upload more swings to track your improvement over time.',
      color: colors.status.info,
    };
  }

  // Streak-based messages
  if (streakDays >= 7) {
    return {
      emoji: '🔥',
      title: `${streakDays}-Day Streak!`,
      subtitle: 'Incredible consistency! Your dedication is paying off.',
      color: colors.secondary.main,
    };
  }

  if (streakDays >= 3) {
    return {
      emoji: '⚡',
      title: `${streakDays}-Day Streak!`,
      subtitle: 'Keep the momentum going. Consistency is key to improvement.',
      color: colors.secondary.light,
    };
  }

  // Improvement-based messages
  if (improvement >= 30) {
    return {
      emoji: '🏆',
      title: `+${improvement}% Improvement!`,
      subtitle: `Incredible progress over ${timeframeDays} days. You're mastering your swing!`,
      color: colors.status.success,
    };
  }

  if (improvement >= 15) {
    return {
      emoji: '📈',
      title: `+${improvement}% Better!`,
      subtitle: primaryCause
        ? `Your ${primaryCause.toLowerCase()} is improving. Keep practicing!`
        : 'Great progress! Your hard work is showing in the data.',
      color: colors.status.success,
    };
  }

  if (improvement >= 5) {
    return {
      emoji: '💪',
      title: 'Steady Progress',
      subtitle: 'Small gains add up. Stay consistent with your practice.',
      color: colors.primary.light,
    };
  }

  if (improvement >= -5) {
    return {
      emoji: '🎯',
      title: 'Stay Focused',
      subtitle: primaryCause
        ? `Focus on fixing your ${primaryCause.toLowerCase()} this week.`
        : 'Keep practicing. Breakthroughs often come after plateaus.',
      color: colors.secondary.main,
    };
  }

  // Declining performance
  return {
    emoji: '💡',
    title: 'Time to Refocus',
    subtitle: 'Check the drill library for exercises targeting your main issue.',
    color: colors.status.warning,
  };
}

export const MotivationalCard: React.FC<MotivationalCardProps> = (props) => {
  const message = getMotivationalMessage(props);

  return (
    <GlassCard style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{message.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: message.color }]}>
            {message.title}
          </Text>
          <Text style={styles.subtitle}>{message.subtitle}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
