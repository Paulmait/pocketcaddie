# RevenueCat & App Store Subscription Setup Guide

## Overview

This guide walks you through setting up in-app subscriptions for SliceFix AI using RevenueCat and App Store Connect.

---

## Part 1: App Store Connect Setup

### Step 1: Create Subscription Group

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **My Apps** → **SliceFix AI**
3. Click **Subscriptions** in the left sidebar
4. Click the **+** button next to "Subscription Groups"
5. Enter the following:

| Field | Value |
|-------|-------|
| **Reference Name** | SliceFix Premium |
| **Subscription Group ID** | slicefix_premium |

6. Click **Create**

---

### Step 2: Create Monthly Subscription

1. In your new subscription group, click **Create Subscription**
2. Fill in the details:

| Field | Value |
|-------|-------|
| **Reference Name** | Monthly Premium |
| **Product ID** | pocketcaddie.monthly |

3. Click **Create**

4. Configure the subscription:

**Subscription Duration:**
| Field | Value |
|-------|-------|
| **Duration** | 1 Month |

**Subscription Prices:**
| Field | Value |
|-------|-------|
| **Price** | $8.99 USD |
| **Proceed to set prices for all territories** | Yes |

**App Store Localization (English - US):**
| Field | Value |
|-------|-------|
| **Subscription Display Name** | Monthly Premium |
| **Description** | Unlimited swing analyses, full drill library, and progress tracking. Billed monthly. |

5. Click **Save**

---

### Step 3: Create Annual Subscription

1. In the same subscription group, click **Create Subscription**
2. Fill in the details:

| Field | Value |
|-------|-------|
| **Reference Name** | Annual Premium |
| **Product ID** | pocketcaddie.annual |

3. Click **Create**

4. Configure the subscription:

**Subscription Duration:**
| Field | Value |
|-------|-------|
| **Duration** | 1 Year |

**Subscription Prices:**
| Field | Value |
|-------|-------|
| **Price** | $59.99 USD |
| **Proceed to set prices for all territories** | Yes |

**App Store Localization (English - US):**
| Field | Value |
|-------|-------|
| **Subscription Display Name** | Annual Premium |
| **Description** | Unlimited swing analyses, full drill library, and progress tracking. Save 44% with annual billing. |

5. Click **Save**

---

### Step 4: Add Free Trial to Annual Subscription

1. Select the **Annual Premium** subscription
2. Scroll to **Subscription Prices**
3. Click **+** next to "Introductory Offers"
4. Configure:

| Field | Value |
|-------|-------|
| **Reference Name** | 7 Day Free Trial |
| **Type** | Free Trial |
| **Duration** | 1 Week |
| **Territories** | All territories |

5. Click **Create** then **Confirm**

---

### Step 5: Get App-Specific Shared Secret

1. In App Store Connect, go to **My Apps** → **SliceFix AI**
2. Click **App Information** in the left sidebar
3. Scroll to **App-Specific Shared Secret**
4. Click **Manage**
5. If no secret exists, click **Generate**
6. **Copy the secret** - you'll need it for RevenueCat

```
Your Shared Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

⚠️ **Keep this secret secure - never commit it to git!**

---

### Step 6: Review Information (Required for Subscriptions)

1. Go to **App Information** in the left sidebar
2. Scroll to **App Store Server Notifications**
3. For now, leave blank (RevenueCat will provide a URL later)

---

## Part 2: RevenueCat Setup

### Step 1: Create RevenueCat Account

1. Go to [RevenueCat](https://app.revenuecat.com)
2. Sign up or log in
3. Click **Create New Project**
4. Enter:

| Field | Value |
|-------|-------|
| **Project Name** | SliceFix AI |

5. Click **Create Project**

---

### Step 2: Add iOS App

1. In your project, click **Apps** in the left sidebar
2. Click **+ New App**
3. Select **App Store (iOS)**
4. Fill in:

| Field | Value |
|-------|-------|
| **App Name** | SliceFix AI iOS |
| **Bundle ID** | com.cienrios.pocketcaddieai |
| **App Store Connect Shared Secret** | [Paste from Step 5 above] |

5. Click **Save Changes**

---

### Step 3: Get RevenueCat API Key

1. In your iOS app settings, scroll to **API Keys**
2. Find the **Public App-Specific API Key**
3. Copy this key - it starts with `appl_`

```
Your RevenueCat iOS Key: appl_xxxxxxxxxxxxxxxxxxxxxxxx
```

This is your `EXPO_PUBLIC_REVENUECAT_IOS_KEY`

---

### Step 4: Create Entitlement

1. Click **Entitlements** in the left sidebar
2. Click **+ New Entitlement**
3. Enter:

| Field | Value |
|-------|-------|
| **Identifier** | premium |
| **Description** | Full access to all SliceFix AI features |

4. Click **Add**

---

### Step 5: Create Products

1. Click **Products** in the left sidebar
2. Click **+ New Product**

**Monthly Product:**
| Field | Value |
|-------|-------|
| **Identifier** | pocketcaddie.monthly |
| **App** | SliceFix AI iOS |
| **App Store Product ID** | pocketcaddie.monthly |

3. Click **Add**
4. Click **+ New Product** again

**Annual Product:**
| Field | Value |
|-------|-------|
| **Identifier** | pocketcaddie.annual |
| **App** | SliceFix AI iOS |
| **App Store Product ID** | pocketcaddie.annual |

5. Click **Add**

---

### Step 6: Attach Products to Entitlement

1. Go to **Entitlements** → **premium**
2. Click **Attach Products**
3. Select both:
   - ✅ pocketcaddie.monthly
   - ✅ pocketcaddie.annual
4. Click **Attach**

---

### Step 7: Create Offering

1. Click **Offerings** in the left sidebar
2. Click **+ New Offering**
3. Enter:

| Field | Value |
|-------|-------|
| **Identifier** | default |
| **Description** | Default offering with monthly and annual options |

4. Click **Add**

---

### Step 8: Add Packages to Offering

1. Click on the **default** offering
2. Click **+ New Package**

**Monthly Package:**
| Field | Value |
|-------|-------|
| **Identifier** | $rc_monthly |
| **Product** | pocketcaddie.monthly |

3. Click **Add**
4. Click **+ New Package** again

**Annual Package:**
| Field | Value |
|-------|-------|
| **Identifier** | $rc_annual |
| **Product** | pocketcaddie.annual |

5. Click **Add**

---

### Step 9: Set Current Offering

1. Go to **Offerings**
2. Find the **default** offering
3. Click the **⋮** menu → **Make Current**

---

### Step 10: Configure Server Notifications (Recommended)

1. In RevenueCat, go to **Apps** → **SliceFix AI iOS**
2. Scroll to **Apple Server Notifications**
3. Copy the **Apple Server Notification URL**
4. Go to App Store Connect → **App Information**
5. Paste the URL in **App Store Server Notifications URL**
6. Select **Version 2 Notifications**
7. Click **Save**

---

## Part 3: Update Your App

### Step 1: Update eas.json

Edit `apps/mobile/eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_VARIANT": "production",
        "EXPO_PUBLIC_SUPABASE_URL": "https://xzuadnexwldcdoluuqjv.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your_anon_key",
        "EXPO_PUBLIC_REVENUECAT_IOS_KEY": "appl_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Replace `appl_xxxxxxxxxxxxxxxxxxxxxxxx` with your actual RevenueCat API key.

