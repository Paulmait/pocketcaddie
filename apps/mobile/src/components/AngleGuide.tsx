/**
 * Angle Guide Overlay Component
 * Provides visual guidance for optimal camera positioning during recording
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export type CameraAngle = 'face-on' | 'down-the-line';

interface AngleGuideProps {
  angle: CameraAngle;
  isRecording?: boolean;
}

export const AngleGuide: React.FC<AngleGuideProps> = ({ angle, isRecording = false }) => {
  const isFaceOn = angle === 'face-on';

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Golfer position indicator */}
      <View style={[styles.golferZone, isFaceOn ? styles.golferZoneFaceOn : styles.golferZoneDownLine]}>
        <View style={styles.golferOutline}>
          <Ionicons
            name="person"
            size={80}
            color={isRecording ? colors.status.success : 'rgba(255,255,255,0.5)'}
          />
        </View>
        <Text style={styles.positionText}>
          {isFaceOn ? 'Face camera' : 'Side view'}
        </Text>
      </View>

      {/* Tripod height indicator */}
      <View style={styles.heightIndicator}>
        <View style={styles.heightLine} />
        <Text style={styles.heightText}>Waist height</Text>
        <View style={styles.heightLine} />
      </View>

      {/* Distance indicator */}
      <View style={styles.distanceGuide}>
        <Ionicons name="resize-outline" size={20} color="rgba(255,255,255,0.7)" />
        <Text style={styles.distanceText}>
          6-10 feet away
        </Text>
      </View>

      {/* Angle-specific tips */}
      <View style={styles.tipContainer}>
        <View style={styles.tipBadge}>
          <Text style={styles.tipText}>
            {isFaceOn
              ? 'Full body visible, centered'
              : 'Target line visible, ball in frame'}
          </Text>
        </View>
      </View>

      {/* Corner markers */}
      <View style={[styles.cornerMarker, styles.topLeft]} />
      <View style={[styles.cornerMarker, styles.topRight]} />
      <View style={[styles.cornerMarker, styles.bottomLeft]} />
      <View style={[styles.cornerMarker, styles.bottomRight]} />

      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  golferZone: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  golferZoneFaceOn: {
    // Center position for face-on
  },
  golferZoneDownLine: {
    // Slightly left for down-the-line
    marginRight: width * 0.2,
  },
  golferOutline: {
    width: 120,
    height: 160,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  heightIndicator: {
    position: 'absolute',
    left: 20,
    top: height * 0.4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heightText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.xs,
    marginHorizontal: spacing.xs,
  },
  distanceGuide: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  distanceText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  tipContainer: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
  },
  tipBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  tipText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
  },
  cornerMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary.light,
    borderWidth: 2,
  },
  topLeft: {
    top: 80,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 80,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 160,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 160,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
    marginRight: spacing.xs,
  },
  recordingText: {
    color: colors.status.error,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
});
