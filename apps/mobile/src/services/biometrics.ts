/**
 * Biometric Authentication Service
 *
 * Provides Face ID / Touch ID authentication for quick sign-in
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = '@slicefix_biometric_enabled';
const BIOMETRIC_USER_KEY = '@slicefix_biometric_user';

export interface BiometricUser {
  id: string;
  email: string;
}

/**
 * Check if device supports biometric authentication
 */
export async function isBiometricSupported(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  return compatible;
}

/**
 * Check if biometrics are enrolled on device
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Get available biometric types (Face ID, Touch ID, etc.)
 */
export async function getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return types;
}

/**
 * Get human-readable biometric type name
 */
export async function getBiometricTypeName(): Promise<string> {
  const types = await getBiometricTypes();

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Touch ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometrics';
}

/**
 * Check if biometric login is enabled for this user
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Get stored biometric user credentials
 */
export async function getBiometricUser(): Promise<BiometricUser | null> {
  try {
    const userJson = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enable biometric login for a user
 */
export async function enableBiometric(user: BiometricUser): Promise<boolean> {
  try {
    // First verify biometrics work
    const result = await authenticate('Enable biometric login');
    if (!result.success) {
      return false;
    }

    // Store user credentials securely
    await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

    return true;
  } catch (error) {
    console.error('[Biometrics] Enable error:', error);
    return false;
  }
}

/**
 * Disable biometric login
 */
export async function disableBiometric(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  } catch (error) {
    console.error('[Biometrics] Disable error:', error);
  }
}

/**
 * Authenticate using biometrics
 */
export async function authenticate(
  promptMessage: string = 'Sign in with biometrics'
): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    return result;
  } catch (error) {
    console.error('[Biometrics] Auth error:', error);
    return { success: false, error: 'unknown' };
  }
}

/**
 * Perform biometric login - returns user if successful
 */
export async function biometricLogin(): Promise<{
  success: boolean;
  user?: BiometricUser;
  error?: string;
}> {
  try {
    // Check if biometric is enabled
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return { success: false, error: 'Biometric login not enabled' };
    }

    // Get stored user
    const user = await getBiometricUser();
    if (!user) {
      return { success: false, error: 'No stored credentials' };
    }

    // Authenticate with biometrics
    const biometricName = await getBiometricTypeName();
    const result = await authenticate(`Sign in with ${biometricName}`);

    if (!result.success) {
      return {
        success: false,
        error: result.error === 'user_cancel' ? 'Cancelled' : 'Authentication failed'
      };
    }

    return { success: true, user };
  } catch (error) {
    console.error('[Biometrics] Login error:', error);
    return { success: false, error: 'Biometric login failed' };
  }
}

/**
 * Check full biometric availability
 */
export async function checkBiometricAvailability(): Promise<{
  available: boolean;
  enrolled: boolean;
  biometricType: string;
}> {
  const available = await isBiometricSupported();
  const enrolled = await isBiometricEnrolled();
  const biometricType = await getBiometricTypeName();

  return {
    available,
    enrolled: available && enrolled,
    biometricType,
  };
}
