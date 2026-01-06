/**
 * Progress Tracking Hook
 * Tracks user improvement over time with streak tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';

const STREAK_STORAGE_KEY = '@slicefix_streak';
const PRACTICE_LOG_KEY = '@slicefix_practice_log';

interface PracticeSession {
  date: string;
  duration: number; // minutes
  drillsCompleted: number;
  challengeItemsCompleted: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalPracticeDays: number;
}

interface ProgressStats {
  totalAnalyses: number;
  averageConfidence: number;
  challengeCompletion: number;
  mostCommonCause: string | null;
  improvementPercentage: number;
}

interface UseProgressTrackingReturn {
  streakData: StreakData;
  progressStats: ProgressStats;
  practiceLog: PracticeSession[];
  logPracticeSession: (duration: number, drillsCompleted: number, challengeItems: number) => Promise<void>;
  getImprovementTrend: () => 'improving' | 'stable' | 'declining' | 'unknown';
  getSliceSeverity: (analysisId?: string) => 'mild' | 'moderate' | 'severe' | 'banana';
  compareAnalyses: (oldId: string, newId: string) => AnalysisComparison | null;
}

interface AnalysisComparison {
  confidenceChange: number;
  sameRootCause: boolean;
  challengeProgressOld: number;
  challengeProgressNew: number;
  daysBetween: number;
}

export const useProgressTracking = (): UseProgressTrackingReturn => {
  const { analyses } = useAppStore();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    totalPracticeDays: 0,
  });
  const [practiceLog, setPracticeLog] = useState<PracticeSession[]>([]);

  const loadStreakData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        setStreakData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  }, []);

  const loadPracticeLog = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PRACTICE_LOG_KEY);
      if (stored) {
        setPracticeLog(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load practice log:', error);
    }
  }, []);

  // Load streak data on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStreakData();
    loadPracticeLog();
  }, [loadStreakData, loadPracticeLog]);

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
      setStreakData(data);
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  };

  const updateStreakFromAnalyses = useCallback(() => {
    if (analyses.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user has any activity today or yesterday
    const hasActivityToday = analyses.some((a) => a.createdAt.startsWith(today));
    const hasActivityYesterday = analyses.some((a) => a.createdAt.startsWith(yesterday));

    const currentData = streakData;

    if (hasActivityToday) {
      if (currentData.lastPracticeDate === yesterday) {
        // Continue streak
        const newStreak = currentData.currentStreak + 1;
        saveStreakData({
          ...currentData,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, currentData.longestStreak),
          lastPracticeDate: today,
          totalPracticeDays: currentData.totalPracticeDays + 1,
        });
      } else if (currentData.lastPracticeDate !== today) {
        // New streak
        saveStreakData({
          ...currentData,
          currentStreak: 1,
          longestStreak: Math.max(1, currentData.longestStreak),
          lastPracticeDate: today,
          totalPracticeDays: currentData.totalPracticeDays + 1,
        });
      }
    } else if (!hasActivityYesterday && currentData.currentStreak > 0) {
      // Streak broken
      saveStreakData({
        ...currentData,
        currentStreak: 0,
      });
    }
  }, [analyses, streakData]);

  // Update streak when analyses change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateStreakFromAnalyses();
  }, [updateStreakFromAnalyses]);

  const logPracticeSession = useCallback(
    async (duration: number, drillsCompleted: number, challengeItems: number) => {
      const session: PracticeSession = {
        date: new Date().toISOString(),
        duration,
        drillsCompleted,
        challengeItemsCompleted: challengeItems,
      };

      const newLog = [session, ...practiceLog].slice(0, 100); // Keep last 100 sessions
      setPracticeLog(newLog);

      try {
        await AsyncStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify(newLog));
      } catch (error) {
        console.error('Failed to save practice log:', error);
      }

      // Update streak
      updateStreakFromAnalyses();
    },
    [practiceLog, updateStreakFromAnalyses]
  );

  const progressStats = useMemo((): ProgressStats => {
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageConfidence: 0,
        challengeCompletion: 0,
        mostCommonCause: null,
        improvementPercentage: 0,
      };
    }

    // Calculate average confidence
    const confidenceMap = { low: 1, medium: 2, high: 3 };
    const avgConfidence =
      analyses.reduce((sum, a) => sum + confidenceMap[a.rootCause.confidence], 0) /
      analyses.length;

    // Calculate challenge completion
    const totalItems = analyses.reduce((sum, a) => sum + a.challenge.checklist.length, 0);
    const completedItems = analyses.reduce(
      (sum, a) => sum + a.challenge.completedItems.filter(Boolean).length,
      0
    );
    const challengeCompletion = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Find most common root cause
    const causeCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      causeCounts[a.rootCause.title] = (causeCounts[a.rootCause.title] || 0) + 1;
    });
    const mostCommonCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Calculate improvement (compare first 3 vs last 3 analyses)
    let improvementPercentage = 0;
    if (analyses.length >= 4) {
      const recentAnalyses = analyses.slice(0, 3);
      const olderAnalyses = analyses.slice(-3);

      const recentAvgConfidence =
        recentAnalyses.reduce((sum, a) => sum + confidenceMap[a.rootCause.confidence], 0) / 3;
      const olderAvgConfidence =
        olderAnalyses.reduce((sum, a) => sum + confidenceMap[a.rootCause.confidence], 0) / 3;

      // Lower confidence = better (means clearer, more fixable issues identified)
      // Higher challenge completion = better
      const recentCompletion =
        recentAnalyses.reduce(
          (sum, a) =>
            sum + a.challenge.completedItems.filter(Boolean).length / a.challenge.checklist.length,
          0
        ) / 3;
      const olderCompletion =
        olderAnalyses.reduce(
          (sum, a) =>
            sum + a.challenge.completedItems.filter(Boolean).length / a.challenge.checklist.length,
          0
        ) / 3;

      improvementPercentage = Math.round((recentCompletion - olderCompletion) * 100);
    }

    return {
      totalAnalyses: analyses.length,
      averageConfidence: avgConfidence,
      challengeCompletion: Math.round(challengeCompletion),
      mostCommonCause,
      improvementPercentage,
    };
  }, [analyses]);

  const getImprovementTrend = useCallback((): 'improving' | 'stable' | 'declining' | 'unknown' => {
    if (analyses.length < 4) return 'unknown';

    const improvement = progressStats.improvementPercentage;
    if (improvement > 10) return 'improving';
    if (improvement < -10) return 'declining';
    return 'stable';
  }, [analyses.length, progressStats.improvementPercentage]);

  const getSliceSeverity = useCallback(
    (analysisId?: string): 'mild' | 'moderate' | 'severe' | 'banana' => {
      const analysis = analysisId
        ? analyses.find((a) => a.id === analysisId)
        : analyses[0];

      if (!analysis) return 'moderate';

      // Determine severity based on confidence and evidence
      const confidence = analysis.rootCause.confidence;
      const evidenceCount = analysis.rootCause.evidence.length;

      if (confidence === 'high' && evidenceCount >= 3) return 'severe';
      if (confidence === 'high' || evidenceCount >= 3) return 'banana';
      if (confidence === 'medium') return 'moderate';
      return 'mild';
    },
    [analyses]
  );

  const compareAnalyses = useCallback(
    (oldId: string, newId: string): AnalysisComparison | null => {
      const oldAnalysis = analyses.find((a) => a.id === oldId);
      const newAnalysis = analyses.find((a) => a.id === newId);

      if (!oldAnalysis || !newAnalysis) return null;

      const confidenceMap = { low: 1, medium: 2, high: 3 };
      const confidenceChange =
        confidenceMap[newAnalysis.rootCause.confidence] -
        confidenceMap[oldAnalysis.rootCause.confidence];

      const oldProgress =
        oldAnalysis.challenge.completedItems.filter(Boolean).length /
        oldAnalysis.challenge.checklist.length;
      const newProgress =
        newAnalysis.challenge.completedItems.filter(Boolean).length /
        newAnalysis.challenge.checklist.length;

      const daysBetween = Math.round(
        (new Date(newAnalysis.createdAt).getTime() - new Date(oldAnalysis.createdAt).getTime()) /
          86400000
      );

      return {
        confidenceChange,
        sameRootCause: oldAnalysis.rootCause.title === newAnalysis.rootCause.title,
        challengeProgressOld: Math.round(oldProgress * 100),
        challengeProgressNew: Math.round(newProgress * 100),
        daysBetween,
      };
    },
    [analyses]
  );

  return {
    streakData,
    progressStats,
    practiceLog,
    logPracticeSession,
    getImprovementTrend,
    getSliceSeverity,
    compareAnalyses,
  };
};
