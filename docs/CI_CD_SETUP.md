# CI/CD Setup Guide

## Overview

This project uses GitHub Actions for continuous integration and deployment with EAS Build.

## Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **CI** | Push/PR to main | Runs TypeScript check, ESLint, Expo Doctor |
| **EAS Build** | Push to main (mobile changes) | Automatically builds iOS preview |
| **PR Preview** | PR with mobile changes | Creates preview build for testing |
| **EAS Submit** | Manual dispatch | Submits build to App Store |

---

## Setup Instructions

### Step 1: Create Expo Token

1. Go to [Expo Access Tokens](https://expo.dev/settings/access-tokens)
2. Click **Create Token**
3. Name it: `GitHub Actions`
4. Copy the token (starts with `expo_...`)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secret:

| Name | Value |
|------|-------|
| `EXPO_TOKEN` | Your Expo access token |

### Step 3: (Optional) Create Production Environment

For App Store submissions with extra protection:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it: `production`
4. Enable **Required reviewers** (add yourself)
5. This adds approval requirement before App Store submission

---

## Using the Workflows

### Automatic Builds

Every push to `main` that changes files in `apps/mobile/` will:
1. Run CI checks (TypeScript, ESLint)
2. Trigger an iOS preview build

### Manual Build

To manually trigger a build:

1. Go to **Actions** → **EAS Build**
2. Click **Run workflow**
3. Select:
   - **Profile**: `development`, `preview`, or `production`
   - **Platform**: `ios`, `android`, or `all`
4. Click **Run workflow**

### Submit to App Store

To submit a build to TestFlight/App Store:

1. Go to **Actions** → **EAS Submit to App Store**
2. Click **Run workflow**
3. Optionally enter a specific **Build ID** (leave empty for latest)
4. Click **Run workflow**
5. If production environment is set up, approve the deployment

---

## Workflow Files

```
.github/workflows/
├── ci.yml           # Lint & type check
├── eas-build.yml    # Automatic/manual EAS builds
├── eas-submit.yml   # App Store submission
└── pr-preview.yml   # Preview builds for PRs
```

---

## Build Profiles

| Profile | Use Case | Distribution |
|---------|----------|--------------|
| `development` | Local testing with dev client | Internal |
| `preview` | Testing on real devices | Internal (Ad Hoc) |
| `production` | App Store submission | App Store |

---

## Monitoring Builds

- **EAS Dashboard**: https://expo.dev/accounts/guampaul/projects/slicefix-ai/builds
- **GitHub Actions**: Check the Actions tab in your repo

---

## Troubleshooting

### "EXPO_TOKEN is not set"

Make sure you've added the `EXPO_TOKEN` secret to GitHub:
1. Settings → Secrets and variables → Actions
2. Add `EXPO_TOKEN` with your Expo access token

### Build fails with credential errors

EAS credentials are stored remotely. If you need to update them:
```bash
cd apps/mobile
eas credentials
```

### CI fails on TypeScript errors

Fix the errors locally first:
```bash
cd apps/mobile
npm run typecheck
```

---

## Local Development Commands

```bash
# Run type check
npm run typecheck --workspace=pocket-caddie-mobile

# Run linter
npm run lint --workspace=pocket-caddie-mobile

# Start Expo dev server
cd apps/mobile && npm start

# Build locally (requires EAS CLI)
cd apps/mobile && eas build --profile preview --platform ios
```

---

## Security Notes

- **EXPO_TOKEN**: Keep this secret! It has access to your Expo account
- **Production environment**: Use required reviewers for App Store submissions
- Never commit tokens or secrets to the repository
