# Changelog

All notable changes to Pocket Caddie AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-05

### Added

- Initial release of Pocket Caddie AI
- AI-powered golf swing analysis for slice correction
- Four slice cause detection:
  - Open clubface at impact
  - Out-to-in swing path
  - Early extension
  - Poor alignment/setup
- Personalized drill recommendations
- 10-Swing Challenge progress tracking
- Shareable Swing Report cards
- Sign in with Apple authentication
- Email magic link authentication
- Subscription management via RevenueCat
  - Monthly plan: $8.99/month
  - Annual plan: $59.99/year with 7-day free trial
- Dark mode UI with premium sports tech aesthetic
- Privacy-first design with automatic video deletion
- In-app account deletion
- Restore purchases functionality

### Security

- Videos automatically deleted within 24 hours of processing
- Secure authentication via Supabase
- No third-party tracking or advertising
- GDPR and CCPA compliant data handling

### Technical

- Built with Expo React Native
- TypeScript throughout
- Zustand state management
- Supabase backend (Auth, Storage, Database)
- RevenueCat subscription infrastructure
- App Store compliant paywall with all required disclosures
