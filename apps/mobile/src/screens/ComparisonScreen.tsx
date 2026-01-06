/**
 * Comparison Screen for SliceFix AI
 *
 * Before/After swing comparison feature:
 * - Select baseline swing
 * - Select recent swing
 * - Generate comparison card
 * - Share via native share sheet
 *
 * Premium feature - gated behind subscription
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useAppStore, SwingAnalysis } from '../store/useAppStore';
import { useFeatureFlag } from '../hooks/useFeatureFlags';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type ComparisonScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Comparison'>;
  route: RouteProp<RootStackParamList, 'Comparison'>;
};

const CONFIDENCE_COLORS = {
  low: colors.status.warning,
  medium: colors.secondary.main,
  high: colors.primary.light,
};

export const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  navigation,
  route,
}) => {
  const analyses = useAppStore((s) => s.analyses);
  const isSubscribed = useAppStore((s) => s.isSubscribed);
  const enableBeforeAfter = useFeatureFlag('enableBeforeAfterV1');

  const [baselineId, setBaselineId] = useState<string | null>(
    route.params?.baselineId || null
  );
  const [recentId, setRecentId] = useState<string | null>(
    route.params?.recentId || null
  );
  const [selectingFor, setSelectingFor] = useState<'baseline' | 'recent' | null>(null);

  const baseline = useMemo(
    () => analyses.find((a) => a.id === baselineId) || null,
    [analyses, baselineId]
  );
  const recent = useMemo(
    () => analyses.find((a) => a.id === recentId) || null,
    [analyses, recentId]
  );

  // Sort analyses by date for selection
  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [analyses]);

  const handleSelectSwing = (analysis: SwingAnalysis) => {
    if (selectingFor === 'baseline') {
      setBaselineId(analysis.id);
    } else if (selectingFor === 'recent') {
      setRecentId(analysis.id);
    }
    setSelectingFor(null);
  };

  const handleShare = async () => {
    if (!baseline || !recent) {
      Alert.alert('Select Swings', 'Please select both a baseline and recent swing.');
      return;
    }

    if (!isSubscribed) {
      navigation.navigate('Paywall');
      return;
    }

    try {
      const baselineDate = new Date(baseline.createdAt).toLocaleDateString();
      const recentDate = new Date(recent.createdAt).toLocaleDateString();

      const message = `My SliceFix AI Progress\n\n` +
        `Before (${baselineDate}):\n` +
        `• ${baseline.rootCause.title}\n` +
        `• Confidence: ${baseline.rootCause.confidence}\n\n` +
        `After (${recentDate}):\n` +
        `• ${recent.rootCause.title}\n` +
        `• Confidence: ${recent.rootCause.confidence}\n\n` +
        `Track your golf improvement with SliceFix AI!\n` +
        `\n---\n` +
        `This comparison is for personal tracking only. ` +
        `Individual results may vary.`;

      await Share.share({
        message,
        title: 'My SliceFix AI Progress',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!enableBeforeAfter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.text.tertiary} />
          <Text style={styles.disabledText}>Feature coming soon</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Selection mode
  if (selectingFor) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectingFor(null)}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            Select {selectingFor === 'baseline' ? 'Baseline' : 'Recent'} Swing
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.selectionList}>
          {sortedAnalyses.map((analysis) => (
            <TouchableOpacity
              key={analysis.id}
              onPress={() => handleSelectSwing(analysis)}
              disabled={
                (selectingFor === 'baseline' && analysis.id === recentId) ||
                (selectingFor === 'recent' && analysis.id === baselineId)
              }
            >
              <GlassCard
                style={[
                  styles.selectionCard,
                  (analysis.id === baselineId || analysis.id === recentId) &&
                    styles.selectedCard,
                ]}
              >
                <Text style={styles.selectionDate}>{formatDate(analysis.createdAt)}</Text>
                <Text style={styles.selectionCause}>{analysis.rootCause.title}</Text>
                <View
                  style={[
                    styles.confidenceDot,
                    { backgroundColor: CONFIDENCE_COLORS[analysis.rootCause.confidence] },
                  ]}
                />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Compare Swings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Select a baseline and recent swing to compare your progress
        </Text>

        {/* Baseline Selection */}
        <Text style={styles.sectionLabel}>Baseline Swing</Text>
        <TouchableOpacity onPress={() => setSelectingFor('baseline')}>
          <GlassCard style={styles.swingCard}>
            {baseline ? (
              <>
                <Text style={styles.swingDate}>{formatDate(baseline.createdAt)}</Text>
                <Text style={styles.swingCause}>{baseline.rootCause.title}</Text>
                <View style={styles.swingMeta}>
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: CONFIDENCE_COLORS[baseline.rootCause.confidence] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confidenceText,
                        { color: CONFIDENCE_COLORS[baseline.rootCause.confidence] },
                      ]}
                    >
                      {baseline.rootCause.confidence} confidence
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptySwing}>
                <Ionicons name="add-circle-outline" size={24} color={colors.text.tertiary} />
                <Text style={styles.emptySwingText}>Select baseline swing</Text>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-down" size={24} color={colors.text.tertiary} />
        </View>

        {/* Recent Selection */}
        <Text style={styles.sectionLabel}>Recent Swing</Text>
        <TouchableOpacity onPress={() => setSelectingFor('recent')}>
          <GlassCard style={styles.swingCard}>
            {recent ? (
              <>
                <Text style={styles.swingDate}>{formatDate(recent.createdAt)}</Text>
                <Text style={styles.swingCause}>{recent.rootCause.title}</Text>
                <View style={styles.swingMeta}>
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: CONFIDENCE_COLORS[recent.rootCause.confidence] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confidenceText,
                        { color: CONFIDENCE_COLORS[recent.rootCause.confidence] },
                      ]}
                    >
                      {recent.rootCause.confidence} confidence
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptySwing}>
                <Ionicons name="add-circle-outline" size={24} color={colors.text.tertiary} />
                <Text style={styles.emptySwingText}>Select recent swing</Text>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>

        {/* Comparison Summary */}
        {baseline && recent && (
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Comparison Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Root Cause Change:</Text>
              <Text style={styles.summaryValue}>
                {baseline.rootCause.title === recent.rootCause.title
                  ? 'Same cause detected'
                  : 'Different cause detected'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time Between:</Text>
              <Text style={styles.summaryValue}>
                {Math.ceil(
                  (new Date(recent.createdAt).getTime() -
                    new Date(baseline.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              This comparison is for personal tracking only. Individual results may vary based on practice consistency and other factors.
            </Text>
          </GlassCard>
        )}

        {/* Share Button */}
        {baseline && recent && (
          <Button
            title={isSubscribed ? 'Share Comparison' : 'Unlock to Share'}
            onPress={handleShare}
            fullWidth
            icon={
              <Ionicons
                name={isSubscribed ? 'share-outline' : 'lock-closed'}
                size={20}
                color={colors.text.inverse}
              />
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  disabledText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  swingCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  swingDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  swingCause: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  swingMeta: {
    flexDirection: 'row',
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  emptySwing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptySwingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  summaryCard: {
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  selectionList: {
    padding: spacing.lg,
  },
  selectionCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  selectionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    width: 100,
  },
  selectionCause: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  confidenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
