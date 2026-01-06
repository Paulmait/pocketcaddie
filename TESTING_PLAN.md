# SliceFix AI - Functional Testing Plan
## App Store Submission QA Checklist

---

## 1. ONBOARDING FLOW

### 1.1 First Launch
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| O-01 | Fresh install launches to onboarding | Onboarding screen displays with first slide | [ ] |
| O-02 | Swipe through all 3 slides | Each slide displays correctly with icon, title, description | [ ] |
| O-03 | Pagination dots update correctly | Active dot changes as user navigates | [ ] |
| O-04 | "Next" button advances slides | Navigates to next slide | [ ] |
| O-05 | Final slide shows "Get Started" | Button text changes on last slide | [ ] |
| O-06 | "Skip" button available on slides 1-2 | Skip button hidden on final slide | [ ] |
| O-07 | Complete onboarding persists | Subsequent launches skip onboarding | [ ] |

---

## 2. AUTHENTICATION FLOW

### 2.1 Apple Sign In (iOS Only)
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| A-01 | Apple Sign In button visible on iOS | Button renders with correct styling | [ ] |
| A-02 | Tap Apple Sign In | iOS authentication prompt appears | [ ] |
| A-03 | Complete Apple auth successfully | User logged in, navigates to Home | [ ] |
| A-04 | Cancel Apple auth | Returns to Auth screen, no error | [ ] |
| A-05 | Apple auth error handling | User-friendly error alert displayed | [ ] |

### 2.2 Email OTP Flow
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| A-06 | Empty email submission | "Email Required" alert shown | [ ] |
| A-07 | Valid email submission | OTP input appears, email sent alert | [ ] |
| A-08 | Invalid email format | Server-side validation error | [ ] |
| A-09 | Empty OTP submission | "Code Required" alert shown | [ ] |
| A-10 | Invalid OTP submission | "Verification Failed" alert | [ ] |
| A-11 | Valid OTP submission | User logged in, navigates to Home | [ ] |
| A-12 | "Back" button in OTP view | Returns to email input | [ ] |

### 2.3 Skip Authentication
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| A-13 | "Skip for now" button works | Navigates to Home without auth | [ ] |
| A-14 | Skip user has limited functionality | Analysis may be restricted | [ ] |

---

## 3. HOME SCREEN

### 3.1 UI Elements
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| H-01 | Header displays correctly | Greeting, title, settings icon visible | [ ] |
| H-02 | Streak badge shows when streak > 0 | Flame icon with streak count | [ ] |
| H-03 | Upload CTA card displays | Video icon, title, description, button | [ ] |
| H-04 | Recent analyses section | Shows list or empty state | [ ] |

### 3.2 Navigation
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| H-05 | "Upload Swing Video" button | Navigates to Upload screen | [ ] |
| H-06 | Settings icon tap | Navigates to Settings screen | [ ] |
| H-07 | Streak badge tap | Navigates to Progress screen | [ ] |
| H-08 | Recent analysis tap | Navigates to Results screen | [ ] |

---

## 4. UPLOAD FLOW

### 4.1 Video Selection
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| U-01 | Tips card displays correctly | All 4 tips visible with icons | [ ] |
| U-02 | "Choose from Library" option | Photo library permission prompt | [ ] |
| U-03 | Grant library permission | Photo library opens | [ ] |
| U-04 | Deny library permission | Alert explaining permission needed | [ ] |
| U-05 | Select valid video | "Video Selected" confirmation shown | [ ] |
| U-06 | Select video too short | "Video Too Short" alert | [ ] |
| U-07 | Cancel video selection | Returns to options | [ ] |
| U-08 | "Change video" option | Returns to selection options | [ ] |

### 4.2 Record with Guide
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| U-09 | "Record with Guide" option | Navigates to Camera screen | [ ] |
| U-10 | Camera screen loads | Permission prompt or camera view | [ ] |
| U-11 | Position guides visible | Overlay guides help user positioning | [ ] |
| U-12 | Countdown functionality | 3-2-1 countdown before recording | [ ] |
| U-13 | Recording completes | Returns to Upload with video selected | [ ] |

