/**
 * Feature Flags for SliceFix AI
 *
 * Controls which features are enabled in the app.
 * All new features should be behind feature flags for safe rollout.
 *
 * Defaults:
 * - Production: OFF (false)
 * - Development: Toggleable via DEV settings
 */

export interface FeatureFlags {
  // Priority 1 - Required before marketing
  enableHistoryV1: boolean;
  enableProgressTrackingV1: boolean;
  enableDrillLibraryV1: boolean;

  // Priority 2 - Retention multipliers
  enableBeforeAfterV1: boolean;
  enableSlowMoV1: boolean;

  // Priority 3 - Competitive features
  enableAnnotationsV1: boolean;
  enableCoachFeedbackV1: boolean;
}

// Production defaults - all OFF for safe rollout
const PRODUCTION_DEFAULTS: FeatureFlags = {
  enableHistoryV1: false,
  enableProgressTrackingV1: false,
  enableDrillLibraryV1: false,
  enableBeforeAfterV1: false,
  enableSlowMoV1: false,
  enableAnnotationsV1: false,
  enableCoachFeedbackV1: false,
};

// Development defaults - all ON for testing
const DEVELOPMENT_DEFAULTS: FeatureFlags = {
  enableHistoryV1: true,
  enableProgressTrackingV1: true,
  enableDrillLibraryV1: true,
  enableBeforeAfterV1: true,
  enableSlowMoV1: true,
  enableAnnotationsV1: true,
  enableCoachFeedbackV1: true,
};

/**
 * Get default feature flags based on environment
 */
export function getDefaultFeatureFlags(isDev: boolean = false): FeatureFlags {
  return isDev ? { ...DEVELOPMENT_DEFAULTS } : { ...PRODUCTION_DEFAULTS };
}

/**
 * Feature flag names for UI display
 */
export const FEATURE_FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  enableHistoryV1: 'Analysis History',
  enableProgressTrackingV1: 'Progress Tracking',
  enableDrillLibraryV1: 'Drill Library',
  enableBeforeAfterV1: 'Before/After Comparison',
  enableSlowMoV1: 'Slow-Mo Playback',
  enableAnnotationsV1: 'Video Annotations',
  enableCoachFeedbackV1: 'AI Coach Feedback',
};

/**
 * Feature flag descriptions for UI
 */
export const FEATURE_FLAG_DESCRIPTIONS: Record<keyof FeatureFlags, string> = {
  enableHistoryV1: 'View your past swing analyses',
  enableProgressTrackingV1: 'Track your improvement over time',
  enableDrillLibraryV1: 'Access drill recommendations',
  enableBeforeAfterV1: 'Compare your swings side-by-side',
  enableSlowMoV1: 'Play videos in slow motion with scrubbing',
  enableAnnotationsV1: 'Draw on video frames',
  enableCoachFeedbackV1: 'Get personalized AI coaching tips',
};
