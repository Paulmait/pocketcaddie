# SliceFix AI - Retention Features QA Guide

## Overview

This document covers QA testing for the core retention features implemented in SliceFix AI:
- Analysis History
- Progress Tracking with Charts
- Drill Library v1
- Before/After Comparison
- Slow-Mo Video Playback

All features are controlled by feature flags for safe rollout.

---

## Feature Flags

Feature flags are managed in `packages/shared/featureFlags.ts` and can be toggled in Settings (dev mode only).

| Flag | Description | Default |
|------|-------------|---------|
| `enableHistoryV1` | Analysis History screen | ON |
| `enableProgressTrackingV1` | Progress tracking & charts | ON |
| `enableDrillLibraryV1` | Drill Library access | ON |
| `enableBeforeAfterV1` | Before/After comparison | ON |
| `enableSlowMoV1` | Slow-motion playback | ON |
| `enableAnnotationsV1` | Auto annotations (future) | OFF |
| `enableCoachFeedbackV1` | Coach feedback (future) | OFF |

---

## 1. Analysis History Screen

**Location**: Home → History (via quick action or "View All" link)

### Test Cases

#### 1.1 Empty State
- [ ] Shows appropriate empty message when no analyses exist
- [ ] Displays ProgressSummary component

#### 1.2 List Display
- [ ] All past analyses appear in chronological order (newest first)
- [ ] Each card shows:
  - Root cause title
  - Date (formatted as "Jan 15, 2026")
  - Drill name
  - Challenge progress ring
  - Confidence badge (color-coded)

#### 1.3 Navigation
- [ ] Tapping an analysis navigates to Results screen with correct analysisId
- [ ] Back button returns to previous screen
- [ ] "View All" from Home navigates to History

#### 1.4 Delete Analysis
- [ ] Long-press shows delete confirmation alert
- [ ] Cancel dismisses alert without deleting
- [ ] Delete removes analysis from store and list
- [ ] Analytics event `analysis_deleted` is tracked

#### 1.5 Progress Summary
- [ ] Shows total analysis count
- [ ] Shows average confidence (low/medium/high)
- [ ] Shows trend indicator (improving/stable/needs attention)

---

## 2. Progress Tracking

**Location**: Home → Progress link (bottom of screen)

### Test Cases

#### 2.1 Progress Screen Display
- [ ] Shows ConfidenceTrendChart with bar visualization
- [ ] Displays progress statistics:
  - Total analyses count
  - Sessions this week
  - Current streak
  - Improvement percentage

#### 2.2 Confidence Trend Chart
- [ ] Shows minimum 2 analyses required message if < 2 analyses
- [ ] Bars are color-coded by confidence level:
  - Low = Warning (orange)
  - Medium = Secondary (amber)
  - High = Primary (green/blue)
- [ ] X-axis shows "Older" to "Recent" flow
- [ ] Y-axis shows "Low", "Med", "High" labels

#### 2.3 Streak Tracking
- [ ] Streak badge shows on Home if streak > 0
- [ ] Streak increments when practicing on consecutive days
- [ ] Streak resets after missing a day

---

## 3. Drill Library v1

**Location**: Home → Drills (quick action) OR Results → View Drill

### Test Cases

#### 3.1 Drill List
- [ ] Shows categorized list of drills
- [ ] Each drill card displays:
  - Drill name
  - Target root cause
  - Difficulty badge
  - Duration estimate

#### 3.2 Drill Detail
- [ ] Shows full drill description
- [ ] Displays step-by-step instructions
- [ ] Shows equipment needed (if any)
- [ ] Video placeholder or instructions

#### 3.3 Filtering
- [ ] Can filter by root cause category
- [ ] Filter from Results screen pre-selects cause

#### 3.4 Feature Flag
- [ ] When `enableDrillLibraryV1` is OFF, shows "Coming Soon" lock screen

---

## 4. Before/After Comparison

**Location**: Home → Compare (quick action)

### Test Cases

#### 4.1 Swing Selection
- [ ] Can select baseline swing from list
- [ ] Can select recent swing from list
- [ ] Cannot select same swing for both
- [ ] Selected swings show border highlight

