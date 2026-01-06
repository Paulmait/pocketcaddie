# SliceFix AI - Retention Features Handoff

**Date:** 2026-01-05
**Status:** Implementation Ready
**Context:** Continue from admin portal completion

---

## Background

SliceFix AI is a golf swing analysis app. Competitive analysis revealed three critical gaps vs. competitors (NiceSwing, SwingWise):

1. **No progress tracking** - Users can't see improvement over time
2. **No drill library** - AI detects issues but doesn't teach fixes
3. **No video playback controls** - Users expect slow-mo and annotations

These features are the difference between "try once and churn" and a sticky $8.99/month subscription.

---

## What to Build

### Feature 1: Drill Library (Build First)

**Goal:** "Your over-the-top move → Try these 3 drills"

Create browsable drill library with 12-15 drills mapped to root causes:
- Open Clubface (3 drills)
- Out-to-In Path (3 drills)
- Early Extension (3 drills)
- Poor Alignment (3 drills)

**Files to create:**
```
apps/mobile/src/data/drillLibrary.ts          # Drill content
apps/mobile/src/screens/DrillLibraryScreen.tsx # Browse/filter
apps/mobile/src/screens/DrillDetailScreen.tsx  # Video + steps
apps/mobile/src/components/DrillCard.tsx       # List item
apps/mobile/src/components/DifficultyBadge.tsx # Level indicator
```

**Files to modify:**
- `App.tsx` - Add DrillLibrary, DrillDetail routes
- `src/store/useAppStore.ts` - Add `drillPracticeLog[]`, `logDrillPractice()`
- `src/screens/ResultsScreen.tsx` - Add "Explore More Drills" button

---

### Feature 2: Enhanced Progress Dashboard (Build Second)

**Goal:** "Your slice has improved 30% over 4 weeks"

Enhance existing ProgressScreen with:
- Weekly improvement chart (SVG with react-native-svg)
- Per-root-cause trend indicators (improving/stable/worsening)
- Motivational messages based on progress

**Files to create:**
```
apps/mobile/src/components/ProgressChart.tsx      # Line/bar chart
apps/mobile/src/components/RootCauseTrend.tsx     # Trend indicator
apps/mobile/src/components/MotivationalCard.tsx   # Dynamic messages
```

**Files to modify:**
- `src/hooks/useProgressTracking.ts` - Add `weeklySnapshots`, `rootCauseProgress`
- `src/screens/ProgressScreen.tsx` - Replace basic stats with chart/trends

---

### Feature 3: Video Playback with Annotations (Build Last)

**Goal:** Frame-by-frame scrubbing with drawing tools

Using expo-av (already installed):
- Playback speeds: 0.25x, 0.5x, 1x
- Frame stepping (~33ms increments)
- SVG annotation overlay for lines/circles

**Files to create:**
```
apps/mobile/src/screens/VideoPlayerScreen.tsx    # Full-screen player
apps/mobile/src/components/VideoControls.tsx     # Custom controls
apps/mobile/src/components/AnnotationCanvas.tsx  # SVG drawing layer
apps/mobile/src/components/AnnotationToolbar.tsx # Tool selection
apps/mobile/src/hooks/useVideoPlayer.ts          # Playback logic
```

**Files to modify:**
- `App.tsx` - Add VideoPlayer route
- `src/store/useAppStore.ts` - Add `videoAnnotations`
- `src/screens/ResultsScreen.tsx` - Add "Review Video" button

---

## Key Architecture Details

### Current Analysis Data Model

```typescript
// apps/mobile/src/store/useAppStore.ts
interface SwingAnalysis {
  id: string;
  createdAt: string;
  videoUri?: string;
  rootCause: {
    title: string; // "Open Clubface at Impact", "Out-to-In Swing Path", etc.
    whyItCausesSlice: string;
    confidence: 'low' | 'medium' | 'high';
    evidence: string[];
  };
  drill: { name, steps, reps, commonMistakes };
  challenge: { title, checklist, completedItems: boolean[] };
  safetyNote: string;
}
```

### Root Cause Types (for drill mapping)

The AI returns one of these as `rootCause.title`:
- "Open Clubface at Impact"
- "Out-to-In Swing Path"
- "Early Extension"
- "Poor Alignment/Setup"

Map drills to these exact strings.

### Existing Hooks/Components to Reuse

- `useProgressTracking` - Already calculates `streakData`, `improvementPercentage`
- `GlassCard` - Dark glassmorphic container
- `ProgressRing` - Circular progress indicator
- `ConfidenceBadge` - Shows low/medium/high
- `Button` - Primary/secondary/outline variants

### Design System

```typescript
// apps/mobile/src/constants/theme.ts
colors: {
  background: { primary: '#0B0F14', secondary: '#12171E' },
  accent: { green: '#2E7D32', amber: '#F59E0B' },
  text: { primary: '#FFFFFF', secondary: '#9CA3AF' }
}
```

---

## Dependencies (No New Installs Needed)

- `expo-av` (v14.0.0) - Video playback
- `react-native-svg` - Charts and annotations
- `zustand` + `@react-native-async-storage/async-storage` - State

---

## File Locations Reference

| Component | Path |
|-----------|------|
| App Entry | `apps/mobile/App.tsx` |
| Store | `apps/mobile/src/store/useAppStore.ts` |
| Progress Hook | `apps/mobile/src/hooks/useProgressTracking.ts` |
| Results Screen | `apps/mobile/src/screens/ResultsScreen.tsx` |
| Progress Screen | `apps/mobile/src/screens/ProgressScreen.tsx` |
| Theme | `apps/mobile/src/constants/theme.ts` |
| Components | `apps/mobile/src/components/` |

