#!/usr/bin/env node

/**
 * Version Bump Script for SliceFix AI
 *
 * Usage:
 *   node scripts/bump-version.js patch   # 1.0.0 -> 1.0.1
 *   node scripts/bump-version.js minor   # 1.0.0 -> 1.1.0
 *   node scripts/bump-version.js major   # 1.0.0 -> 2.0.0
 *   node scripts/bump-version.js build   # Increment build number only
 */

const fs = require('fs');
const path = require('path');

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default:
      return version;
  }
}

function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0] || 'patch';

  if (!['major', 'minor', 'patch', 'build'].includes(bumpType)) {
    console.error('Usage: node bump-version.js [major|minor|patch|build]');
    process.exit(1);
  }

  // Read current configs
  const appJson = readJson(APP_JSON_PATH);
  const packageJson = readJson(PACKAGE_JSON_PATH);

  const currentVersion = appJson.expo.version;
  const currentBuild = parseInt(appJson.expo.ios.buildNumber, 10);

  let newVersion = currentVersion;
  let newBuild = currentBuild + 1;

  if (bumpType !== 'build') {
    newVersion = bumpVersion(currentVersion, bumpType);
  }

  // Update app.json
  appJson.expo.version = newVersion;
  appJson.expo.ios.buildNumber = String(newBuild);
  writeJson(APP_JSON_PATH, appJson);

  // Update package.json
  packageJson.version = newVersion;
  writeJson(PACKAGE_JSON_PATH, packageJson);

  console.log('');
  console.log('Version bumped successfully!');
  console.log('');
  console.log(`  Version: ${currentVersion} -> ${newVersion}`);
  console.log(`  Build:   ${currentBuild} -> ${newBuild}`);
  console.log('');
  console.log('Files updated:');
  console.log('  - app.json');
  console.log('  - package.json');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Commit: git add . && git commit -m "Bump version to ' + newVersion + '"');
  console.log('  2. Tag:    git tag v' + newVersion);
  console.log('  3. Build:  eas build --profile production --platform ios');
  console.log('');
}

main();
