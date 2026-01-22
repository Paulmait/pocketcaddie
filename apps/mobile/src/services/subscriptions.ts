import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { SUBSCRIPTION_SKUS } from '../constants';
import { isDemoReviewAccount } from '../config/security';

// RevenueCat API keys - replace with your keys
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'your-ios-key';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'your-android-key';

const ENTITLEMENT_ID = 'premium';

export const initializePurchases = async (userId?: string) => {
  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  await Purchases.configure({
    apiKey,
    appUserID: userId,
  });
};

export const setUserId = async (userId: string) => {
  await Purchases.logIn(userId);
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

export const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo> => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

export const restorePurchases = async (): Promise<CustomerInfo> => {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
};

export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo;
};

export const checkSubscriptionStatus = async (userEmail?: string | null): Promise<{
  isSubscribed: boolean;
  subscriptionType: 'monthly' | 'annual' | null;
  trialActive: boolean;
  expirationDate: string | null;
}> => {
  // Check for demo review account (for App Store review)
  if (isDemoReviewAccount(userEmail)) {
    return {
      isSubscribed: true,
      subscriptionType: 'annual',
      trialActive: false,
      expirationDate: null,
    };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (!entitlement) {
      return {
        isSubscribed: false,
        subscriptionType: null,
        trialActive: false,
        expirationDate: null,
      };
    }

    // Determine subscription type based on product identifier
    let subscriptionType: 'monthly' | 'annual' | null = null;
    if (entitlement.productIdentifier === SUBSCRIPTION_SKUS.monthly) {
      subscriptionType = 'monthly';
    } else if (entitlement.productIdentifier === SUBSCRIPTION_SKUS.annual) {
      subscriptionType = 'annual';
    }

    return {
      isSubscribed: true,
      subscriptionType,
      trialActive: entitlement.periodType === 'TRIAL',
      expirationDate: entitlement.expirationDate,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isSubscribed: false,
      subscriptionType: null,
      trialActive: false,
      expirationDate: null,
    };
  }
};

export const addCustomerInfoListener = (
  callback: (info: CustomerInfo) => void
): (() => void) => {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    // RevenueCat SDK handles cleanup internally
  };
};

// Helper to format price for display
export const formatPrice = (pkg: PurchasesPackage): string => {
  return pkg.product.priceString;
};

// Helper to get trial info
export const getTrialInfo = (pkg: PurchasesPackage): {
  hasTrial: boolean;
  trialDays: number;
} => {
  const intro = pkg.product.introPrice;
  if (intro && intro.price === 0) {
    // Extract trial period - this varies by platform
    const periodUnit = intro.periodUnit;
    const periodNumber = intro.periodNumberOfUnits;

    let trialDays = 0;
    if (periodUnit === 'DAY') {
      trialDays = periodNumber;
    } else if (periodUnit === 'WEEK') {
      trialDays = periodNumber * 7;
    } else if (periodUnit === 'MONTH') {
      trialDays = periodNumber * 30;
    }

    return { hasTrial: true, trialDays };
  }

  return { hasTrial: false, trialDays: 0 };
};
