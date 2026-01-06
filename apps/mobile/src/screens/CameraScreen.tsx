/**
 * Enhanced Camera Screen
 * Features:
 * - Audio countdown before recording
 * - Tripod angle guide overlay
 * - Shake to re-record gesture
 * - Auto-trim to swing moment
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { AngleGuide, CameraAngle } from '../components/AngleGuide';
import { useCountdown } from '../hooks/useCountdown';
import { useShakeDetector } from '../hooks/useShakeDetector';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { VIDEO_CONSTRAINTS } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
};

type RecordingState = 'idle' | 'countdown' | 'recording' | 'preview';

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>('face-on');
  const [showGuide, setShowGuide] = useState(true);

  const cameraRef = useRef<CameraView>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown hook
  const { count, isCountingDown, startCountdown, cancelCountdown } = useCountdown({
    duration: 3,
    onComplete: () => {
      startRecording();
    },
  });

  // Shake detector for re-recording
  const { isShaking } = useShakeDetector({
    enabled: recordingState === 'preview',
    onShake: () => {
      handleReRecord();
    },
  });

  // Pulse animation for recording
  useEffect(() => {
    if (recordingState === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [recordingState, pulseAnim]);

  // Recording duration timer
  useEffect(() => {
    if (recordingState === 'recording') {
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 0.1;
          // Auto-stop at max duration
          if (newDuration >= VIDEO_CONSTRAINTS.maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 100);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [recordingState]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      setRecordingState('recording');
      setShowGuide(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const video = await cameraRef.current.recordAsync({
        maxDuration: VIDEO_CONSTRAINTS.maxDuration,
      });

      if (video?.uri) {
        setRecordedVideo(video.uri);
        setRecordingState('preview');
      } else {
        setRecordingState('idle');
      }
    } catch (error: any) {
      console.error('Recording failed:', error);
      Alert.alert('Recording Failed', error.message || 'Please try again');
      setRecordingState('idle');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || recordingState !== 'recording') return;

    try {
      await cameraRef.current.stopRecording();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Stop recording failed:', error);
    }
  }, [recordingState]);

  const handleRecordPress = useCallback(() => {
    if (recordingState === 'idle') {
      setRecordingState('countdown');
      startCountdown();
    } else if (recordingState === 'countdown') {
      cancelCountdown();
      setRecordingState('idle');
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  }, [recordingState, startCountdown, cancelCountdown, stopRecording]);

  const handleReRecord = useCallback(() => {
    setRecordedVideo(null);
    setRecordingState('idle');
    setShowGuide(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const handleUseVideo = useCallback(() => {
    if (recordedVideo) {
      navigation.navigate('Processing', { videoUri: recordedVideo });
    }
  }, [recordedVideo, navigation]);

  const toggleCameraType = useCallback(() => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const toggleAngle = useCallback(() => {
    setSelectedAngle((prev) => (prev === 'face-on' ? 'down-the-line' : 'face-on'));
  }, []);

  // Permission handling
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to record your golf swing for analysis.
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} />
          <Button
            title="Go Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.backButtonPermission}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        mode="video"
      >
        {/* Angle Guide Overlay */}
        {showGuide && recordingState === 'idle' && (
          <AngleGuide angle={selectedAngle} isRecording={false} />
        )}

        {/* Recording indicator */}
        {recordingState === 'recording' && (
          <AngleGuide angle={selectedAngle} isRecording={true} />
        )}

        {/* Countdown Overlay */}
        {isCountingDown && count !== null && (
          <View style={styles.countdownOverlay}>
            <Animated.Text
              style={[
                styles.countdownText,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {count === 0 ? 'GO!' : count}
            </Animated.Text>
            <Text style={styles.countdownSubtext}>Get ready...</Text>
          </View>
        )}

        {/* Top Controls */}
        <SafeAreaView style={styles.topControls}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.topRight}>
            {recordingState === 'idle' && (
              <>
                <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                  <Ionicons name="camera-reverse" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleAngle}
                  style={[styles.iconButton, styles.angleButton]}
                >
                  <Ionicons
                    name={selectedAngle === 'face-on' ? 'person' : 'person-outline'}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.angleButtonText}>
                    {selectedAngle === 'face-on' ? 'Face-on' : 'DTL'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>

        {/* Recording Duration */}
        {recordingState === 'recording' && (
          <View style={styles.durationContainer}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.durationText}>
              {recordingDuration.toFixed(1)}s / {VIDEO_CONSTRAINTS.maxDuration}s
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {recordingState !== 'preview' ? (
            <>
              {/* Recording instructions */}
              {recordingState === 'idle' && (
                <Text style={styles.instructionText}>
                  Tap to start {'\n'}3-second countdown
                </Text>
              )}

              {/* Record button */}
              <TouchableOpacity
                onPress={handleRecordPress}
                style={styles.recordButtonContainer}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.recordButton,
                    recordingState === 'recording' && styles.recordButtonRecording,
                  ]}
                >
                  {recordingState === 'recording' ? (
                    <View style={styles.stopIcon} />
                  ) : recordingState === 'countdown' ? (
                    <Ionicons name="close" size={32} color="white" />
                  ) : (
                    <View style={styles.innerCircle} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Guide toggle */}
              {recordingState === 'idle' && (
                <TouchableOpacity
                  onPress={() => setShowGuide(!showGuide)}
                  style={styles.guideToggle}
                >
                  <Ionicons
                    name={showGuide ? 'grid' : 'grid-outline'}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.guideToggleText}>Guide</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* Preview controls */
            <View style={styles.previewControls}>
              <View style={styles.shakeHint}>
                <Ionicons name="phone-portrait-outline" size={20} color="white" />
                <Text style={styles.shakeHintText}>Shake to re-record</Text>
              </View>

              <View style={styles.previewButtons}>
                <TouchableOpacity
                  onPress={handleReRecord}
                  style={styles.previewButton}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                  <Text style={styles.previewButtonText}>Re-record</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUseVideo}
                  style={[styles.previewButton, styles.useButton]}
                >
                  <Ionicons name="checkmark" size={24} color="white" />
                  <Text style={styles.previewButtonText}>Use Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  permissionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButtonPermission: {
    marginTop: spacing.md,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  angleButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: spacing.md,
  },
  angleButtonText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '700',
    color: colors.primary.light,
  },
  countdownSubtext: {
    fontSize: typography.fontSize.lg,
    color: 'white',
    marginTop: spacing.md,
  },
  durationContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.error,
    marginRight: spacing.sm,
  },
  durationText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonRecording: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.status.error,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.status.error,
  },
  guideToggle: {
    position: 'absolute',
    right: 30,
    bottom: 28,
    alignItems: 'center',
  },
  guideToggleText: {
    color: 'white',
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  previewControls: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  shakeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  shakeHintText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  previewButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  useButton: {
    backgroundColor: colors.primary.main,
  },
  previewButtonText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});
