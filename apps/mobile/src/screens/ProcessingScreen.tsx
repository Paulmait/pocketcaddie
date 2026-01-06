import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { useAppStore } from '../store/useAppStore';
import { analyzeSwing, getMockAnalysis } from '../services/analysis';
import { colors, spacing, typography } from '../constants/theme';

type ProcessingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Processing'>;
  route: RouteProp<RootStackParamList, 'Processing'>;
};

const processingSteps = [
  'Uploading video...',
  'Analyzing swing positions...',
  'Identifying slice causes...',
  'Generating drill recommendation...',
  'Creating your report...',
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  navigation,
  route,
}) => {
  const { videoUri } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const { user, addAnalysis, setIsAnalyzing } = useAppStore();

  useEffect(() => {
    let mounted = true;
    setIsAnalyzing(true);

    const processVideo = async () => {
      try {
        // Simulate step progress
        const stepInterval = setInterval(() => {
          if (mounted) {
            setCurrentStep((prev) =>
              prev < processingSteps.length - 1 ? prev + 1 : prev
            );
          }
        }, 1500);

        let analysis;

        if (videoUri === 'sample') {
          // Use mock analysis for demo
          await new Promise((resolve) => setTimeout(resolve, 5000));
          analysis = getMockAnalysis();
        } else {
          // Real analysis
          analysis = await analyzeSwing({
            videoUri,
            userId: user?.id || 'anonymous',
          });
        }

        clearInterval(stepInterval);

        if (mounted) {
          addAnalysis(analysis);
          setIsAnalyzing(false);
          navigation.replace('Results', { analysisId: analysis.id });
        }
      } catch (error: any) {
        if (mounted) {
          setIsAnalyzing(false);
          Alert.alert(
            'Analysis Failed',
            error.message || 'Something went wrong. Please try again.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setCurrentStep(0);
                  processVideo();
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }
    };

    processVideo();

    return () => {
      mounted = false;
      setIsAnalyzing(false);
    };
  }, [videoUri]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={64} color={colors.primary.light} />
        </View>

        <Text style={styles.title}>Analyzing Your Swing</Text>
        <Text style={styles.subtitle}>
          This usually takes about 10-15 seconds
        </Text>

        <View style={styles.stepsContainer}>
          {processingSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              {index < currentStep ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.status.success}
                />
              ) : index === currentStep ? (
                <ActivityIndicator size="small" color={colors.primary.light} />
              ) : (
                <View style={styles.pendingDot} />
              )}
              <Text
                style={[
                  styles.stepText,
                  index <= currentStep && styles.stepTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Your video will be automatically deleted after analysis
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.glass,
  },
  stepText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    marginLeft: spacing.md,
  },
  stepTextActive: {
    color: colors.text.primary,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
});