### 4.3 Quick Record
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| U-14 | "Quick Record" option | Camera permission prompt | [ ] |
| U-15 | Grant camera permission | System camera opens | [ ] |
| U-16 | Deny camera permission | Alert explaining permission needed | [ ] |
| U-17 | Record video | Returns with video selected | [ ] |

### 4.4 Sample Video
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| U-18 | "Use Sample Video" button | Navigates to Processing with sample | [ ] |
| U-19 | Sample analysis completes | Results screen shows demo analysis | [ ] |

### 4.5 Analyze Flow
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| U-20 | "Analyze Swing" with video | Navigates to Processing screen | [ ] |
| U-21 | Back navigation | Returns to Home | [ ] |

---

## 5. PROCESSING SCREEN

### 5.1 Analysis Progress
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| P-01 | Loading animation displays | Progress indicator visible | [ ] |
| P-02 | Status messages update | Shows analysis progress stages | [ ] |
| P-03 | Analysis completes successfully | Navigates to Results screen | [ ] |
| P-04 | Analysis fails (network error) | Error message with retry option | [ ] |
| P-05 | Analysis fails (server error) | User-friendly error message | [ ] |

---

## 6. RESULTS SCREEN

### 6.1 Analysis Display
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| R-01 | Root cause section displays | Title, explanation, confidence level | [ ] |
| R-02 | Evidence list displays | All evidence items visible | [ ] |
| R-03 | Drill section displays | Name, steps, reps, common mistakes | [ ] |
| R-04 | Challenge section displays | Title with checklist items | [ ] |
| R-05 | Safety note displays | Warning/safety information visible | [ ] |

### 6.2 Challenge Interaction
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| R-06 | Tap challenge item | Toggles completion state | [ ] |
| R-07 | Progress persists | Completed items saved after navigation | [ ] |
| R-08 | All items completed | Challenge completion recognized | [ ] |

### 6.3 Sharing
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| R-09 | Share button available | Share icon/button visible | [ ] |
| R-10 | Share generates report | Share sheet opens with report | [ ] |

---

## 7. PAYWALL SCREEN

### 7.1 UI Elements
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PW-01 | Close button works | Returns to previous screen | [ ] |
| PW-02 | Features list displays | All 6 features visible with checkmarks | [ ] |
| PW-03 | Annual plan card shows | Price, "BEST VALUE" badge, trial info | [ ] |
| PW-04 | Monthly plan card shows | Price, slightly faded styling | [ ] |
| PW-05 | Plan selection works | Radio buttons toggle correctly | [ ] |

### 7.2 Subscription Flow
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PW-06 | "Start Free Trial" button (annual) | Initiates purchase flow | [ ] |
| PW-07 | "Subscribe" button (monthly) | Initiates purchase flow | [ ] |
| PW-08 | Purchase successful | Subscription activated, returns | [ ] |
| PW-09 | Purchase cancelled by user | Returns to paywall, no error | [ ] |
| PW-10 | Purchase failed | User-friendly error message | [ ] |

### 7.3 Restore Purchases
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PW-11 | "Restore Purchases" button | Initiates restore flow | [ ] |
| PW-12 | Restore successful | "Success" alert, subscription restored | [ ] |
| PW-13 | Restore - no subscription | "No Subscription Found" alert | [ ] |
| PW-14 | Restore failed | Error message displayed | [ ] |

### 7.4 Legal Compliance
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PW-15 | Trial disclosure text | Auto-renewal terms displayed | [ ] |
| PW-16 | "Manage subscription" link | Opens Apple ID subscription settings | [ ] |
| PW-17 | "Terms of Service" link | Opens terms URL | [ ] |
| PW-18 | "Privacy Policy" link | Opens privacy URL | [ ] |

---

## 8. SETTINGS SCREEN

### 8.1 Account Section
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-01 | Signed in user info displays | Email/Apple ID, truncated user ID | [ ] |
| S-02 | "Sign Out" button | Confirmation dialog appears | [ ] |
| S-03 | Confirm sign out | Signs out, returns to Auth | [ ] |
| S-04 | Cancel sign out | Returns to Settings | [ ] |
| S-05 | Guest user shows "Sign In" | Sign in option displayed | [ ] |

