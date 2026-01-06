/**
 * History Screen - Analysis History for SliceFix AI
 *
 * Displays past swing analyses with:
 * - Root cause and confidence badges
 * - Date/time of analysis
 * - Challenge completion progress
 * - Tap to view full details
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { GlassCard } from '../components/GlassCard';
import { ProgressSummary } from '../components/ProgressSummary';
import { useAppStore, SwingAnalysis } from '../store/useAppStore';
import { useFeatureFlag } from '../hooks/useFeatureFlags';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

// Confidence badge colors
const CONFIDENCE_COLORS = {
  low: colors.status.warning,
  medium: colors.secondary.main,
  high: colors.primary.light,
};

const CONFIDENCE_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const analyses = useAppStore((s) => s.analyses);
  const setCurrentAnalysis = useAppStore((s) => s.setCurrentAnalysis);
  const deleteAnalysis = useAppStore((s) => s.deleteAnalysis);
  const enableProgressTracking = useFeatureFlag('enableProgressTrackingV1');

  // Sort analyses by date (newest first)
  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [analyses]);

  const handleViewAnalysis = (analysis: SwingAnalysis) => {
    setCurrentAnalysis(analysis);
    navigation.navigate('Results');
  };

  const handleDeleteAnalysis = (analysis: SwingAnalysis) => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAnalysis(analysis.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getChallengeProgress = (analysis: SwingAnalysis): number => {
    const completed = analysis.challenge.completedItems.filter(Boolean).length;
    const total = analysis.challenge.completedItems.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const renderAnalysisItem = ({ item }: { item: SwingAnalysis }) => {
    const progress = getChallengeProgress(item);
    const confidenceColor = CONFIDENCE_COLORS[item.rootCause.confidence];

    return (
      <TouchableOpacity
        onPress={() => handleViewAnalysis(item)}
        onLongPress={() => handleDeleteAnalysis(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Analysis from ${formatDate(item.createdAt)}, ${item.rootCause.title}`}
        accessibilityHint="Tap to view details, long press to delete"
      >
        <GlassCard style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            </View>
            <View
              style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20' }]}
            >
              <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {CONFIDENCE_LABELS[item.rootCause.confidence]}
              </Text>
            </View>
          </View>

          <Text style={styles.rootCauseTitle}>{item.rootCause.title}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.drillInfo}>
              <Ionicons name="fitness-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.drillName} numberOfLines={1}>
                {item.drill.name}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="golf-outline" size={64} color={colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Analyses Yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload your first swing video to get started
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('Upload')}
        accessibilityRole="button"
        accessibilityLabel="Upload your first video"
      >
        <Ionicons name="cloud-upload-outline" size={20} color={colors.text.inverse} />
        <Text style={styles.uploadButtonText}>Upload Video</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {analyses.length > 0 && enableProgressTracking && (
        <ProgressSummary analyses={sortedAnalyses} />
      )}

      <FlatList
        data={sortedAnalyses}
        renderItem={renderAnalysisItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          analyses.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  analysisCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  rootCauseTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.md,
  },
  drillName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.surface.glass,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.light,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    minWidth: 32,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  uploadButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
