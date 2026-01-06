/**
 * Screenshot Mode Utility for Pocket Caddie AI
 *
 * Provides deterministic data and UI state for consistent App Store screenshots.
 * This should be used during development/marketing asset creation only.
 *
 * Features:
 * - Mock data for all screens
 * - Consistent timestamps
 * - Hidden personal information
 * - Quick navigation to any screen
 *
 * Usage:
 *   import { SCREENSHOT_MODE, getMockData } from '../utils/screenshotMode';
 *
 *   if (SCREENSHOT_MODE) {
 *     // Use mock data for screenshots
 *   }
 */

import { SwingAnalysis } from '../store/useAppStore';

// Enable screenshot mode via environment variable or build config
// Set EXPO_PUBLIC_SCREENSHOT_MODE=true to enable
export const SCREENSHOT_MODE = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === 'true';

// Fixed date for consistent screenshots
export const SCREENSHOT_DATE = new Date('2025-01-15T10:30:00Z');

/**
 * Mock analysis data for screenshots
 * Realistic but anonymized data
 */
export const MOCK_ANALYSES: SwingAnalysis[] = [
  {
    id: 'screenshot_analysis_1',
    createdAt: new Date('2025-01-15T10:00:00Z').toISOString(),
    rootCause: {
      title: 'Open Clubface at Impact',
      whyItCausesSlice:
        'When the clubface is open relative to your swing path at impact, it imparts clockwise spin on the ball, causing it to curve to the right.',
      confidence: 'high',
      evidence: [
        'Clubface appears open at the top of backswing',
        'Limited forearm rotation through impact zone',
        'Grip position suggests weak grip pattern',
      ],
    },
    drill: {
      name: 'Toe-Up to Toe-Up Drill',
      steps: [
        'Take your normal grip and address position',
        'Make a half backswing until the club is parallel to the ground',
        'Check that the toe of the club points straight up to the sky',
        'Swing through to a half follow-through position',
        'Check that the toe points up again at this position',
        'Repeat slowly, focusing on the rotation of your forearms',
      ],
      reps: '20 slow-motion swings, then 10 at 50% speed',
      commonMistakes: [
        'Rushing through the drill without checking positions',
        'Gripping too tightly, preventing natural rotation',
        'Moving the body instead of letting arms rotate',
      ],
    },
    challenge: {
      title: '10 Swing Challenge',
      checklist: [
        'Complete 3 sets of the Toe-Up drill',
        'Hit 5 balls focusing only on clubface control',
        'Record a follow-up swing video',
        'Notice if your ball flight has less curve',
        'Practice the drill for 5 minutes before your next round',
        'Check your grip pressure (should be 4/10)',
        'Visualize a square clubface before each swing',
        'Hit 5 punch shots with exaggerated face control',
        'Complete one full practice session focusing on this fix',
        'Share your progress or ask questions',
      ],
      completedItems: [true, true, true, true, false, false, false, false, false, false],
    },
    safetyNote:
      'Always warm up before practicing. If you experience any pain or discomfort, stop immediately and consult a medical professional.',
  },
  {
    id: 'screenshot_analysis_2',
    createdAt: new Date('2025-01-12T14:30:00Z').toISOString(),
    rootCause: {
      title: 'Out-to-In Swing Path',
      whyItCausesSlice:
        'An over-the-top move causes the club to travel from outside the target line to inside, producing left-to-right spin.',
      confidence: 'medium',
      evidence: [
        'Shoulders open too early in downswing',
        'Club approaches from outside target line',
        'Divots point left of target',
      ],
    },
    drill: {
      name: 'Headcover Gate Drill',
      steps: [
        'Place a headcover just outside the ball',
        'Practice swinging without hitting the headcover',
        'Focus on an inside-out path',
      ],
      reps: '15 practice swings, then 10 balls',
      commonMistakes: ['Starting downswing with shoulders', 'Trying to hit too hard'],
    },
    challenge: {
      title: '10 Swing Challenge',
      checklist: [
        'Complete the Headcover drill 3 times',
        'Hit 5 balls with exaggerated inside path',
        'Record a follow-up video',
        'Check for straighter ball flight',
        'Practice before your next round',
        'Focus on dropping the club into the slot',
        'Visualize the correct path',
        'Hit punch shots with inside path',
        'Complete a full practice session',
        'Track your improvement',
      ],
      completedItems: [true, true, true, true, true, true, true, false, false, false],
    },
    safetyNote: 'Stop if you feel any discomfort. This is educational guidance only.',
  },
];

