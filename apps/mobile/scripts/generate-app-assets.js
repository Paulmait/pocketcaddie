/**
 * SliceFix AI - App Asset Generator
 * Generates icon and splash screen for iOS App Store
 *
 * Usage: node scripts/generate-app-assets.js
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas, fall back to creating SVG files
let createCanvas, loadImage;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (e) {
  console.log('Canvas not available, generating SVG files instead');
}

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Brand colors
const COLORS = {
  background: '#0B0F14',
  primary: '#10B981',      // Green
  primaryLight: '#34D399',
  secondary: '#F59E0B',    // Amber/Gold
  white: '#FFFFFF',
  glow: 'rgba(16, 185, 129, 0.3)',
};

/**
 * Generate App Icon (1024x1024 for App Store)
 */
function generateIconSVG() {
  const size = 1024;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#0B0F14"/>
    </linearGradient>
    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10B981"/>
      <stop offset="100%" style="stop-color:#34D399"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bgGrad)" rx="180"/>

  <!-- Swing arc (corrected path - straight to curved) -->
  <g transform="translate(${size/2}, ${size/2 + 80})">
    <!-- Curved slice path (the problem) - red/faded -->
    <path d="M -280 100 Q -100 -200 280 100"
          stroke="#EF4444"
          stroke-width="24"
          fill="none"
          opacity="0.3"
          stroke-dasharray="20,15"/>

    <!-- Straight corrected path (the fix) - green/bright -->
    <path d="M -280 100 Q 0 -280 280 100"
          stroke="url(#arcGrad)"
          stroke-width="28"
          fill="none"
          filter="url(#glow)"
          stroke-linecap="round"/>

    <!-- Golf ball -->
    <circle cx="0" cy="-180" r="55" fill="${COLORS.white}"/>
    <circle cx="-15" cy="-195" r="8" fill="#E5E7EB"/>
    <circle cx="15" cy="-195" r="8" fill="#E5E7EB"/>
    <circle cx="0" cy="-170" r="8" fill="#E5E7EB"/>
    <circle cx="-20" cy="-170" r="6" fill="#E5E7EB"/>
    <circle cx="20" cy="-170" r="6" fill="#E5E7EB"/>
  </g>

  <!-- "S" Letter for SliceFix -->
  <text x="${size/2}" y="${size/2 - 180}"
        font-family="Arial Black, Arial, sans-serif"
        font-size="320"
        font-weight="900"
        fill="${COLORS.secondary}"
        text-anchor="middle"
        filter="url(#textGlow)">S</text>

  <!-- FIX badge -->
  <g transform="translate(${size/2 + 200}, ${size/2 + 220})">
    <rect x="-70" y="-35" width="140" height="70" rx="35" fill="${COLORS.primary}"/>
    <text x="0" y="12"
          font-family="Arial Black, Arial, sans-serif"
          font-size="42"
          font-weight="900"
          fill="${COLORS.white}"
          text-anchor="middle">FIX</text>
  </g>
</svg>`;

  return svg;
}

/**
 * Generate Splash Screen (2732x2732 for iPad, centered content)
 */
function generateSplashSVG() {
  const size = 2732;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#0B0F14"/>
    </linearGradient>
    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10B981"/>
      <stop offset="100%" style="stop-color:#34D399"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>

  <!-- Centered content group -->
  <g transform="translate(${size/2}, ${size/2})">

    <!-- "S" Letter -->
    <text x="0" y="-100"
          font-family="Arial Black, Arial, sans-serif"
          font-size="400"
          font-weight="900"
          fill="${COLORS.secondary}"
          text-anchor="middle">S</text>

    <!-- Swing arc -->
    <g transform="translate(0, 100)">
      <!-- Curved slice path (faded) -->
      <path d="M -200 80 Q -70 -150 200 80"
            stroke="#EF4444"
            stroke-width="16"
            fill="none"
            opacity="0.25"
            stroke-dasharray="15,12"/>

      <!-- Straight path (bright) -->
      <path d="M -200 80 Q 0 -200 200 80"
            stroke="url(#arcGrad)"
            stroke-width="20"
            fill="none"
            filter="url(#glow)"
            stroke-linecap="round"/>

      <!-- Golf ball -->
      <circle cx="0" cy="-130" r="40" fill="${COLORS.white}"/>
      <circle cx="-10" cy="-140" r="6" fill="#E5E7EB"/>
      <circle cx="10" cy="-140" r="6" fill="#E5E7EB"/>
      <circle cx="0" cy="-125" r="6" fill="#E5E7EB"/>
    </g>

    <!-- FIX badge -->
    <g transform="translate(150, 180)">
      <rect x="-55" y="-28" width="110" height="56" rx="28" fill="${COLORS.primary}"/>
      <text x="0" y="10"
            font-family="Arial Black, Arial, sans-serif"
            font-size="32"
            font-weight="900"
            fill="${COLORS.white}"
            text-anchor="middle">FIX</text>
    </g>

    <!-- App name -->
    <text x="0" y="350"
          font-family="Arial, sans-serif"
          font-size="72"
          font-weight="700"
          fill="${COLORS.white}"
          text-anchor="middle">SliceFix AI</text>

    <!-- Tagline -->
    <text x="0" y="420"
          font-family="Arial, sans-serif"
          font-size="36"
          fill="#9CA3AF"
          text-anchor="middle">Fix Your Slice Fast</text>
  </g>
</svg>`;

  return svg;
}

