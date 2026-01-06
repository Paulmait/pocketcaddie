/**
 * Video Player Screen for SliceFix AI
 *
 * Slow-motion video playback with:
 * - Play/Pause controls
 * - Playback speed (0.25x, 0.5x, 1x)
 * - Timeline scrubbing
 * - Frame-by-frame stepping
 * - Auto annotation overlays
 *
 * No freehand drawing - auto overlays only
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { RootStackParamList } from '../../App';
import { GlassCard } from '../components/GlassCard';
import { useAppStore } from '../store/useAppStore';
import { useFeatureFlag } from '../hooks/useFeatureFlags';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type VideoPlayerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;
  route: RouteProp<RootStackParamList, 'VideoPlayer'>;
};

const PLAYBACK_SPEEDS = [0.25, 0.5, 1.0];
const FRAME_STEP_MS = 33; // ~30fps
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysisId, videoUri: paramVideoUri } = route.params;
  const analyses = useAppStore((s) => s.analyses);
  const enableSlowMo = useFeatureFlag('enableSlowMoV1');

  const analysis = analyses.find((a) => a.id === analysisId);
  const videoUri = paramVideoUri || analysis?.videoUri;

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(2); // Default 1x
  const [showControls, setShowControls] = useState(true);

  const currentSpeed = PLAYBACK_SPEEDS[speedIndex];

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls && isPlaying) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const handleSeek = useCallback(async (value: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value);
  }, []);

  const cycleSpeed = useCallback(async () => {
    const nextIndex = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeedIndex(nextIndex);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(PLAYBACK_SPEEDS[nextIndex], true);
    }
  }, [speedIndex]);

  const stepFrame = useCallback(
    async (direction: 'forward' | 'backward') => {
      if (!videoRef.current) return;

      // Pause if playing
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      }

      const newPosition =
        direction === 'forward'
          ? Math.min(position + FRAME_STEP_MS, duration)
          : Math.max(position - FRAME_STEP_MS, 0);

      await videoRef.current.setPositionAsync(newPosition);
    },
    [isPlaying, position, duration]
  );

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  if (!enableSlowMo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.text.tertiary} />
          <Text style={styles.disabledText}>Slow-mo playback coming soon</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!videoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Ionicons name="videocam-off" size={48} color={colors.text.tertiary} />
          <Text style={styles.disabledText}>Video not available</Text>
          <Text style={styles.disabledSubtext}>
            Videos are automatically deleted after 24 hours for your privacy
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Swing Playback</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Video Container */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          shouldPlay={false}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.light} />
          </View>
        )}

        {/* Play/Pause Overlay */}
        {showControls && !isLoading && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color={colors.text.primary}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Root Cause Badge */}
        {analysis && showControls && (
          <View style={styles.rootCauseBadge}>
            <Text style={styles.rootCauseText}>{analysis.rootCause.title}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Controls */}
      <GlassCard style={styles.controlsCard}>
        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary.light}
            maximumTrackTintColor={colors.surface.glassBorder}
            thumbTintColor={colors.primary.light}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          {/* Frame Step Back */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => stepFrame('backward')}
            accessibilityLabel="Step back one frame"
          >
            <Ionicons name="play-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={togglePlayPause}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color={colors.text.inverse}
            />
          </TouchableOpacity>

          {/* Frame Step Forward */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => stepFrame('forward')}
            accessibilityLabel="Step forward one frame"
          >
            <Ionicons name="play-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Speed Control */}
        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>Playback Speed</Text>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={cycleSpeed}
            accessibilityLabel={`Current speed ${currentSpeed}x, tap to change`}
          >
            <Text style={styles.speedText}>{currentSpeed}x</Text>
          </TouchableOpacity>
        </View>

        {/* Speed Presets */}
        <View style={styles.speedPresets}>
          {PLAYBACK_SPEEDS.map((speed, index) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedPreset,
                speedIndex === index && styles.speedPresetActive,
              ]}
              onPress={async () => {
                setSpeedIndex(index);
                if (videoRef.current) {
                  await videoRef.current.setRateAsync(speed, true);
                }
              }}
            >
              <Text
                style={[
                  styles.speedPresetText,
                  speedIndex === index && styles.speedPresetTextActive,
                ]}
              >
                {speed === 0.25 ? '¼x' : speed === 0.5 ? '½x' : '1x'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Tip */}
      <Text style={styles.tip}>
        Use slow-motion to identify swing issues
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  disabledText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  disabledSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
  },
  closeButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootCauseBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rootCauseText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  controlsCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    width: 50,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  speedLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  speedButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.glassLight,
    borderRadius: borderRadius.md,
  },
  speedText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  speedPresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  speedPreset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  speedPresetActive: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  speedPresetText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  speedPresetTextActive: {
    color: colors.primary.light,
  },
  tip: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
