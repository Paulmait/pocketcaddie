/**
 * SliceFix AI - Drill Library
 * 12 drills mapped to 4 root causes
 */

export type DrillDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type RootCauseType =
  | 'Open Clubface at Impact'
  | 'Out-to-In Swing Path'
  | 'Early Extension'
  | 'Poor Alignment/Setup';

export interface LibraryDrill {
  id: string;
  name: string;
  description: string;
  targetCause: RootCauseType;
  difficulty: DrillDifficulty;
  durationMinutes: number;
  videoUrl?: string;
  thumbnailEmoji: string;
  steps: string[];
  reps: string;
  commonMistakes: string[];
  tips: string[];
  equipment?: string[];
}

export interface DrillPracticeRecord {
  drillId: string;
  practiceDate: string;
  durationMinutes: number;
  notes?: string;
}

export const ROOT_CAUSE_LABELS: Record<RootCauseType, string> = {
  'Open Clubface at Impact': 'Open Clubface',
  'Out-to-In Swing Path': 'Swing Path',
  'Early Extension': 'Early Extension',
  'Poor Alignment/Setup': 'Alignment',
};

export const ROOT_CAUSE_COLORS: Record<RootCauseType, string> = {
  'Open Clubface at Impact': '#EF4444', // red
  'Out-to-In Swing Path': '#F59E0B', // amber
  'Early Extension': '#3B82F6', // blue
  'Poor Alignment/Setup': '#8B5CF6', // purple
};

