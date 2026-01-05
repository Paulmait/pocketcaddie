/**
 * App Store Rating Prompt Hook
 *
 * Intelligently prompts users for App Store ratings at optimal moments:
 * - After completing a successful analysis with high confidence
 * - After completing 5+ challenge items
 * - Not more than once per 30 days
 * - Not if user has already rated
 */

import { useCallback, useEffect } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { analytics, AnalyticsEvents } from '../services/analytics';

const STORAGE_KEYS = {
  LAST_PROMPT_DATE: 'rating_last_prompt_date',
  PROMPT_COUNT: 'rating_prompt_count',
  HAS_RATED: 'rating_has_rated',
  ANALYSIS_COUNT: 'rating_analysis_count',
  CHALLENGE_COMPLETIONS: 'rating_challenge_completions',
};

// Configuration
const CONFIG = {
  MIN_DAYS_BETWEEN_PROMPTS: 30,
  MIN_ANALYSES_BEFORE_PROMPT: 2,
  MIN_CHALLENGE_ITEMS_BEFORE_PROMPT: 5,
  MAX_PROMPT_COUNT: 3, // Don't annoy users
};

interface RatingState {
  lastPromptDate: string | null;
  promptCount: number;
  hasRated: boolean;
  analysisCount: number;
  challengeCompletions: number;
}

export function useRatingPrompt() {
  // Check if we can show the rating prompt
  const canShowPrompt = useCallback(async (): Promise<boolean> => {
    // Only works on iOS and Android
    if (Platform.OS === 'web') return false;

    // Check if StoreReview is available
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    // Get stored state
    const state = await getRatingState();

    // User already rated
    if (state.hasRated) return false;

    // Too many prompts already
    if (state.promptCount >= CONFIG.MAX_PROMPT_COUNT) return false;

    // Not enough activity yet
    if (state.analysisCount < CONFIG.MIN_ANALYSES_BEFORE_PROMPT) return false;

    // Check time since last prompt
    if (state.lastPromptDate) {
      const lastPrompt = new Date(state.lastPromptDate);
      const daysSincePrompt = Math.floor(
        (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePrompt < CONFIG.MIN_DAYS_BETWEEN_PROMPTS) return false;
    }

    return true;
  }, []);

  // Show the rating prompt
  const showRatingPrompt = useCallback(async (): Promise<boolean> => {
    const canShow = await canShowPrompt();
    if (!canShow) return false;

    try {
      // Track that we're showing the prompt
      analytics.track(AnalyticsEvents.RATING_PROMPT_SHOWN);

      // Update stored state
      const state = await getRatingState();
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_PROMPT_DATE,
        new Date().toISOString()
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROMPT_COUNT,
        String(state.promptCount + 1)
      );

      // Request the review
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        return true;
      }
    } catch (error) {
      console.log('Rating prompt error:', error);
    }

    return false;
  }, [canShowPrompt]);

  // Track when user completes an analysis
  const trackAnalysisComplete = useCallback(
    async (confidence: 'low' | 'medium' | 'high') => {
      const state = await getRatingState();
      const newCount = state.analysisCount + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.ANALYSIS_COUNT, String(newCount));

      // High confidence analysis is a good moment to prompt
      if (confidence === 'high' && newCount >= CONFIG.MIN_ANALYSES_BEFORE_PROMPT) {
        const shouldPrompt = await canShowPrompt();
        if (shouldPrompt) {
          // Delay slightly so user sees their results first
          setTimeout(() => showRatingPrompt(), 3000);
        }
      }
    },
    [canShowPrompt, showRatingPrompt]
  );

  // Track when user completes challenge items
  const trackChallengeItemComplete = useCallback(
    async (totalCompleted: number) => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHALLENGE_COMPLETIONS,
        String(totalCompleted)
      );

      // 5+ items completed is a good moment
      if (totalCompleted >= CONFIG.MIN_CHALLENGE_ITEMS_BEFORE_PROMPT) {
        const shouldPrompt = await canShowPrompt();
        if (shouldPrompt) {
          setTimeout(() => showRatingPrompt(), 2000);
        }
      }
    },
    [canShowPrompt, showRatingPrompt]
  );

  // Mark as rated (call if user confirms they rated)
  const markAsRated = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, 'true');
    analytics.track(AnalyticsEvents.RATING_PROMPT_ACCEPTED);
  }, []);

  // Reset rating state (for testing)
  const resetRatingState = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }, []);

  return {
    canShowPrompt,
    showRatingPrompt,
    trackAnalysisComplete,
    trackChallengeItemComplete,
    markAsRated,
    resetRatingState,
  };
}

// Helper to get stored rating state
async function getRatingState(): Promise<RatingState> {
  const [lastPromptDate, promptCount, hasRated, analysisCount, challengeCompletions] =
    await AsyncStorage.multiGet([
      STORAGE_KEYS.LAST_PROMPT_DATE,
      STORAGE_KEYS.PROMPT_COUNT,
      STORAGE_KEYS.HAS_RATED,
      STORAGE_KEYS.ANALYSIS_COUNT,
      STORAGE_KEYS.CHALLENGE_COMPLETIONS,
    ]);

  return {
    lastPromptDate: lastPromptDate[1],
    promptCount: parseInt(promptCount[1] || '0', 10),
    hasRated: hasRated[1] === 'true',
    analysisCount: parseInt(analysisCount[1] || '0', 10),
    challengeCompletions: parseInt(challengeCompletions[1] || '0', 10),
  };
}

// Context provider for app-wide rating prompt access
import React, { createContext, useContext, ReactNode } from 'react';

interface RatingContextValue {
  trackAnalysisComplete: (confidence: 'low' | 'medium' | 'high') => Promise<void>;
  trackChallengeItemComplete: (totalCompleted: number) => Promise<void>;
  showRatingPrompt: () => Promise<boolean>;
}

const RatingContext = createContext<RatingContextValue | null>(null);

export function RatingProvider({ children }: { children: ReactNode }) {
  const rating = useRatingPrompt();

  return (
    <RatingContext.Provider
      value={{
        trackAnalysisComplete: rating.trackAnalysisComplete,
        trackChallengeItemComplete: rating.trackChallengeItemComplete,
        showRatingPrompt: rating.showRatingPrompt,
      }}
    >
      {children}
    </RatingContext.Provider>
  );
}

export function useRating() {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
}
