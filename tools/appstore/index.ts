#!/usr/bin/env node
/**
 * SliceFix AI - App Store Asset Pipeline
 *
 * Main CLI entry point for generating all App Store assets.
 *
 * Commands:
 *   npx ts-node tools/appstore/index.ts icon       - Generate app icons
 *   npx ts-node tools/appstore/index.ts screenshots - Process screenshots
 *   npx ts-node tools/appstore/index.ts all        - Generate everything
 *   npx ts-node tools/appstore/index.ts validate   - Validate assets
 *
 * Or use npm scripts:
 *   npm run appstore:icons
 *   npm run appstore:screenshots
 *   npm run appstore:assets
 */

import { generateIcons } from './generate-icon';
import { processScreenshots } from './postprocess-screenshots';
import { validateAssets } from './validate-assets';
import * as fs from 'fs';
import * as path from 'path';

const COMMANDS = ['icon', 'icons', 'screenshot', 'screenshots', 'all', 'validate', 'help'];

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || 'help';

  console.log('\n🏌️ SliceFix AI - App Store Asset Pipeline');
  console.log('================================================\n');

  if (!COMMANDS.includes(command)) {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  let success = true;

  switch (command) {
    case 'icon':
    case 'icons':
      const iconResult = await generateIcons();
      success = iconResult.success;
      break;

    case 'screenshot':
    case 'screenshots':
      const screenshotResult = await processScreenshots();
      success = screenshotResult.success;
      break;

    case 'all':
      console.log('📦 Generating all assets...\n');

      const iconRes = await generateIcons();
      console.log('');
      const screenshotRes = await processScreenshots();
      console.log('');
      const validateRes = await validateAssets();

      success = iconRes.success && screenshotRes.success && validateRes.success;
      break;

    case 'validate':
      const valResult = await validateAssets();
      success = valResult.success;
      break;

    case 'help':
    default:
      showHelp();
      break;
  }

  console.log('\n================================================');
  if (success) {
    console.log('✅ Pipeline completed successfully!');
  } else {
    console.log('⚠️  Pipeline completed with warnings/errors');
  }

  process.exit(success ? 0 : 1);
}

function showHelp() {
  console.log(`
Usage: npx ts-node tools/appstore/index.ts <command>

Commands:
  icon, icons       Generate app icons from source SVG
  screenshot, screenshots
                    Process raw screenshots into final assets
  all               Generate all assets and validate
  validate          Validate existing assets for App Store compliance
  help              Show this help message

NPM Scripts:
  npm run appstore:icons        Generate icons
  npm run appstore:screenshots  Process screenshots
  npm run appstore:assets       Generate all assets
  npm run appstore:validate     Validate assets

Folder Structure:
  assets/app-store/
  ├── icon/
  │   ├── source/app-icon.svg     Source SVG (edit this)
  │   └── export/ios/             Generated icons
  ├── screenshots/
  │   ├── raw/                    Raw captures (add here)
  │   ├── final/en-US/            Processed screenshots
  │   └── captions.json           Caption configuration
  └── README.md                   Documentation

Requirements:
  - Node.js 18+
  - npm install sharp

Workflow:
  1. Edit source SVG at assets/app-store/icon/source/app-icon.svg
  2. Run: npm run appstore:icons
  3. Capture raw screenshots into assets/app-store/screenshots/raw/
  4. Run: npm run appstore:screenshots
  5. Validate: npm run appstore:validate
  6. Upload to App Store Connect
  `);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
