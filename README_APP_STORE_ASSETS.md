# SliceFix AI - App Store Asset Pipeline

Complete guide for generating App Store assets (icons and screenshots) for iOS submission.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Folder Structure](#folder-structure)
3. [Quick Start](#quick-start)
4. [App Icon Generation](#app-icon-generation)
5. [Screenshot Capture](#screenshot-capture)
6. [Screenshot Processing](#screenshot-processing)
7. [Validation](#validation)
8. [App Store Connect Upload](#app-store-connect-upload)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **pnpm**
- **Sharp** image processing library

```bash
# Install dependencies
npm install
npm install sharp --save-dev

# Or with pnpm
pnpm install
pnpm add sharp -D
```

---

## Folder Structure

```
assets/app-store/
├── icon/
│   ├── source/
│   │   └── app-icon.svg          # ← Edit this source file
│   └── export/
│       └── ios/
│           ├── AppIcon-1024.png  # App Store icon
│           ├── AppIcon-60@2x.png
│           ├── AppIcon-60@3x.png
│           └── ...
├── screenshots/
│   ├── raw/                      # ← Add raw captures here
│   │   ├── 01-home.png
│   │   ├── 02-upload.png
│   │   └── ...
│   ├── final/
│   │   └── en-US/
│   │       ├── iphone-6.7/       # 1290x2796
│   │       │   ├── 01-home.png
│   │       │   └── ...
│   │       └── iphone-6.5/       # 1284x2778 (optional)
│   └── captions.json             # Caption configuration
└── README.md

tools/appstore/
├── index.ts                      # Main CLI
├── generate-icon.ts              # Icon generator
├── postprocess-screenshots.ts    # Screenshot processor
└── validate-assets.ts            # Asset validator
```

---

## Quick Start

```bash
# 1. Generate app icons
npm run appstore:icons

# 2. Capture raw screenshots (see Screenshot Capture section)

# 3. Process screenshots with captions
npm run appstore:screenshots

# 4. Validate all assets
npm run appstore:validate

# Or do everything at once
npm run appstore:assets
```

---

## App Icon Generation

### Source File

Edit the source SVG at: `assets/app-store/icon/source/app-icon.svg`

**Requirements:**
- 1024x1024 viewBox
- No transparency (will be flattened)
- No "FREE", "NEW", "AI" text
- Golf-themed, brand consistent
- Simple enough to be legible at 29pt

### Generate Icons

```bash
npm run appstore:icons
```

This generates:
- `AppIcon-1024.png` - App Store Connect (required)
- `AppIcon-60@2x.png`, `AppIcon-60@3x.png` - iPhone icons
- `icon.png`, `splash.png`, `adaptive-icon.png` - Expo assets

---

## Screenshot Capture

### Enable Screenshot Mode

1. Create `.env.local` in `apps/mobile/`:

```env
EXPO_PUBLIC_SCREENSHOT_MODE=true
```

2. Start the app:

```bash
cd apps/mobile
npx expo start
```

3. Use an iOS Simulator (iPhone 15 Pro Max for 6.7" screenshots)

### Capture Each Screen

| Filename | Screen | Description |
|----------|--------|-------------|
| 01-home.png | HomeScreen | Main dashboard with analyses |
| 02-upload.png | UploadScreen | Video upload options |
| 03-camera.png | CameraScreen | Camera with angle guide |
| 04-analysis.png | ProcessingScreen | AI analysis in progress |
| 05-results.png | ResultsScreen | Analysis results + drill |
| 06-progress.png | ProgressScreen | Progress tracking |

### Capture Methods

**Method 1: iOS Simulator (Recommended)**

```bash
# Press Cmd+S in Simulator to save screenshot
# Screenshots save to Desktop
```

**Method 2: Expo Screenshot**

```bash
# In Expo DevTools, use the screenshot button
```

**Method 3: Device Screenshot**

```bash
# On device: Side button + Volume Up
# Transfer to computer via AirDrop
```

### Save Raw Screenshots

Move captured screenshots to:
```
assets/app-store/screenshots/raw/
├── 01-home.png
├── 02-upload.png
├── 03-camera.png
├── 04-analysis.png
├── 05-results.png
└── 06-progress.png
```

---

## Screenshot Processing

### Configure Captions

Edit `assets/app-store/screenshots/captions.json`:

```json
{
  "screenshots": [
    {
      "id": "01-home",
      "filename": "01-home.png",
      "caption": "Fix Your Slice Fast",
      "subtitle": "AI-powered swing analysis"
    }
  ]
}
```

**Caption Guidelines:**
- ✓ Short, clear messaging
- ✓ Accurate feature descriptions
- ✗ No "guaranteed" or "best"
- ✗ No competitor names
- ✗ No medical claims

### Process Screenshots

```bash
npm run appstore:screenshots
```

This:
1. Resizes to target dimensions (1290x2796 for 6.7")
2. Adds caption overlays
3. Applies consistent styling
4. Outputs to `final/en-US/iphone-6.7/`

---

## Validation

```bash
npm run appstore:validate
```

Checks:
- [x] Icon dimensions (1024x1024)
- [x] Icon format (PNG, no transparency)
- [x] Screenshot dimensions
- [x] Screenshot count (3-10 per device)
- [x] No prohibited text in captions
- [x] Color space (sRGB)

---

## App Store Connect Upload

### Required Assets

| Asset | Size | Required |
|-------|------|----------|
| App Icon | 1024x1024 | Yes |
| iPhone 6.7" Screenshots | 1290x2796 | Yes (primary) |
| iPhone 6.5" Screenshots | 1284x2778 | Recommended |
| iPhone 5.5" Screenshots | 1242x2208 | Optional |

### Upload Steps

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → App Information → App Previews and Screenshots
3. Upload screenshots for each device size
4. Upload app icon (usually handled via Xcode build)

### Upload Checklist

- [ ] 1024x1024 app icon uploaded (via Xcode)
- [ ] At least 3 screenshots for iPhone 6.7"
- [ ] Screenshots show real app UI
- [ ] Captions are accurate and compliant
- [ ] No placeholder or lorem ipsum text
- [ ] All text is in English (or localized)

---

## Troubleshooting

### Sharp Installation Issues

```bash
# On Windows, you may need:
npm install --platform=win32 sharp

# On macOS M1/M2:
npm install --arch=arm64 sharp
```

### Screenshots Too Large

The postprocessor automatically resizes. If raw screenshots are much larger, consider capturing at closer to target resolution.

### Fonts Not Rendering

SVG text in captions uses system fonts. Ensure your system has:
- SF Pro Display (macOS)
- Segoe UI (Windows)

### Colors Look Wrong

Ensure screenshots are in sRGB color space. The postprocessor handles this automatically.

---

## NPM Scripts Reference

```bash
# Individual commands
npm run appstore:icons        # Generate icons only
npm run appstore:screenshots  # Process screenshots only
npm run appstore:validate     # Validate assets only

# Combined
npm run appstore:assets       # Generate all + validate

# Direct CLI usage
npx ts-node tools/appstore/index.ts icon
npx ts-node tools/appstore/index.ts screenshots
npx ts-node tools/appstore/index.ts validate
npx ts-node tools/appstore/index.ts all
npx ts-node tools/appstore/index.ts help
```

---

## Apple Compliance Notes

### Icon Requirements
- No transparency
- No "FREE", "NEW", "AI", or pricing text
- Simple, recognizable design
- Works at all sizes (29pt to 1024pt)

### Screenshot Requirements
- Must show actual app UI (not mockups)
- No copyrighted Apple device frames
- Accurate captions only
- No guarantees or promises
- No competitor references
- No medical/health claims

### Rejection Prevention
- [ ] Test all screenshots on device
- [ ] Verify captions match actual features
- [ ] Remove any development/debug UI
- [ ] Check for placeholder text
- [ ] Validate dimensions match requirements

---

## Support

For issues with this asset pipeline:
1. Check the [Troubleshooting](#troubleshooting) section
2. Run `npm run appstore:validate` for diagnostics
3. Open an issue with validation output

---

*Last updated: January 2025*
