import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';

import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useAppStore } from '../store/useAppStore';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  formatPrice,
  getTrialInfo,
} from '../services/subscriptions';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { PRICING } from '../constants';

type PaywallScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Paywall'>;
};

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [packages, setPackages] = useState<{
    annual?: PurchasesPackage;
    monthly?: PurchasesPackage;
  }>({});
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const setSubscription = useAppStore((s) => s.setSubscription);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offering = await getOfferings();
      if (offering) {
        const annualPkg = offering.availablePackages.find(
          (p) => p.packageType === 'ANNUAL'
        );
        const monthlyPkg = offering.availablePackages.find(
          (p) => p.packageType === 'MONTHLY'
        );
        setPackages({ annual: annualPkg, monthly: monthlyPkg });
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const handlePurchase = async () => {
    const pkg = selectedPlan === 'annual' ? packages.annual : packages.monthly;
    if (!pkg) {
      Alert.alert('Error', 'Package not available. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const customerInfo = await purchasePackage(pkg);

      if (customerInfo.entitlements.active['premium']) {
        const trialInfo = getTrialInfo(pkg);
        setSubscription(
          selectedPlan,
          trialInfo.hasTrial,
          customerInfo.entitlements.active['premium'].expirationDate || undefined
        );
        navigation.goBack();
      }
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled, do nothing
      } else {
        Alert.alert('Purchase Failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active['premium']) {
        setSubscription('annual'); // Default to annual for restored
        Alert.alert('Success', 'Your subscription has been restored!');
        navigation.goBack();
      } else {
        Alert.alert('No Subscription Found', 'No active subscription was found for this account.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const openTerms = () => {
    Linking.openURL('https://slicefixai.com/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://slicefixai.com/privacy');
  };

  const openManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const annualPrice = packages.annual
    ? formatPrice(packages.annual)
    : `$${PRICING.annual.price}`;
  const monthlyPrice = packages.monthly
    ? formatPrice(packages.monthly)
    : `$${PRICING.monthly.price}`;

  const annualTrialInfo = packages.annual
    ? getTrialInfo(packages.annual)
    : { hasTrial: true, trialDays: 7 };

  const features = [
    'Unlimited swing analyses',
    'Detailed root cause identification',
    'Personalized drills',
    '10-Swing Challenge tracking',
    'Shareable Swing Reports',
    'Priority support',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Unlock Your Best Swing</Text>
        <Text style={styles.subtitle}>
          Get unlimited access to AI-powered swing analysis
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary.light}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          {/* Annual Plan - Best Value */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.8}
          >
            <GlassCard
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedPlan === 'annual' && styles.radioOuterSelected,
                  ]}
                >
                  {selectedPlan === 'annual' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>Annual</Text>
                  <Text style={styles.planPrice}>
                    {annualPrice}
                    <Text style={styles.planPeriod}>/year</Text>
                  </Text>
                </View>
              </View>
              {annualTrialInfo.hasTrial && (
                <Text style={styles.trialText}>
                  {annualTrialInfo.trialDays}-day free trial
                </Text>
              )}
            </GlassCard>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <GlassCard
              style={[
                styles.planCard,
                styles.planCardMonthly,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedPlan === 'monthly' && styles.radioOuterSelected,
                  ]}
                >
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>Monthly</Text>
                  <Text style={styles.planPrice}>
                    {monthlyPrice}
                    <Text style={styles.planPeriod}>/month</Text>
                  </Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <Button
          title={
            selectedPlan === 'annual' && annualTrialInfo.hasTrial
              ? 'Start Free Trial'
              : 'Subscribe'
          }
          onPress={handlePurchase}
          loading={loading}
          fullWidth
          size="lg"
        />

        {/* Disclosures */}
        <View style={styles.disclosures}>
          <Text style={styles.disclosureText}>
            {selectedPlan === 'annual' && annualTrialInfo.hasTrial
              ? `After your ${annualTrialInfo.trialDays}-day free trial, you'll be charged ${annualPrice}/year. `
              : ''}
            Subscription auto-renews unless cancelled at least 24 hours before the
            end of the current period.
          </Text>
          <TouchableOpacity onPress={openManageSubscription}>
            <Text style={styles.linkText}>
              Manage subscription in Apple ID Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Restore & Legal */}
        <View style={styles.footer}>
          <Button
            title="Restore Purchases"
            onPress={handleRestore}
            loading={restoring}
            variant="ghost"
          />
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={openTerms}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity onPress={openPrivacy}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  plansContainer: {
    marginBottom: spacing.lg,
  },
  planCard: {
    marginBottom: spacing.sm,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: colors.primary.main,
  },
  planCardMonthly: {
    opacity: 0.7,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bestValueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioOuterSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  planPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  planPeriod: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },
  trialText: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.main,
    marginTop: spacing.xs,
    marginLeft: 40,
  },
  disclosures: {
    marginTop: spacing.lg,
  },
  disclosureText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
  linkText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    textAlign: 'center',
    marginTop: spacing.xs,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  legalLink: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  legalDivider: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing.sm,
  },
});
