// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { COPIES, REQUIRED, copyBuiltAssets, missingFiles } = require('../../../scripts/prepare-npm-package.js');

const ROOT = path.resolve(import.meta.dirname, '../../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('package.json is ready to publish to npm', () => {
  it('is public, MIT licensed and published with public access', () => {
    expect(pkg.private).toBeUndefined();
    expect(pkg.license).toBe('MIT');
    expect(pkg.publishConfig).toEqual({ access: 'public' });
  });

  it('names the repository, homepage and issue tracker', () => {
    expect(pkg.repository.url).toContain('DHCW-Digital-Health-and-Care-Wales/dhcw-design-system');
    expect(pkg.homepage).toContain('dhcw-design-system');
    expect(pkg.bugs.url).toContain('/issues');
  });

  it('only ships the source, the built files and the licences, not the docs site, tests or build output', () => {
    expect(pkg.files).toContain('src');
    expect(pkg.files).toContain('dist/nhsw.min.css');
    expect(pkg.files).toContain('LICENSE');
    expect(pkg.files).toContain('LICENSE-CONTENT.md');
    for (const excluded of ['preview', 'specs', 'node_modules', 'test-results', '.github']) {
      expect(pkg.files.some((f) => f === excluded || f.startsWith(`${excluded}/`)), excluded).toBe(false);
    }
  });

  it('points Sass and CSS consumers at the entry files', () => {
    expect(pkg.sass).toBe('src/index.scss');
    expect(pkg.style).toBe('dist/nhsw.min.css');
    expect(fs.existsSync(path.join(ROOT, pkg.sass))).toBe(true);
  });

  it('checks the package files exist before publishing, and can build them', () => {
    expect(pkg.scripts.prepublishOnly).toContain('prepare-npm-package.js --check');
    expect(pkg.scripts['build:npm']).toContain('build:css');
    expect(pkg.scripts['build:npm']).toContain('prepare-npm-package.js');
  });

  it('every file in the package list is one the prepare script promises', () => {
    for (const file of pkg.files.filter((f) => f.startsWith('dist/'))) {
      expect(REQUIRED, file).toContain(file);
    }
  });
});

describe('prepare-npm-package script', () => {
  it('copies the built CSS from preview/dist into dist', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-package-'));
    try {
      for (const [from] of COPIES) {
        fs.mkdirSync(path.dirname(path.join(root, from)), { recursive: true });
        fs.writeFileSync(path.join(root, from), `built ${from}`);
      }
      copyBuiltAssets(root);
      for (const [from, to] of COPIES) {
        expect(fs.readFileSync(path.join(root, to), 'utf8')).toBe(`built ${from}`);
      }
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails clearly when the CSS has not been built', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-package-'));
    try {
      expect(() => copyBuiltAssets(root)).toThrow(/npm run build:css/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports every missing file in an empty folder', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-package-'));
    try {
      expect(missingFiles(root)).toEqual(REQUIRED);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
