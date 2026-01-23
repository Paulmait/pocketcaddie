import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { signOut } from '../services/supabase';
import { restorePurchases } from '../services/subscriptions';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  checkBiometricAvailability,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
} from '../services/biometrics';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  showChevron = true,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.settingsItem}>
    <View style={styles.settingsItemLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={destructive ? colors.status.error : colors.text.secondary}
      />
      <View style={styles.settingsItemText}>
        <Text
          style={[styles.settingsItemTitle, destructive && styles.destructiveText]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    )}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [restoring, setRestoring] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [togglingBiometric, setTogglingBiometric] = useState(false);

  const {
    user,
    isSubscribed,
    subscriptionType,
    trialActive,
    setUser,
    setSubscription,
    clearAllData,
  } = useAppStore();

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

  const handleToggleBiometric = async (value: boolean) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in first to enable biometric login.');
      return;
    }

    try {
      setTogglingBiometric(true);

      if (value) {
        // Enable biometrics
        const result = await enableBiometric({
          id: user.id,
          email: user.email || '',
        });

        if (result.success) {
          setBiometricEnabled(true);
          Alert.alert('Success', `${biometricType} login enabled!`);
        } else {
          // Don't show alert for user cancellation
          if (result.errorCode !== 'cancelled') {
            Alert.alert(
              `${biometricType} Setup Failed`,
              result.error || `Please authenticate with ${biometricType} to enable quick sign-in.`
            );
          }
        }
      } else {
        // Disable biometrics
        await disableBiometric();
        setBiometricEnabled(false);
        Alert.alert('Disabled', `${biometricType} login has been disabled.`);
      }
    } catch (error: any) {
      console.error('[Settings] Biometric toggle error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update biometric settings. Please try again.'
      );
    } finally {
      setTogglingBiometric(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              setUser(null);
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    // Navigate to dedicated Delete Account screen
    navigation.navigate('DeleteAccount');
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active['premium']) {
        setSubscription('annual');
        Alert.alert('Success', 'Your subscription has been restored!');
      } else {
        Alert.alert(
          'No Subscription Found',
          'No active subscription was found for this account.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://paulmait.github.io/pocketcaddie/legal/privacy.html');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://paulmait.github.io/pocketcaddie/legal/terms.html');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@cienrios.com');
  };

  const getSubscriptionStatus = () => {
    if (!isSubscribed) return 'Free';
    if (trialActive) return `${subscriptionType === 'annual' ? 'Annual' : 'Monthly'} (Trial)`;
    return subscriptionType === 'annual' ? 'Annual' : 'Monthly';
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
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <GlassCard style={styles.section}>
          {user ? (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.accountInfo}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={colors.text.secondary} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountEmail}>
                    {user.email || 'Apple ID User'}
                  </Text>
                  <Text style={styles.accountId}>
                    Tap to edit profile
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
              {/* Biometric Login Toggle */}
              {biometricAvailable && (
                <View style={styles.biometricRow}>
                  <View style={styles.settingsItemLeft}>
                    <Ionicons
                      name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                      size={22}
                      color={colors.text.secondary}
                    />
                    <View style={styles.settingsItemText}>
                      <Text style={styles.settingsItemTitle}>{biometricType} Login</Text>
                      <Text style={styles.settingsItemSubtitle}>
                        Quick sign-in with {biometricType}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleToggleBiometric}
                    disabled={togglingBiometric}
                    trackColor={{ false: colors.surface.glass, true: colors.primary.main }}
                    thumbColor={colors.text.primary}
                  />
                </View>
              )}
              <SettingsItem
                icon="log-out-outline"
                title="Sign Out"
                onPress={handleSignOut}
                showChevron={false}
              />
            </>
          ) : (
            <SettingsItem
              icon="log-in-outline"
              title="Sign In"
              subtitle="Sign in to save your progress"
              onPress={() => navigation.navigate('Auth')}
            />
          )}
        </GlassCard>

        {/* Subscription Section */}
        <Text style={styles.sectionTitle}>Subscription</Text>
        <GlassCard style={styles.section}>
          <View style={styles.subscriptionStatus}>
            <Text style={styles.subscriptionLabel}>Current Plan</Text>
            <Text style={styles.subscriptionValue}>{getSubscriptionStatus()}</Text>
          </View>

          {!isSubscribed && (
            <Button
              title="Upgrade to Premium"
              onPress={() => navigation.navigate('Paywall')}
              fullWidth
              style={styles.upgradeButton}
            />
          )}

          <SettingsItem
            icon="card-outline"
            title="Manage Subscription"
            subtitle="Opens Apple ID Settings"
            onPress={handleManageSubscription}
          />

          <SettingsItem
            icon="refresh-outline"
            title="Restore Purchases"
            onPress={handleRestorePurchases}
            showChevron={false}
          />
        </GlassCard>

        {/* Legal Section */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <GlassCard style={styles.section}>
          <SettingsItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={handleOpenPrivacy}
          />
          <SettingsItem
            icon="document-outline"
            title="Terms of Service"
            onPress={handleOpenTerms}
          />
        </GlassCard>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <GlassCard style={styles.section}>
          <SettingsItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="support@cienrios.com"
            onPress={handleContact}
          />
        </GlassCard>

        {/* Danger Zone */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <GlassCard style={[styles.section, styles.dangerSection]}>
              <SettingsItem
                icon="trash-outline"
                title="Delete Account"
                subtitle="Permanently delete all your data"
                onPress={handleDeleteAccount}
                destructive
              />
            </GlassCard>
          </>
        )}

        {/* App Version */}
        <Text style={styles.version}>
          SliceFix AI v1.0.0{'\n'}
          Cien Rios LLC
        </Text>
      </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    padding: 0,
    overflow: 'hidden',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountEmail: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  accountId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  subscriptionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  subscriptionValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
  },
  upgradeButton: {
    margin: spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  settingsItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  destructiveText: {
    color: colors.status.error,
  },
  dangerSection: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  version: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
});
