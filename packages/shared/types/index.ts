/**
 * Shared Types for SliceFix AI
 */

// User types
export interface User {
  id: string;
  email?: string;
  appleId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Subscription types
export type SubscriptionTier = 'monthly' | 'annual';

export interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trialEndDate?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Slice cause types
export const SLICE_CAUSES = [
  'open_clubface',
  'out_to_in_path',
  'early_extension',
  'poor_alignment',
] as const;

export type SliceCause = (typeof SLICE_CAUSES)[number];

export const SLICE_CAUSE_LABELS: Record<SliceCause, string> = {
  open_clubface: 'Open Clubface at Impact',
  out_to_in_path: 'Out-to-In Swing Path',
  early_extension: 'Early Extension',
  poor_alignment: 'Poor Alignment/Setup',
};

// Confidence types
export type Confidence = 'low' | 'medium' | 'high';

// Analysis types
export interface RootCause {
  id: SliceCause;
  title: string;
  whyItCausesSlice: string;
  confidence: Confidence;
  evidence: string[];
}

export interface Drill {
  id: string;
  name: string;
  description?: string;
  steps: string[];
  reps: string;
  commonMistakes: string[];
  videoUrl?: string;
}

export interface Challenge {
  title: string;
  checklist: string[];
  completedItems: boolean[];
}

export interface SwingAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  videoPath?: string;
  rootCause: RootCause;
  drill: Drill;
  challenge: Challenge;
  safetyNote: string;
}

// Video types
export interface VideoMetadata {
  uri: string;
  duration: number;
  width: number;
  height: number;
  fileSize: number;
}

export type CameraAngle = 'face_on' | 'down_the_line' | 'other';
export type Handedness = 'right' | 'left';

export interface VideoUpload {
  metadata: VideoMetadata;
  angle: CameraAngle;
  handedness: Handedness;
}

// API types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AnalyzeSwingRequest {
  videoPath: string;
  userId: string;
  angle?: CameraAngle;
  handedness?: Handedness;
}

export interface AnalyzeSwingResponse {
  analysis: SwingAnalysis;
}

// App state types
export interface OnboardingState {
  currentStep: number;
  completed: boolean;
}

export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  revenueCatKey: string;
}
