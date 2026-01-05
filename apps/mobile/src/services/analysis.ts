import { supabase, uploadVideo, deleteVideo } from './supabase';
import { SwingAnalysis } from '../store/useAppStore';

export interface AnalysisRequest {
  videoUri: string;
  userId: string;
}

export interface AnalysisResponse {
  root_cause: {
    title: string;
    why_it_causes_slice: string;
    confidence: 'low' | 'medium' | 'high';
    evidence: string[];
  };
  drill: {
    name: string;
    steps: string[];
    reps: string;
    common_mistakes: string[];
  };
  challenge: {
    title: string;
    checklist: string[];
  };
  safety_note: string;
}

export const analyzeSwing = async (
  request: AnalysisRequest
): Promise<SwingAnalysis> => {
  const { videoUri, userId } = request;

  // 1. Upload video to Supabase Storage
  const uploadResult = await uploadVideo(videoUri, userId);
  const videoPath = uploadResult.path;

  try {
    // 2. Call the analysis edge function
    const { data, error } = await supabase.functions.invoke<AnalysisResponse>(
      'analyze-swing',
      {
        body: {
          videoPath,
          userId,
        },
      }
    );

    if (error) {
      throw new Error(error.message || 'Analysis failed');
    }

    if (!data) {
      throw new Error('No analysis data returned');
    }

    // 3. Transform response to SwingAnalysis format
    const analysis: SwingAnalysis = {
      id: `analysis_${Date.now()}`,
      createdAt: new Date().toISOString(),
      videoUri: videoPath,
      rootCause: {
        title: data.root_cause.title,
        whyItCausesSlice: data.root_cause.why_it_causes_slice,
        confidence: data.root_cause.confidence,
        evidence: data.root_cause.evidence,
      },
      drill: {
        name: data.drill.name,
        steps: data.drill.steps,
        reps: data.drill.reps,
        commonMistakes: data.drill.common_mistakes,
      },
      challenge: {
        title: data.challenge.title,
        checklist: data.challenge.checklist,
        completedItems: new Array(data.challenge.checklist.length).fill(false),
      },
      safetyNote: data.safety_note,
    };

    // 4. Schedule video deletion (handled by edge function, but we can also clean up locally)
    // Videos are auto-deleted after 24 hours on the server

    return analysis;
  } catch (error) {
    // Clean up uploaded video on failure
    try {
      await deleteVideo(videoPath);
    } catch (cleanupError) {
      console.error('Failed to cleanup video:', cleanupError);
    }
    throw error;
  }
};

// Mock analysis for development/testing
export const getMockAnalysis = (): SwingAnalysis => {
  return {
    id: `analysis_${Date.now()}`,
    createdAt: new Date().toISOString(),
    rootCause: {
      title: 'Open Clubface at Impact',
      whyItCausesSlice:
        'When the clubface is open relative to your swing path at impact, it imparts clockwise spin on the ball (for right-handed golfers), causing it to curve dramatically to the right.',
      confidence: 'high',
      evidence: [
        'Clubface appears open at the top of backswing',
        'Limited forearm rotation through impact zone',
        'Grip may be too weak (turned too far left)',
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
      completedItems: new Array(10).fill(false),
    },
    safetyNote:
      'Always warm up before practicing. If you experience any pain or discomfort, stop immediately and consult a medical professional. This analysis is for educational purposes only and is not a substitute for professional instruction.',
  };
};
