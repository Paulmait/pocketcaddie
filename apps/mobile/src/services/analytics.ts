/**
 * Analytics Service for Pocket Caddie AI
 *
 * Supports multiple analytics backends:
 * - Mixpanel (primary)
 * - Supabase (fallback)
 *
 * Privacy-first: No PII is tracked, user can opt-out
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Event names - centralized for consistency
export const AnalyticsEvents = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Auth
  AUTH_SCREEN_VIEWED: 'auth_screen_viewed',
  AUTH_APPLE_STARTED: 'auth_apple_started',
  AUTH_APPLE_SUCCESS: 'auth_apple_success',
  AUTH_APPLE_FAILED: 'auth_apple_failed',
  AUTH_EMAIL_STARTED: 'auth_email_started',
  AUTH_EMAIL_SUCCESS: 'auth_email_success',
  AUTH_SKIPPED: 'auth_skipped',
  SIGN_OUT: 'sign_out',

  // Upload & Analysis
  UPLOAD_SCREEN_VIEWED: 'upload_screen_viewed',
  VIDEO_SELECTED: 'video_selected',
  VIDEO_RECORDED: 'video_recorded',
  SAMPLE_VIDEO_USED: 'sample_video_used',
  ANALYSIS_STARTED: 'analysis_started',
  ANALYSIS_COMPLETED: 'analysis_completed',
  ANALYSIS_FAILED: 'analysis_failed',

  // Results
  RESULTS_VIEWED: 'results_viewed',
  DRILL_VIEWED: 'drill_viewed',
  CHALLENGE_ITEM_COMPLETED: 'challenge_item_completed',
  CHALLENGE_COMPLETED: 'challenge_completed',
  REPORT_SHARED: 'report_shared',

  // Paywall
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  PLAN_SELECTED: 'plan_selected',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  RESTORE_STARTED: 'restore_started',
  RESTORE_SUCCESS: 'restore_success',
  RESTORE_FAILED: 'restore_failed',

  // Settings
  SETTINGS_VIEWED: 'settings_viewed',
  DELETE_ACCOUNT_STARTED: 'delete_account_started',
  DELETE_ACCOUNT_COMPLETED: 'delete_account_completed',

  // App Lifecycle
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  RATING_PROMPT_SHOWN: 'rating_prompt_shown',
  RATING_PROMPT_ACCEPTED: 'rating_prompt_accepted',
  RATING_PROMPT_DECLINED: 'rating_prompt_declined',
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

interface DeviceInfo {
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel?: string;
}

interface AnalyticsConfig {
  mixpanelToken?: string;
  enabled: boolean;
  userId?: string;
}

class Analytics {
  private config: AnalyticsConfig = {
    enabled: true,
  };
  private mixpanel: any = null;
  private deviceInfo: DeviceInfo;
  private queue: Array<{ event: string; properties: any; timestamp: string }> = [];
  private isInitialized = false;

  constructor() {
    this.deviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version?.toString() || 'unknown',
      appVersion: '1.0.0', // Should come from app.json
    };
  }

  async initialize(config?: Partial<AnalyticsConfig>) {
    if (this.isInitialized) return;

    // Check user opt-out preference
    const optedOut = await AsyncStorage.getItem('analytics_opted_out');
    if (optedOut === 'true') {
      this.config.enabled = false;
      console.log('Analytics: User opted out');
      return;
    }

    // Initialize Mixpanel if token provided
    const mixpanelToken = config?.mixpanelToken || process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

    if (mixpanelToken) {
      try {
        // Dynamic import to avoid errors if not installed
        const { Mixpanel } = await import('mixpanel-react-native');
        this.mixpanel = new Mixpanel(mixpanelToken, true);
        await this.mixpanel.init();
        console.log('Analytics: Mixpanel initialized');
      } catch (error) {
        console.log('Analytics: Mixpanel not available, using Supabase fallback');
      }
    }

    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    // Flush any queued events
    this.flushQueue();
  }

  setUserId(userId: string | null) {
    this.config.userId = userId || undefined;

    if (this.mixpanel && userId) {
      this.mixpanel.identify(userId);
    }
  }

  async track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.config.enabled) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        ...this.deviceInfo,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // If not initialized, queue the event
    if (!this.isInitialized) {
      this.queue.push(eventData);
      return;
    }

    // Track to Mixpanel
    if (this.mixpanel) {
      try {
        this.mixpanel.track(event, eventData.properties);
      } catch (error) {
        console.error('Mixpanel track error:', error);
      }
    }

    // Also track to Supabase for internal analytics
    try {
      await supabase.from('analytics_events').insert({
        user_id: this.config.userId,
        event_name: event,
        event_properties: properties,
        device_info: this.deviceInfo,
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.log('Analytics: Supabase tracking failed (non-critical)');
    }
  }

  async trackScreen(screenName: string) {
    await this.track(`screen_viewed` as AnalyticsEvent, { screen: screenName });

    if (this.mixpanel) {
      try {
        this.mixpanel.track('Screen Viewed', { screen: screenName });
      } catch (error) {
        // Ignore
      }
    }
  }

  // Set user properties (for segmentation)
  setUserProperty(key: string, value: any) {
    if (!this.config.enabled) return;

    if (this.mixpanel) {
      try {
        this.mixpanel.getPeople().set(key, value);
      } catch (error) {
        // Ignore
      }
    }
  }

  // Increment a user property (e.g., analysis_count)
  incrementUserProperty(key: string, amount = 1) {
    if (!this.config.enabled) return;

    if (this.mixpanel) {
      try {
        this.mixpanel.getPeople().increment(key, amount);
      } catch (error) {
        // Ignore
      }
    }
  }

  // Time an event (for performance tracking)
  timeEvent(event: AnalyticsEvent) {
    if (!this.config.enabled) return;

    if (this.mixpanel) {
      try {
        this.mixpanel.timeEvent(event);
      } catch (error) {
        // Ignore
      }
    }
  }

  // User opt-out
  async optOut() {
    this.config.enabled = false;
    await AsyncStorage.setItem('analytics_opted_out', 'true');

    if (this.mixpanel) {
      try {
        this.mixpanel.optOutTracking();
      } catch (error) {
        // Ignore
      }
    }
  }

  // User opt-in
  async optIn() {
    this.config.enabled = true;
    await AsyncStorage.setItem('analytics_opted_out', 'false');

    if (this.mixpanel) {
      try {
        this.mixpanel.optInTracking();
      } catch (error) {
        // Ignore
      }
    }
  }

  // Check if user has opted out
  async isOptedOut(): Promise<boolean> {
    const optedOut = await AsyncStorage.getItem('analytics_opted_out');
    return optedOut === 'true';
  }

  // Flush queued events
  private async flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        await this.track(event.event as AnalyticsEvent, event.properties);
      }
    }
  }

  // Reset (for logout)
  reset() {
    this.config.userId = undefined;

    if (this.mixpanel) {
      try {
        this.mixpanel.reset();
      } catch (error) {
        // Ignore
      }
    }
  }
}

// Singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) =>
  analytics.track(event, properties);

export const trackScreen = (screenName: string) =>
  analytics.trackScreen(screenName);

export const setAnalyticsUserId = (userId: string | null) =>
  analytics.setUserId(userId);

export const initializeAnalytics = (config?: Partial<AnalyticsConfig>) =>
  analytics.initialize(config);
