'use strict';

// Gathers the built CSS and JavaScript into dist/ so that `npm publish` ships
// them. The CSS is built into preview/dist by `npm run build:css`; the
// JavaScript already lives in dist/. Run with --check to only verify that every
// file the package promises is present (this is what prepublishOnly does).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const COPIES = [
  ['preview/dist/nhsw.css', 'dist/nhsw.css'],
  ['preview/dist/nhsw.css.map', 'dist/nhsw.css.map'],
  ['preview/dist/nhsw.min.css', 'dist/nhsw.min.css'],
];

const REQUIRED = [
  'dist/nhsw.css',
  'dist/nhsw.css.map',
  'dist/nhsw.min.css',
  'dist/nhsw-behaviours.js',
  'dist/nhsw-behaviours.min.js',
  'dist/nhsw-date-picker.js',
  'dist/nhsw-date-picker.min.js',
  'src/index.scss',
  'LICENSE',
  'LICENSE-CONTENT.md',
  'README.md',
];

function copyBuiltAssets(root = ROOT) {
  for (const [from, to] of COPIES) {
    const source = path.join(root, from);
    if (!fs.existsSync(source)) {
      throw new Error(`${from} is missing: run "npm run build:css" first.`);
    }
    fs.mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
    fs.copyFileSync(source, path.join(root, to));
  }
}

function missingFiles(root = ROOT) {
  return REQUIRED.filter((file) => !fs.existsSync(path.join(root, file)));
}

function main(argv = process.argv.slice(2)) {
  if (!argv.includes('--check')) copyBuiltAssets();
  const missing = missingFiles();
  if (missing.length) {
    throw new Error(`The npm package is missing: ${missing.join(', ')}. Run "npm run build:npm".`);
  }
  console.log('npm package files are ready.');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { COPIES, REQUIRED, copyBuiltAssets, missingFiles, main };
