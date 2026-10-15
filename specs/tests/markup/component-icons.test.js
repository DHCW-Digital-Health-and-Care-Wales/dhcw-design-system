import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const docPaths = (example) => [...read(`preview/examples/${example}.html`).matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);

const [LEFT, RIGHT] = docPaths('icon-arrows');
const SEARCH = docPaths('icon-search')[0];
const CIRCLE = docPaths('icon-arrow-circle')[0];
const CHEVRON_LEFT = docPaths('icon-chevron-left')[0];
const CHEVRON_RIGHT = docPaths('icon-chevron-right')[0];
const WARNING = docPaths('icon-warning')[0];
const UP = docPaths('icon-up-arrow')[0];

// The Icons page is the source of truth: components must render exactly these icons.
const maskedPaths = (scssRel) =>
  [...read(scssRel).matchAll(/data:image\/svg\+xml,([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));

describe('components use the icons documented on the Icons page', () => {
  it('pagination arrows (macro) are the left and right arrow icons', () => {
    const macro = read('src/components/pagination/macro.njk');
    expect(macro).toContain(`d="${LEFT}"`);
    expect(macro).toContain(`d="${RIGHT}"`);
    expect(macro).not.toContain('viewBox="0 0 17 16"');
  });

  it('action link icon (macro) is the right arrow inside a circle', () => {
    const macro = read('src/components/action-link/macro.njk');
    expect(macro).toContain(`d="${CIRCLE}"`);
    expect(macro).toContain('viewBox="0 0 30 30"');
  });

  it('header search button icon is the search icon', () => {
    expect(maskedPaths('src/components/site/_header.scss').join('')).toContain(`d='${SEARCH}'`);
  });

  it('back link chevron is the left chevron icon', () => {
    expect(maskedPaths('src/components/actions/_back-link.scss').join('')).toContain(`d='${CHEVRON_LEFT}'`);
  });

  it('breadcrumb separator is the right chevron icon', () => {
    expect(maskedPaths('src/components/navigation/_breadcrumb.scss').join('')).toContain(`d='${CHEVRON_RIGHT}'`);
  });

  it('warning callout icon is the warning icon', () => {
    expect(maskedPaths('src/components/callouts/_warning-callout.scss').join('')).toContain(`d='${WARNING}'`);
  });

  it('"Back to top" links use the up arrow icon instead of a text arrow', () => {
    for (const rel of ['preview/styles/colours.html', 'preview/styles/typography.html', 'preview/styles/icons.html']) {
      const html = read(rel);
      expect(html, rel).toContain(`d="${UP}"`);
      expect(html, rel).not.toContain('&uarr; Back to top');
    }
  });
});
