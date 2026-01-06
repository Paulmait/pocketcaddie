/**
 * Login Callback Screen
 *
 * Handles deep link callbacks from email magic links.
 * Route: slicefix://login
 *
 * Flow:
 * 1. User clicks magic link in email
 * 2. App opens to this screen
 * 3. Session is verified
 * 4. User is redirected to Home
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { getSession } from '../services/auth';
import { useAppStore } from '../store/useAppStore';
import { setAnalyticsUserId } from '../services/analytics';
import { colors, spacing, typography } from '../constants/theme';

type LoginCallbackScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LoginCallback'>;
};

export const LoginCallbackScreen: React.FC<LoginCallbackScreenProps> = ({
  navigation,
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Small delay to ensure deep link params are processed
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check for session
        const session = await getSession();

        if (session?.user) {
          // Success! Update app state
          setUser({
            id: session.user.id,
            email: session.user.email,
            createdAt: session.user.created_at,
          });

          await setAnalyticsUserId(session.user.id);

          setStatus('success');

          // Navigate to Home after brief success state
          setTimeout(() => {
            navigation.replace('Home');
          }, 1000);
        } else {
          // No session found
          setStatus('error');
          setErrorMessage('Sign in link has expired or is invalid.');
        }
      } catch (error) {
        console.error('[LoginCallback] Error:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.'
        );
      }
    }

    handleCallback();
  }, [navigation, setUser]);

  const handleRetry = () => {
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator
              size="large"
              color={colors.primary.light}
              style={styles.spinner}
            />
            <Text style={styles.title}>Signing you in...</Text>
            <Text style={styles.subtitle}>
              Please wait while we verify your account
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={colors.status.success}
              />
            </View>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              You&apos;re signed in successfully
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="alert-circle"
                size={64}
                color={colors.status.error}
              />
            </View>
            <Text style={styles.title}>Sign In Failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
            <Button
              title="Try Again"
              onPress={handleRetry}
              style={styles.button}
            />
          </>
        )}
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
    paddingHorizontal: spacing.xl,
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 150,
  },
});