---

## Suggested Drill Content (Example)

```typescript
// For apps/mobile/src/data/drillLibrary.ts
{
  id: 'otp-headcover',
  name: 'Headcover Path Drill',
  description: 'Forces an inside-out swing path by creating a physical barrier.',
  targetCause: 'Out-to-In Swing Path',
  difficulty: 'beginner',
  durationMinutes: 15,
  videoUrl: 'https://youtube.com/embed/...', // Or Supabase storage
  steps: [
    'Place a headcover 6 inches behind and 3 inches outside the ball',
    'Your goal is to swing without hitting the headcover',
    'Start with half swings and progress to full swings',
    'The obstacle trains your body to swing from inside'
  ],
  reps: '20 swings (start slow, build up)',
  commonMistakes: ['Placing the headcover too close', 'Trying to hit hard too soon'],
  tips: ['If you keep hitting the headcover, move it further away initially']
}
```

---

## Implementation Checklist

### Phase 1: Drill Library - COMPLETED
- [x] Create `src/data/drillLibrary.ts` with 12+ drills
- [x] Create `DrillCard` and `DifficultyBadge` components
- [x] Create `DrillLibraryScreen` with filtering
- [x] Create `DrillDetailScreen` with video player
- [x] Add drill practice tracking to store
- [x] Add routes to App.tsx
- [x] Add "Explore Drills" button to ResultsScreen

### Phase 2: Progress Dashboard - IN PROGRESS
- [x] Create `ProgressChart` component (SVG)
- [x] Create `RootCauseTrend` component
- [x] Create `MotivationalCard` component
- [ ] Enhance `useProgressTracking` hook
- [ ] Redesign `ProgressScreen` with new components

### Phase 3: Video Playback
- [ ] Create `useVideoPlayer` hook
- [ ] Create `VideoControls` component
- [ ] Create `AnnotationCanvas` component (SVG)
- [ ] Create `AnnotationToolbar` component
- [ ] Create `VideoPlayerScreen`
- [ ] Add annotation storage to store
- [ ] Add "Review Video" button to ResultsScreen

---

## Immediate Next Steps

### 1. Enhance useProgressTracking Hook
File: `apps/mobile/src/hooks/useProgressTracking.ts`

Add these computed values:
```typescript
// Weekly snapshots - aggregate analyses by week
weeklySnapshots: WeeklyProgressSnapshot[];

// Per-cause tracking
rootCauseProgress: RootCauseProgress[];

// Motivational message generator
getMotivationalMessage(): string;

// Calculate improvement over N days
calculateTimeframeImprovement(days: number): number;
```

### 2. Redesign ProgressScreen
File: `apps/mobile/src/screens/ProgressScreen.tsx`

Replace basic stats with:
- `MotivationalCard` at the top
- `ProgressChart` showing weekly challenge completion
- List of `RootCauseTrend` components for each detected issue
- "View Drill Library" button

### 3. Video Playback (expo-av approach)
```typescript
// Key expo-av configuration for slow-mo:
<Video
  ref={videoRef}
  source={{ uri: analysis.videoUri }}
  rate={playbackRate} // 0.25, 0.5, 1.0
  shouldPlay={isPlaying}
  useNativeControls={false}
/>

// Frame stepping (~33ms per frame at 30fps):
const stepFrame = async (direction: 'prev' | 'next') => {
  const status = await videoRef.current.getStatusAsync();
  const newPosition = direction === 'next'
    ? status.positionMillis + 33
    : status.positionMillis - 33;
  await videoRef.current.setPositionAsync(newPosition);
};
```

---

## Files Created This Session

```
apps/mobile/src/
├── data/
│   └── drillLibrary.ts          ✅ 12 drills with full content
├── screens/
│   ├── DrillLibraryScreen.tsx   ✅ Browse/filter by cause
│   └── DrillDetailScreen.tsx    ✅ Drill details + "Mark Practiced"
├── components/
│   ├── DifficultyBadge.tsx      ✅ beginner/intermediate/advanced
│   ├── DrillCard.tsx            ✅ List item with practice badge
│   ├── ProgressChart.tsx        ✅ SVG line chart with trend
│   ├── RootCauseTrend.tsx       ✅ Per-cause improvement indicator
│   └── MotivationalCard.tsx     ✅ Dynamic encouragement
```

## Files Modified This Session

```
apps/mobile/
├── App.tsx                      ✅ Added DrillLibrary, DrillDetail routes
├── src/
│   ├── store/useAppStore.ts     ✅ Added drillPracticeLog state
│   ├── components/index.ts      ✅ Exported new components
│   └── screens/ResultsScreen.tsx ✅ Added "Explore More Drills" button
```

---

## Previous Work Completed

1. **TestFlight preparation** - Build configs, App Store compliance
2. **Supabase Authentication** - Magic Link + Apple Sign In
3. **Admin Portal** (`apps/admin/`) - Next.js dashboard for user management
4. **Security migrations** - Audit logs, rate limiting, RLS

---

## Contact

**Repository:** `C:\Users\maito\pocketcaddie`
**Mobile App:** `apps/mobile/`
**Admin Portal:** `apps/admin/`
**Backend:** `apps/api/supabase/`

*Cien Rios LLC - SliceFix AI*