export const DRILL_LIBRARY: LibraryDrill[] = [
  // ===========================
  // OPEN CLUBFACE DRILLS (3)
  // ===========================
  {
    id: 'oc-grip-pressure',
    name: 'Grip Pressure Check',
    description: 'Ensure consistent grip pressure to prevent the clubface from opening at impact.',
    targetCause: 'Open Clubface at Impact',
    difficulty: 'beginner',
    durationMinutes: 5,
    thumbnailEmoji: '✊',
    steps: [
      'Grip the club with pressure level 4/10 (relaxed but secure)',
      'Make 10 slow practice swings maintaining constant pressure',
      'Check that your lead wrist stays flat at impact',
      'Gradually increase swing speed while maintaining grip pressure',
    ],
    reps: '10 slow swings, then 10 at 75% speed',
    commonMistakes: [
      'Gripping too tight causes tension and inconsistent face',
      'Loosening grip at the top of backswing',
    ],
    tips: [
      'Think "hold a bird" - firm enough it won\'t fly away, gentle enough not to hurt it',
      'Check pressure in your last 3 fingers of lead hand',
    ],
    equipment: ['7-iron or wedge'],
  },
  {
    id: 'oc-glove-under-arm',
    name: 'Glove Under Lead Arm',
    description: 'Promotes connection and prevents arms from separating, which causes an open face.',
    targetCause: 'Open Clubface at Impact',
    difficulty: 'beginner',
    durationMinutes: 10,
    thumbnailEmoji: '🧤',
    steps: [
      'Place your glove or headcover under your lead armpit',
      'Make half swings keeping the glove in place',
      'The glove should stay until well after impact',
      'Progress to 3/4 swings, then full swings',
    ],
    reps: '15 half swings, 10 full swings',
    commonMistakes: [
      'Dropping the glove on the downswing',
      'Squeezing too hard causing tension',
    ],
    tips: [
      'Focus on the feeling of connection, not power',
      'Your arms and body should rotate together',
    ],
  },
  {
    id: 'oc-toe-tap',
    name: 'Toe Tap Face Control',
    description: 'Develops feel for clubface awareness through impact.',
    targetCause: 'Open Clubface at Impact',
    difficulty: 'intermediate',
    durationMinutes: 10,
    thumbnailEmoji: '👆',
    steps: [
      'Set up to the ball with a 7-iron',
      'Make a slow backswing stopping at hip height',
      'On the downswing, tap the toe of the club on the ground in front of the ball',
      'This promotes a square or slightly closed face position',
      'After 20 taps, hit real shots focusing on the same feel',
    ],
    reps: '20 taps, then 10 regular swings',
    commonMistakes: [
      'Rushing the motion',
      'Not pausing at the tap position',
    ],
    tips: [
      'The slower you go, the more you learn',
      'Feel the toe leading into impact',
    ],
    equipment: ['7-iron', 'Alignment stick (optional)'],
  },

  // ===========================
  // OUT-TO-IN PATH DRILLS (3)
  // ===========================
  {
    id: 'otp-headcover',
    name: 'Headcover Path Drill',
    description: 'Forces an inside-out swing path by creating a physical barrier.',
    targetCause: 'Out-to-In Swing Path',
    difficulty: 'beginner',
    durationMinutes: 15,
    thumbnailEmoji: '🧢',
    steps: [
      'Place a headcover 6 inches behind and 3 inches outside the ball',
      'Your goal is to swing without hitting the headcover',
      'Start with half swings and progress to full swings',
      'The obstacle trains your body to swing from inside',
    ],
    reps: '20 swings (start slow, build up)',
    commonMistakes: [
      'Placing the headcover too close',
      'Trying to hit hard too soon',
    ],
    tips: [
      'If you keep hitting the headcover, move it further away initially',
      'Film yourself from behind to see your path improve',
    ],
    equipment: ['Headcover or small towel', 'Mid-iron'],
  },
  {
    id: 'otp-trailing-foot',
    name: 'Trailing Foot Back Drill',
    description: 'Preset an in-to-out path by adjusting your stance.',
    targetCause: 'Out-to-In Swing Path',
    difficulty: 'beginner',
    durationMinutes: 10,
    thumbnailEmoji: '👟',
    steps: [
      'Set up normally, then pull your trailing foot back 4-6 inches',
      'Your hips and shoulders should feel slightly closed to target',
      'Make normal swings from this closed stance',
      'Focus on feeling the club drop to the inside on the downswing',
    ],
    reps: '15 swings from closed stance',
    commonMistakes: [
      'Opening shoulders despite closed feet',
      'Exaggerating too much causing pushes',
    ],
    tips: [
      'This is exaggerated practice - you won\'t play this way',
      'The feeling should be swinging to "right field" (for righties)',
    ],
    equipment: ['Any club'],
  },
  {
    id: 'otp-baseball',
    name: 'Baseball Swing Drill',
    description: 'Horizontal swings that reinforce the inside-out feeling.',
    targetCause: 'Out-to-In Swing Path',
    difficulty: 'intermediate',
    durationMinutes: 10,
    thumbnailEmoji: '⚾',
    steps: [
      'Hold the club at waist height (horizontal, like a baseball bat)',
      'Make baseball-style swings feeling the inside path',
      'Focus on your trailing elbow staying close to your body',
      'Gradually lower the swing plane closer to golf',
      'Transfer the inside feeling to your regular swing',
    ],
    reps: '10 baseball, 10 transitional, 10 regular',
    commonMistakes: [
      'Swinging over the top when transitioning back to golf swing',
      'Casting the club from the top',
    ],
    tips: [
      'Feel like you\'re throwing the clubhead to right field',
      'Keep your back to the target longer in the downswing',
    ],
  },

  // ===========================
  // EARLY EXTENSION DRILLS (3)
  // ===========================
  {
    id: 'ee-wall-drill',
    name: 'Wall Contact Drill',
    description: 'Prevents your hips from thrusting toward the ball through impact.',
    targetCause: 'Early Extension',
    difficulty: 'beginner',
    durationMinutes: 10,
    thumbnailEmoji: '🧱',
    steps: [
      'Set up with your glutes touching a wall or sturdy chair',
      'Cross your arms over your chest (no club needed)',
      'Make rotation motions keeping your glutes on the wall',
      'Through the impact zone, your glutes should still touch the wall',
      'Progress to holding a club once you feel the proper rotation',
    ],
    reps: '20 slow motion rotations',
    commonMistakes: [
      'Swinging too fast',
      'Letting hips slide forward on downswing',
    ],
    tips: [
      'Start in slow motion - this drill is about feel, not speed',
      'Your hips should rotate, not thrust forward',
    ],
  },
  {
    id: 'ee-chair-drill',
    name: 'Chair Squat Drill',
    description: 'Maintains posture and prevents standing up through impact.',
    targetCause: 'Early Extension',
    difficulty: 'intermediate',
    durationMinutes: 15,
    thumbnailEmoji: '🪑',
    steps: [
      'Place a chair behind you so it touches your glutes at address',
      'Take your normal golf posture with the chair contact',
      'Make practice swings maintaining contact with the chair',
      'If you early extend, you\'ll lose contact with the chair',
      'Practice until you can make full swings while touching',
    ],
    reps: '15 half swings, 10 full swings',
    commonMistakes: [
      'Standing up out of posture',
      'Sliding hips forward instead of rotating',
    ],
    tips: [
      'Film yourself from down-the-line to see improvement',
      'The chair should stay in contact through the entire swing',
    ],
    equipment: ['Chair or bench', 'Any club'],
  },
  {
    id: 'ee-pelvis-push',
    name: 'Pelvis Rotation Drill',
    description: 'Trains proper hip rotation instead of hip thrust.',
    targetCause: 'Early Extension',
    difficulty: 'intermediate',
    durationMinutes: 10,
    thumbnailEmoji: '🔄',
    steps: [
      'Take your address position without a club',
      'Place your hands on your hips',
      'Practice rotating your lead hip BACK (toward the target) in the downswing',
      'Your belt buckle should rotate to face the target, not move toward the ball',
      'Add a club once you feel the proper rotation pattern',
    ],
    reps: '20 rotations without club, 10 with club',
    commonMistakes: [
      'Thrusting pelvis forward instead of rotating',
      'Losing spine angle during rotation',
    ],
    tips: [
      'Your lead hip should clear BACK, not slide forward',
      'Imagine your back pocket moving toward the target',
    ],
  },

  // ===========================
  // POOR ALIGNMENT DRILLS (3)
  // ===========================
  {
    id: 'pa-alignment-sticks',
    name: 'Alignment Stick Setup',
    description: 'The fundamental drill for proper alignment at address.',
    targetCause: 'Poor Alignment/Setup',
    difficulty: 'beginner',
    durationMinutes: 10,
    thumbnailEmoji: '📏',
    steps: [
      'Place one stick along your toe line, parallel to target line',
      'Place second stick on the ground pointing at your target',
      'Your feet, hips, and shoulders should all be parallel to the sticks',
      'Hit 10 balls, checking alignment before each shot',
      'Remove sticks and hit 5 more, trying to recreate the feeling',
    ],
    reps: '10 shots with sticks, 5 without',
    commonMistakes: [
      'Shoulders open even when feet are square',
      'Moving sticks during practice',
    ],
    tips: [
      'Have a friend check your alignment - what feels square often isn\'t',
      'Use this drill at the start of every practice session',
    ],
    equipment: ['2 alignment sticks or golf clubs'],
  },
  {
    id: 'pa-intermediate-target',
    name: 'Intermediate Target Drill',
    description: 'Pick a spot 2-3 feet in front of ball to aim at.',
    targetCause: 'Poor Alignment/Setup',
    difficulty: 'beginner',
    durationMinutes: 5,
    thumbnailEmoji: '🎯',
    steps: [
      'Stand behind the ball and pick your final target',
      'Find a spot (leaf, divot, discolored grass) 2-3 feet in front of ball on your target line',
      'Set up with clubface aimed at that intermediate spot',
      'Align your body parallel to the line from ball to spot',
      'Make your swing without second-guessing alignment',
    ],
    reps: 'Use on every shot in practice',
    commonMistakes: [
      'Picking a spot too far away',
      'Forgetting to use it under pressure',
    ],
    tips: [
      'This is what the pros do on every single shot',
      'The closer the intermediate target, the more accurate your aim',
    ],
  },
  {
    id: 'pa-shadow-drill',
    name: 'Shadow Alignment Check',
    description: 'Use your shadow to verify alignment on sunny days.',
    targetCause: 'Poor Alignment/Setup',
    difficulty: 'beginner',
    durationMinutes: 5,
    thumbnailEmoji: '☀️',
    steps: [
      'On a sunny day, position yourself with sun behind you',
      'Your shadow will show your shoulder and hip alignment',
      'Check that your shoulder shadow line points at target',
      'Adjust your setup until your shadow shows square alignment',
      'Hit shots with this visual feedback',
    ],
    reps: '10 shots with shadow check',
    commonMistakes: [
      'Only checking feet, not shoulders',
      'Ignoring hip alignment',
    ],
    tips: [
      'Shoulders are the most common alignment mistake',
      'Your body tends to align where your eyes look',
    ],
  },
];

