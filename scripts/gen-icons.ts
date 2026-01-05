/**
 * App Icon Generator for Pocket Caddie AI
 *
 * This script generates all required iOS app icon sizes from a source SVG.
 * Uses Node.js with sharp for image processing.
 *
 * Usage: npx ts-node scripts/gen-icons.ts
 *
 * Requirements:
 * - npm install sharp @types/sharp
 * - Source SVG at assets/source/app-icon.svg
 */

import * as fs from 'fs';
import * as path from 'path';

// iOS App Icon sizes required for App Store
const IOS_ICON_SIZES = [
  { size: 20, scales: [2, 3], name: 'Icon-20' },
  { size: 29, scales: [2, 3], name: 'Icon-29' },
  { size: 40, scales: [2, 3], name: 'Icon-40' },
  { size: 60, scales: [2, 3], name: 'Icon-60' },
  { size: 76, scales: [1, 2], name: 'Icon-76' },
  { size: 83.5, scales: [2], name: 'Icon-83.5' },
  { size: 1024, scales: [1], name: 'Icon-1024' }, // App Store
];

// Android icon sizes
const ANDROID_ICON_SIZES = [
  { size: 48, name: 'mdpi' },
  { size: 72, name: 'hdpi' },
  { size: 96, name: 'xhdpi' },
  { size: 144, name: 'xxhdpi' },
  { size: 192, name: 'xxxhdpi' },
];

const SOURCE_SVG = path.join(__dirname, '../assets/source/app-icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/generated/icons');

async function generateIcons() {
  console.log('🎨 Pocket Caddie AI - Icon Generator\n');

  // Check if sharp is available
  let sharp: any;
  try {
    sharp = require('sharp');
  } catch {
    console.log('⚠️  Sharp not installed. Creating placeholder script.\n');
    console.log('To enable icon generation, run:');
    console.log('  npm install sharp @types/sharp\n');
    console.log('Then create your source SVG at:');
    console.log(`  ${SOURCE_SVG}\n`);
    createPlaceholderReadme();
    return;
  }

  // Check if source exists
  if (!fs.existsSync(SOURCE_SVG)) {
    console.log('⚠️  Source SVG not found at:', SOURCE_SVG);
    console.log('\nPlease create your app icon SVG and place it at:');
    console.log(`  ${SOURCE_SVG}\n`);
    console.log('Recommended specifications:');
    console.log('  - Size: 1024x1024 px');
    console.log('  - Format: SVG');
    console.log('  - No transparency for iOS App Store icon');
    console.log('  - Safe zone: Keep important content within center 80%\n');
    createPlaceholderReadme();
    return;
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('📁 Output directory:', OUTPUT_DIR);
  console.log('📄 Source:', SOURCE_SVG);
  console.log('');

  // Generate iOS icons
  console.log('🍎 Generating iOS icons...');
  for (const icon of IOS_ICON_SIZES) {
    for (const scale of icon.scales) {
      const pixelSize = Math.round(icon.size * scale);
      const filename = `${icon.name}@${scale}x.png`;
      const outputPath = path.join(OUTPUT_DIR, 'ios', filename);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      await sharp(SOURCE_SVG)
        .resize(pixelSize, pixelSize)
        .png()
        .toFile(outputPath);

      console.log(`  ✓ ${filename} (${pixelSize}x${pixelSize})`);
    }
  }

  // Generate Android icons
  console.log('\n🤖 Generating Android icons...');
  for (const icon of ANDROID_ICON_SIZES) {
    const filename = `ic_launcher.png`;
    const outputPath = path.join(OUTPUT_DIR, 'android', icon.name, filename);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(SOURCE_SVG)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`  ✓ ${icon.name}/${filename} (${icon.size}x${icon.size})`);
  }

  // Generate Expo assets
  console.log('\n📱 Generating Expo assets...');
  const expoAssets = [
    { size: 1024, name: 'icon.png' },
    { size: 1284, name: 'splash.png', width: 1284, height: 2778 },
    { size: 1024, name: 'adaptive-icon.png' },
  ];

  const expoOutputDir = path.join(__dirname, '../apps/mobile/assets');
  fs.mkdirSync(expoOutputDir, { recursive: true });

  for (const asset of expoAssets) {
    const outputPath = path.join(expoOutputDir, asset.name);

    if (asset.width && asset.height) {
      // Splash screen - create with background
      await sharp({
        create: {
          width: asset.width,
          height: asset.height,
          channels: 4,
          background: { r: 11, g: 15, b: 20, alpha: 1 }, // #0B0F14
        },
      })
        .composite([
          {
            input: await sharp(SOURCE_SVG)
              .resize(400, 400)
              .toBuffer(),
            gravity: 'center',
          },
        ])
        .png()
        .toFile(outputPath);
    } else {
      await sharp(SOURCE_SVG)
        .resize(asset.size, asset.size)
        .png()
        .toFile(outputPath);
    }

    console.log(`  ✓ ${asset.name}`);
  }

  console.log('\n✅ Icon generation complete!');
}

function createPlaceholderReadme() {
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const content = `# Generated Icons

This folder will contain generated app icons once you:

1. Install sharp: \`npm install sharp @types/sharp\`
2. Create your source SVG at \`assets/source/app-icon.svg\`
3. Run: \`npm run gen:icons\`

## Source SVG Requirements

- Size: 1024x1024 px
- Format: SVG (will be converted to PNG)
- No transparency for iOS App Store icon
- Keep important content within center 80% (safe zone)

## Generated Output

- iOS icons (all required sizes and scales)
- Android icons (mdpi through xxxhdpi)
- Expo assets (icon.png, splash.png, adaptive-icon.png)
`;

  fs.writeFileSync(readmePath, content);
  console.log('📄 Created placeholder README at:', readmePath);
}

generateIcons().catch(console.error);
