import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { ChecklistItem } from '../components/ChecklistItem';
import { ProgressRing } from '../components/ProgressRing';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useRating } from '../hooks/useRatingPrompt';
import { trackEvent, AnalyticsEvents } from '../services/analytics';

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysisId } = route.params;
  const viewShotRef = useRef<ViewShot>(null);
  const { trackAnalysisComplete, trackChallengeItemComplete } = useRating();

  const { analyses, currentAnalysis, updateChallengeProgress } = useAppStore();

  const analysis = currentAnalysis || analyses.find((a) => a.id === analysisId);

  // Track results viewed and trigger rating prompt for high confidence
  useEffect(() => {
    if (analysis) {
      trackEvent(AnalyticsEvents.RESULTS_VIEWED, {
        confidence: analysis.rootCause.confidence,
        root_cause: analysis.rootCause.title,
      });

      // Track for rating prompt
      trackAnalysisComplete(analysis.rootCause.confidence);
    }
  }, [analysis?.id]);

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Analysis not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const { rootCause, drill, challenge, safetyNote } = analysis;

  const completedCount = challenge.completedItems.filter(Boolean).length;
  const progress = completedCount / challenge.completedItems.length;

  const handleToggleChecklistItem = (index: number) => {
    const newCompleted = !challenge.completedItems[index];
    updateChallengeProgress(analysis.id, index, newCompleted);

    // Track for analytics and rating prompt
    if (newCompleted) {
      const newCompletedCount = completedCount + 1;
      trackEvent(AnalyticsEvents.CHALLENGE_ITEM_COMPLETED, {
        item_index: index,
        total_completed: newCompletedCount,
      });

      // Track for rating prompt (may trigger after 5+ items)
      trackChallengeItemComplete(newCompletedCount);

      // Track challenge completion
      if (newCompletedCount === challenge.checklist.length) {
        trackEvent(AnalyticsEvents.CHALLENGE_COMPLETED, {
          analysis_id: analysis.id,
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
          trackEvent(AnalyticsEvents.REPORT_SHARED, {
            analysis_id: analysis.id,
            confidence: rootCause.confidence,
          });
        } else {
          Alert.alert('Sharing not available', 'Unable to share on this device.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create shareable image.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Root Cause Section */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <GlassCard style={styles.rootCauseCard}>
            <View style={styles.rootCauseHeader}>
              <Text style={styles.sectionLabel}>PRIMARY SLICE CAUSE</Text>
              <ConfidenceBadge level={rootCause.confidence} />
            </View>
            <Text style={styles.rootCauseTitle}>{rootCause.title}</Text>
            <Text style={styles.rootCauseDescription}>
              {rootCause.whyItCausesSlice}
            </Text>

            <View style={styles.evidenceSection}>
              <Text style={styles.evidenceTitle}>Evidence from your swing:</Text>
              {rootCause.evidence.map((item, index) => (
                <View key={index} style={styles.evidenceItem}>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.primary.light}
                  />
                  <Text style={styles.evidenceText}>{item}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ViewShot>

        {/* Drill Section */}
        <GlassCard style={styles.drillCard}>
          <Text style={styles.sectionLabel}>RECOMMENDED DRILL</Text>
          <Text style={styles.drillName}>{drill.name}</Text>

          <View style={styles.stepsSection}>
            {drill.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.repsSection}>
            <Ionicons name="repeat" size={20} color={colors.secondary.main} />
            <Text style={styles.repsText}>{drill.reps}</Text>
          </View>

          <View style={styles.mistakesSection}>
            <Text style={styles.mistakesTitle}>Common Mistakes to Avoid:</Text>
            {drill.commonMistakes.map((mistake, index) => (
              <View key={index} style={styles.mistakeItem}>
                <Ionicons name="alert-circle" size={16} color={colors.status.warning} />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Challenge Section */}
        <GlassCard style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View>
              <Text style={styles.sectionLabel}>{challenge.title.toUpperCase()}</Text>
              <Text style={styles.challengeProgress}>
                {completedCount} of {challenge.checklist.length} completed
              </Text>
            </View>
            <ProgressRing progress={progress} size={60} strokeWidth={5} />
          </View>

          <View style={styles.checklistContainer}>
            {challenge.checklist.map((item, index) => (
              <ChecklistItem
                key={index}
                text={item}
                completed={challenge.completedItems[index]}
                onToggle={() => handleToggleChecklistItem(index)}
                index={index}
              />
            ))}
          </View>
        </GlassCard>

        {/* Safety Note */}
        <GlassCard style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.status.info} />
            <Text style={styles.safetyTitle}>Safety Note</Text>
          </View>
          <Text style={styles.safetyText}>{safetyNote}</Text>
        </GlassCard>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Analyze Another Swing"
            onPress={() => navigation.navigate('Upload')}
            fullWidth
            size="lg"
          />
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Home')}
            variant="ghost"
            fullWidth
            style={styles.homeButton}
          />
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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  shareButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  rootCauseCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  rootCauseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  rootCauseTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  rootCauseDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  evidenceSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  evidenceTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  evidenceText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  drillCard: {
    marginBottom: spacing.md,
  },
  drillName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  stepsSection: {
    marginBottom: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  repsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.glass,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  repsText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary.main,
    marginLeft: spacing.sm,
  },
  mistakesSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  mistakesTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  mistakeText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  challengeCard: {
    marginBottom: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeProgress: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  checklistContainer: {
    marginTop: spacing.sm,
  },
  safetyCard: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  safetyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.status.info,
    marginLeft: spacing.sm,
  },
  safetyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  actions: {
    marginTop: spacing.md,
  },
  homeButton: {
    marginTop: spacing.sm,
  },
});