/**
 * Get drills for a specific root cause
 */
export function getDrillsForCause(cause: RootCauseType): LibraryDrill[] {
  return DRILL_LIBRARY.filter((drill) => drill.targetCause === cause);
}

/**
 * Get drill by ID
 */
export function getDrillById(id: string): LibraryDrill | undefined {
  return DRILL_LIBRARY.find((drill) => drill.id === id);
}

/**
 * Get drills by difficulty
 */
export function getDrillsByDifficulty(difficulty: DrillDifficulty): LibraryDrill[] {
  return DRILL_LIBRARY.filter((drill) => drill.difficulty === difficulty);
}

/**
 * Get recommended drills based on user's most common issue
 */
export function getRecommendedDrills(
  analyses: { rootCause: { title: string } }[],
  maxDrills = 3
): LibraryDrill[] {
  if (analyses.length === 0) {
    // Return beginner drills if no analyses
    return DRILL_LIBRARY.filter((d) => d.difficulty === 'beginner').slice(0, maxDrills);
  }

  // Count occurrences of each root cause
  const causeCounts: Record<string, number> = {};
  analyses.forEach((a) => {
    const cause = a.rootCause.title;
    causeCounts[cause] = (causeCounts[cause] || 0) + 1;
  });

  // Find most common cause
  const mostCommonCause = Object.entries(causeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] as RootCauseType | undefined;

  if (!mostCommonCause) {
    return DRILL_LIBRARY.slice(0, maxDrills);
  }

  // Get drills for that cause, prioritizing beginner
  const causeDrills = getDrillsForCause(mostCommonCause);
  return causeDrills
    .sort((a, b) => {
      const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    })
    .slice(0, maxDrills);
}
