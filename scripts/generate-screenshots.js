/**
 * App Store Screenshot Generator
 * Generates professional screenshots for App Store submission
 *
 * Sizes:
 * - 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 px
 * - 6.5" Display (iPhone 11 Pro Max): 1284 x 2778 px
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../apps/mobile/assets/screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Screenshot configurations
const SIZES = {
  '6.7': { width: 1290, height: 2796, suffix: '6.7inch' },
  '6.5': { width: 1284, height: 2778, suffix: '6.5inch' },
};

// App theme colors
const COLORS = {
  background: '#0A0A0F',
  backgroundGradientTop: '#0F1419',
  backgroundGradientBottom: '#0A0A0F',
  primary: '#10B981',
  primaryLight: '#34D399',
  secondary: '#F59E0B',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  card: '#1F2937',
  cardBorder: '#374151',
  success: '#22C55E',
  error: '#EF4444',
};

// Screenshot content
const SCREENSHOTS = [
  {
    id: '01',
    name: 'home',
    headline: 'AI-Powered',
    subheadline: 'Golf Coaching',
    tagline: 'Fix your slice with instant AI analysis',
    mockupType: 'home',
  },
  {
    id: '02',
    name: 'record',
    headline: 'Record Your',
    subheadline: 'Swing',
    tagline: 'Upload any video for instant analysis',
    mockupType: 'record',
  },
  {
    id: '03',
    name: 'analysis',
    headline: 'Get Instant',
    subheadline: 'Feedback',
    tagline: 'AI identifies the root cause of your slice',
    mockupType: 'analysis',
  },
  {
    id: '04',
    name: 'drills',
    headline: 'Personalized',
    subheadline: 'Drills',
    tagline: 'Step-by-step exercises to fix your swing',
    mockupType: 'drills',
  },
  {
    id: '05',
    name: 'library',
    headline: '12 Expert',
    subheadline: 'Drills',
    tagline: 'Target every aspect of your swing',
    mockupType: 'library',
  },
  {
    id: '06',
    name: 'progress',
    headline: 'Track Your',
    subheadline: 'Progress',
    tagline: 'See your improvement over time',
    mockupType: 'progress',
  },
];

// Generate SVG for screenshot
function generateScreenshotSVG(screenshot, size) {
  const { width, height } = size;
  const phoneWidth = Math.round(width * 0.75);
  const phoneHeight = Math.round(height * 0.65);
  const phoneX = Math.round((width - phoneWidth) / 2);
  const phoneY = Math.round(height * 0.28);
  const cornerRadius = 50;

  // Generate mockup content based on type
  let mockupContent = '';

  switch (screenshot.mockupType) {
    case 'home':
      mockupContent = generateHomeMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
    case 'record':
      mockupContent = generateRecordMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
    case 'analysis':
      mockupContent = generateAnalysisMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
    case 'drills':
      mockupContent = generateDrillsMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
    case 'library':
      mockupContent = generateLibraryMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
    case 'progress':
      mockupContent = generateProgressMockup(phoneX, phoneY, phoneWidth, phoneHeight);
      break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.backgroundGradientTop};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.backgroundGradientBottom};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.primaryLight};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="40" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <clipPath id="phoneClip">
      <rect x="${phoneX + 8}" y="${phoneY + 8}" width="${phoneWidth - 16}" height="${phoneHeight - 16}" rx="${cornerRadius - 8}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

  <!-- Decorative elements -->
  <circle cx="${width * 0.1}" cy="${height * 0.15}" r="200" fill="${COLORS.primary}" opacity="0.05"/>
  <circle cx="${width * 0.9}" cy="${height * 0.85}" r="300" fill="${COLORS.secondary}" opacity="0.03"/>

  <!-- Headline text -->
  <text x="${width / 2}" y="${height * 0.08}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="72" font-weight="700" fill="${COLORS.text}">${screenshot.headline}</text>
  <text x="${width / 2}" y="${height * 0.14}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="72" font-weight="700" fill="${COLORS.primary}">${screenshot.subheadline}</text>

  <!-- Tagline -->
  <text x="${width / 2}" y="${height * 0.19}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="36" fill="${COLORS.textSecondary}">${screenshot.tagline}</text>

  <!-- Phone frame -->
  <rect x="${phoneX}" y="${phoneY}" width="${phoneWidth}" height="${phoneHeight}" rx="${cornerRadius}" fill="#1C1C1E" filter="url(#shadow)"/>
  <rect x="${phoneX + 4}" y="${phoneY + 4}" width="${phoneWidth - 8}" height="${phoneHeight - 8}" rx="${cornerRadius - 4}" fill="#000" stroke="#333" stroke-width="2"/>

  <!-- Phone screen content -->
  <g clip-path="url(#phoneClip)">
    <rect x="${phoneX + 8}" y="${phoneY + 8}" width="${phoneWidth - 16}" height="${phoneHeight - 16}" fill="${COLORS.background}"/>
    ${mockupContent}
  </g>

  <!-- Dynamic Island -->
  <rect x="${phoneX + phoneWidth/2 - 60}" y="${phoneY + 20}" width="120" height="36" rx="18" fill="#000"/>

  <!-- App name at bottom -->
  <text x="${width / 2}" y="${height * 0.97}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="32" font-weight="600" fill="${COLORS.textSecondary}">SliceFix AI</text>
</svg>`;
}

function generateHomeMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  return `
    <!-- Status bar area -->
    <rect x="${phoneX + 8}" y="${phoneY + 8}" width="${phoneWidth - 16}" height="60" fill="${COLORS.background}"/>

    <!-- Header -->
    <text x="${contentX}" y="${contentY}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${COLORS.text}">Welcome Back</text>
    <text x="${contentX}" y="${contentY + 50}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="28" fill="${COLORS.textSecondary}">Ready to improve your swing?</text>

    <!-- Analysis card -->
    <rect x="${contentX}" y="${contentY + 100}" width="${cardWidth}" height="200" rx="20" fill="${COLORS.card}" stroke="${COLORS.cardBorder}" stroke-width="1"/>
    <text x="${contentX + 30}" y="${contentY + 150}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.textSecondary}">Latest Analysis</text>
    <text x="${contentX + 30}" y="${contentY + 195}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="36" font-weight="600" fill="${COLORS.text}">Out-to-In Swing Path</text>
    <text x="${contentX + 30}" y="${contentY + 240}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.primary}">Score: 72/100</text>
    <circle cx="${contentX + cardWidth - 60}" cy="${contentY + 180}" r="40" fill="${COLORS.primary}" opacity="0.2"/>
    <text x="${contentX + cardWidth - 60}" y="${contentY + 190}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="32" font-weight="700" fill="${COLORS.primary}">72</text>

    <!-- Quick actions -->
    <rect x="${contentX}" y="${contentY + 330}" width="${cardWidth/2 - 15}" height="140" rx="20" fill="url(#primaryGradient)"/>
    <text x="${contentX + cardWidth/4 - 7}" y="${contentY + 390}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="48" fill="${COLORS.text}">📹</text>
    <text x="${contentX + cardWidth/4 - 7}" y="${contentY + 440}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" font-weight="600" fill="${COLORS.text}">Record</text>

    <rect x="${contentX + cardWidth/2 + 15}" y="${contentY + 330}" width="${cardWidth/2 - 15}" height="140" rx="20" fill="${COLORS.card}" stroke="${COLORS.cardBorder}" stroke-width="1"/>
    <text x="${contentX + cardWidth*3/4 + 7}" y="${contentY + 390}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="48" fill="${COLORS.text}">📤</text>
    <text x="${contentX + cardWidth*3/4 + 7}" y="${contentY + 440}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" font-weight="600" fill="${COLORS.text}">Upload</text>

    <!-- Stats row -->
    <rect x="${contentX}" y="${contentY + 500}" width="${cardWidth}" height="120" rx="20" fill="${COLORS.card}" stroke="${COLORS.cardBorder}" stroke-width="1"/>
    <text x="${contentX + cardWidth/6}" y="${contentY + 550}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="36" font-weight="700" fill="${COLORS.primary}">12</text>
    <text x="${contentX + cardWidth/6}" y="${contentY + 585}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.textSecondary}">Analyses</text>
    <text x="${contentX + cardWidth/2}" y="${contentY + 550}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="36" font-weight="700" fill="${COLORS.secondary}">5</text>
    <text x="${contentX + cardWidth/2}" y="${contentY + 585}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.textSecondary}">Day Streak</text>
    <text x="${contentX + cardWidth*5/6}" y="${contentY + 550}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="36" font-weight="700" fill="${COLORS.text}">8</text>
    <text x="${contentX + cardWidth*5/6}" y="${contentY + 585}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.textSecondary}">Drills Done</text>
  `;
}

function generateRecordMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  return `
    <!-- Camera viewfinder -->
    <rect x="${phoneX + 8}" y="${phoneY + 80}" width="${phoneWidth - 16}" height="${phoneHeight - 250}" fill="#1a1a1a"/>

    <!-- Grid lines -->
    <line x1="${phoneX + phoneWidth/3}" y1="${phoneY + 80}" x2="${phoneX + phoneWidth/3}" y2="${phoneY + phoneHeight - 170}" stroke="${COLORS.textSecondary}" stroke-width="1" opacity="0.3"/>
    <line x1="${phoneX + phoneWidth*2/3}" y1="${phoneY + 80}" x2="${phoneX + phoneWidth*2/3}" y2="${phoneY + phoneHeight - 170}" stroke="${COLORS.textSecondary}" stroke-width="1" opacity="0.3"/>
    <line x1="${phoneX + 8}" y1="${phoneY + (phoneHeight - 170)/3 + 80}" x2="${phoneX + phoneWidth - 8}" y2="${phoneY + (phoneHeight - 170)/3 + 80}" stroke="${COLORS.textSecondary}" stroke-width="1" opacity="0.3"/>
    <line x1="${phoneX + 8}" y1="${phoneY + (phoneHeight - 170)*2/3 + 80}" x2="${phoneX + phoneWidth - 8}" y2="${phoneY + (phoneHeight - 170)*2/3 + 80}" stroke="${COLORS.textSecondary}" stroke-width="1" opacity="0.3"/>

    <!-- Golfer silhouette -->
    <text x="${phoneX + phoneWidth/2}" y="${phoneY + phoneHeight/2 - 50}" text-anchor="middle" font-size="200" opacity="0.3">🏌️</text>

    <!-- Tips overlay -->
    <rect x="${contentX}" y="${phoneY + 120}" width="${cardWidth}" height="80" rx="15" fill="${COLORS.card}" opacity="0.9"/>
    <text x="${contentX + 20}" y="${phoneY + 155}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.primary}">💡 Tip:</text>
    <text x="${contentX + 90}" y="${phoneY + 155}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Film from down-the-line view</text>
    <text x="${contentX + 20}" y="${phoneY + 185}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.textSecondary}">Position camera at hip height</text>

    <!-- Bottom controls -->
    <rect x="${phoneX + 8}" y="${phoneY + phoneHeight - 170}" width="${phoneWidth - 16}" height="162" fill="${COLORS.background}"/>

    <!-- Record button -->
    <circle cx="${phoneX + phoneWidth/2}" cy="${phoneY + phoneHeight - 90}" r="50" fill="none" stroke="${COLORS.text}" stroke-width="4"/>
    <circle cx="${phoneX + phoneWidth/2}" cy="${phoneY + phoneHeight - 90}" r="40" fill="${COLORS.error}"/>

    <!-- Gallery button -->
    <rect x="${contentX}" y="${phoneY + phoneHeight - 115}" width="60" height="60" rx="10" fill="${COLORS.card}"/>
    <text x="${contentX + 30}" y="${phoneY + phoneHeight - 75}" text-anchor="middle" font-size="30">🖼️</text>

    <!-- Flip camera -->
    <rect x="${contentX + cardWidth - 60}" y="${phoneY + phoneHeight - 115}" width="60" height="60" rx="10" fill="${COLORS.card}"/>
    <text x="${contentX + cardWidth - 30}" y="${phoneY + phoneHeight - 75}" text-anchor="middle" font-size="30">🔄</text>
  `;
}

function generateAnalysisMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  return `
    <!-- Header -->
    <text x="${contentX}" y="${contentY}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${COLORS.text}">Analysis Results</text>

    <!-- Score circle -->
    <circle cx="${phoneX + phoneWidth/2}" cy="${contentY + 140}" r="80" fill="none" stroke="${COLORS.card}" stroke-width="12"/>
    <circle cx="${phoneX + phoneWidth/2}" cy="${contentY + 140}" r="80" fill="none" stroke="${COLORS.primary}" stroke-width="12" stroke-dasharray="377" stroke-dashoffset="105" transform="rotate(-90 ${phoneX + phoneWidth/2} ${contentY + 140})"/>
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 150}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="56" font-weight="700" fill="${COLORS.text}">72</text>
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 185}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">out of 100</text>

    <!-- Root cause card -->
    <rect x="${contentX}" y="${contentY + 260}" width="${cardWidth}" height="160" rx="20" fill="${COLORS.error}" opacity="0.15"/>
    <rect x="${contentX}" y="${contentY + 260}" width="${cardWidth}" height="160" rx="20" fill="none" stroke="${COLORS.error}" stroke-width="2"/>
    <text x="${contentX + 25}" y="${contentY + 305}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.error}">ROOT CAUSE IDENTIFIED</text>
    <text x="${contentX + 25}" y="${contentY + 355}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="32" font-weight="600" fill="${COLORS.text}">Out-to-In Swing Path</text>
    <text x="${contentX + 25}" y="${contentY + 395}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">Confidence: High</text>

    <!-- Evidence -->
    <text x="${contentX}" y="${contentY + 470}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" font-weight="600" fill="${COLORS.text}">Evidence Found:</text>

    <rect x="${contentX}" y="${contentY + 495}" width="${cardWidth}" height="50" rx="10" fill="${COLORS.card}"/>
    <text x="${contentX + 20}" y="${contentY + 530}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.success}">✓</text>
    <text x="${contentX + 50}" y="${contentY + 530}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Club crosses target line at impact</text>

    <rect x="${contentX}" y="${contentY + 555}" width="${cardWidth}" height="50" rx="10" fill="${COLORS.card}"/>
    <text x="${contentX + 20}" y="${contentY + 590}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.success}">✓</text>
    <text x="${contentX + 50}" y="${contentY + 590}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Shoulders open at impact</text>

    <rect x="${contentX}" y="${contentY + 615}" width="${cardWidth}" height="50" rx="10" fill="${COLORS.card}"/>
    <text x="${contentX + 20}" y="${contentY + 650}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.success}">✓</text>
    <text x="${contentX + 50}" y="${contentY + 650}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Early hip rotation in downswing</text>

    <!-- CTA Button -->
    <rect x="${contentX}" y="${contentY + 700}" width="${cardWidth}" height="70" rx="15" fill="url(#primaryGradient)"/>
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 745}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">View Recommended Drills</text>
  `;
}

function generateDrillsMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  return `
    <!-- Header -->
    <text x="${contentX}" y="${contentY}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${COLORS.text}">Headcover Path Drill</text>
    <text x="${contentX}" y="${contentY + 45}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.textSecondary}">Fix your out-to-in swing path</text>

    <!-- Emoji icon -->
    <rect x="${phoneX + phoneWidth/2 - 50}" y="${contentY + 70}" width="100" height="100" rx="25" fill="${COLORS.card}"/>
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 140}" text-anchor="middle" font-size="60">🧢</text>

    <!-- Meta badges -->
    <rect x="${contentX}" y="${contentY + 200}" width="120" height="40" rx="20" fill="${COLORS.success}" opacity="0.2"/>
    <text x="${contentX + 60}" y="${contentY + 228}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.success}">Beginner</text>

    <rect x="${contentX + 140}" y="${contentY + 200}" width="100" height="40" rx="20" fill="${COLORS.card}"/>
    <text x="${contentX + 190}" y="${contentY + 228}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.textSecondary}">15 min</text>

    <!-- Steps -->
    <text x="${contentX}" y="${contentY + 290}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">Steps</text>

    <rect x="${contentX}" y="${contentY + 310}" width="${cardWidth}" height="70" rx="15" fill="${COLORS.card}"/>
    <circle cx="${contentX + 35}" cy="${contentY + 345}" r="18" fill="${COLORS.primary}"/>
    <text x="${contentX + 35}" y="${contentY + 352}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" font-weight="700" fill="${COLORS.text}">1</text>
    <text x="${contentX + 70}" y="${contentY + 352}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Place headcover behind the ball</text>

    <rect x="${contentX}" y="${contentY + 390}" width="${cardWidth}" height="70" rx="15" fill="${COLORS.card}"/>
    <circle cx="${contentX + 35}" cy="${contentY + 425}" r="18" fill="${COLORS.primary}"/>
    <text x="${contentX + 35}" y="${contentY + 432}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" font-weight="700" fill="${COLORS.text}">2</text>
    <text x="${contentX + 70}" y="${contentY + 432}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Swing without hitting the cover</text>

    <rect x="${contentX}" y="${contentY + 470}" width="${cardWidth}" height="70" rx="15" fill="${COLORS.card}"/>
    <circle cx="${contentX + 35}" cy="${contentY + 505}" r="18" fill="${COLORS.primary}"/>
    <text x="${contentX + 35}" y="${contentY + 512}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" font-weight="700" fill="${COLORS.text}">3</text>
    <text x="${contentX + 70}" y="${contentY + 512}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.text}">Progress from half to full swings</text>

    <!-- Tips -->
    <text x="${contentX}" y="${contentY + 590}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">Pro Tips</text>

    <rect x="${contentX}" y="${contentY + 610}" width="${cardWidth}" height="60" rx="15" fill="${COLORS.secondary}" opacity="0.15"/>
    <text x="${contentX + 20}" y="${contentY + 650}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.secondary}">💡 Film yourself to track improvement</text>

    <!-- CTA -->
    <rect x="${contentX}" y="${contentY + 700}" width="${cardWidth}" height="70" rx="15" fill="url(#primaryGradient)"/>
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 745}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">Mark as Practiced</text>
  `;
}

function generateLibraryMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  const drills = [
    { emoji: '✊', name: 'Grip Pressure Check', category: 'Open Clubface', color: COLORS.error },
    { emoji: '🧤', name: 'Glove Under Arm', category: 'Open Clubface', color: COLORS.error },
    { emoji: '🧢', name: 'Headcover Path Drill', category: 'Swing Path', color: COLORS.secondary },
    { emoji: '👟', name: 'Trailing Foot Back', category: 'Swing Path', color: COLORS.secondary },
    { emoji: '🧱', name: 'Wall Contact Drill', category: 'Early Extension', color: '#3B82F6' },
    { emoji: '📏', name: 'Alignment Sticks', category: 'Alignment', color: '#8B5CF6' },
  ];

  let drillCards = '';
  drills.forEach((drill, index) => {
    const y = contentY + 80 + (index * 110);
    drillCards += `
      <rect x="${contentX}" y="${y}" width="${cardWidth}" height="100" rx="15" fill="${COLORS.card}"/>
      <rect x="${contentX}" y="${y}" width="8" height="100" rx="4" fill="${drill.color}"/>
      <rect x="${contentX + 25}" y="${y + 20}" width="60" height="60" rx="15" fill="${COLORS.background}"/>
      <text x="${contentX + 55}" y="${y + 62}" text-anchor="middle" font-size="36">${drill.emoji}</text>
      <text x="${contentX + 100}" y="${y + 45}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" font-weight="600" fill="${COLORS.text}">${drill.name}</text>
      <text x="${contentX + 100}" y="${y + 75}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${drill.color}">${drill.category}</text>
    `;
  });

  return `
    <!-- Header -->
    <text x="${contentX}" y="${contentY}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${COLORS.text}">Drill Library</text>
    <text x="${contentX}" y="${contentY + 45}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.textSecondary}">12 drills for every swing issue</text>

    ${drillCards}

    <!-- More indicator -->
    <text x="${phoneX + phoneWidth/2}" y="${contentY + 770}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">+ 6 more drills</text>
  `;
}

function generateProgressMockup(phoneX, phoneY, phoneWidth, phoneHeight) {
  const contentX = phoneX + 40;
  const contentY = phoneY + 100;
  const cardWidth = phoneWidth - 80;

  return `
    <!-- Header -->
    <text x="${contentX}" y="${contentY}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${COLORS.text}">Your Progress</text>

    <!-- Streak card -->
    <rect x="${contentX}" y="${contentY + 50}" width="${cardWidth}" height="140" rx="20" fill="${COLORS.secondary}" opacity="0.15"/>
    <rect x="${contentX}" y="${contentY + 50}" width="${cardWidth}" height="140" rx="20" fill="none" stroke="${COLORS.secondary}" stroke-width="2"/>
    <text x="${contentX + 30}" y="${contentY + 100}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.secondary}">🔥 Current Streak</text>
    <text x="${contentX + 30}" y="${contentY + 155}" font-family="SF Pro Display, -apple-system, sans-serif" font-size="56" font-weight="700" fill="${COLORS.text}">5 Days</text>
    <text x="${contentX + cardWidth - 30}" y="${contentY + 155}" text-anchor="end" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">Best: 12</text>

    <!-- Stats grid -->
    <rect x="${contentX}" y="${contentY + 220}" width="${cardWidth/2 - 10}" height="120" rx="15" fill="${COLORS.card}"/>
    <text x="${contentX + cardWidth/4 - 5}" y="${contentY + 280}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${COLORS.primary}">12</text>
    <text x="${contentX + cardWidth/4 - 5}" y="${contentY + 320}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">Analyses</text>

    <rect x="${contentX + cardWidth/2 + 10}" y="${contentY + 220}" width="${cardWidth/2 - 10}" height="120" rx="15" fill="${COLORS.card}"/>
    <text x="${contentX + cardWidth*3/4 + 5}" y="${contentY + 280}" text-anchor="middle" font-family="SF Pro Display, -apple-system, sans-serif" font-size="48" font-weight="700" fill="${COLORS.success}">8</text>
    <text x="${contentX + cardWidth*3/4 + 5}" y="${contentY + 320}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="22" fill="${COLORS.textSecondary}">Drills Done</text>

    <!-- Improvement chart area -->
    <text x="${contentX}" y="${contentY + 390}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">Improvement Trend</text>

    <rect x="${contentX}" y="${contentY + 410}" width="${cardWidth}" height="180" rx="15" fill="${COLORS.card}"/>

    <!-- Simple chart bars -->
    <rect x="${contentX + 40}" y="${contentY + 530}" width="40" height="40" rx="5" fill="${COLORS.primary}" opacity="0.4"/>
    <rect x="${contentX + 100}" y="${contentY + 510}" width="40" height="60" rx="5" fill="${COLORS.primary}" opacity="0.5"/>
    <rect x="${contentX + 160}" y="${contentY + 490}" width="40" height="80" rx="5" fill="${COLORS.primary}" opacity="0.6"/>
    <rect x="${contentX + 220}" y="${contentY + 480}" width="40" height="90" rx="5" fill="${COLORS.primary}" opacity="0.7"/>
    <rect x="${contentX + 280}" y="${contentY + 460}" width="40" height="110" rx="5" fill="${COLORS.primary}" opacity="0.8"/>
    <rect x="${contentX + 340}" y="${contentY + 440}" width="40" height="130" rx="5" fill="${COLORS.primary}"/>

    <text x="${phoneX + phoneWidth/2}" y="${contentY + 430}" text-anchor="middle" font-family="SF Pro Text, -apple-system, sans-serif" font-size="20" fill="${COLORS.success}">↑ 15% improvement this week</text>

    <!-- Most worked on -->
    <text x="${contentX}" y="${contentY + 640}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${COLORS.text}">Focus Area</text>
    <rect x="${contentX}" y="${contentY + 660}" width="${cardWidth}" height="70" rx="15" fill="${COLORS.card}"/>
    <text x="${contentX + 20}" y="${contentY + 705}" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.secondary}">Out-to-In Swing Path</text>
    <text x="${contentX + cardWidth - 20}" y="${contentY + 705}" text-anchor="end" font-family="SF Pro Text, -apple-system, sans-serif" font-size="24" fill="${COLORS.textSecondary}">6 sessions</text>
  `;
}

// Main function to generate all screenshots
async function generateAllScreenshots() {
  console.log('🎨 Generating App Store Screenshots...\n');

  for (const screenshot of SCREENSHOTS) {
    for (const [sizeKey, size] of Object.entries(SIZES)) {
      const filename = `${screenshot.id}_${screenshot.name}_${size.suffix}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      console.log(`  Creating: ${filename}`);

      const svg = generateScreenshotSVG(screenshot, size);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(filepath);
    }
  }

  console.log('\n✅ All screenshots generated!');
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log('\nGenerated files:');

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
  files.forEach(f => console.log(`  - ${f}`));
}

// Run
generateAllScreenshots().catch(console.error);
