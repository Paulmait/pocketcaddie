/**
 * Progress Screen
 * Shows user improvement over time with:
 * - Streak tracking
 * - Before/after swing comparison
 * - Improvement percentage
 * - Practice history
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../App';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { ProgressRing } from '../components/ProgressRing';
import { SliceSeverityMeter } from '../components/SliceSeverityMeter';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProgressScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Progress'>;
};

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const { analyses, setCurrentAnalysis } = useAppStore();
  const {
    streakData,
    progressStats,
    getImprovementTrend,
    getSliceSeverity,
    compareAnalyses,
  } = useProgressTracking();

  const [selectedComparison, setSelectedComparison] = useState<{
    oldIndex: number;
    newIndex: number;
  } | null>(null);

  const trend = getImprovementTrend();
  const latestSeverity = getSliceSeverity();

  const trendConfig = {
    improving: { icon: 'trending-up', color: colors.status.success, text: 'Improving!' },
    stable: { icon: 'trending-up', color: colors.secondary.main, text: 'Stable' },
    declining: { icon: 'trending-down', color: colors.status.error, text: 'Needs Work' },
    unknown: { icon: 'analytics', color: colors.text.tertiary, text: 'Keep practicing' },
  };

  const currentTrend = trendConfig[trend];

  // Get comparison data
  const comparison =
    selectedComparison && analyses.length >= 2
      ? compareAnalyses(
          analyses[selectedComparison.oldIndex]?.id,
          analyses[selectedComparison.newIndex]?.id
        )
      : null;

  const handleViewAnalysis = (index: number) => {
    const analysis = analyses[index];
    if (analysis) {
      setCurrentAnalysis(analysis);
      navigation.navigate('Results', { analysisId: analysis.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Card */}
        <GlassCard style={styles.streakCard}>
          <LinearGradient
            colors={[colors.primary.dark, colors.primary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakGradient}
          >
            <View style={styles.streakContent}>
              <View style={styles.streakMain}>
                <Ionicons name="flame" size={48} color={colors.secondary.main} />
                <View style={styles.streakNumbers}>
                  <Text style={styles.streakCount}>{streakData.currentStreak}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
              </View>
              <View style={styles.streakStats}>
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatValue}>{streakData.longestStreak}</Text>
                  <Text style={styles.streakStatLabel}>Best</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakStat}>
                  <Text style={styles.streakStatValue}>{streakData.totalPracticeDays}</Text>
                  <Text style={styles.streakStatLabel}>Total Days</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Improvement Summary */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>Improvement Summary</Text>
            <View style={[styles.trendBadge, { backgroundColor: `${currentTrend.color}20` }]}>
              <Ionicons
                name={currentTrend.icon as any}
                size={16}
                color={currentTrend.color}
              />
              <Text style={[styles.trendText, { color: currentTrend.color }]}>
                {currentTrend.text}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progressStats.totalAnalyses}</Text>
              <Text style={styles.statLabel}>Swings Analyzed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progressStats.challengeCompletion}%</Text>
              <Text style={styles.statLabel}>Challenges Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: progressStats.improvementPercentage >= 0 ? colors.status.success : colors.status.error }
              ]}>
                {progressStats.improvementPercentage >= 0 ? '+' : ''}{progressStats.improvementPercentage}%
              </Text>
              <Text style={styles.statLabel}>Improvement</Text>
            </View>
          </View>

          {progressStats.mostCommonCause && (
            <View style={styles.focusArea}>
              <Ionicons name="bulb" size={20} color={colors.secondary.main} />
              <Text style={styles.focusText}>
                Focus area: <Text style={styles.focusBold}>{progressStats.mostCommonCause}</Text>
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Slice Severity */}
        {analyses.length > 0 && (
          <GlassCard style={styles.severityCard}>
            <Text style={styles.sectionTitle}>Current Slice Severity</Text>
            <SliceSeverityMeter severity={latestSeverity} />
            <Text style={styles.severityHint}>
              {latestSeverity === 'mild'
                ? 'Great progress! Your slice is almost gone.'
                : latestSeverity === 'moderate'
                ? 'Good work! Keep practicing the drills.'
                : latestSeverity === 'severe'
                ? 'Focus on the recommended drill daily.'
                : 'Major slice detected. Follow the 10-Swing Challenge!'}
            </Text>
          </GlassCard>
        )}

        {/* Before/After Comparison */}
        {analyses.length >= 2 && (
          <GlassCard style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>Compare Swings</Text>
            <Text style={styles.comparisonHint}>
              Select two analyses to see your improvement
            </Text>

            <View style={styles.comparisonSelector}>
              <View style={styles.selectorColumn}>
                <Text style={styles.selectorLabel}>Earlier</Text>
                {analyses.slice(1).map((analysis, index) => (
                  <TouchableOpacity
                    key={analysis.id}
                    style={[
                      styles.selectorItem,
                      selectedComparison?.oldIndex === index + 1 && styles.selectorItemSelected,
                    ]}
                    onPress={() =>
                      setSelectedComparison((prev) => ({
                        oldIndex: index + 1,
                        newIndex: prev?.newIndex ?? 0,
                      }))
                    }
                  >
                    <Text style={styles.selectorItemDate}>
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.selectorItemTitle} numberOfLines={1}>
                      {analysis.rootCause.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Ionicons
                name="arrow-forward"
                size={24}
                color={colors.text.tertiary}
                style={styles.comparisonArrow}
              />

              <View style={styles.selectorColumn}>
                <Text style={styles.selectorLabel}>Recent</Text>
                {analyses.slice(0, -1).map((analysis, index) => (
                  <TouchableOpacity
                    key={analysis.id}
                    style={[
                      styles.selectorItem,
                      selectedComparison?.newIndex === index && styles.selectorItemSelected,
                    ]}
                    onPress={() =>
                      setSelectedComparison((prev) => ({
                        oldIndex: prev?.oldIndex ?? analyses.length - 1,
                        newIndex: index,
                      }))
                    }
                  >
                    <Text style={styles.selectorItemDate}>
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.selectorItemTitle} numberOfLines={1}>
                      {analysis.rootCause.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {comparison && (
              <View style={styles.comparisonResult}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Days between:</Text>
                  <Text style={styles.comparisonValue}>{comparison.daysBetween} days</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Same issue:</Text>
                  <Text style={styles.comparisonValue}>
                    {comparison.sameRootCause ? 'Yes - keep practicing!' : 'Different cause'}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Challenge progress:</Text>
                  <Text style={styles.comparisonValue}>
                    {comparison.challengeProgressOld}% → {comparison.challengeProgressNew}%
                  </Text>
                </View>
              </View>
            )}
          </GlassCard>
        )}

        {/* Recent Analyses */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          {analyses.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="golf" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No analyses yet</Text>
              <Button
                title="Analyze Your First Swing"
                onPress={() => navigation.navigate('Upload')}
                size="sm"
              />
            </GlassCard>
          ) : (
            analyses.slice(0, 5).map((analysis, index) => (
              <TouchableOpacity
                key={analysis.id}
                onPress={() => handleViewAnalysis(index)}
                activeOpacity={0.7}
              >
                <GlassCard style={styles.analysisCard}>
                  <View style={styles.analysisLeft}>
                    <Text style={styles.analysisDate}>
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.analysisTitle}>{analysis.rootCause.title}</Text>
                  </View>
                  <View style={styles.analysisRight}>
                    <ProgressRing
                      progress={
                        analysis.challenge.completedItems.filter(Boolean).length /
                        analysis.challenge.checklist.length
                      }
                      size={40}
                      strokeWidth={3}
                    />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  streakCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  streakGradient: {
    padding: spacing.lg,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakNumbers: {
    marginLeft: spacing.md,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  streakLabel: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakStat: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  streakStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: 'white',
  },
  streakStatLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  trendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  focusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.glass,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  focusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  focusBold: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  severityCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  severityHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  comparisonCard: {
    marginBottom: spacing.md,
  },
  comparisonHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  comparisonSelector: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectorColumn: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  selectorItem: {
    backgroundColor: colors.surface.glass,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  selectorItemSelected: {
    backgroundColor: colors.primary.main,
  },
  selectorItemDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  selectorItemTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  comparisonArrow: {
    marginHorizontal: spacing.md,
    marginTop: 40,
  },
  comparisonResult: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  comparisonLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  comparisonValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recentSection: {
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginVertical: spacing.md,
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  analysisLeft: {
    flex: 1,
  },
  analysisDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  analysisTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  analysisRight: {
    marginLeft: spacing.md,
  },
});
