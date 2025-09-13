/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const args = process.argv.slice(2);
const isWatch = args.includes('--watch');
const isDev = isWatch || args.includes('--dev');

const outDir = path.join(__dirname, '..', 'dist');
const outJsDir = path.join(outDir, 'js');
const publicDir = path.join(__dirname, '..', 'public');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function run() {
  // Clean dist on non-watch builds
  if (!isWatch) {
    if (fs.existsSync(outDir)) {
      // simple recursive delete without extra deps
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  }
  ensureDir(outJsDir);

  // Copy static files from public → dist
  copyDir(publicDir, outDir);

  const define = {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    'process.env.DEBUG': isDev ? 'true' : 'false',
  };

  const entryPoints = [
    'src/popup.tsx',
    'src/options.tsx',
    'src/background.ts',
    'src/content_script.tsx',
    'src/likedata.tsx',
    'src/quotedata.tsx',
  ].map((p) => path.join(__dirname, '..', p));

  const commonOptions = {
    entryPoints,
    bundle: true,
    outdir: outJsDir,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: isDev ? 'inline' : false,
    minify: !isDev,
    legalComments: 'none',
    define,
    logLevel: 'info',
  };

  if (isWatch && esbuild.context) {
    // Newer esbuild API
    const ctx = await esbuild.context(commonOptions);
    await ctx.watch();
    console.log('[esbuild] watching for changes...');
  } else if (isWatch && !esbuild.context) {
    // Legacy fallback for very old esbuild (<0.17)
    await esbuild.build(Object.assign({}, commonOptions, { watch: true }));
  } else {
    // One-shot build without any watch key (esbuild>=0.23 rejects unknown keys)
    await esbuild.build(commonOptions);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
