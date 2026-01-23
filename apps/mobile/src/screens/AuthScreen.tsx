import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useAppStore } from '../store/useAppStore';
import { signInWithApple, signInWithEmail, verifyOtp, signInWithPassword } from '../services/supabase';
import { setUserId } from '../services/subscriptions';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { isDemoReviewAccount, isDemoReviewOtp, DEMO_CONFIG } from '../config/security';
import {
  checkBiometricAvailability,
  biometricLogin,
  isBiometricEnabled,
  enableBiometric,
} from '../services/biometrics';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setSubscription = useAppStore((s) => s.setSubscription);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Check biometric availability on mount
  useEffect(() => {
    async function checkBiometrics() {
      const { available, enrolled, biometricType: type } = await checkBiometricAvailability();
      setBiometricAvailable(available && enrolled);
      setBiometricType(type);

      if (available && enrolled) {
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
      }
    }
    checkBiometrics();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      const result = await biometricLogin();

      if (result.success && result.user) {
        setUser({
          id: result.user.id,
          email: result.user.email,
          createdAt: new Date().toISOString(),
        });

        await setUserId(result.user.id);
        navigation.replace('Home');
      } else if (result.error !== 'Cancelled') {
        Alert.alert('Biometric Login Failed', result.error || 'Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Biometric login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);

      // Generate nonce
      const nonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
        nonce: hashedNonce,
      });

      if (credential.identityToken) {
        const { user } = await signInWithApple(credential.identityToken, nonce);

        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            appleId: credential.user,
            createdAt: user.created_at,
          });

          await setUserId(user.id);
          navigation.replace('Home');
        }
      }
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Sign In Failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      // Demo account - use password authentication
      if (isDemoReviewAccount(email)) {
        setShowPasswordInput(true);
        Alert.alert(
          'Demo Account',
          'Enter the demo password to continue.'
        );
        return;
      }

      await signInWithEmail(email);
      setShowOtpInput(true);
      Alert.alert(
        'Check Your Email',
        'We sent you a verification code. Enter it below to sign in.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async () => {
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const { user } = await signInWithPassword(email, password);

      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        });

        // Grant premium access for demo account
        if (isDemoReviewAccount(email)) {
          setSubscription('annual', false, undefined);
          console.log('[AuthScreen] Demo review account signed in with premium access');
        }

        await setUserId(user.id);
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Code Required', 'Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);

      // Demo account bypass - create mock session (fallback for OTP method)
      if (isDemoReviewOtp(email, otp)) {
        const demoUserId = 'demo-review-user-' + Date.now();
        setUser({
          id: demoUserId,
          email: DEMO_CONFIG.REVIEW_EMAIL,
          createdAt: new Date().toISOString(),
        });
        // Grant premium access for demo account
        setSubscription('annual', false, undefined);
        console.log('[AuthScreen] Demo review account signed in with premium access');
        navigation.replace('Home');
        return;
      }

      const { user } = await verifyOtp(email, otp);

      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        });

        await setUserId(user.id);
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow limited functionality without auth
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="golf" size={64} color={colors.primary.light} />
            <Text style={styles.title}>SliceFix AI</Text>
            <Text style={styles.subtitle}>Sign in to save your progress</Text>
          </View>

          <View style={styles.authOptions}>
          {/* Biometric Login Button */}
          {biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons
                name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                size={32}
                color={colors.primary.light}
              />
              <Text style={styles.biometricText}>
                Sign in with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={borderRadius.md}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <GlassCard style={styles.emailCard}>
            {!showOtpInput && !showPasswordInput ? (
              <>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                />
                <Button
                  title="Continue with Email"
                  onPress={handleEmailSignIn}
                  loading={loading}
                  fullWidth
                  variant="outline"
                />
              </>
            ) : showPasswordInput ? (
              <>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                />
                <Button
                  title="Sign In"
                  onPress={handlePasswordSignIn}
                  loading={loading}
                  fullWidth
                />
                <Button
                  title="Back"
                  onPress={() => {
                    setShowPasswordInput(false);
                    setPassword('');
                  }}
                  variant="ghost"
                  style={styles.backButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.text.tertiary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Button
                  title="Verify"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  fullWidth
                />
                <Button
                  title="Back"
                  onPress={() => {
                    setShowOtpInput(false);
                    setOtp('');
                  }}
                  variant="ghost"
                  style={styles.backButton}
                />
              </>
            )}
          </GlassCard>
          </View>

          {!keyboardVisible && (
            <View style={styles.footer}>
              <Button
                title="Skip for now"
                onPress={handleSkip}
                variant="ghost"
              />
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  authOptions: {
    marginTop: spacing.sm,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  biometricText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.light,
    marginLeft: spacing.sm,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surface.glassBorder,
  },
  dividerText: {
    color: colors.text.tertiary,
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  emailCard: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