### 8.2 Subscription Section
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-06 | Current plan displays | Free, Monthly, Annual, or Trial status | [ ] |
| S-07 | "Upgrade to Premium" (free users) | Navigates to Paywall | [ ] |
| S-08 | "Manage Subscription" | Opens Apple ID subscription settings | [ ] |
| S-09 | "Restore Purchases" | Same flow as paywall restore | [ ] |

### 8.3 Legal Section
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-10 | "Privacy Policy" link | Opens privacy URL | [ ] |
| S-11 | "Terms of Service" link | Opens terms URL | [ ] |

### 8.4 Support Section
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-12 | "Contact Support" | Opens email to support@cienrios.com | [ ] |

### 8.5 Delete Account (Apple Requirement)
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-13 | "Delete Account" visible for signed-in users | Danger zone section displayed | [ ] |
| S-14 | "Delete Account" tap | First confirmation dialog appears | [ ] |
| S-15 | Cancel first confirmation | Returns to Settings | [ ] |
| S-16 | Proceed to second confirmation | Second dialog with DELETE prompt | [ ] |
| S-17 | Cancel second confirmation | Returns to Settings | [ ] |
| S-18 | Confirm deletion | Account deleted, returns to Onboarding | [ ] |
| S-19 | Deletion error handling | Error message displayed | [ ] |
| S-20 | All user data cleared | Local storage cleared after deletion | [ ] |

### 8.6 Version Info
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| S-21 | Version number displays | "v1.0.0" and "Cien Rios LLC" visible | [ ] |

---

## 9. PROGRESS SCREEN

### 9.1 Streak Display
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PR-01 | Current streak displays | Streak count with flame icon | [ ] |
| PR-02 | Longest streak displays | Historical best streak | [ ] |
| PR-03 | Total practice days | Cumulative practice count | [ ] |

### 9.2 Statistics
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PR-04 | Total analyses count | Accurate count of all analyses | [ ] |
| PR-05 | Challenge completion % | Percentage of completed items | [ ] |
| PR-06 | Most common root cause | Identified pattern | [ ] |
| PR-07 | Improvement trend | Improving/Stable/Declining indicator | [ ] |

---

## 10. NETWORK & OFFLINE

### 10.1 Network Status
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| N-01 | Offline banner displays | User notified when offline | [ ] |
| N-02 | Reconnection detection | Banner disappears when online | [ ] |

### 10.2 Offline Functionality
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| N-03 | Queue upload when offline | Video queued for later upload | [ ] |
| N-04 | View cached analyses offline | Previous results accessible | [ ] |
| N-05 | Queue processes when online | Queued videos upload automatically | [ ] |

---

## 11. ERROR HANDLING

### 11.1 Error Boundaries
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| E-01 | App crash recovery | Error boundary catches, shows UI | [ ] |
| E-02 | "Try Again" button | Resets error state | [ ] |
| E-03 | Error logged to analytics | Error tracked for debugging | [ ] |

### 11.2 API Errors
| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| E-04 | 401 Unauthorized | Redirects to auth | [ ] |
| E-05 | 500 Server Error | User-friendly message | [ ] |
| E-06 | Network timeout | Retry option offered | [ ] |

---

## 12. PERMISSIONS

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| PM-01 | Camera permission request | Clear explanation in prompt | [ ] |
| PM-02 | Photo library permission request | Clear explanation in prompt | [ ] |
| PM-03 | Denied permissions handling | Graceful fallback, instructions | [ ] |

---

## TESTING DEVICES

| Device | iOS Version | Status |
|--------|-------------|--------|
| iPhone 15 Pro | iOS 17.x | [ ] |
| iPhone 14 | iOS 17.x | [ ] |
| iPhone SE (3rd gen) | iOS 17.x | [ ] |
| iPhone 12 mini | iOS 16.x | [ ] |
| iPad Pro 12.9" | iPadOS 17.x | [ ] |

---

## SIGN-OFF

| Phase | Tester | Date | Status |
|-------|--------|------|--------|
| Functional Testing | | | [ ] |
| Regression Testing | | | [ ] |
| UAT | | | [ ] |

---

*Generated by Production Readiness Audit - Phase 2*
