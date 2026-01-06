#!/usr/bin/env node

/**
 * Release Checklist Script for SliceFix AI
 *
 * Validates that all requirements are met before building for release.
 *
 * Usage:
 *   node scripts/release-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const checks = [];
let hasErrors = false;

function check(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      checks.push({ name, status: 'PASS', message: '' });
    } else {
      checks.push({ name, status: 'FAIL', message: result });
      hasErrors = true;
    }
  } catch (error) {
    checks.push({ name, status: 'FAIL', message: error.message });
    hasErrors = true;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), 'utf8'));
}

// Run checks
console.log('\nSliceFix AI - Release Checklist\n');
console.log('Running checks...\n');

// 1. Check app.json
check('app.json exists', () => fileExists('app.json') || 'File not found');

check('Bundle ID configured', () => {
  const appJson = readJson('app.json');
  const bundleId = appJson.expo?.ios?.bundleIdentifier;
  if (bundleId === 'com.cienrios.pocketcaddieai') return true;
  return `Expected com.cienrios.pocketcaddieai, got ${bundleId}`;
});

check('Version number set', () => {
  const appJson = readJson('app.json');
  const version = appJson.expo?.version;
  if (version && version !== '0.0.0') return true;
  return `Invalid version: ${version}`;
});

check('Build number set', () => {
  const appJson = readJson('app.json');
  const build = appJson.expo?.ios?.buildNumber;
  if (build && parseInt(build, 10) > 0) return true;
  return `Invalid build number: ${build}`;
});

// 2. Check eas.json
check('eas.json exists', () => fileExists('eas.json') || 'File not found');

check('Production profile configured', () => {
  const easJson = readJson('eas.json');
  if (easJson.build?.production) return true;
  return 'Production profile missing';
});

// 3. Check assets
check('App icon exists', () => fileExists('assets/icon.png') || 'Icon not found');
check('Splash screen exists', () => fileExists('assets/splash.png') || 'Splash not found');

// 4. Check TypeScript
check('TypeScript compiles', () => {
  try {
    execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'TypeScript errors found';
  }
});

// 5. Check ESLint
check('ESLint passes', () => {
  try {
    execSync('npx eslint src --ext .ts,.tsx --max-warnings 100', { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'ESLint errors found';
  }
});

// 6. Check for .env
check('Environment variables set', () => {
  const appJson = readJson('app.json');
  const projectId = appJson.expo?.extra?.eas?.projectId;
  if (projectId && projectId !== 'your-project-id') return true;
  return 'EAS project ID not configured (run eas init)';
});

// 7. Check npm audit
check('No security vulnerabilities', () => {
  try {
    execSync('npm audit --audit-level=high', { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch (error) {
    return 'Security vulnerabilities found';
  }
});

// Print results
console.log('Results:\n');
console.log('-'.repeat(60));

checks.forEach(({ name, status, message }) => {
  const icon = status === 'PASS' ? '[OK]' : '[X]';
  console.log(`${icon} ${name}`);
  if (message) {
    console.log(`     ${message}`);
  }
});

console.log('-'.repeat(60));

const passCount = checks.filter(c => c.status === 'PASS').length;
const failCount = checks.filter(c => c.status === 'FAIL').length;

console.log(`\nPassed: ${passCount}/${checks.length}`);

if (hasErrors) {
  console.log('\n[!] Some checks failed. Please fix before releasing.\n');
  process.exit(1);
} else {
  console.log('\n[OK] All checks passed! Ready to build.\n');
  console.log('Next steps:');
  console.log('  1. eas build --profile production --platform ios');
  console.log('  2. eas submit --platform ios --latest');
  console.log('');
  process.exit(0);
}
