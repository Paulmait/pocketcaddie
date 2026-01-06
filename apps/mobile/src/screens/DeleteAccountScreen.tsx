/**
 * Delete Account Screen
 *
 * Allows users to permanently delete their account.
 * Implements Apple App Store requirement for account deletion.
 *
 * Flow:
 * 1. Warning message displayed
 * 2. User confirms via modal
 * 3. Account deletion requested via Edge Function
 * 4. Local data cleared
 * 5. User redirected to Onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useAppStore } from '../store/useAppStore';
import { requestAccountDeletion } from '../services/auth';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

type DeleteAccountScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeleteAccount'>;
};

export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  navigation,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const { clearAllData, isSubscribed } = useAppStore();

  const handleDeleteRequest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText.toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE to confirm.');
      return;
    }

    setLoading(true);

    try {
      const result = await requestAccountDeletion();

      if (result.success) {
        // Clear local data
        clearAllData();

        // Close modal
        setShowConfirmModal(false);

        // Show success and navigate
        Alert.alert(
          'Account Deleted',
          'Your account and all associated data have been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Onboarding'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Deletion Failed',
          result.error || 'Unable to delete account. Please contact support.'
        );
      }
    } catch (error) {
      console.error('[DeleteAccount] Error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@cienrios.com?subject=Account%20Deletion%20Request');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Warning Banner */}
        <GlassCard style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons
              name="warning"
              size={32}
              color={colors.status.error}
            />
            <Text style={styles.warningTitle}>This Action is Permanent</Text>
          </View>
          <Text style={styles.warningText}>
            Deleting your account will permanently remove all your data from our
            servers. This cannot be undone.
          </Text>
        </GlassCard>

        {/* What Gets Deleted */}
        <Text style={styles.sectionTitle}>What will be deleted:</Text>
        <GlassCard style={styles.listCard}>
          {[
            'Your profile information',
            'All swing analysis history',
            'All uploaded videos',
            'Progress and challenge data',
            'Settings and preferences',
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.status.error}
              />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Subscription Notice */}
        {isSubscribed && (
          <>
            <Text style={styles.sectionTitle}>About Your Subscription:</Text>
            <GlassCard style={styles.subscriptionCard}>
              <Text style={styles.subscriptionText}>
                Deleting your account does NOT automatically cancel your
                subscription. You must cancel it separately in Apple ID Settings
                to avoid future charges.
              </Text>
              <Button
                title="Manage Subscription"
                onPress={handleManageSubscription}
                variant="outline"
                style={styles.subscriptionButton}
              />
            </GlassCard>
          </>
        )}

        {/* Alternative Options */}
        <Text style={styles.sectionTitle}>Need Help Instead?</Text>
        <GlassCard style={styles.helpCard}>
          <Text style={styles.helpText}>
            If you&apos;re having issues with the app or your account, our support
            team may be able to help without deleting your account.
          </Text>
          <Button
            title="Contact Support"
            onPress={handleContactSupport}
            variant="outline"
            style={styles.helpButton}
          />
        </GlassCard>

        {/* Delete Button */}
        <Button
          title="Delete My Account"
          onPress={handleDeleteRequest}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />

        <Text style={styles.footer}>
          By deleting your account, you acknowledge that this action is
          irreversible and all your data will be permanently removed.
        </Text>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Button
              title="Cancel"
              onPress={() => {
                setShowConfirmModal(false);
                setConfirmText('');
              }}
              variant="ghost"
            />
          </View>

          <View style={styles.modalContent}>
            <Ionicons
              name="alert-circle"
              size={64}
              color={colors.status.error}
              style={styles.modalIcon}
            />

            <Text style={styles.modalText}>
              Are you absolutely sure you want to delete your account? This
              action cannot be undone.
            </Text>

            <Text style={styles.modalInstructions}>
              Type <Text style={styles.deleteWord}>DELETE</Text> to confirm:
            </Text>

            <TextInput
              style={styles.confirmInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type DELETE"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Button
              title={loading ? 'Deleting...' : 'Permanently Delete Account'}
              onPress={handleConfirmDelete}
              loading={loading}
              disabled={confirmText.toUpperCase() !== 'DELETE'}
              style={
                confirmText.toUpperCase() !== 'DELETE'
                  ? { ...styles.confirmDeleteButton, ...styles.confirmDeleteButtonDisabled }
                  : styles.confirmDeleteButton
              }
              textStyle={styles.confirmDeleteButtonText}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.status.error,
    marginLeft: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * 1.5,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  listCard: {
    marginBottom: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  listText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  subscriptionCard: {
    marginBottom: spacing.lg,
    borderColor: colors.status.warning,
    borderWidth: 1,
  },
  subscriptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.md,
  },
  subscriptionButton: {
    borderColor: colors.status.warning,
  },
  helpCard: {
    marginBottom: spacing.xl,
  },
  helpText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.md,
  },
  helpButton: {},
  deleteButton: {
    backgroundColor: colors.status.error,
    marginBottom: spacing.lg,
  },
  deleteButtonText: {
    color: colors.text.primary,
  },
  footer: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * 1.5,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.glassBorder,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: spacing.lg,
  },
  modalText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.xl,
  },
  modalInstructions: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  deleteWord: {
    fontWeight: typography.fontWeight.bold,
    color: colors.status.error,
  },
  confirmInput: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  confirmDeleteButton: {
    width: '100%',
    backgroundColor: colors.status.error,
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: colors.surface.glass,
    opacity: 0.5,
  },
  confirmDeleteButtonText: {
    color: colors.text.primary,
  },
});
