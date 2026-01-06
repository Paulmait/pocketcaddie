/**
 * Feature Flags Hook for SliceFix AI
 *
 * Manages feature flags with:
 * - AsyncStorage persistence
 * - Dev-only toggle UI
 * - Runtime updates
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FeatureFlags,
  getDefaultFeatureFlags,
} from '../../../../packages/shared/featureFlags';

const FEATURE_FLAGS_STORAGE_KEY = '@slicefix_feature_flags';

// Check if we're in development mode
const __DEV__ = process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_DEV_MODE === 'true';

// Singleton state for feature flags
let globalFlags: FeatureFlags = getDefaultFeatureFlags(__DEV__);
let listeners: Set<() => void> = new Set();

/**
 * Load feature flags from storage
 */
async function loadFeatureFlags(): Promise<FeatureFlags> {
  try {
    const stored = await AsyncStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new flags
      globalFlags = { ...getDefaultFeatureFlags(__DEV__), ...parsed };
    } else {
      globalFlags = getDefaultFeatureFlags(__DEV__);
    }
  } catch (error) {
    console.warn('Failed to load feature flags:', error);
    globalFlags = getDefaultFeatureFlags(__DEV__);
  }
  return globalFlags;
}

/**
 * Save feature flags to storage
 */
async function saveFeatureFlags(flags: FeatureFlags): Promise<void> {
  try {
    await AsyncStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
    globalFlags = flags;
    // Notify all listeners
    listeners.forEach((listener) => listener());
  } catch (error) {
    console.warn('Failed to save feature flags:', error);
  }
}

/**
 * Hook to access and manage feature flags
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(globalFlags);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load flags on mount
    loadFeatureFlags().then((loaded) => {
      setFlags(loaded);
      setIsLoading(false);
    });

    // Subscribe to updates
    const listener = () => setFlags({ ...globalFlags });
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  /**
   * Toggle a specific feature flag (DEV only)
   */
  const toggleFlag = useCallback(
    async (key: keyof FeatureFlags) => {
      if (!__DEV__) {
        console.warn('Feature flag toggling is only available in development mode');
        return;
      }
      const newFlags = { ...globalFlags, [key]: !globalFlags[key] };
      await saveFeatureFlags(newFlags);
    },
    []
  );

  /**
   * Set a specific feature flag value (DEV only)
   */
  const setFlag = useCallback(
    async (key: keyof FeatureFlags, value: boolean) => {
      if (!__DEV__) {
        console.warn('Feature flag setting is only available in development mode');
        return;
      }
      const newFlags = { ...globalFlags, [key]: value };
      await saveFeatureFlags(newFlags);
    },
    []
  );

  /**
   * Reset all flags to defaults
   */
  const resetFlags = useCallback(async () => {
    const defaults = getDefaultFeatureFlags(__DEV__);
    await saveFeatureFlags(defaults);
  }, []);

  /**
   * Enable all flags (DEV only)
   */
  const enableAllFlags = useCallback(async () => {
    if (!__DEV__) return;
    const allEnabled: FeatureFlags = {
      enableHistoryV1: true,
      enableProgressTrackingV1: true,
      enableDrillLibraryV1: true,
      enableBeforeAfterV1: true,
      enableSlowMoV1: true,
      enableAnnotationsV1: true,
      enableCoachFeedbackV1: true,
    };
    await saveFeatureFlags(allEnabled);
  }, []);

  return {
    flags,
    isLoading,
    isDev: __DEV__,
    toggleFlag,
    setFlag,
    resetFlags,
    enableAllFlags,
  };
}

/**
 * Simple hook to check a single feature flag
 */
export function useFeatureFlag(key: keyof FeatureFlags): boolean {
  const { flags } = useFeatureFlags();
  return flags[key];
}
