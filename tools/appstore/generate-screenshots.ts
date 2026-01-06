/**
 * Synthetic Screenshot Generator for Pocket Caddie AI
 *
 * Generates App Store screenshots programmatically using Sharp.
 * Based on the actual screen layouts and design system.
 *
 * Usage: npx ts-node --transpile-only tools/appstore/generate-screenshots.ts
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

const OUTPUT_DIR = path.join(process.cwd(), 'assets/app-store/screenshots/raw');

// iPhone 6.7" dimensions (iPhone 15 Pro Max)
const SCREEN_WIDTH = 1290;
const SCREEN_HEIGHT = 2796;

// Design System (from theme.ts)
const colors = {
  background: {
    primary: '#0B0F14',
    secondary: '#12171E',
    tertiary: '#1A2028',
  },
  primary: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
  },
  secondary: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
  },
  surface: {
    glass: 'rgba(255, 255, 255, 0.05)',
    glassLight: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

const spacing = {
  xs: 4 * 3, // Scale for high DPI
  sm: 8 * 3,
  md: 16 * 3,
  lg: 24 * 3,
  xl: 32 * 3,
  xxl: 48 * 3,
};

// =============================================================================
// SVG HELPERS
// =============================================================================

function createRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  rx: number = 0
): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="${rx}" />`;
}

function createText(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  fill: string,
  fontWeight: string = 'normal',
  textAnchor: string = 'start'
): string {
  return `<text x="${x}" y="${y}" font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}" text-anchor="${textAnchor}">${escapeXml(text)}</text>`;
}

function createCircle(cx: number, cy: number, r: number, fill: string, stroke?: string, strokeWidth?: number): string {
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth || 2}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${strokeAttr} />`;
}

function createGlassCard(x: number, y: number, width: number, height: number, rx: number = 36): string {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#1A2028" rx="${rx}" />
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" rx="${rx}" />
  `;
}

function createButton(x: number, y: number, width: number, height: number, text: string, primary: boolean = true): string {
  const fill = primary ? colors.primary.main : 'transparent';
  const textColor = primary ? colors.text.primary : colors.primary.light;
  const stroke = primary ? '' : `stroke="${colors.primary.light}" stroke-width="2"`;
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="36" ${stroke} />
    ${createText(x + width / 2, y + height / 2 + 15, text, 48, textColor, '600', 'middle')}
  `;
}

function createProgressRing(cx: number, cy: number, r: number, progress: number, strokeWidth: number = 12): string {
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.surface.glass}" stroke-width="${strokeWidth}" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.primary.light}" stroke-width="${strokeWidth}"
      stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
      transform="rotate(-90 ${cx} ${cy})" />
    <text x="${cx}" y="${cy + 12}" font-family="SF Pro Display, sans-serif" font-size="36" font-weight="600" fill="${colors.text.primary}" text-anchor="middle">${Math.round(progress * 100)}%</text>
  `;
}

// Ionicons-style icons (simplified SVG paths)
const icons = {
  videocam: `<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/>`,
  settings: `<path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>`,
  flame: `<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="currentColor"/>`,
  checkmark: `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>`,
  arrowForward: `<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"/>`,
  arrowBack: `<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>`,
  images: `<path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" fill="currentColor"/>`,
  analytics: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>`,
  trendingUp: `<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>`,
  close: `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>`,
  time: `<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>`,
  sunny: `<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" fill="currentColor"/>`,
  body: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>`,
  phone: `<path d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" fill="currentColor"/>`,
  star: `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>`,
  share: `<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>`,
  shield: `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>`,
  repeat: `<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="currentColor"/>`,
  alert: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>`,
  grid: `<path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" fill="currentColor"/>`,
  camera: `<path d="M12 15.2c1.2 0 2.2-1 2.2-2.2S13.2 10.8 12 10.8s-2.2 1-2.2 2.2 1 2.2 2.2 2.2zm8-7.2h-3.2l-1.8-2H9l-1.8 2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8 11c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor"/>`,
  bulb: `<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>`,
};

function createIcon(name: keyof typeof icons, x: number, y: number, size: number, color: string): string {
  const scale = size / 24;
  return `<g transform="translate(${x}, ${y}) scale(${scale})" color="${color}">${icons[name]}</g>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Status bar
function createStatusBar(time: string = '9:41'): string {
  return `
    <!-- Status Bar -->
    <rect x="0" y="0" width="${SCREEN_WIDTH}" height="132" fill="${colors.background.primary}" />
    ${createText(60, 90, time, 48, colors.text.primary, '600')}
    <!-- Signal, WiFi, Battery indicators -->
    <g transform="translate(${SCREEN_WIDTH - 280}, 60)">
      <!-- Signal bars -->
      <rect x="0" y="20" width="12" height="20" fill="${colors.text.primary}" rx="2" />
      <rect x="18" y="14" width="12" height="26" fill="${colors.text.primary}" rx="2" />
      <rect x="36" y="8" width="12" height="32" fill="${colors.text.primary}" rx="2" />
      <rect x="54" y="2" width="12" height="38" fill="${colors.text.primary}" rx="2" />
      <!-- WiFi -->
      <path d="M100,30 L114,8 L128,30 Z" fill="${colors.text.primary}" />
      <!-- Battery -->
      <rect x="150" y="8" width="60" height="28" rx="6" stroke="${colors.text.primary}" stroke-width="2" fill="none" />
      <rect x="154" y="12" width="50" height="20" rx="4" fill="${colors.primary.light}" />
      <rect x="210" y="14" width="6" height="16" rx="2" fill="${colors.text.primary}" />
    </g>
  `;
}

// Home indicator
function createHomeIndicator(): string {
  return `<rect x="${(SCREEN_WIDTH - 420) / 2}" y="${SCREEN_HEIGHT - 60}" width="420" height="15" fill="${colors.text.secondary}" rx="7" />`;
}

// =============================================================================
// SCREEN GENERATORS
// =============================================================================

function generateHomeScreen(): string {
  const safeTop = 132;
  const paddingX = spacing.lg;
  const cardWidth = SCREEN_WIDTH - paddingX * 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="${colors.background.primary}" />

  ${createStatusBar()}

  <!-- Header -->
  <g transform="translate(${paddingX}, ${safeTop + spacing.md})">
    ${createText(0, 48, 'Welcome back', 42, colors.text.secondary)}
    ${createText(0, 120, 'Fix Your Slice', 72, colors.text.primary, '700')}
    ${createText(0, 165, "America's #1 Slice Fixer", 36, colors.primary.light, '600')}

    <!-- Streak Badge -->
    <g transform="translate(${cardWidth - 220}, 60)">
      <rect x="0" y="0" width="150" height="75" fill="rgba(245,158,11,0.2)" rx="37" />
      ${createIcon('flame', 20, 18, 45, colors.secondary.main)}
      ${createText(80, 52, '7', 48, colors.secondary.main, '700')}
    </g>

    <!-- Settings icon -->
    <g transform="translate(${cardWidth - 50}, 60)">
      ${createIcon('settings', 0, 0, 72, colors.text.primary)}
    </g>
  </g>

  <!-- Upload Card -->
  <g transform="translate(${paddingX}, ${safeTop + 260})">
    ${createGlassCard(0, 0, cardWidth, 450)}
    <g transform="translate(${cardWidth / 2}, 100)">
      ${createIcon('videocam', -60, -60, 120, colors.primary.light)}
    </g>
    ${createText(cardWidth / 2, 200, 'Analyze Your Swing', 60, colors.text.primary, '600', 'middle')}
    ${createText(cardWidth / 2, 270, 'Upload a 5-8 second swing video and get', 45, colors.text.secondary, 'normal', 'middle')}
    ${createText(cardWidth / 2, 325, "instant feedback on what's causing your slice.", 45, colors.text.secondary, 'normal', 'middle')}
    ${createButton(spacing.lg, 370, cardWidth - spacing.lg * 2, 120, 'Upload Swing Video')}
  </g>

  <!-- Your Analyses Section -->
  <g transform="translate(${paddingX}, ${safeTop + 750})">
    ${createText(0, 54, 'Your Analyses', 54, colors.text.primary, '600')}

    <!-- Analysis Card 1 -->
    ${createGlassCard(0, 90, cardWidth, 210)}
    <g transform="translate(${spacing.md}, 120)">
      ${createText(0, 48, 'Open Clubface at Impact', 48, colors.text.primary, '600')}
      ${createText(0, 100, 'Jan 15', 39, colors.text.tertiary)}
      ${createText(0, 150, 'Drill: Toe-Up to Toe-Up Drill', 42, colors.text.secondary)}
    </g>
    <g transform="translate(${cardWidth - 180}, 150)">
      ${createProgressRing(60, 60, 60, 0.4)}
    </g>

    <!-- Analysis Card 2 -->
    ${createGlassCard(0, 330, cardWidth, 210)}
    <g transform="translate(${spacing.md}, 360)">
      ${createText(0, 48, 'Out-to-In Swing Path', 48, colors.text.primary, '600')}
      ${createText(0, 100, 'Jan 12', 39, colors.text.tertiary)}
      ${createText(0, 150, 'Drill: Headcover Gate Drill', 42, colors.text.secondary)}
    </g>
    <g transform="translate(${cardWidth - 180}, 390)">
      ${createProgressRing(60, 60, 60, 0.7)}
    </g>
  </g>

  <!-- Success Stories Section -->
  <g transform="translate(${paddingX}, ${safeTop + 1360})">
    ${createText(0, 54, 'Success Stories', 54, colors.text.primary, '600')}

    <!-- Success Card 1 -->
    ${createGlassCard(0, 90, 480, 270)}
    <g transform="translate(${spacing.md}, 120)">
      <circle cx="48" cy="48" r="48" fill="${colors.primary.main}" />
      ${createText(48, 60, 'M', 48, 'white', '700', 'middle')}
      ${createText(120, 55, 'Mike T.', 42, colors.text.primary, '600')}
      ${createText(0, 150, 'Fixed grip issue', 48, colors.text.primary, '500')}
      ${createIcon('checkmark', 0, 180, 42, colors.status.success)}
      ${createText(50, 212, 'Fixed in 3 sessions', 36, colors.status.success)}
    </g>

    <!-- Success Card 2 -->
    ${createGlassCard(510, 90, 480, 270)}
    <g transform="translate(${510 + spacing.md}, 120)">
      <circle cx="48" cy="48" r="48" fill="${colors.primary.main}" />
      ${createText(48, 60, 'S', 48, 'white', '700', 'middle')}
      ${createText(120, 55, 'Sarah K.', 42, colors.text.primary, '600')}
      ${createText(0, 150, 'Eliminated over-the-top', 45, colors.text.primary, '500')}
      ${createIcon('checkmark', 0, 180, 42, colors.status.success)}
      ${createText(50, 212, 'Fixed in 5 sessions', 36, colors.status.success)}
    </g>
  </g>

  <!-- View Progress Card -->
  <g transform="translate(${paddingX}, ${safeTop + 1760})">
    ${createGlassCard(0, 0, cardWidth, 180)}
    <g transform="translate(${spacing.md}, 45)">
      ${createIcon('trendingUp', 0, 0, 72, colors.primary.light)}
      ${createText(100, 40, 'View Your Progress', 48, colors.text.primary, '600')}
      ${createText(100, 95, '+24% improvement \u2022 8 analyses', 42, colors.text.secondary)}
    </g>
    <g transform="translate(${cardWidth - 90}, 68)">
      ${createIcon('arrowForward', 0, 0, 60, colors.text.tertiary)}
    </g>
  </g>

  <!-- Community Stats -->
  ${createText(SCREEN_WIDTH / 2, safeTop + 2020, 'Join 10,000+ golfers who have improved their slice', 42, colors.text.tertiary, 'normal', 'middle')}

  ${createHomeIndicator()}
</svg>`;
}

function generateUploadScreen(): string {
  const safeTop = 132;
  const paddingX = spacing.lg;
  const cardWidth = SCREEN_WIDTH - paddingX * 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="${colors.background.primary}" />

  ${createStatusBar()}

  <!-- Header -->
  <g transform="translate(0, ${safeTop})">
    <g transform="translate(${paddingX}, ${spacing.md})">
      ${createIcon('arrowBack', 0, 0, 72, colors.text.primary)}
    </g>
    ${createText(SCREEN_WIDTH / 2, spacing.md + 54, 'Upload Swing', 60, colors.text.primary, '600', 'middle')}
  </g>

  <!-- Tips Card -->
  <g transform="translate(${paddingX}, ${safeTop + 150})">
    ${createGlassCard(0, 0, cardWidth, 360)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      ${createText(0, 54, 'Tips for Best Results', 48, colors.text.primary, '600')}

      <!-- Tips -->
      <g transform="translate(0, 90)">
        ${createIcon('time', 0, 0, 60, colors.primary.light)}
        ${createText(80, 42, '5-8 seconds', 42, colors.text.secondary)}
      </g>
      <g transform="translate(0, 160)">
        ${createIcon('sunny', 0, 0, 60, colors.primary.light)}
        ${createText(80, 42, 'Good lighting', 42, colors.text.secondary)}
      </g>
      <g transform="translate(0, 230)">
        ${createIcon('body', 0, 0, 60, colors.primary.light)}
        ${createText(80, 42, 'Full body visible', 42, colors.text.secondary)}
      </g>
      <g transform="translate(0, 300)">
        ${createIcon('phone', 0, 0, 60, colors.primary.light)}
        ${createText(80, 42, 'Face-on or down-the-line angle', 42, colors.text.secondary)}
      </g>
    </g>
  </g>

  <!-- Upload Options -->
  <g transform="translate(${paddingX}, ${safeTop + 560})">
    <!-- Choose from Library -->
    ${createGlassCard(0, 0, cardWidth, 300)}
    <g transform="translate(${cardWidth / 2}, 100)">
      ${createIcon('images', -60, -60, 120, colors.primary.light)}
    </g>
    ${createText(cardWidth / 2, 200, 'Choose from Library', 54, colors.text.primary, '600', 'middle')}
    ${createText(cardWidth / 2, 260, 'Select an existing swing video', 42, colors.text.secondary, 'normal', 'middle')}

    <!-- Record with Guide (Recommended) -->
    ${createGlassCard(0, 340, cardWidth, 300)}
    <rect x="0" y="340" width="${cardWidth}" height="300" fill="none" stroke="${colors.primary.main}" stroke-width="3" rx="36" />
    <rect x="${cardWidth / 2 - 150}" y="328" width="300" height="48" fill="${colors.primary.main}" rx="24" />
    ${createText(cardWidth / 2, 360, 'RECOMMENDED', 36, colors.text.primary, '700', 'middle')}
    <g transform="translate(${cardWidth / 2}, 440)">
      ${createIcon('videocam', -60, -60, 120, colors.primary.light)}
    </g>
    ${createText(cardWidth / 2, 540, 'Record with Guide', 54, colors.text.primary, '600', 'middle')}
    ${createText(cardWidth / 2, 600, 'Countdown + position guide for best results', 42, colors.text.secondary, 'normal', 'middle')}

    <!-- Quick Record -->
    ${createGlassCard(0, 680, cardWidth, 240)}
    <g transform="translate(${cardWidth / 2}, 760)">
      ${createIcon('camera', -48, -48, 96, colors.text.secondary)}
    </g>
    ${createText(cardWidth / 2, 860, 'Quick Record', 54, colors.text.primary, '600', 'middle')}
    ${createText(cardWidth / 2, 910, 'Use system camera', 42, colors.text.secondary, 'normal', 'middle')}
  </g>

  <!-- Sample Video Button -->
  <g transform="translate(${paddingX}, ${SCREEN_HEIGHT - 200})">
    ${createButton(0, 0, cardWidth, 100, 'Use Sample Video', false)}
  </g>

  ${createHomeIndicator()}
</svg>`;
}

function generateCameraScreen(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Camera preview background (simulated) -->
  <defs>
    <linearGradient id="cameraGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a3a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2d5a2d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a3a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="url(#cameraGrad)" />

  <!-- Angle Guide Overlay -->
  <!-- Corner markers -->
  <g stroke="${colors.primary.light}" stroke-width="6" fill="none">
    <!-- Top left -->
    <path d="M 200,500 L 200,400 L 300,400" />
    <!-- Top right -->
    <path d="M ${SCREEN_WIDTH - 200},500 L ${SCREEN_WIDTH - 200},400 L ${SCREEN_WIDTH - 300},400" />
    <!-- Bottom left -->
    <path d="M 200,${SCREEN_HEIGHT - 600} L 200,${SCREEN_HEIGHT - 500} L 300,${SCREEN_HEIGHT - 500}" />
    <!-- Bottom right -->
    <path d="M ${SCREEN_WIDTH - 200},${SCREEN_HEIGHT - 600} L ${SCREEN_WIDTH - 200},${SCREEN_HEIGHT - 500} L ${SCREEN_WIDTH - 300},${SCREEN_HEIGHT - 500}" />
  </g>

  <!-- Center guide line -->
  <line x1="${SCREEN_WIDTH / 2}" y1="420" x2="${SCREEN_WIDTH / 2}" y2="${SCREEN_HEIGHT - 520}" stroke="${colors.primary.light}" stroke-width="3" stroke-dasharray="20,20" opacity="0.6" />

  <!-- Silhouette guide (simplified golfer) -->
  <g transform="translate(${SCREEN_WIDTH / 2 - 150}, 600)" opacity="0.4" fill="${colors.primary.light}">
    <!-- Head -->
    <circle cx="150" cy="100" r="80" />
    <!-- Body -->
    <ellipse cx="150" cy="400" rx="120" ry="250" />
    <!-- Arms extended (backswing) -->
    <ellipse cx="320" cy="200" rx="30" ry="180" transform="rotate(30, 320, 200)" />
    <!-- Club -->
    <line x1="360" y1="50" x2="450" y2="180" stroke="${colors.primary.light}" stroke-width="12" stroke-linecap="round" />
  </g>

  <!-- Position hint -->
  ${createText(SCREEN_WIDTH / 2, 350, 'Face-On Angle', 48, colors.primary.light, '600', 'middle')}
  ${createText(SCREEN_WIDTH / 2, 410, 'Position yourself within the guide', 36, 'rgba(255,255,255,0.7)', 'normal', 'middle')}

  ${createStatusBar('9:41')}

  <!-- Top Controls -->
  <g transform="translate(${spacing.md}, 170)">
    <circle cx="66" cy="66" r="66" fill="rgba(0,0,0,0.5)" />
    ${createIcon('close', 30, 30, 72, 'white')}
  </g>

  <g transform="translate(${SCREEN_WIDTH - 400}, 170)">
    <circle cx="66" cy="66" r="66" fill="rgba(0,0,0,0.5)" />
    ${createIcon('camera', 30, 30, 72, 'white')}

    <!-- Angle button -->
    <rect x="160" y="20" width="200" height="90" fill="rgba(0,0,0,0.5)" rx="45" />
    ${createIcon('body', 180, 38, 54, 'white')}
    ${createText(280, 78, 'Face-on', 36, 'white')}
  </g>

  <!-- Recording instruction -->
  ${createText(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 450, 'Tap to start', 48, 'white', 'normal', 'middle')}
  ${createText(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 390, '3-second countdown', 42, 'rgba(255,255,255,0.7)', 'normal', 'middle')}

  <!-- Record Button -->
  <g transform="translate(${SCREEN_WIDTH / 2 - 120}, ${SCREEN_HEIGHT - 340})">
    <circle cx="120" cy="120" r="120" fill="none" stroke="white" stroke-width="12" />
    <circle cx="120" cy="120" r="96" fill="${colors.status.error}" />
  </g>

  <!-- Guide toggle -->
  <g transform="translate(${SCREEN_WIDTH - 180}, ${SCREEN_HEIGHT - 280})">
    ${createIcon('grid', 0, 0, 72, 'white')}
    ${createText(36, 95, 'Guide', 36, 'white', 'normal', 'middle')}
  </g>

  ${createHomeIndicator()}
</svg>`;
}

function generateProcessingScreen(): string {
  const safeTop = 132;

  const steps = [
    { text: 'Uploading video...', done: true },
    { text: 'Analyzing swing positions...', done: true },
    { text: 'Identifying slice causes...', active: true },
    { text: 'Generating drill recommendation...', done: false },
    { text: 'Creating your report...', done: false },
  ];

  let stepsContent = '';
  steps.forEach((step, i) => {
    const y = 100 + i * 100;
    if (step.done) {
      stepsContent += createIcon('checkmark', 0, y - 30, 72, colors.status.success);
    } else if (step.active) {
      // Spinner (simplified as rotating circle)
      stepsContent += `<circle cx="36" cy="${y + 6}" r="30" fill="none" stroke="${colors.primary.light}" stroke-width="6" stroke-dasharray="120,60" />`;
    } else {
      stepsContent += createCircle(36, y + 6, 36, colors.surface.glass);
    }
    const textColor = step.done || step.active ? colors.text.primary : colors.text.tertiary;
    stepsContent += createText(100, y + 18, step.text, 48, textColor);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="${colors.background.primary}" />

  ${createStatusBar()}

  <!-- Content centered -->
  <g transform="translate(${SCREEN_WIDTH / 2}, ${safeTop + 400})">
    <!-- Icon container -->
    <circle cx="0" cy="0" r="180" fill="${colors.surface.glass}" />
    ${createIcon('analytics', -96, -96, 192, colors.primary.light)}

    ${createText(0, 280, 'Analyzing Your Swing', 72, colors.text.primary, '700', 'middle')}
    ${createText(0, 350, 'This usually takes about 10-15 seconds', 48, colors.text.secondary, 'normal', 'middle')}
  </g>

  <!-- Steps -->
  <g transform="translate(${(SCREEN_WIDTH - 800) / 2}, ${safeTop + 900})">
    ${stepsContent}
  </g>

  <!-- Disclaimer -->
  ${createText(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 300, 'Your video will be automatically deleted after analysis', 36, colors.text.tertiary, 'normal', 'middle')}

  ${createHomeIndicator()}
</svg>`;
}

function generateResultsScreen(): string {
  const safeTop = 132;
  const paddingX = spacing.lg;
  const cardWidth = SCREEN_WIDTH - paddingX * 2;

  // Mock challenge items
  const challengeItems = [
    { text: 'Complete 3 sets of the Toe-Up drill', done: true },
    { text: 'Hit 5 balls focusing only on clubface control', done: true },
    { text: 'Record a follow-up swing video', done: true },
    { text: 'Notice if your ball flight has less curve', done: true },
    { text: 'Practice the drill for 5 minutes before your next round', done: false },
    { text: 'Check your grip pressure (should be 4/10)', done: false },
  ];

  let challengeContent = '';
  challengeItems.forEach((item, i) => {
    const y = i * 90;
    const checkColor = item.done ? colors.primary.light : colors.surface.glass;
    challengeContent += `
      <rect x="0" y="${y}" width="72" height="72" rx="12" fill="${item.done ? colors.primary.main : 'transparent'}" stroke="${checkColor}" stroke-width="3" />
      ${item.done ? createIcon('checkmark', 12, y + 12, 48, 'white') : ''}
      ${createText(100, y + 48, item.text, 42, item.done ? colors.text.secondary : colors.text.primary)}
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="${colors.background.primary}" />

  ${createStatusBar()}

  <!-- Header -->
  <g transform="translate(0, ${safeTop})">
    <g transform="translate(${paddingX}, ${spacing.md})">
      ${createIcon('close', 0, 0, 72, colors.text.primary)}
    </g>
    ${createText(SCREEN_WIDTH / 2, spacing.md + 54, 'Analysis Results', 54, colors.text.primary, '600', 'middle')}
    <g transform="translate(${SCREEN_WIDTH - paddingX - 72}, ${spacing.md})">
      ${createIcon('share', 0, 0, 72, colors.text.primary)}
    </g>
  </g>

  <!-- Root Cause Card -->
  <g transform="translate(${paddingX}, ${safeTop + 150})">
    ${createGlassCard(0, 0, cardWidth, 520)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      ${createText(0, 36, 'PRIMARY SLICE CAUSE', 33, colors.text.tertiary, '700')}
      <!-- Confidence Badge -->
      <rect x="${cardWidth - 270}" y="0" width="180" height="60" fill="rgba(34,197,94,0.2)" rx="30" />
      ${createText(cardWidth - 180, 42, 'HIGH', 36, colors.status.success, '700', 'middle')}

      ${createText(0, 120, 'Open Clubface at Impact', 66, colors.text.primary, '700')}

      ${createText(0, 200, 'When the clubface is open relative to your swing', 42, colors.text.secondary)}
      ${createText(0, 250, 'path at impact, it imparts clockwise spin on the ball,', 42, colors.text.secondary)}
      ${createText(0, 300, 'causing it to curve to the right.', 42, colors.text.secondary)}

      <line x1="0" y1="350" x2="${cardWidth - spacing.md * 2}" y2="350" stroke="${colors.surface.glassBorder}" stroke-width="2" />

      ${createText(0, 400, 'Evidence from your swing:', 39, colors.text.secondary, '500')}
      ${createIcon('arrowForward', 0, 430, 48, colors.primary.light)}
      ${createText(60, 465, 'Clubface appears open at the top of backswing', 39, colors.text.primary)}
    </g>
  </g>

  <!-- Drill Card -->
  <g transform="translate(${paddingX}, ${safeTop + 710})">
    ${createGlassCard(0, 0, cardWidth, 580)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      ${createText(0, 36, 'RECOMMENDED DRILL', 33, colors.text.tertiary, '700')}
      ${createText(0, 105, 'Toe-Up to Toe-Up Drill', 60, colors.text.primary, '700')}

      <!-- Steps -->
      <g transform="translate(0, 150)">
        <circle cx="36" cy="36" r="36" fill="${colors.primary.main}" />
        ${createText(36, 48, '1', 36, 'white', '700', 'middle')}
        ${createText(96, 48, 'Take your normal grip and address position', 42, colors.text.primary)}

        <circle cx="36" cy="126" r="36" fill="${colors.primary.main}" />
        ${createText(36, 138, '2', 36, 'white', '700', 'middle')}
        ${createText(96, 138, 'Make a half backswing until club is parallel', 42, colors.text.primary)}

        <circle cx="36" cy="216" r="36" fill="${colors.primary.main}" />
        ${createText(36, 228, '3', 36, 'white', '700', 'middle')}
        ${createText(96, 228, 'Check that the toe points straight up', 42, colors.text.primary)}
      </g>

      <!-- Reps -->
      <rect x="0" y="400" width="${cardWidth - spacing.md * 2}" height="90" fill="${colors.surface.glass}" rx="24" />
      ${createIcon('repeat', 24, 418, 54, colors.secondary.main)}
      ${createText(96, 458, '20 slow-motion swings, then 10 at 50% speed', 42, colors.secondary.main, '500')}
    </g>
  </g>

  <!-- Challenge Card -->
  <g transform="translate(${paddingX}, ${safeTop + 1330})">
    ${createGlassCard(0, 0, cardWidth, 700)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      <g>
        ${createText(0, 36, '10 SWING CHALLENGE', 33, colors.text.tertiary, '700')}
        ${createText(0, 90, '4 of 10 completed', 48, colors.text.secondary)}
      </g>
      <g transform="translate(${cardWidth - 240}, 0)">
        ${createProgressRing(90, 90, 78, 0.4, 18)}
      </g>

      <!-- Checklist -->
      <g transform="translate(0, 160)">
        ${challengeContent}
      </g>
    </g>
  </g>

  <!-- Action Buttons -->
  <g transform="translate(${paddingX}, ${safeTop + 2100})">
    ${createButton(0, 0, cardWidth, 120, 'Analyze Another Swing')}
    ${createButton(0, 150, cardWidth, 100, 'Back to Home', false)}
  </g>

  ${createHomeIndicator()}
</svg>`;
}

function generateProgressScreen(): string {
  const safeTop = 132;
  const paddingX = spacing.lg;
  const cardWidth = SCREEN_WIDTH - paddingX * 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" fill="${colors.background.primary}" />

  ${createStatusBar()}

  <!-- Header -->
  <g transform="translate(0, ${safeTop})">
    <g transform="translate(${paddingX}, ${spacing.md})">
      ${createIcon('arrowBack', 0, 0, 72, colors.text.primary)}
    </g>
    ${createText(SCREEN_WIDTH / 2, spacing.md + 54, 'Your Progress', 60, colors.text.primary, '600', 'middle')}
  </g>

  <!-- Streak Card with Gradient -->
  <g transform="translate(${paddingX}, ${safeTop + 150})">
    <defs>
      <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.primary.dark}" />
        <stop offset="100%" style="stop-color:${colors.primary.main}" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${cardWidth}" height="400" fill="url(#streakGrad)" rx="36" />

    <!-- Streak content -->
    <g transform="translate(${cardWidth / 2}, 100)">
      ${createIcon('flame', -72, -60, 144, colors.secondary.main)}
      ${createText(100, 30, '7', 144, 'white', '700')}
      ${createText(100, 90, 'Day Streak', 48, 'rgba(255,255,255,0.8)')}
    </g>

    <!-- Stats row -->
    <g transform="translate(0, 280)">
      <g transform="translate(${cardWidth / 4}, 0)">
        ${createText(0, 48, '12', 60, 'white', '600', 'middle')}
        ${createText(0, 100, 'Best', 42, 'rgba(255,255,255,0.7)', 'normal', 'middle')}
      </g>
      <line x1="${cardWidth / 2}" y1="20" x2="${cardWidth / 2}" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
      <g transform="translate(${cardWidth * 3 / 4}, 0)">
        ${createText(0, 48, '23', 60, 'white', '600', 'middle')}
        ${createText(0, 100, 'Total Days', 42, 'rgba(255,255,255,0.7)', 'normal', 'middle')}
      </g>
    </g>
  </g>

  <!-- Improvement Summary Card -->
  <g transform="translate(${paddingX}, ${safeTop + 590})">
    ${createGlassCard(0, 0, cardWidth, 400)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      ${createText(0, 54, 'Improvement Summary', 54, colors.text.primary, '600')}

      <!-- Trend Badge -->
      <rect x="${cardWidth - 300}" y="10" width="210" height="66" fill="rgba(34,197,94,0.2)" rx="33" />
      ${createIcon('trendingUp', cardWidth - 285, 20, 45, colors.status.success)}
      ${createText(cardWidth - 140, 55, 'Improving!', 39, colors.status.success, '600', 'middle')}

      <!-- Stats Grid -->
      <g transform="translate(0, 120)">
        <g transform="translate(${(cardWidth - spacing.md * 2) / 6}, 0)">
          ${createText(0, 60, '8', 72, colors.text.primary, '700', 'middle')}
          ${createText(0, 110, 'Swings', 36, colors.text.secondary, 'normal', 'middle')}
          ${createText(0, 150, 'Analyzed', 36, colors.text.secondary, 'normal', 'middle')}
        </g>
        <g transform="translate(${(cardWidth - spacing.md * 2) / 2}, 0)">
          ${createText(0, 60, '65%', 72, colors.text.primary, '700', 'middle')}
          ${createText(0, 110, 'Challenges', 36, colors.text.secondary, 'normal', 'middle')}
          ${createText(0, 150, 'Done', 36, colors.text.secondary, 'normal', 'middle')}
        </g>
        <g transform="translate(${(cardWidth - spacing.md * 2) * 5 / 6}, 0)">
          ${createText(0, 60, '+24%', 72, colors.status.success, '700', 'middle')}
          ${createText(0, 110, 'Improvement', 36, colors.text.secondary, 'normal', 'middle')}
        </g>
      </g>

      <!-- Focus area -->
      <rect x="0" y="280" width="${cardWidth - spacing.md * 2}" height="80" fill="${colors.surface.glass}" rx="24" />
      ${createIcon('bulb', 24, 294, 51, colors.secondary.main)}
      ${createText(90, 332, 'Focus area:', 42, colors.text.secondary)}
      ${createText(280, 332, 'Open Clubface at Impact', 42, colors.text.primary, '600')}
    </g>
  </g>

  <!-- Slice Severity Card -->
  <g transform="translate(${paddingX}, ${safeTop + 1030})">
    ${createGlassCard(0, 0, cardWidth, 350)}
    <g transform="translate(${spacing.md}, ${spacing.md})">
      ${createText(cardWidth / 2 - spacing.md, 54, 'Current Slice Severity', 54, colors.text.primary, '600', 'middle')}

      <!-- Severity Meter -->
      <g transform="translate(${(cardWidth - spacing.md * 2 - 900) / 2}, 100)">
        <rect x="0" y="60" width="900" height="30" fill="${colors.surface.glass}" rx="15" />
        <rect x="0" y="60" width="300" height="30" fill="${colors.status.success}" rx="15" />
        <!-- Marker -->
        <circle cx="300" cy="75" r="24" fill="white" />

        <!-- Labels -->
        ${createText(0, 140, 'Mild', 36, colors.status.success)}
        ${createText(300, 140, 'Moderate', 36, colors.text.tertiary, 'normal', 'middle')}
        ${createText(600, 140, 'Severe', 36, colors.text.tertiary, 'normal', 'middle')}
        ${createText(900, 140, 'Major', 36, colors.text.tertiary, 'normal', 'end')}
      </g>

      ${createText(cardWidth / 2 - spacing.md, 290, 'Great progress! Your slice is almost gone.', 42, colors.text.secondary, 'normal', 'middle')}
    </g>
  </g>

  <!-- Recent Analyses Section -->
  <g transform="translate(${paddingX}, ${safeTop + 1420})">
    ${createText(0, 54, 'Recent Analyses', 54, colors.text.primary, '600')}

    <!-- Analysis Item 1 -->
    ${createGlassCard(0, 90, cardWidth, 180)}
    <g transform="translate(${spacing.md}, 120)">
      ${createText(0, 36, 'Jan 15', 36, colors.text.tertiary)}
      ${createText(0, 90, 'Open Clubface at Impact', 48, colors.text.primary, '500')}
    </g>
    <g transform="translate(${cardWidth - 150}, 130)">
      ${createProgressRing(60, 60, 48, 0.4, 9)}
    </g>

    <!-- Analysis Item 2 -->
    ${createGlassCard(0, 300, cardWidth, 180)}
    <g transform="translate(${spacing.md}, 330)">
      ${createText(0, 36, 'Jan 12', 36, colors.text.tertiary)}
      ${createText(0, 90, 'Out-to-In Swing Path', 48, colors.text.primary, '500')}
    </g>
    <g transform="translate(${cardWidth - 150}, 340)">
      ${createProgressRing(60, 60, 48, 0.7, 9)}
    </g>
  </g>

  ${createHomeIndicator()}
</svg>`;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function generateScreenshot(name: string, svgContent: string): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, `${name}.png`);

  try {
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(outputPath);
    console.log(`  \u2713 ${name}.png`);
  } catch (error) {
    console.error(`  \u2717 ${name}.png - Error:`, error);
  }
}

async function main(): Promise<void> {
  console.log('\n\ud83d\udcf1 Pocket Caddie AI - Screenshot Generator');
  console.log('=============================================\n');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\ud83c\udfa8 Generating synthetic screenshots...\n');

  const screens = [
    { name: '01-home', generator: generateHomeScreen },
    { name: '02-upload', generator: generateUploadScreen },
    { name: '03-camera', generator: generateCameraScreen },
    { name: '04-processing', generator: generateProcessingScreen },
    { name: '05-results', generator: generateResultsScreen },
    { name: '06-progress', generator: generateProgressScreen },
  ];

  for (const screen of screens) {
    const svg = screen.generator();
    await generateScreenshot(screen.name, svg);
  }

  console.log(`\n\u2705 Generated ${screens.length} screenshots to ${OUTPUT_DIR}\n`);
  console.log('Next steps:');
  console.log('  1. npm run appstore:screenshots  (add captions)');
  console.log('  2. npm run appstore:validate     (verify assets)\n');
}

main().catch(console.error);
