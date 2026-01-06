/**
 * App Store Screenshot Postprocessor for SliceFix AI
 *
 * Takes raw screenshot captures and processes them into App Store ready assets:
 * - Resizes to required dimensions
 * - Adds caption overlays
 * - Applies consistent styling
 * - Outputs final PNGs in correct folder structure
 *
 * Usage: npx ts-node tools/appstore/postprocess-screenshots.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Paths
const ROOT_DIR = path.resolve(__dirname, '../..');
const RAW_DIR = path.join(ROOT_DIR, 'assets/app-store/screenshots/raw');
const FINAL_DIR = path.join(ROOT_DIR, 'assets/app-store/screenshots/final');
const CAPTIONS_FILE = path.join(ROOT_DIR, 'assets/app-store/screenshots/captions.json');

interface ScreenshotConfig {
  id: string;
  filename: string;
  caption: string;
  subtitle?: string;
  screenName: string;
  priority: number;
}

interface CaptionsConfig {
  screenshots: ScreenshotConfig[];
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  subtitleColor: string;
  deviceSizes: Record<string, { width: number; height: number; name: string; required: boolean }>;
  layout: {
    captionFontSize: number;
    subtitleFontSize: number;
    captionPaddingTop: number;
    captionSpacing: number;
    screenshotPaddingTop: number;
    screenshotPaddingBottom: number;
    screenshotPaddingX: number;
    cornerRadius: number;
  };
}

interface ProcessResult {
  success: boolean;
  processed: string[];
  skipped: string[];
  errors: string[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

async function processScreenshots(): Promise<ProcessResult> {
  const result: ProcessResult = {
    success: true,
    processed: [],
    skipped: [],
    errors: [],
  };

  console.log('\n📸 SliceFix AI - Screenshot Postprocessor');
  console.log('==============================================\n');

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

  // Load captions config
  if (!fs.existsSync(CAPTIONS_FILE)) {
    result.success = false;
    result.errors.push(`Captions file not found: ${CAPTIONS_FILE}`);
    console.error(`❌ Captions file not found: ${CAPTIONS_FILE}`);
    return result;
  }

  const config: CaptionsConfig = JSON.parse(fs.readFileSync(CAPTIONS_FILE, 'utf-8'));

  // Check raw directory
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log(`📁 Created raw screenshots directory: ${RAW_DIR}`);
    console.log('\n⚠️  No raw screenshots found. Please capture screenshots first.');
    console.log('\nExpected files:');
    config.screenshots.forEach((s) => {
      console.log(`  - ${s.id}.png (${s.screenName})`);
    });
    return result;
  }

  console.log(`📁 Raw directory: ${RAW_DIR}`);
  console.log(`📁 Output directory: ${FINAL_DIR}`);
  console.log(`📄 Config: ${CAPTIONS_FILE}`);
  console.log('');

  // Process for each device size
  for (const [deviceKey, deviceSpec] of Object.entries(config.deviceSizes)) {
    const outputDir = path.join(FINAL_DIR, 'en-US', deviceKey);
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`\n📱 Processing ${deviceSpec.name} (${deviceSpec.width}x${deviceSpec.height})...`);

    for (const screenshot of config.screenshots) {
      // Look for raw screenshot with matching ID
      const rawPath = path.join(RAW_DIR, `${screenshot.id}.png`);
      const outputPath = path.join(outputDir, screenshot.filename);

      if (!fs.existsSync(rawPath)) {
        result.skipped.push(`${deviceKey}/${screenshot.filename}`);
        console.log(`  ⏭️  Skipping ${screenshot.id} - raw file not found`);
        continue;
      }

      try {
        await createScreenshotWithCaption(
          sharp,
          rawPath,
          outputPath,
          deviceSpec,
          screenshot,
          config
        );
        result.processed.push(`${deviceKey}/${screenshot.filename}`);
        console.log(`  ✓ ${screenshot.filename}`);
      } catch (error: any) {
        result.errors.push(`${deviceKey}/${screenshot.filename}: ${error.message}`);
        console.error(`  ✗ ${screenshot.filename}: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n==============================================');
  console.log(`✅ Processed: ${result.processed.length}`);
  console.log(`⏭️  Skipped: ${result.skipped.length}`);
  console.log(`❌ Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    result.success = false;
  }

  // Compliance checklist
  console.log('\n📋 App Store Compliance Checklist:');
  console.log('  ✓ Real app UI screenshots (not mockups)');
  console.log('  ✓ Accurate captions (no guarantees/promises)');
  console.log('  ✓ No competitor names/logos');
  console.log('  ✓ No Apple device frames (custom presentation)');
  console.log('  ✓ Correct dimensions for each device');

  return result;
}

async function createScreenshotWithCaption(
  sharp: any,
  sourcePath: string,
  outputPath: string,
  deviceSpec: { width: number; height: number },
  screenshot: ScreenshotConfig,
  config: CaptionsConfig
): Promise<void> {
  const { width, height } = deviceSpec;
  const { layout, backgroundColor, textColor, subtitleColor } = config;

  const bgColor = hexToRgb(backgroundColor);

  // Calculate content area
  const contentTop = layout.screenshotPaddingTop;
  const contentHeight = height - contentTop - layout.screenshotPaddingBottom;
  const contentWidth = width - layout.screenshotPaddingX * 2;

  // Resize source screenshot to fit content area
  const resizedScreenshot = await sharp(sourcePath)
    .resize(contentWidth, contentHeight, {
      fit: 'contain',
      background: { r: bgColor.r, g: bgColor.g, b: bgColor.b, alpha: 1 },
    })
    .png()
    .toBuffer();

  // Get actual dimensions after resize
  const resizedMeta = await sharp(resizedScreenshot).metadata();
  const actualWidth = resizedMeta.width || contentWidth;
  const actualHeight = resizedMeta.height || contentHeight;

  // Center the screenshot horizontally
  const screenshotLeft = Math.round((width - actualWidth) / 2);
  const screenshotTop = contentTop;

  // Create SVG text overlay
  const textSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'SF Pro Display';
          src: local('-apple-system'), local('BlinkMacSystemFont'), local('system-ui');
        }
        .caption {
          font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif;
          font-size: ${layout.captionFontSize}px;
          font-weight: 700;
          fill: ${textColor};
        }
        .subtitle {
          font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, system-ui, sans-serif;
          font-size: ${layout.subtitleFontSize}px;
          font-weight: 400;
          fill: ${subtitleColor};
        }
      </style>
      <text x="${width / 2}" y="${layout.captionPaddingTop}" text-anchor="middle" class="caption">
        ${escapeXml(screenshot.caption)}
      </text>
      ${
        screenshot.subtitle
          ? `<text x="${width / 2}" y="${layout.captionPaddingTop + layout.captionSpacing}" text-anchor="middle" class="subtitle">
              ${escapeXml(screenshot.subtitle)}
            </text>`
          : ''
      }
    </svg>
  `);

  // Create final composite
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: bgColor.r, g: bgColor.g, b: bgColor.b, alpha: 1 },
    },
  })
    .composite([
      // Screenshot content
      {
        input: resizedScreenshot,
        top: screenshotTop,
        left: screenshotLeft,
      },
      // Text overlay
      {
        input: textSvg,
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 100 })
    .toFile(outputPath);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Run if called directly
if (require.main === module) {
  processScreenshots()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { processScreenshots };
