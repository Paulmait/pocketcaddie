# App Store Review Notes

**App Name**: Pocket Caddie AI
**Version**: 1.0.0
**Category**: Sports / Health & Fitness

---

## App Purpose

Pocket Caddie AI helps golfers identify and fix their slice through AI-powered swing video analysis. Users upload a short swing video, receive analysis identifying the primary cause of their slice, and get a focused practice drill.

### Core Features
1. Upload 5-8 second swing videos
2. AI analysis of slice causes
3. Personalized drill recommendations
4. 10-Swing Challenge progress tracking
5. Shareable Swing Report cards

---

## Demo Account

**No demo account required.** The app supports Sign in with Apple for frictionless testing.

### Test Flow

1. Launch app → View onboarding (3 screens)
2. Sign in with Apple (or skip to limited mode)
3. View paywall → Use sandbox account to subscribe
4. Upload provided sample swing video
5. View analysis results
6. Complete 10-Swing Challenge
7. Share Swing Report
8. Test account deletion in Settings

---

## Sample Swing Video

A sample swing video is bundled with the app for review purposes:

**Location**: `assets/sample-swing.mp4`

This video can be selected from the app's demo mode or accessed when the reviewer is prompted to select a video.

### To Access Sample Video:
1. On upload screen, tap "Use Sample Video"
2. Or select from Photos if previously saved

---

## Subscription Information

### Plans Offered

| Plan | Price | Trial | SKU |
|------|-------|-------|-----|
| Monthly | $8.99/month | None | `pocketcaddie.monthly` |
| Annual | $59.99/year | 7 days | `pocketcaddie.annual` |

### Subscription Testing

- Use Sandbox Apple ID for testing
- Annual plan includes 7-day trial (sandbox trial is shortened)
- Restore Purchases available in Settings

### Paywall Compliance

Our paywall includes all required elements:
- Price and billing period clearly displayed
- Auto-renewal disclosure
- Trial terms for annual plan
- "Manage subscription in Settings" link
- Restore Purchases button
- Links to Terms of Service and Privacy Policy

---

## Content & Claims

### No Medical Claims
- App does NOT provide medical advice
- No injury diagnosis or treatment suggestions
- No physical therapy recommendations
- Users are advised to consult professionals for health concerns

### No Guaranteed Results
- All language uses coaching terminology
- "may help", "often caused by", "try this drill"
- No promises of specific improvement
- Results disclaimer included

### Coaching Language Examples
- "Your slice may be caused by an open clubface at impact"
- "This drill often helps golfers improve clubface control"
- "Practice this motion to develop better swing path awareness"

---

## Data Handling

### Video Privacy
- Videos are processed and **deleted within 24 hours**
- Users can manually delete videos anytime
- Videos stored temporarily in Supabase Storage
- Automatic cleanup via scheduled function

### User Data
- Minimal data collection
- No third-party data sales
- Full data export available
- Complete account deletion available

See `privacy-data-map.md` for complete data handling details.

---

## Account Deletion

**Location**: Settings → Delete Account

### Deletion Process
1. User taps "Delete Account"
2. Confirmation dialog explains consequences
3. User confirms deletion
4. Account and all associated data deleted within 24 hours
5. User receives confirmation email

### What Gets Deleted
- Account credentials
- Profile information
- All uploaded videos
- All analysis history
- Usage data

### Subscription Handling
- Active subscriptions must be cancelled via Apple ID
- Clear instructions provided in deletion flow
- Link to Apple subscription management included

---

## Third-Party Services

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Supabase | Auth, Database, Storage | Account data, videos |
| RevenueCat | Subscription management | Purchase receipts |
| Apple Sign In | Authentication | Apple ID token |

---

## Content Rights

- All illustrations are original SVG artwork
- Icons use SF Symbols or original designs
- No copyrighted golf course imagery
- No professional golfer likenesses
- No trademarked golf brand references

---

## Age Rating

**Recommended**: 4+ (No objectionable content)

- No violence
- No mature themes
- No gambling
- No user-generated content sharing (reports are private unless explicitly shared)

---

## Additional Notes

### Offline Functionality
- App requires internet for video upload and analysis
- Historical results viewable offline
- Clear messaging when offline

### Accessibility
- VoiceOver support
- Dynamic Type support
- Sufficient color contrast
- Button touch targets meet guidelines

---

## Contact for Review Questions

**Email**: review@pocketcaddieai.com
**Response Time**: Within 24 hours

---

*Thank you for reviewing Pocket Caddie AI. We're committed to providing a compliant, user-friendly experience.*
