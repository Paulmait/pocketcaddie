# SliceFix AI - Rename QA Checklist

**Date:** January 6, 2026
**Previous Name:** Pocket Caddie AI
**New Name:** SliceFix AI

---

## Rename Verification

### App Configuration
- [x] `app.json` name updated to "SliceFix AI"
- [x] `app.json` slug updated to "slicefix-ai"
- [x] `app.json` scheme updated to "slicefix"
- [x] iOS permission descriptions updated
- [x] Camera/Photos plugin permissions updated
- [x] `APP_NAME` constant updated

### Deep Link Scheme
- [x] App.tsx linking prefixes updated to `slicefix://`
- [x] auth.ts emailRedirectTo updated to `slicefix://login`
- [x] Supabase config.toml redirect URL updated

### UI Strings
- [x] AuthScreen title updated
- [x] SettingsScreen version footer updated
- [x] Legal URLs updated to slicefixai.com

### Legal Documents
- [x] Privacy.md updated
- [x] Terms.md updated
- [x] EULA-short.md updated

### Documentation
- [x] README.md updated
- [x] CHANGELOG.md updated
- [x] All docs/ files updated
- [x] All audit files updated

### Asset Configurations
- [x] captions.json app name updated
- [x] Screenshot generator comments updated
- [x] Icon generator comments updated

---

## Items Intentionally NOT Changed

| Item | Value | Reason |
|------|-------|--------|
| Bundle ID | `com.cienrios.pocketcaddieai` | Per safety rules - explicit instruction required |
| Android Package | `com.cienrios.pocketcaddieai` | Per safety rules |
| Subscription SKUs | `pocketcaddie.monthly`, `pocketcaddie.annual` | Already configured in App Store Connect |
| Database tables | N/A | Per safety rules |
| Storage keys | Changed to `@slicefix_*` | Migration handled by app |

---

## Build Verification

### TypeScript Compilation
- [x] Pre-existing error in DrillLibraryScreen Props (NOT caused by rename)
- [x] No new TypeScript errors introduced by rename

### Source Code Verification
- [x] 0 remaining "Pocket Caddie" references in apps/, packages/, scripts/, tools/
- [x] All comment headers updated
- [x] All console.log messages updated

---

## Post-Rename Actions Required

### Supabase Dashboard
- [ ] Update redirect URL: `slicefix://auth/callback`
- [ ] Update email templates (if customized)

### App Store Connect
- [ ] Update app name to "SliceFix AI"
- [ ] Update marketing URL to slicefixai.com
- [ ] Update privacy URL to slicefixai.com/privacy
- [ ] Regenerate screenshots with new branding

### Domain Setup
- [ ] Configure slicefixai.com domain
- [ ] Deploy privacy policy to slicefixai.com/privacy
- [ ] Deploy terms to slicefixai.com/terms

---

## QA Status: PASSED

The rename from "Pocket Caddie AI" to "SliceFix AI" has been completed successfully.

All user-facing strings, configuration files, and documentation have been updated while preserving:
- Bundle identifiers (for App Store continuity)
- Subscription SKU identifiers (for RevenueCat/App Store Connect)
- Database schema (no breaking changes)

---

*SliceFix AI - Cien Rios LLC*
