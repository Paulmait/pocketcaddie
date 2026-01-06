import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { NetworkStatus } from '../components/NetworkStatus';
import { SeverityBadge } from '../components/SliceSeverityMeter';
import { useAppStore, SwingAnalysis } from '../store/useAppStore';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useNetworkStore } from '../services/network';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

// Success stories for social proof
const SUCCESS_STORIES = [
  { name: 'Mike T.', sessions: 3, improvement: 'Fixed grip issue' },
  { name: 'Sarah K.', sessions: 5, improvement: 'Eliminated over-the-top swing' },
  { name: 'James R.', sessions: 2, improvement: 'Corrected open clubface' },
];

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isSubscribed, analyses, setCurrentAnalysis } = useAppStore();
  const { streakData, progressStats, getSliceSeverity } = useProgressTracking();
  const { isConnected } = useNetworkStore();

  const handleUpload = () => {
    if (!isSubscribed && analyses.length >= 1) {
      // Free users get 1 analysis
      navigation.navigate('Paywall');
    } else {
      navigation.navigate('Upload');
    }
  };

  const handleAnalysisPress = (analysis: SwingAnalysis) => {
    setCurrentAnalysis(analysis);
    navigation.navigate('Results', { analysisId: analysis.id });
  };

  const getChallengeProgress = (analysis: SwingAnalysis) => {
    const completed = analysis.challenge.completedItems.filter(Boolean).length;
    return completed / analysis.challenge.completedItems.length;
  };

  const renderAnalysisItem = ({ item }: { item: SwingAnalysis }) => {
    const progress = getChallengeProgress(item);
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity
        onPress={() => handleAnalysisPress(item)}
        activeOpacity={0.7}
      >
        <GlassCard style={styles.analysisCard}>
          <View style={styles.analysisContent}>
            <View style={styles.analysisInfo}>
              <Text style={styles.analysisTitle}>{item.rootCause.title}</Text>
              <Text style={styles.analysisDate}>{date}</Text>
              <Text style={styles.analysisDrill}>Drill: {item.drill.name}</Text>
            </View>
            <ProgressRing progress={progress} size={50} strokeWidth={4} />
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Network Status Banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color={colors.text.primary} />
          <Text style={styles.offlineBannerText}>
            Offline - Videos will sync when connected
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.email ? `Welcome back` : 'Welcome'}
          </Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Fix Your Slice</Text>
            <Text style={styles.tagline}>America&apos;s #1 Slice Fixer</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Streak indicator */}
          {streakData.currentStreak > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Progress')}
              style={styles.streakBadge}
            >
              <Ionicons name="flame" size={18} color={colors.secondary.main} />
              <Text style={styles.streakText}>{streakData.currentStreak}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload CTA */}
        <GlassCard style={styles.uploadCard}>
          <Ionicons name="videocam" size={48} color={colors.primary.light} />
          <Text style={styles.uploadTitle}>Analyze Your Swing</Text>
          <Text style={styles.uploadDescription}>
            Upload a 5-8 second swing video and get instant feedback on what&apos;s
            causing your slice.
          </Text>
          <Button
            title="Upload Swing Video"
            onPress={handleUpload}
            fullWidth
            size="lg"
          />
        </GlassCard>

        {/* Subscription Status */}
        {!isSubscribed && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.promoCard}>
              <View style={styles.promoContent}>
                <Ionicons name="star" size={24} color={colors.secondary.main} />
                <View style={styles.promoText}>
                  <Text style={styles.promoTitle}>Unlock Unlimited Analysis</Text>
                  <Text style={styles.promoDescription}>
                    7-day free trial with annual plan
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.tertiary}
                />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}

        {/* Past Analyses */}
        {analyses.length > 0 && (
          <View style={styles.analysesSection}>
            <Text style={styles.sectionTitle}>Your Analyses</Text>
            <FlatList
              data={analyses}
              renderItem={renderAnalysisItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {analyses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="golf-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No analyses yet</Text>
            <Text style={styles.emptyDescription}>
              Upload your first swing video to get started
            </Text>
          </View>
        )}

        {/* Success Stories - Social Proof */}
        <View style={styles.successSection}>
          <Text style={styles.sectionTitle}>Success Stories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.successScroll}
          >
            {SUCCESS_STORIES.map((story, index) => (
              <GlassCard key={index} style={styles.successCard}>
                <View style={styles.successHeader}>
                  <View style={styles.successAvatar}>
                    <Text style={styles.successInitial}>{story.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.successName}>{story.name}</Text>
                </View>
                <Text style={styles.successImprovement}>{story.improvement}</Text>
                <View style={styles.successMeta}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.status.success} />
                  <Text style={styles.successSessions}>
                    Fixed in {story.sessions} sessions
                  </Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Progress Link */}
        {analyses.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Progress')}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.progressCard}>
              <View style={styles.progressContent}>
                <View style={styles.progressLeft}>
                  <Ionicons name="trending-up" size={24} color={colors.primary.light} />
                  <View style={styles.progressText}>
                    <Text style={styles.progressTitle}>View Your Progress</Text>
                    <Text style={styles.progressDescription}>
                      {progressStats.improvementPercentage >= 0 ? '+' : ''}
                      {progressStats.improvementPercentage}% improvement • {progressStats.totalAnalyses} analyses
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}

        {/* Community Stats */}
        <View style={styles.communityStats}>
          <Text style={styles.communityText}>
            Join 10,000+ golfers who have improved their slice
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.secondary.main,
    marginLeft: spacing.xs,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  titleRow: {
    flexDirection: 'column',
  },
  tagline: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.warning,
    paddingVertical: spacing.sm,
  },
  offlineBannerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  uploadCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  uploadDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  promoCard: {
    marginBottom: spacing.lg,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  promoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  promoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  analysesSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  analysisCard: {
    marginBottom: spacing.sm,
  },
  analysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  analysisDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  analysisDrill: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  successSection: {
    marginTop: spacing.lg,
  },
  successScroll: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
  successCard: {
    width: 180,
    marginRight: spacing.md,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  successInitial: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: 'white',
  },
  successName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  successImprovement: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  successMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successSessions: {
    fontSize: typography.fontSize.xs,
    color: colors.status.success,
    marginLeft: spacing.xs,
  },
  progressCard: {
    marginTop: spacing.md,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    marginLeft: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  communityStats: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  communityText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
