export * from './theme';

// App constants
export const APP_NAME = 'Pocket Caddie AI';
export const APP_TAGLINE = 'Fix Your Slice Fast';

// Subscription SKUs
export const SUBSCRIPTION_SKUS = {
  monthly: 'pocketcaddie.monthly',
  annual: 'pocketcaddie.annual',
} as const;

// Pricing
export const PRICING = {
  monthly: {
    price: 8.99,
    period: 'month',
    trialDays: 0,
  },
  annual: {
    price: 59.99,
    period: 'year',
    trialDays: 7,
  },
} as const;

// Video constraints
export const VIDEO_CONSTRAINTS = {
  minDuration: 3, // seconds
  maxDuration: 10, // seconds
  recommendedDuration: { min: 5, max: 8 }, // seconds
  maxFileSize: 50 * 1024 * 1024, // 50MB
} as const;

// Slice causes (MVP focus)
export const SLICE_CAUSES = [
  'open_clubface',
  'out_to_in_path',
  'early_extension',
  'poor_alignment',
] as const;

export type SliceCause = (typeof SLICE_CAUSES)[number];

// API endpoints
export const API_ENDPOINTS = {
  analyzeSwing: '/functions/v1/analyze-swing',
} as const;
