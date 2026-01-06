import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { VIDEO_CONSTRAINTS } from '../constants';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type UploadScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Upload'>;
};

export const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to select a video.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: VIDEO_CONSTRAINTS.maxDuration,
    });

    if (!result.canceled && result.assets[0]) {
      const video = result.assets[0];

      // Check duration
      if (video.duration && video.duration / 1000 < VIDEO_CONSTRAINTS.minDuration) {
        Alert.alert(
          'Video Too Short',
          `Please select a video that is at least ${VIDEO_CONSTRAINTS.minDuration} seconds long.`
        );
        return;
      }

      setSelectedVideo(video.uri);
    }
  };

  const recordVideo = () => {
    // Navigate to enhanced camera with guides and countdown
    navigation.navigate('Camera');
  };

  const recordVideoQuick = async () => {
    // Quick record using system camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to record a video.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: VIDEO_CONSTRAINTS.maxDuration,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
    }
  };

  const handleAnalyze = () => {
    if (selectedVideo) {
      navigation.navigate('Processing', { videoUri: selectedVideo });
    }
  };

  const handleUseSample = () => {
    // Use a bundled sample video for demo purposes
    // In production, this would be a real video URI from assets
    navigation.navigate('Processing', { videoUri: 'sample' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Swing</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Tips Card */}
        <GlassCard style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          <View style={styles.tipRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary.light} />
            <Text style={styles.tipText}>
              {VIDEO_CONSTRAINTS.recommendedDuration.min}-{VIDEO_CONSTRAINTS.recommendedDuration.max} seconds
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="sunny-outline" size={20} color={colors.primary.light} />
            <Text style={styles.tipText}>Good lighting</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="body-outline" size={20} color={colors.primary.light} />
            <Text style={styles.tipText}>Full body visible</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="phone-landscape-outline" size={20} color={colors.primary.light} />
            <Text style={styles.tipText}>Face-on or down-the-line angle</Text>
          </View>
        </GlassCard>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          {selectedVideo ? (
            <GlassCard style={styles.selectedCard}>
              <Ionicons name="checkmark-circle" size={48} color={colors.status.success} />
              <Text style={styles.selectedText}>Video Selected</Text>
              <TouchableOpacity onPress={() => setSelectedVideo(null)}>
                <Text style={styles.changeText}>Change video</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <>
              <TouchableOpacity onPress={pickVideo} style={styles.uploadOption}>
                <GlassCard style={styles.optionCard}>
                  <Ionicons name="images-outline" size={48} color={colors.primary.light} />
                  <Text style={styles.optionTitle}>Choose from Library</Text>
                  <Text style={styles.optionDescription}>
                    Select an existing swing video
                  </Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity onPress={recordVideo} style={styles.uploadOption}>
                <GlassCard style={[styles.optionCard, styles.recommendedCard]}>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                  <Ionicons name="videocam" size={48} color={colors.primary.light} />
                  <Text style={styles.optionTitle}>Record with Guide</Text>
                  <Text style={styles.optionDescription}>
                    Countdown + position guide for best results
                  </Text>
                </GlassCard>
              </TouchableOpacity>

              <TouchableOpacity onPress={recordVideoQuick} style={styles.uploadOption}>
                <GlassCard style={styles.optionCard}>
                  <Ionicons name="flash-outline" size={48} color={colors.text.secondary} />
                  <Text style={styles.optionTitle}>Quick Record</Text>
                  <Text style={styles.optionDescription}>
                    Use system camera
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {selectedVideo && (
            <Button
              title="Analyze Swing"
              onPress={handleAnalyze}
              fullWidth
              size="lg"
            />
          )}

          <Button
            title="Use Sample Video"
            onPress={handleUseSample}
            variant="ghost"
            fullWidth
            style={styles.sampleButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  tipsCard: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  uploadOptions: {
    flex: 1,
  },
  uploadOption: {
    marginBottom: spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  selectedCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  selectedText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.light,
    marginTop: spacing.sm,
  },
  recommendedCard: {
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  recommendedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  actions: {
    paddingBottom: spacing.lg,
  },
  sampleButton: {
    marginTop: spacing.sm,
  },
});
