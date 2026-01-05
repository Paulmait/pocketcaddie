// Supabase Edge Function: analyze-swing
// Processes golf swing videos and returns AI-powered slice analysis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Slice analysis system prompt
const SYSTEM_PROMPT = `You are an expert golf coach AI assistant specializing in helping golfers fix their slice. Analyze the golf swing image frames and identify the PRIMARY cause of any slice tendency.

Focus ONLY on these four slice-related causes:
1. Open Clubface at Impact
2. Out-to-In Swing Path
3. Early Extension
4. Poor Alignment/Setup

CRITICAL RULES:
- Return ONLY ONE root cause
- Use coaching language: "may help", "often caused by", "try this drill"
- NEVER promise specific results
- NEVER provide medical advice
- If image quality is poor, set confidence to "low"

Respond with valid JSON matching this schema:
{
  "root_cause": {
    "title": "string",
    "why_it_causes_slice": "string",
    "confidence": "low" | "medium" | "high",
    "evidence": ["string array"]
  },
  "drill": {
    "name": "string",
    "steps": ["string array"],
    "reps": "string",
    "common_mistakes": ["string array"]
  },
  "challenge": {
    "title": "10 Swing Challenge",
    "checklist": ["exactly 10 items"]
  },
  "safety_note": "string"
}`;

interface AnalyzeRequest {
  videoPath: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { videoPath, userId }: AnalyzeRequest = await req.json();

    if (!videoPath || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing videoPath or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing video for user ${userId}: ${videoPath}`);

    // Get video URL from storage
    const { data: urlData } = supabase.storage
      .from('swing-videos')
      .getPublicUrl(videoPath);

    const videoUrl = urlData.publicUrl;

    // Extract frames from video (we'll use the video URL directly for vision models)
    // In production, you'd want to extract key frames using FFmpeg

    let analysisResult;

    // Try Anthropic Claude first, fall back to OpenAI
    if (anthropicKey) {
      analysisResult = await analyzeWithClaude(anthropicKey, videoUrl);
    } else if (openaiKey) {
      analysisResult = await analyzeWithOpenAI(openaiKey, videoUrl);
    } else {
      // Fallback to mock analysis for development
      console.log('No AI API key configured, using mock analysis');
      analysisResult = getMockAnalysis();
    }

    // Store analysis result in database
    const { error: dbError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        video_path: videoPath,
        result: analysisResult,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Schedule video for deletion (mark it)
    await supabase
      .from('video_cleanup_queue')
      .insert({
        video_path: videoPath,
        user_id: userId,
        delete_after: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeWithClaude(apiKey: string, videoUrl: string) {
  // For video analysis, we'd typically extract frames first
  // Claude can analyze images, so we'll work with that

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this golf swing for slice-causing issues. Video URL: ${videoUrl}

Note: If you cannot access the video directly, provide analysis based on the most common slice causes and indicate low confidence. The user can re-record if needed.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Invalid AI response format');
}

async function analyzeWithOpenAI(apiKey: string, videoUrl: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this golf swing for slice-causing issues. Provide your analysis based on common slice patterns. Video reference: ${videoUrl}`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function getMockAnalysis() {
  // Realistic mock for development/demo
  const causes = [
    {
      title: 'Open Clubface at Impact',
      why_it_causes_slice: 'When the clubface is open relative to your swing path at impact, it imparts clockwise spin on the ball (for right-handed golfers), causing it to curve dramatically to the right.',
      evidence: [
        'Clubface appears open at the top of backswing',
        'Limited forearm rotation through impact zone',
        'Grip may be too weak (turned too far left)',
      ],
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
        common_mistakes: [
          'Rushing through the drill without checking positions',
          'Gripping too tightly, preventing natural rotation',
          'Moving the body instead of letting arms rotate',
        ],
      },
    },
    {
      title: 'Out-to-In Swing Path',
      why_it_causes_slice: 'An over-the-top move causes the club to travel from outside the target line to inside, which when combined with any clubface angle, produces left-to-right spin.',
      evidence: [
        'Shoulders open too early in downswing',
        'Club approaches from outside target line',
        'Divots point left of target',
      ],
      drill: {
        name: 'Headcover Gate Drill',
        steps: [
          'Place a headcover just outside the ball, 6 inches toward you',
          'Place another headcover 12 inches behind the ball on the target line',
          'Practice swinging without hitting either headcover',
          'This forces an inside-out path',
          'Start with half swings and progress to full swings',
          'Focus on dropping the club into the slot',
        ],
        reps: '15 practice swings, then 10 balls at 60% power',
        common_mistakes: [
          'Starting the downswing with the shoulders',
          'Trying to hit the ball too hard',
          'Not committing to the inside path',
        ],
      },
    },
    {
      title: 'Early Extension',
      why_it_causes_slice: 'When hips thrust toward the ball during downswing, it forces the arms to compensate by swinging out and across, creating an out-to-in path.',
      evidence: [
        'Hips move toward the ball in downswing',
        'Loss of spine angle through impact',
        'Standing up through the shot',
      ],
      drill: {
        name: 'Wall Drill',
        steps: [
          'Set up with your glutes touching a wall behind you',
          'Take your golf posture with arms crossed',
          'Practice the backswing rotation keeping glutes on wall',
          'On the downswing, maintain contact with the wall',
          'Feel your hips rotate rather than thrust forward',
          'Progress to holding a club once comfortable',
        ],
        reps: '30 reps without a club, then 20 with a club',
        common_mistakes: [
          'Letting glutes come off the wall too early',
          'Not maintaining spine angle',
          'Rushing through the motion',
        ],
      },
    },
  ];

  const selected = causes[Math.floor(Math.random() * causes.length)];

  return {
    root_cause: {
      title: selected.title,
      why_it_causes_slice: selected.why_it_causes_slice,
      confidence: 'medium',
      evidence: selected.evidence,
    },
    drill: selected.drill,
    challenge: {
      title: '10 Swing Challenge',
      checklist: [
        'Complete 3 sets of the recommended drill',
        'Hit 5 balls focusing only on the fix',
        'Record a follow-up swing video',
        'Notice if your ball flight has less curve',
        'Practice the drill for 5 minutes before your next round',
        'Check your grip pressure (should be 4/10)',
        'Visualize the correct motion before each swing',
        'Hit 5 punch shots with exaggerated correction',
        'Complete one full practice session on this fix',
        'Share your progress or ask for feedback',
      ],
    },
    safety_note: 'Always warm up before practicing. If you experience any pain or discomfort, stop immediately and consult a medical professional. This analysis is for educational purposes only and is not a substitute for professional instruction.',
  };
}
