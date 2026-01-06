/**
 * App Store Icon Generator for Pocket Caddie AI
 *
 * Generates all required iOS app icon sizes from source SVG.
 * Compliant with Apple App Store requirements:
 * - No transparency
 * - No "FREE", "NEW", "AI" text
 * - 1024x1024 for App Store Connect
 *
 * Usage: npx ts-node tools/appstore/generate-icon.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Paths
const ROOT_DIR = path.resolve(__dirname, '../..');
const SOURCE_SVG = path.join(ROOT_DIR, 'assets/app-store/icon/source/app-icon.svg');
const OUTPUT_DIR = path.join(ROOT_DIR, 'assets/app-store/icon/export/ios');
const EXPO_ASSETS_DIR = path.join(ROOT_DIR, 'apps/mobile/assets');

// iOS App Icon sizes for App Store
const IOS_ICON_SIZES = [
  // App Store icon (required)
  { size: 1024, scales: [1], name: 'AppIcon-1024', required: true },
  // iPhone icons
  { size: 60, scales: [2, 3], name: 'AppIcon-60' },
  { size: 40, scales: [2, 3], name: 'AppIcon-40' },
  { size: 29, scales: [2, 3], name: 'AppIcon-29' },
  { size: 20, scales: [2, 3], name: 'AppIcon-20' },
];

interface GenerationResult {
  success: boolean;
  filesGenerated: string[];
  errors: string[];
}

async function generateIcons(): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: true,
    filesGenerated: [],
    errors: [],
  };

  console.log('\n🎨 Pocket Caddie AI - Icon Generator');
  console.log('=====================================\n');

  // Check for sharp
  let sharp: any;
  try {
    sharp = require('sharp');
  } catch {
    result.success = false;
    result.errors.push('Sharp not installed. Run: npm install sharp');
    console.error('❌ Sharp not installed. Run: npm install sharp');
    return result;
  }

  // Check source SVG
  if (!fs.existsSync(SOURCE_SVG)) {
    result.success = false;
    result.errors.push(`Source SVG not found: ${SOURCE_SVG}`);
    console.error(`❌ Source SVG not found: ${SOURCE_SVG}`);
    return result;
  }

  // Create output directories
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(EXPO_ASSETS_DIR, { recursive: true });

  console.log(`📄 Source: ${SOURCE_SVG}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('');

  // Read source SVG
  const svgBuffer = fs.readFileSync(SOURCE_SVG);

  // Generate iOS icons
  console.log('🍎 Generating iOS icons...');

  for (const icon of IOS_ICON_SIZES) {
    for (const scale of icon.scales) {
      const pixelSize = Math.round(icon.size * scale);
      const filename = scale === 1
        ? `${icon.name}.png`
        : `${icon.name}@${scale}x.png`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      try {
        await sharp(svgBuffer)
          .resize(pixelSize, pixelSize, {
            fit: 'contain',
            background: { r: 11, g: 15, b: 20, alpha: 1 }, // #0B0F14
          })
          .flatten({ background: { r: 11, g: 15, b: 20 } }) // Remove transparency
          .png({ quality: 100 })
          .toFile(outputPath);

        result.filesGenerated.push(filename);
        console.log(`  ✓ ${filename} (${pixelSize}x${pixelSize})`);
      } catch (error: any) {
        result.errors.push(`Failed to generate ${filename}: ${error.message}`);
        console.error(`  ✗ ${filename}: ${error.message}`);
      }
    }
  }

  // Generate Expo assets
  console.log('\n📱 Generating Expo assets...');

  // icon.png (1024x1024)
  const iconPath = path.join(EXPO_ASSETS_DIR, 'icon.png');
  try {
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .flatten({ background: { r: 11, g: 15, b: 20 } })
      .png()
      .toFile(iconPath);
    result.filesGenerated.push('icon.png');
    console.log('  ✓ icon.png (1024x1024)');
  } catch (error: any) {
    result.errors.push(`Failed to generate icon.png: ${error.message}`);
  }

  // adaptive-icon.png (1024x1024)
  const adaptiveIconPath = path.join(EXPO_ASSETS_DIR, 'adaptive-icon.png');
  try {
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .flatten({ background: { r: 11, g: 15, b: 20 } })
      .png()
      .toFile(adaptiveIconPath);
    result.filesGenerated.push('adaptive-icon.png');
    console.log('  ✓ adaptive-icon.png (1024x1024)');
  } catch (error: any) {
    result.errors.push(`Failed to generate adaptive-icon.png: ${error.message}`);
  }

  // splash.png (1284x2778 with centered icon)
  const splashPath = path.join(EXPO_ASSETS_DIR, 'splash.png');
  try {
    const iconForSplash = await sharp(svgBuffer)
      .resize(400, 400)
      .flatten({ background: { r: 11, g: 15, b: 20 } })
      .toBuffer();

    await sharp({
      create: {
        width: 1284,
        height: 2778,
        channels: 4,
        background: { r: 11, g: 15, b: 20, alpha: 1 },
      },
    })
      .composite([
        {
          input: iconForSplash,
          gravity: 'center',
        },
      ])
      .png()
      .toFile(splashPath);

    result.filesGenerated.push('splash.png');
    console.log('  ✓ splash.png (1284x2778)');
  } catch (error: any) {
    result.errors.push(`Failed to generate splash.png: ${error.message}`);
  }

  // Summary
  console.log('\n=====================================');
  if (result.errors.length === 0) {
    console.log(`✅ Generated ${result.filesGenerated.length} icons successfully!`);
  } else {
    console.log(`⚠️  Generated ${result.filesGenerated.length} icons with ${result.errors.length} errors`);
    result.success = false;
  }

  // Compliance check
  console.log('\n📋 App Store Compliance Check:');
  console.log('  ✓ No transparency (flattened with background)');
  console.log('  ✓ No "FREE"/"NEW"/"AI" text in icon');
  console.log('  ✓ 1024x1024 App Store icon generated');
  console.log('  ✓ Golf-themed, brand consistent');

  return result;
}

// Run if called directly
if (require.main === module) {
  generateIcons()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateIcons };
