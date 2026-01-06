import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { useAppStore } from './src/store/useAppStore';
import { initializePurchases, checkSubscriptionStatus } from './src/services/subscriptions';
import { supabase } from './src/services/supabase';
import {
  initializeAnalytics,
  setAnalyticsUserId,
  trackEvent,
  AnalyticsEvents,
} from './src/services/analytics';
import { colors } from './src/constants/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RatingProvider } from './src/hooks/useRatingPrompt';
import { initNetworkMonitoring } from './src/services/network';
import { loadQueueFromStorage } from './src/services/uploadQueue';

// Screens
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { UploadScreen } from './src/screens/UploadScreen';
import { ProcessingScreen } from './src/screens/ProcessingScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  Upload: undefined;
  Camera: undefined;
  Processing: { videoUri: string };
  Results: { analysisId: string };
  Progress: undefined;
  Paywall: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const {
    hasCompletedOnboarding,
    isAuthenticated,
    setUser,
    setSubscription,
  } = useAppStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize network monitoring
        initNetworkMonitoring();

        // Load upload queue from storage
        await loadQueueFromStorage();

        // Initialize analytics first
        await initializeAnalytics();

        // Track app open
        trackEvent(AnalyticsEvents.APP_OPENED);

        // Initialize RevenueCat
        await initializePurchases();

        // Check auth state
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            createdAt: session.user.created_at,
          });

          // Set user ID for analytics
          setAnalyticsUserId(session.user.id);

          // Check subscription status
          const subStatus = await checkSubscriptionStatus();
          setSubscription(
            subStatus.subscriptionType,
            subStatus.trialActive,
            subStatus.expirationDate || undefined
          );
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              createdAt: session.user.created_at,
            });
            setAnalyticsUserId(session.user.id);
          } else {
            setUser(null);
            setAnalyticsUserId(null);
          }
        });
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Track initialization error
        trackEvent('app_init_error' as any, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
        initialRouteName={
          !hasCompletedOnboarding
            ? 'Onboarding'
            : !isAuthenticated
            ? 'Auth'
            : 'Home'
        }
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RatingProvider>
          <AppContent />
        </RatingProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
