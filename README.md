# Pocket Caddie AI — Fix My Slice Fast

> "Identify the most common cause of your slice and get **one drill** you can try immediately."

## Overview

Pocket Caddie AI is an iOS-first app that helps golfers fix their slice using short swing videos, AI-assisted analysis, and a tight feedback loop.

### How It Works

1. **Upload** a 5-8 second swing video (face-on + down-the-line recommended)
2. **Receive** AI analysis identifying your primary slice cause
3. **Practice** a focused drill with the 10-Swing Challenge
4. **Share** your Swing Report card with friends or coaches

## Tech Stack

- **Frontend**: Expo React Native + TypeScript
- **Backend**: Supabase (Auth, Storage, Postgres)
- **Payments**: RevenueCat / StoreKit 2
- **State**: Zustand

## Project Structure

```
pocket-caddie-ai/
├─ apps/
│  ├─ mobile/              # Expo RN app
│  └─ api/                 # Edge functions
├─ packages/
│  ├─ shared/              # Types, prompts, utilities
│  └─ ui/                  # Reusable UI components
├─ assets/
│  ├─ source/              # SVG masters
│  └─ generated/           # Icons, screenshots
├─ scripts/                # Asset automation
├─ legal/                  # Privacy, Terms, EULA
├─ docs/                   # App Store & review docs
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (macOS) or Expo Go app

### Installation

```bash
# Install dependencies
npm install

# Start the mobile app
npm run mobile
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
REVENUECAT_API_KEY=your_revenuecat_key
```

## Subscription Tiers

| Plan | Price | Trial |
|------|-------|-------|
| Monthly | $8.99/month | None |
| Annual | $59.99/year | 7-day free trial |

## App Store Compliance

This app follows Apple App Store Review Guidelines for:
- In-App Purchases with proper disclosures
- Account creation with in-app deletion
- Privacy disclosures and data handling
- No medical or injury claims

See `docs/app-review-notes.md` for reviewer guidance.

## Legal

- [Privacy Policy](legal/Privacy.md)
- [Terms of Service](legal/Terms.md)
- [EULA](legal/EULA-short.md)

## License

Proprietary - All Rights Reserved