/**
 * Generate Adaptive Icon (Android) SVG
 */
function generateAdaptiveIconSVG() {
  const size = 1024;
  // Same as main icon but without rounded corners (Android handles masking)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="100%" style="stop-color:#0B0F14"/>
    </linearGradient>
    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10B981"/>
      <stop offset="100%" style="stop-color:#34D399"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>

  <!-- Swing arc -->
  <g transform="translate(${size/2}, ${size/2 + 80})">
    <path d="M -280 100 Q -100 -200 280 100"
          stroke="#EF4444"
          stroke-width="24"
          fill="none"
          opacity="0.3"
          stroke-dasharray="20,15"/>

    <path d="M -280 100 Q 0 -280 280 100"
          stroke="url(#arcGrad)"
          stroke-width="28"
          fill="none"
          filter="url(#glow)"
          stroke-linecap="round"/>

    <circle cx="0" cy="-180" r="55" fill="${COLORS.white}"/>
    <circle cx="-15" cy="-195" r="8" fill="#E5E7EB"/>
    <circle cx="15" cy="-195" r="8" fill="#E5E7EB"/>
    <circle cx="0" cy="-170" r="8" fill="#E5E7EB"/>
  </g>

  <!-- "S" Letter -->
  <text x="${size/2}" y="${size/2 - 180}"
        font-family="Arial Black, Arial, sans-serif"
        font-size="320"
        font-weight="900"
        fill="${COLORS.secondary}"
        text-anchor="middle">S</text>

  <!-- FIX badge -->
  <g transform="translate(${size/2 + 200}, ${size/2 + 220})">
    <rect x="-70" y="-35" width="140" height="70" rx="35" fill="${COLORS.primary}"/>
    <text x="0" y="12"
          font-family="Arial Black, Arial, sans-serif"
          font-size="42"
          font-weight="900"
          fill="${COLORS.white}"
          text-anchor="middle">FIX</text>
  </g>
</svg>`;

  return svg;
}

// Main execution
async function main() {
  console.log('🎨 Generating SliceFix AI App Assets...\n');

  // Ensure assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Generate SVG files
  const iconSVG = generateIconSVG();
  const splashSVG = generateSplashSVG();
  const adaptiveSVG = generateAdaptiveIconSVG();

  // Save SVG files
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.svg'), iconSVG);
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.svg'), splashSVG);
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.svg'), adaptiveSVG);

  console.log('✅ Generated SVG files:');
  console.log('   - assets/icon.svg');
  console.log('   - assets/splash.svg');
  console.log('   - assets/adaptive-icon.svg');
  console.log('\n📝 To convert to PNG, use one of these methods:');
  console.log('   1. Online: https://svgtopng.com/');
  console.log('   2. Inkscape: inkscape icon.svg -w 1024 -h 1024 -o icon.png');
  console.log('   3. ImageMagick: convert icon.svg icon.png');
  console.log('\n📏 Required sizes:');
  console.log('   - icon.png: 1024x1024');
  console.log('   - splash.png: 2732x2732 (or use resizeMode: contain)');
  console.log('   - adaptive-icon.png: 1024x1024');
}

main().catch(console.error);
