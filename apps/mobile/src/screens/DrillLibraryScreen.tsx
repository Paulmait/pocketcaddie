import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { GlassCard, DrillCard } from '../components';
import { useAppStore } from '../store/useAppStore';
import {
  DRILL_LIBRARY,
  ROOT_CAUSE_LABELS,
  ROOT_CAUSE_COLORS,
  getRecommendedDrills,
  type RootCauseType,
  type LibraryDrill,
} from '../data/drillLibrary';

type RootStackParamList = {
  DrillLibrary: { filterCause?: RootCauseType };
  DrillDetail: { drillId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'DrillLibrary'>;

const CAUSES: RootCauseType[] = [
  'Open Clubface at Impact',
  'Out-to-In Swing Path',
  'Early Extension',
  'Poor Alignment/Setup',
];

export default function DrillLibraryScreen({ navigation, route }: Props) {
  const analyses = useAppStore((state) => state.analyses);
  const drillPracticeLog = useAppStore((state) => state.drillPracticeLog ?? []);

  const initialFilter = route.params?.filterCause ?? null;
  const [selectedCause, setSelectedCause] = useState<RootCauseType | null>(
    initialFilter
  );

  // Get practice counts for each drill
  const practiceCountsById = useMemo(() => {
    const counts: Record<string, number> = {};
    drillPracticeLog.forEach((record) => {
      counts[record.drillId] = (counts[record.drillId] || 0) + 1;
    });
    return counts;
  }, [drillPracticeLog]);

  // Get recommended drills based on user's analyses
  const recommendedDrills = useMemo(
    () => getRecommendedDrills(analyses, 3),
    [analyses]
  );

  // Filter drills by selected cause
  const filteredDrills = useMemo(() => {
    if (!selectedCause) return DRILL_LIBRARY;
    return DRILL_LIBRARY.filter((drill) => drill.targetCause === selectedCause);
  }, [selectedCause]);

  const handleDrillPress = (drill: LibraryDrill) => {
    navigation.navigate('DrillDetail', { drillId: drill.id });
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
          <Text style={styles.headerTitle}>Drill Library</Text>
          <Text style={styles.headerSubtitle}>
            {DRILL_LIBRARY.length} drills to fix your slice
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Section (only if not filtering) */}
        {!selectedCause && recommendedDrills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="star"
                size={20}
                color={colors.secondary.main}
              />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Based on your most common swing issue
            </Text>
            {recommendedDrills.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                practiceCount={practiceCountsById[drill.id] || 0}
                onPress={() => handleDrillPress(drill)}
              />
            ))}
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by Issue</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                !selectedCause && styles.filterTabActive,
              ]}
              onPress={() => setSelectedCause(null)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  !selectedCause && styles.filterTabTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {CAUSES.map((cause) => {
              const isActive = selectedCause === cause;
              const causeColor = ROOT_CAUSE_COLORS[cause];
              return (
                <TouchableOpacity
                  key={cause}
                  style={[
                    styles.filterTab,
                    isActive && {
                      backgroundColor: `${causeColor}20`,
                      borderColor: causeColor,
                    },
                  ]}
                  onPress={() => setSelectedCause(isActive ? null : cause)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isActive && { color: causeColor },
                    ]}
                  >
                    {ROOT_CAUSE_LABELS[cause]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* All Drills (or Filtered) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="golf-outline"
              size={20}
              color={colors.primary.light}
            />
            <Text style={styles.sectionTitle}>
              {selectedCause
                ? `${ROOT_CAUSE_LABELS[selectedCause]} Drills`
                : 'All Drills'}
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {filteredDrills.length} drill
            {filteredDrills.length !== 1 ? 's' : ''} available
          </Text>

          {filteredDrills.map((drill) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              practiceCount={practiceCountsById[drill.id] || 0}
              onPress={() => handleDrillPress(drill)}
              showCauseBadge={!selectedCause}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  filterSection: {
    marginTop: spacing.lg,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    backgroundColor: colors.surface.glass,
  },
  filterTabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: colors.text.primary,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
