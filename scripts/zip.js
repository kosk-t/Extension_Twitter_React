/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const releaseDir = path.join(__dirname, '..', 'release');

// Always build a fresh production bundle before zipping
const build = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'build.js')], {
  stdio: 'inherit',
});
if (build.status !== 0) process.exit(build.status);

// Read version and name from manifest
const manifestPath = path.join(distDir, 'manifest.json');
let version = '0.0.0';
let name = 'extension';
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  version = manifest.version || version;
  name = (manifest.name || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
} catch (e) {
  console.warn('Could not read manifest.json for version; using defaults.');
}

if (!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir);
const zipPath = path.join(releaseDir, `${name}-v${version}.zip`);

if (process.platform === 'win32') {
  // Use PowerShell Compress-Archive to zip contents of dist/* at top-level
  const psCommand = [
    'Compress-Archive',
    '-Path', path.join('dist', '*'),
    '-DestinationPath', zipPath,
    '-Force',
  ];
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', psCommand.join(' ')], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  process.exit(result.status || 0);
} else {
  // Use zip CLI on Unix-like systems
  // zip -r release/file.zip . from inside dist, to avoid top-level dist/ folder
  const result = spawnSync('sh', ['-lc', `cd dist && zip -r ${JSON.stringify(zipPath)} .`], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  process.exit(result.status || 0);
}