/**
 * Mock user data for screenshots
 */
export const MOCK_USER = {
  id: 'screenshot_user',
  email: 'golfer@example.com',
  createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
};

/**
 * Mock streak data for screenshots
 */
export const MOCK_STREAK = {
  currentStreak: 7,
  longestStreak: 12,
  totalPracticeDays: 23,
  lastPracticeDate: SCREENSHOT_DATE.toISOString().split('T')[0],
};

/**
 * Mock progress stats for screenshots
 */
export const MOCK_PROGRESS_STATS = {
  totalAnalyses: 8,
  averageConfidence: 2.5,
  challengeCompletion: 65,
  mostCommonCause: 'Open Clubface at Impact',
  improvementPercentage: 24,
};

/**
 * Get mock data for a specific screen
 */
export function getMockDataForScreen(screenName: string): any {
  switch (screenName) {
    case 'HomeScreen':
      return {
        user: MOCK_USER,
        analyses: MOCK_ANALYSES,
        isSubscribed: true,
        streakData: MOCK_STREAK,
        progressStats: MOCK_PROGRESS_STATS,
      };

    case 'UploadScreen':
      return {
        selectedVideo: null,
        tips: [
          { icon: 'time-outline', text: '5-8 seconds' },
          { icon: 'sunny-outline', text: 'Good lighting' },
          { icon: 'body-outline', text: 'Full body visible' },
          { icon: 'phone-landscape-outline', text: 'Face-on or down-the-line' },
        ],
      };

    case 'CameraScreen':
      return {
        selectedAngle: 'face-on',
        showGuide: true,
        isRecording: false,
      };

    case 'ProcessingScreen':
      return {
        currentStep: 2,
        steps: [
          'Uploading video...',
          'Analyzing swing positions...',
          'Identifying slice causes...',
          'Generating recommendations...',
          'Creating your report...',
        ],
      };

    case 'ResultsScreen':
      return {
        analysis: MOCK_ANALYSES[0],
        progress: 0.4,
      };

    case 'ProgressScreen':
      return {
        streakData: MOCK_STREAK,
        progressStats: MOCK_PROGRESS_STATS,
        analyses: MOCK_ANALYSES,
        trend: 'improving',
      };

    default:
      return {};
  }
}

/**
 * Screenshot capture instructions for each screen
 */
export const SCREENSHOT_INSTRUCTIONS = {
  '01-home': {
    screen: 'HomeScreen',
    description: 'Main home screen with upload CTA and recent analyses',
    setup: 'Show 2 past analyses with progress rings',
  },
  '02-upload': {
    screen: 'UploadScreen',
    description: 'Video upload options screen',
    setup: 'Show "Record with Guide" as highlighted option',
  },
  '03-camera': {
    screen: 'CameraScreen',
    description: 'Camera recording with angle guide overlay',
    setup: 'Show face-on guide with corner markers',
  },
  '04-analysis': {
    screen: 'ProcessingScreen',
    description: 'AI analysis in progress',
    setup: 'Show step 3 (Identifying slice causes) active',
  },
  '05-results': {
    screen: 'ResultsScreen',
    description: 'Analysis results with drill recommendation',
    setup: 'Show high confidence result with 4/10 challenge items complete',
  },
  '06-progress': {
    screen: 'ProgressScreen',
    description: 'Progress tracking with streak and improvement',
    setup: 'Show 7-day streak and 24% improvement',
  },
};

/**
 * Log screenshot mode status on app start
 */
export function logScreenshotModeStatus(): void {
  if (SCREENSHOT_MODE) {
    console.log('\n=================================');
    console.log('📸 SCREENSHOT MODE ENABLED');
    console.log('=================================');
    console.log('Using mock data for App Store screenshots');
    console.log('Disable by removing EXPO_PUBLIC_SCREENSHOT_MODE\n');
  }
}