---

### Step 2: Update .env for Local Development

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xzuadnexwldcdoluuqjv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Part 4: Testing Subscriptions

### Sandbox Testing

1. Create a **Sandbox Tester** in App Store Connect:
   - Go to **Users and Access** → **Sandbox Testers**
   - Click **+** to add a new tester
   - Use a unique email (can be fake, e.g., `test1@sandbox.example.com`)
   - Create a password

2. On your **test device**:
   - Go to **Settings** → **App Store**
   - Scroll down and tap **Sandbox Account**
   - Sign in with your sandbox tester credentials

3. **Test purchases** in your app:
   - Sandbox subscriptions renew quickly:
     - 1 month = 5 minutes
     - 1 year = 1 hour
   - Sandbox subscriptions auto-renew up to 6 times

---

### RevenueCat Testing Dashboard

1. Go to RevenueCat → **Customers**
2. Search by App User ID or email
3. View purchase history, entitlements, and subscription status

---

## Part 5: Production Checklist

### Before Submitting to App Store

- [ ] Monthly subscription created in App Store Connect
- [ ] Annual subscription created with 7-day free trial
- [ ] Shared secret copied to RevenueCat
- [ ] RevenueCat entitlement "premium" created
- [ ] Both products attached to entitlement
- [ ] Offering "default" created with both packages
- [ ] Server notifications URL configured
- [ ] EXPO_PUBLIC_REVENUECAT_IOS_KEY in eas.json
- [ ] Sandbox testing completed successfully
- [ ] Production build created

---

## Quick Reference

### Product IDs
| Product | App Store ID | RevenueCat ID |
|---------|--------------|---------------|
| Monthly | pocketcaddie.monthly | pocketcaddie.monthly |
| Annual | pocketcaddie.annual | pocketcaddie.annual |

### Pricing
| Plan | Price | Trial | Savings |
|------|-------|-------|---------|
| Monthly | $8.99/month | None | - |
| Annual | $59.99/year | 7 days | 44% |

### RevenueCat Identifiers
| Item | Identifier |
|------|------------|
| Entitlement | premium |
| Offering | default |
| Monthly Package | $rc_monthly |
| Annual Package | $rc_annual |

### App Store Connect
| Item | Value |
|------|-------|
| Bundle ID | com.cienrios.pocketcaddieai |
| ASC App ID | 6757434999 |
| Team ID | LFB9Z5Q3Y9 |

---

## Troubleshooting

### "Product not found" Error
- Ensure the product ID matches exactly in App Store Connect and RevenueCat
- Wait 15-30 minutes after creating products (App Store caching)
- Make sure subscriptions are in "Ready to Submit" or "Approved" status

### "Invalid Shared Secret" Error
- Use the **App-Specific** shared secret, not the primary shared secret
- Regenerate the secret if needed

### Purchases Not Appearing in RevenueCat
- Check that App User ID is being set correctly
- Verify server notifications are configured
- Check RevenueCat dashboard for errors

### Sandbox Purchase Fails
- Sign out of production App Store account on device
- Use sandbox account in Settings → App Store → Sandbox Account
- Try a different sandbox tester account

---

## Support

- **RevenueCat Docs:** https://docs.revenuecat.com
- **App Store Connect Help:** https://developer.apple.com/help/app-store-connect/
- **SliceFix Support:** support@cienrios.com
