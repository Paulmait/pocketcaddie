import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { GlassCard, Button, DifficultyBadge } from '../components';
import { useAppStore } from '../store/useAppStore';
import {
  getDrillById,
  getDrillsForCause,
  ROOT_CAUSE_LABELS,
  ROOT_CAUSE_COLORS,
  type LibraryDrill,
} from '../data/drillLibrary';

type RootStackParamList = {
  DrillLibrary: { filterCause?: string };
  DrillDetail: { drillId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'DrillDetail'>;

export default function DrillDetailScreen({ navigation, route }: Props) {
  const { drillId } = route.params;
  const drill = getDrillById(drillId);

  const drillPracticeLog = useAppStore((state) => state.drillPracticeLog ?? []);
  const logDrillPractice = useAppStore((state) => state.logDrillPractice);

  const [isPracticing, setIsPracticing] = useState(false);

  // Get practice history for this drill
  const practiceHistory = useMemo(() => {
    return drillPracticeLog
      .filter((record) => record.drillId === drillId)
      .sort(
        (a, b) =>
          new Date(b.practiceDate).getTime() - new Date(a.practiceDate).getTime()
      );
  }, [drillPracticeLog, drillId]);

  // Get related drills (same cause, different drill)
  const relatedDrills = useMemo(() => {
    if (!drill) return [];
    return getDrillsForCause(drill.targetCause)
      .filter((d) => d.id !== drill.id)
      .slice(0, 2);
  }, [drill]);

  if (!drill) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Drill not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const causeColor = ROOT_CAUSE_COLORS[drill.targetCause];
  const causeLabel = ROOT_CAUSE_LABELS[drill.targetCause];

  const handleMarkPracticed = () => {
    setIsPracticing(true);

    // Simulate practice completion
    setTimeout(() => {
      if (logDrillPractice) {
        logDrillPractice(drill.id, drill.durationMinutes);
      }
      setIsPracticing(false);

      Alert.alert(
        'Great Work!',
        `You've completed the ${drill.name} drill. Keep practicing to improve your swing!`,
        [{ text: 'OK' }]
      );
    }, 500);
  };

  const handleRelatedDrillPress = (relatedDrill: LibraryDrill) => {
    navigation.replace('DrillDetail', { drillId: relatedDrill.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {drill.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{drill.thumbnailEmoji}</Text>
          </View>

          <View style={styles.metaRow}>
            <DifficultyBadge difficulty={drill.difficulty} size="md" />
            <View style={styles.durationBadge}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.durationText}>
                {drill.durationMinutes} minutes
              </Text>
            </View>
            <View
              style={[styles.causeBadge, { backgroundColor: `${causeColor}20` }]}
            >
              <Text style={[styles.causeText, { color: causeColor }]}>
                {causeLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{drill.description}</Text>

          {/* Practice Stats */}
          {practiceHistory.length > 0 && (
            <View style={styles.practiceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{practiceHistory.length}</Text>
                <Text style={styles.statLabel}>Times Practiced</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {practiceHistory.length * drill.durationMinutes}
                </Text>
                <Text style={styles.statLabel}>Total Minutes</Text>
              </View>
            </View>
          )}
        </View>

        {/* Steps */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="list-outline"
              size={20}
              color={colors.primary.light}
            />
            <Text style={styles.sectionTitle}>Steps</Text>
          </View>
          {drill.steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Reps */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="repeat-outline"
              size={20}
              color={colors.secondary.main}
            />
            <Text style={styles.sectionTitle}>Recommended Reps</Text>
          </View>
          <Text style={styles.repsText}>{drill.reps}</Text>
        </GlassCard>

        {/* Common Mistakes */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={colors.status.warning}
            />
            <Text style={styles.sectionTitle}>Common Mistakes</Text>
          </View>
          {drill.commonMistakes.map((mistake, index) => (
            <View key={index} style={styles.mistakeItem}>
              <Ionicons name="close-circle" size={16} color={colors.status.error} />
              <Text style={styles.mistakeText}>{mistake}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Tips */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color={colors.secondary.light}
            />
            <Text style={styles.sectionTitle}>Pro Tips</Text>
          </View>
          {drill.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.status.success}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Equipment */}
        {drill.equipment && drill.equipment.length > 0 && (
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="golf-outline"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
            </View>
            <View style={styles.equipmentList}>
              {drill.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Related Drills */}
        {relatedDrills.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Drills</Text>
            <Text style={styles.relatedSubtitle}>
              More drills for {causeLabel.toLowerCase()}
            </Text>
            {relatedDrills.map((relatedDrill) => (
              <TouchableOpacity
                key={relatedDrill.id}
                style={styles.relatedCard}
                onPress={() => handleRelatedDrillPress(relatedDrill)}
              >
                <Text style={styles.relatedEmoji}>
                  {relatedDrill.thumbnailEmoji}
                </Text>
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedName}>{relatedDrill.name}</Text>
                  <Text style={styles.relatedDuration}>
                    {relatedDrill.durationMinutes} min •{' '}
                    {relatedDrill.difficulty}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Padding for button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          title={isPracticing ? 'Marking...' : 'Mark as Practiced'}
          onPress={handleMarkPracticed}
          disabled={isPracticing}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
  },
  durationText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  causeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  causeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  practiceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surface.glassBorder,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  repsText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  mistakeText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  equipmentItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
  },
  equipmentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  relatedSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  relatedTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  relatedSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    marginBottom: spacing.sm,
  },
  relatedEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  relatedContent: {
    flex: 1,
  },
  relatedName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  relatedDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
});
