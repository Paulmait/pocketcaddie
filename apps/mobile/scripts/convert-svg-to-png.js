/**
 * Convert SVG assets to PNG for App Store
 * Usage: node scripts/convert-svg-to-png.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function convertSVGtoPNG(inputFile, outputFile, width, height) {
  const svgPath = path.join(ASSETS_DIR, inputFile);
  const pngPath = path.join(ASSETS_DIR, outputFile);

  if (!fs.existsSync(svgPath)) {
    console.log(`⚠️  ${inputFile} not found, skipping...`);
    return false;
  }

  try {
    const svgBuffer = fs.readFileSync(svgPath);

    await sharp(svgBuffer, { density: 300 })
      .resize(width, height, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 1 } // #0B0F14
      })
      .png()
      .toFile(pngPath);

    console.log(`✅ Created ${outputFile} (${width}x${height})`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${inputFile}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🖼️  Converting SVG assets to PNG...\n');

  // Convert icon (1024x1024 for App Store)
  await convertSVGtoPNG('icon.svg', 'icon.png', 1024, 1024);

  // Convert splash (2732x2732 for largest iPad)
  await convertSVGtoPNG('splash.svg', 'splash.png', 2732, 2732);

  // Convert adaptive icon for Android
  await convertSVGtoPNG('adaptive-icon.svg', 'adaptive-icon.png', 1024, 1024);

  console.log('\n✨ Conversion complete!');
  console.log('\nYour new branded assets are ready:');
  console.log('  - assets/icon.png (App Store icon)');
  console.log('  - assets/splash.png (Launch screen)');
  console.log('  - assets/adaptive-icon.png (Android)');
}

main().catch(console.error);
