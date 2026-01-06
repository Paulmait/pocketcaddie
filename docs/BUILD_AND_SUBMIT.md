# SliceFix AI - Build & Submit Guide

## Prerequisites

### 1. Environment Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize EAS (if not done)
cd apps/mobile
eas init
```

### 2. Required Environment Variables
Create a `.env.production` file or set in EAS secrets:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xzuadnexwldcdoluuqjv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-revenuecat-ios-key

# Optional Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

### 3. Apple Developer Account
- Apple Developer Program membership (active)
- App Store Connect app created
- Provisioning profiles configured

---

## Build Commands

### Development Build (Simulator)
```bash
cd apps/mobile
eas build --profile development --platform ios
```

### Preview Build (Internal Testing)
```bash
cd apps/mobile
eas build --profile preview --platform ios
```

### Production Build (App Store/TestFlight)
```bash
cd apps/mobile
eas build --profile production --platform ios
```

---

## Submit to App Store

### Option 1: EAS Submit (Recommended)
```bash
# After successful build
eas submit --platform ios --latest
```

### Option 2: Manual Upload
1. Download the `.ipa` from EAS dashboard
2. Open Transporter app on Mac
3. Drag and drop the `.ipa`
4. Click "Deliver"

---

## TestFlight Distribution

### First-Time Setup in App Store Connect

1. **Create App**
   - Go to App Store Connect > My Apps > "+"
   - Bundle ID: `com.cienrios.pocketcaddieai`
   - Name: "SliceFix AI"
   - Primary Language: English (US)
   - SKU: `pocketcaddieai`

2. **Configure TestFlight**
   - Add internal testers (your team)
   - Create external testing group
   - Set up beta app information

3. **Set Up Subscriptions**
   - Go to App > In-App Purchases
   - Create subscription group: "Premium"
   - Add products:
     - `pocketcaddie.monthly` - $8.99/month
     - `pocketcaddie.annual` - $59.99/year (7-day trial)

### Submit for Beta Review
1. Upload build via EAS or Transporter
2. Wait for processing (5-15 minutes)
3. Select build in TestFlight
4. Add "What to Test" notes
5. Submit for beta review (external testers only)

---

## Production Release

### Pre-Release Checklist
- [ ] All builds pass TypeScript check
- [ ] All builds pass ESLint
- [ ] No npm audit vulnerabilities
- [ ] Privacy policy URL is live
- [ ] Terms of service URL is live
- [ ] App Store screenshots uploaded
- [ ] App description written
- [ ] Keywords optimized
- [ ] Privacy nutrition label completed

### Submit for App Review
1. Select build in App Store Connect
2. Complete all required metadata
3. Answer export compliance questions
4. Submit for review
5. Monitor for feedback

---

## Troubleshooting

### Build Failures

**Provisioning Profile Issues**
```bash
# Clear credentials and rebuild
eas credentials
eas build --profile production --platform ios --clear-cache
```

**Node Modules Issues**
```bash
rm -rf node_modules
rm package-lock.json
npm install
eas build --profile production --platform ios
```

### Submit Failures

**Missing App Store Connect API Key**
```bash
# Set up API key in eas.json or use environment variables
export APPLE_ID=your-apple-id@example.com
export ASC_APP_ID=your-asc-app-id
export APPLE_TEAM_ID=your-team-id
```

---

## Version Management

### Bump Version
```bash
# See scripts/bump-version.ts for automated versioning
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

### Build Number
Build numbers auto-increment with `autoIncrement: "buildNumber"` in eas.json.

---

## Quick Reference

| Profile | Use Case | Distribution |
|---------|----------|--------------|
| development | Local testing | Simulator |
| preview | Internal testing | Ad Hoc |
| production | App Store/TestFlight | App Store |

| Command | Description |
|---------|-------------|
| `eas build --platform ios` | Build for iOS |
| `eas submit --platform ios` | Submit to App Store |
| `eas build:list` | View recent builds |
| `eas credentials` | Manage certificates |

---

*SliceFix AI - Cien Rios LLC*
