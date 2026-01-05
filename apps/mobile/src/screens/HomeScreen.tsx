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

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ProgressRing } from '../components/ProgressRing';
import { useAppStore, SwingAnalysis } from '../store/useAppStore';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isSubscribed, analyses, setCurrentAnalysis } = useAppStore();

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
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.email ? `Welcome back` : 'Welcome'}
          </Text>
          <Text style={styles.title}>Fix Your Slice</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
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
            Upload a 5-8 second swing video and get instant feedback on what's
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
  settingsButton: {
    padding: spacing.sm,
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
});