#### 4.2 Comparison Display
- [ ] Shows both swings with date and root cause
- [ ] Confidence badges are color-coded
- [ ] Summary shows:
  - Root cause change status
  - Time between swings (days)
- [ ] Disclaimer text is visible

#### 4.3 Share Functionality
- [ ] Share button appears when both swings selected
- [ ] Non-subscribers see "Unlock to Share" with lock icon
- [ ] Subscribers see "Share Comparison" with share icon
- [ ] Tapping share (non-subscriber) navigates to Paywall
- [ ] Tapping share (subscriber) opens native share sheet
- [ ] Share message includes:
  - Before/After dates
  - Root causes
  - Confidence levels
  - Disclaimer about individual results

#### 4.4 Feature Flag
- [ ] When `enableBeforeAfterV1` is OFF, shows "Feature coming soon"

---

## 5. Slow-Mo Video Playback

**Location**: Results → Watch Video (if video available)

### Test Cases

#### 5.1 Video Loading
- [ ] Shows loading indicator while video loads
- [ ] Handles missing video gracefully with explanation
- [ ] Shows 24-hour privacy deletion notice

#### 5.2 Playback Controls
- [ ] Play/Pause toggle works
- [ ] Tapping video area shows/hides controls
- [ ] Controls auto-hide after 3 seconds during playback

#### 5.3 Speed Control
- [ ] Default speed is 1x
- [ ] Can cycle through 0.25x, 0.5x, 1x
- [ ] Speed presets at bottom allow direct selection
- [ ] Active speed is highlighted

#### 5.4 Frame Stepping
- [ ] Step back button moves ~33ms backward
- [ ] Step forward button moves ~33ms forward
- [ ] Frame stepping auto-pauses video

#### 5.5 Timeline Scrubbing
- [ ] Slider shows current position
- [ ] Dragging slider seeks to new position
- [ ] Time display shows mm:ss.cc format

#### 5.6 Root Cause Badge
- [ ] Shows root cause title overlay when controls visible

#### 5.7 Feature Flag
- [ ] When `enableSlowMoV1` is OFF, shows "Slow-mo playback coming soon" with lock icon

---

## Integration Testing

### Navigation Flow
- [ ] Home → History → Analysis Detail → Back → Home
- [ ] Home → Compare → Select Swings → Share → Back → Home
- [ ] Results → Watch Video → Adjust Speed → Back → Results
- [ ] Home → Drills → Drill Detail → Back → Home

### State Persistence
- [ ] Analyses persist across app restart
- [ ] Feature flag toggles persist
- [ ] Streak data persists
- [ ] Progress stats recalculate correctly

### Analytics Events
Verify these events fire correctly:
- [ ] `screen_viewed` with screen name for each new screen
- [ ] `analysis_deleted` when deleting from history
- [ ] `comparison_shared` when sharing comparison
- [ ] `video_playback_started` when playing video
- [ ] `drill_viewed` when viewing drill detail

---

## Edge Cases

### History
- [ ] Handles 100+ analyses without performance issues
- [ ] Correctly handles analyses with missing data fields

### Comparison
- [ ] Works with only 2 analyses in system
- [ ] Handles analyses from same day

### Video Player
- [ ] Handles network interruption during playback
- [ ] Handles corrupted or inaccessible video file
- [ ] Works in both portrait and landscape

### Progress
- [ ] Handles single analysis (no trend possible)
- [ ] Handles all same confidence level

---

## Accessibility

- [ ] All interactive elements have accessibility labels
- [ ] Screen reader announces:
  - Analysis details in History
  - Chart data points
  - Video player state (playing/paused)
- [ ] Touch targets are minimum 44x44 points
- [ ] Color is not sole indicator (badges have text too)

---

## Performance

- [ ] History screen loads < 500ms with 50 analyses
- [ ] Chart renders < 200ms
- [ ] Video player initializes < 1s
- [ ] No frame drops during video playback

---

## Sign-off

| Tester | Date | Build | Status |
|--------|------|-------|--------|
| | | | |

**Notes:**
- All features are gated behind feature flags for controlled rollout
- Video playback requires expo-av and @react-native-community/slider
- Comparison sharing requires active subscription
