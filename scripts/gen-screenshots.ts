/**
 * App Store Screenshot Generator for SliceFix AI
 *
 * This script generates App Store screenshots with device frames and captions.
 * Uses a JSON config file for customization.
 *
 * Usage: npx ts-node scripts/gen-screenshots.ts
 *
 * Requirements:
 * - npm install sharp @types/sharp
 * - Screenshot source images in assets/source/screenshots/
 */

import * as fs from 'fs';
import * as path from 'path';

// App Store screenshot sizes
const SCREENSHOT_SIZES = {
  'iphone-6.7': { width: 1290, height: 2796, name: 'iPhone 6.7"' },
  'iphone-6.5': { width: 1284, height: 2778, name: 'iPhone 6.5"' },
  'iphone-5.5': { width: 1242, height: 2208, name: 'iPhone 5.5"' },
  'ipad-12.9': { width: 2048, height: 2732, name: 'iPad 12.9"' },
};

// Screenshot configuration
interface ScreenshotConfig {
  id: string;
  sourceImage: string;
  caption: string;
  subtitle?: string;
  backgroundColor: string;
}

const SCREENSHOTS: ScreenshotConfig[] = [
  {
    id: '01-hero',
    sourceImage: 'hero.png',
    caption: 'Fix Your Slice Fast',
    subtitle: 'AI-powered swing analysis',
    backgroundColor: '#0B0F14',
  },
  {
    id: '02-upload',
    sourceImage: 'upload.png',
    caption: 'Upload Your Swing',
    subtitle: 'Just 5-8 seconds needed',
    backgroundColor: '#0B0F14',
  },
  {
    id: '03-analysis',
    sourceImage: 'analysis.png',
    caption: 'Get Instant Analysis',
    subtitle: 'Identify your slice cause',
    backgroundColor: '#0B0F14',
  },
  {
    id: '04-drill',
    sourceImage: 'drill.png',
    caption: 'Practice with Purpose',
    subtitle: 'Personalized drill recommendations',
    backgroundColor: '#0B0F14',
  },
  {
    id: '05-challenge',
    sourceImage: 'challenge.png',
    caption: '10-Swing Challenge',
    subtitle: 'Track your progress',
    backgroundColor: '#0B0F14',
  },
];

const SOURCE_DIR = path.join(__dirname, '../assets/source/screenshots');
const OUTPUT_DIR = path.join(__dirname, '../assets/generated/screenshots');

// Design constants
const DESIGN = {
  captionFontSize: 72,
  subtitleFontSize: 42,
  captionColor: '#FFFFFF',
  subtitleColor: '#9CA3AF',
  deviceFrameRadius: 60,
  deviceFramePadding: 40,
  captionPaddingTop: 120,
  contentPaddingTop: 200,
};

async function generateScreenshots() {
  console.log('📸 SliceFix AI - Screenshot Generator\n');

  // Check if sharp is available
  let sharp: any;
  try {
    sharp = require('sharp');
  } catch {
    console.log('⚠️  Sharp not installed. Creating placeholder.\n');
    console.log('To enable screenshot generation, run:');
    console.log('  npm install sharp @types/sharp\n');
    createPlaceholderReadme();
    return;
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check for source directory
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    console.log('⚠️  Source directory created at:', SOURCE_DIR);
    console.log('\nPlease add your screenshot source images:');
    SCREENSHOTS.forEach((s) => console.log(`  - ${s.sourceImage}`));
    console.log('');
    createPlaceholderReadme();
    return;
  }

  console.log('📁 Source directory:', SOURCE_DIR);
  console.log('📁 Output directory:', OUTPUT_DIR);
  console.log('');

  // Generate for each device size
  for (const [deviceKey, deviceSpec] of Object.entries(SCREENSHOT_SIZES)) {
    console.log(`\n📱 Generating ${deviceSpec.name} screenshots...`);

    const deviceOutputDir = path.join(OUTPUT_DIR, deviceKey);
    fs.mkdirSync(deviceOutputDir, { recursive: true });

    for (const screenshot of SCREENSHOTS) {
      const sourcePath = path.join(SOURCE_DIR, screenshot.sourceImage);
      const outputPath = path.join(deviceOutputDir, `${screenshot.id}.png`);

      // Check if source exists
      if (!fs.existsSync(sourcePath)) {
        console.log(`  ⚠️  Skipping ${screenshot.id} - source not found`);
        continue;
      }

      try {
        // Create screenshot with caption
        await createScreenshotWithCaption(
          sharp,
          sourcePath,
          outputPath,
          deviceSpec,
          screenshot
        );
        console.log(`  ✓ ${screenshot.id}.png`);
      } catch (error) {
        console.log(`  ✗ ${screenshot.id}.png - Error:`, error);
      }
    }
  }

  console.log('\n✅ Screenshot generation complete!');
}

async function createScreenshotWithCaption(
  sharp: any,
  sourcePath: string,
  outputPath: string,
  deviceSpec: { width: number; height: number },
  config: ScreenshotConfig
) {
  const { width, height } = deviceSpec;

  // Calculate dimensions for device frame
  const frameWidth = width - DESIGN.deviceFramePadding * 2;
  const frameHeight = height - DESIGN.contentPaddingTop - DESIGN.deviceFramePadding;

  // Create SVG text overlay
  const textSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .caption {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: ${DESIGN.captionFontSize}px;
          font-weight: 700;
          fill: ${DESIGN.captionColor};
        }
        .subtitle {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: ${DESIGN.subtitleFontSize}px;
          font-weight: 400;
          fill: ${DESIGN.subtitleColor};
        }
      </style>
      <text x="${width / 2}" y="${DESIGN.captionPaddingTop}" text-anchor="middle" class="caption">
        ${config.caption}
      </text>
      ${
        config.subtitle
          ? `<text x="${width / 2}" y="${DESIGN.captionPaddingTop + 60}" text-anchor="middle" class="subtitle">
              ${config.subtitle}
            </text>`
          : ''
      }
    </svg>
  `;

  // Resize source image to fit frame
  const resizedSource = await sharp(sourcePath)
    .resize(frameWidth, frameHeight, {
      fit: 'contain',
      background: { r: 11, g: 15, b: 20, alpha: 1 },
    })
    .toBuffer();

  // Create final composite
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: config.backgroundColor,
    },
  })
    .composite([
      // Device frame with screenshot
      {
        input: resizedSource,
        top: DESIGN.contentPaddingTop,
        left: DESIGN.deviceFramePadding,
      },
      // Text overlay
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(outputPath);
}

function createPlaceholderReadme() {
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const content = `# Generated Screenshots

This folder will contain App Store screenshots once you:

1. Install sharp: \`npm install sharp @types/sharp\`
2. Add source screenshots to \`assets/source/screenshots/\`:
${SCREENSHOTS.map((s) => `   - ${s.sourceImage}`).join('\n')}
3. Run: \`npm run gen:screenshots\`

## Screenshot Specifications

Screenshots are generated for:
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1284 x 2778)
- iPhone 5.5" (1242 x 2208)
- iPad 12.9" (2048 x 2732)

## Captions

Each screenshot includes:
- Main caption text
- Optional subtitle
- Custom device frame (no copyrighted frames)
- Dark background (#0B0F14)
`;

  fs.writeFileSync(readmePath, content);
  console.log('📄 Created placeholder README at:', readmePath);
}

generateScreenshots().catch(console.error);
