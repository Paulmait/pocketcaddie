# Privacy Data Map

This document maps all data collected, stored, and processed by Pocket Caddie AI for privacy compliance and App Store Privacy Nutrition Label requirements.

---

## Data Categories Overview

| Category | Collected | Linked to User | Used for Tracking |
|----------|-----------|----------------|-------------------|
| Contact Info | Yes | Yes | No |
| Identifiers | Yes | Yes | No |
| Usage Data | Yes | No | No |
| User Content | Yes | Yes | No |
| Diagnostics | Yes | No | No |
| Purchases | Yes | Yes | No |

---

## Detailed Data Inventory

### 1. Contact Info

#### Email Address
- **Source**: User input or Sign in with Apple
- **Purpose**: Account authentication, service communications
- **Storage**: Supabase Auth
- **Retention**: Until account deletion
- **Shared With**: None
- **Linked to User**: Yes

#### Name (Optional)
- **Source**: Sign in with Apple (if user permits)
- **Purpose**: Personalization
- **Storage**: Supabase Database
- **Retention**: Until account deletion
- **Shared With**: None
- **Linked to User**: Yes

---

### 2. Identifiers

#### User ID
- **Source**: Generated at signup
- **Purpose**: Account identification
- **Storage**: Supabase Auth
- **Retention**: Until account deletion
- **Shared With**: RevenueCat (for subscription linking)
- **Linked to User**: Yes

#### Device ID
- **Source**: System
- **Purpose**: Analytics, crash reporting
- **Storage**: Analytics service
- **Retention**: 90 days
- **Shared With**: None
- **Linked to User**: No

---

### 3. User Content

#### Swing Videos
- **Source**: User upload
- **Purpose**: AI analysis
- **Storage**: Supabase Storage (encrypted)
- **Retention**: **24 hours maximum** (auto-deleted after processing)
- **Shared With**: AI processing service
- **Linked to User**: Yes (temporarily)

#### Analysis Results
- **Source**: AI processing
- **Purpose**: Display to user, history
- **Storage**: Supabase Database
- **Retention**: Until user deletes or account deletion
- **Shared With**: None
- **Linked to User**: Yes

#### Swing Report Images
- **Source**: Generated from analysis
- **Purpose**: Sharing feature
- **Storage**: Supabase Storage
- **Retention**: 30 days or until deleted
- **Shared With**: User-controlled sharing only
- **Linked to User**: Yes

---

### 4. Usage Data

#### App Interactions
- **Source**: In-app events
- **Purpose**: Product improvement
- **Storage**: Analytics service
- **Retention**: 90 days
- **Shared With**: None
- **Linked to User**: No (anonymized)

**Events Tracked**:
- Screen views
- Feature usage (upload, analysis, challenge completion)
- Subscription events
- Settings changes

#### Session Data
- **Source**: App sessions
- **Purpose**: Product improvement
- **Storage**: Analytics service
- **Retention**: 90 days
- **Shared With**: None
- **Linked to User**: No

---

### 5. Diagnostics

#### Crash Logs
- **Source**: App crashes
- **Purpose**: Bug fixes, stability
- **Storage**: Crash reporting service
- **Retention**: 90 days
- **Shared With**: None
- **Linked to User**: No

#### Performance Data
- **Source**: App performance metrics
- **Purpose**: Performance optimization
- **Storage**: Analytics service
- **Retention**: 90 days
- **Shared With**: None
- **Linked to User**: No

---

### 6. Purchases

#### Subscription Status
- **Source**: RevenueCat / App Store
- **Purpose**: Entitlement management
- **Storage**: RevenueCat
- **Retention**: Duration of subscription + 1 year
- **Shared With**: RevenueCat
- **Linked to User**: Yes

#### Transaction History
- **Source**: App Store
- **Purpose**: Purchase verification
- **Storage**: RevenueCat
- **Retention**: Per Apple requirements
- **Shared With**: RevenueCat
- **Linked to User**: Yes

---

## Data Flow Diagram

```
User Device
    │
    ├─── Sign In ──────────► Supabase Auth
    │                              │
    │                              ▼
    │                        User ID Created
    │                              │
    ├─── Video Upload ────► Supabase Storage
    │                              │
    │                              ▼
    │                        AI Processing
    │                              │
    │                              ▼
    │                        Analysis Results
    │                              │
    │                              ▼
    │                        Video DELETED (24h)
    │
    ├─── Subscription ────► RevenueCat ◄───► App Store
    │
    └─── Analytics ───────► Analytics Service (anonymized)
```

---

## Data Deletion Procedures

### User-Initiated Video Deletion
1. User taps delete on analysis
2. API call to delete video from storage
3. Analysis metadata deleted from database
4. Confirmation shown to user
5. **Immediate** deletion

### Automatic Video Cleanup
1. Scheduled function runs every hour
2. Identifies videos older than 24 hours
3. Deletes from storage
4. Updates database records
5. Logs deletion for audit

### Account Deletion
1. User requests deletion in Settings
2. System queues deletion job
3. Within 24 hours:
   - All videos deleted from storage
   - All analysis records deleted
   - User profile deleted
   - Auth credentials deleted
4. RevenueCat customer data flagged for deletion
5. Confirmation email sent
6. **Irreversible** after 24 hours

---

## Third-Party Data Processing

### Supabase
- **Role**: Data processor
- **Data**: All user data
- **Location**: US (configurable)
- **Compliance**: SOC 2, GDPR
- **DPA**: Required

### RevenueCat
- **Role**: Data processor
- **Data**: User ID, purchase data
- **Location**: US
- **Compliance**: SOC 2, GDPR
- **DPA**: Included in terms

### AI Processing Service
- **Role**: Data processor
- **Data**: Video frames (no PII)
- **Location**: [Configure based on service]
- **Compliance**: [Verify with provider]
- **DPA**: Required

---

## User Rights Implementation

| Right | Implementation | Location |
|-------|----------------|----------|
| Access | Export data feature | Settings |
| Rectification | Edit profile | Settings |
| Erasure | Delete account | Settings |
| Portability | Export as JSON | Settings |
| Opt-out | Analytics toggle | Settings |

---

## Compliance Checklist

- [x] Privacy Policy accessible before signup
- [x] Privacy Policy accessible in app
- [x] Data collection minimized
- [x] Video auto-deletion implemented
- [x] Account deletion available in-app
- [x] Third-party DPAs in place
- [x] App Store Privacy Labels accurate
- [x] GDPR rights supported
- [x] CCPA rights supported
- [x] No data sold to third parties
