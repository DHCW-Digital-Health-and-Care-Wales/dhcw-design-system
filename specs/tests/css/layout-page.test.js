import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../support/compile-scss.js';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const page = read('preview/styles/layout.html');
const spacing = read('src/tokens/_spacing.scss');
const breakpoints = read('src/utilities/_breakpoints.scss');

const px = {};
for (const m of spacing.matchAll(/\$(nhsw-[\w-]+):\s*([\d.]+)px/g)) px[m[1]] = Number(m[2]);
const bp = {};
for (const m of breakpoints.matchAll(/\$(nhsw-breakpoint-[\w-]+):\s*([\d.]+)em/g)) bp[m[1]] = Math.round(Number(m[2]) * 16);

// Every rule on the Layout page that gives a number, checked against the value the
// library implements, so the page and the code cannot drift apart.
const rules = [
  { says: 'apply 16px side margins across mobile viewports', actual: px['nhsw-container-margin-mobile'], documented: 16 },
  { says: 'use 16px side margins and grid gutters', actual: [px['nhsw-container-margin-mobile'], px['nhsw-gutter']], documented: [16, 16] },
  { says: 'use 16px spacing between headings and supporting content', actual: px['nhsw-heading-margin-mobile'], documented: 16 },
  { says: 'separate form controls with 16px vertical spacing', actual: px['nhsw-form-group-margin-mobile'], documented: 16 },
  { says: 'maintain a 40px gap between major page sections', actual: px['nhsw-section-gap'], documented: 40 },
  { says: 'leave 32px to 40px spacing between content sections', actual: px['nhsw-section-gap'], documented: 40, within: [32, 40] },
  { says: 'use 40px padding on the left and right of the main page container', actual: px['nhsw-container-margin-desktop'], documented: 40 },
  { says: 'use 32px padding at the top and bottom of content areas', actual: [px['nhsw-main-wrapper-padding-mobile'], px['nhsw-main-wrapper-padding-tablet']], documented: [32, 32] },
  { says: 'maintain a 40px gap between columns', actual: px['nhsw-gutter-desktop'] * 2, documented: 40 },
  { says: 'use 40px outer padding', actual: px['nhsw-container-margin-desktop'], documented: 40 },
  { says: 'leave 24px space above the back link or primary page title', actual: px['nhsw-main-wrapper-padding-top-mobile'], documented: 24 },
];

// Rules that are not a single spacing token are checked against the compiled CSS below.

describe('Layout page documents the screen sizes and breakpoints', () => {
  it('lists Mobile 320px, Tablet 641px, Desktop 769px and Large Desktop 990px', () => {
    for (const line of ['Mobile: 320px and above', 'Tablet: 641px and above', 'Desktop: 769px and above', 'Large Desktop: 990px and above']) {
      expect(page).toContain(`<li>${line}</li>`);
    }
  });

  it('matches the breakpoints the library uses', () => {
    expect(bp['nhsw-breakpoint-tablet']).toBe(641);
    expect(bp['nhsw-breakpoint-desktop']).toBe(769);
    expect(bp['nhsw-breakpoint-large-desktop']).toBe(990);
  });
});

describe('Layout page spacing rules match the spacing the library implements', () => {
  for (const rule of rules) {
    it(`the page states: ${rule.says}`, () => {
      expect(page).toContain(rule.says);
    });

    it(`${rule.says}: library value matches`, () => {
      if (rule.within) {
        expect(rule.actual).toBeGreaterThanOrEqual(rule.within[0]);
        expect(rule.actual).toBeLessThanOrEqual(rule.within[1]);
      } else {
        expect(rule.actual).toEqual(rule.documented);
      }
    });
  }
});

describe('Layout page rules for labels, cards and the patient header match the compiled CSS', () => {
  let labelCss = '';
  let cardCss = '';
  let patientCss = '';

  beforeAll(() => {
    labelCss = compileProbe(`@use "components/forms/label";`);
    cardCss = compileProbe(`@use "components/cards/card";`);
    patientCss = compileProbe(`@use "components/content/patient-header";`);
  });

  it('use 4px spacing between labels and form controls', () => {
    expect(page).toContain('use 4px spacing between labels and form controls');
    expect(block(labelCss, '\\.nhsw-label\\b')).toMatch(/margin-bottom:\s*4px/);
  });

  it('for container components like cards, use 16px internal padding with an 8px gap between titles and body details', () => {
    expect(page).toContain('use 16px internal padding with an 8px gap between titles and body details');
    expect(block(cardCss, '\.nhsw-card')).toMatch(/padding:\s*1rem/);
    expect(block(cardCss, '\.nhsw-card__title')).toMatch(/margin:\s*0 0 0\.5rem/);
  });

  it('apply 16px internal padding within the patient summary area, and leave 32px between it and the page content', () => {
    expect(page).toContain('apply 16px internal padding within the patient summary area');
    expect(page).toContain('leave 32px spacing between the patient header and page content');
    const header = block(patientCss, '\.nhsw-patient-header');
    expect(header).toMatch(/padding:\s*16px/);
    expect(header).toMatch(/margin:\s*0 0 32px/);
  });
});

describe('Layout page examples', () => {
  const examples = ['layout-full-width', 'layout-one-half', 'layout-patient-header', 'layout-mobile'];

  it.each(examples)('%s has a preview, an example page and an HTML sample', (slug) => {
    expect(page).toContain(`open_url="/examples/${slug}.html"`);
    expect(page).toContain(`include code-viewer.html id="${slug}"`);
    expect(fs.existsSync(path.join(root, `preview/examples/${slug}.html`))).toBe(true);
  });

  it.each(examples)('%s starts with a back link, as in the design', (slug) => {
    const example = read(`preview/examples/${slug}.html`);
    expect(example).toContain('<a class="nhsw-back-link" href="#">Back</a>');
    expect(example.match(/<h1 /g)).toHaveLength(1);
  });

  it('the one-half example uses two one-half grid columns', () => {
    expect(read('preview/examples/layout-one-half.html').match(/nhsw-grid-column-one-half/g)).toHaveLength(2);
  });
});

describe('Layout example fixes from design review', () => {
  it('a back link followed by a page heading leaves 40px between them', () => {
    const css = compileProbe(`@use "components/actions/back-link";`);
    expect(block(css, '\\.nhsw-back-link \\+ \\.nhsw-h1')).toMatch(/margin-top:\s*40px/);
  });

  it('the example pages line the logo up with the page content using the fluid header container', () => {
    expect(read('preview/_layouts/example.html')).toContain('nhsw-site-header__container--fluid');
    const css = compileProbe(`@use "components/site/header";`);
    expect(block(css, '\\.nhsw-site-header__container--fluid')).toMatch(/padding:\s*0 16px/);
    expect(css).toMatch(/\.nhsw-site-header__container--fluid\s*\{\s*padding:\s*0 40px/);
  });

  it('the one-half example has the heading above the grid, so both columns start at the same height', () => {
    const example = read('preview/examples/layout-one-half.html');
    expect(example.indexOf('<h1')).toBeLessThan(example.indexOf('nhsw-grid-row'));
    const columns = example.split('nhsw-grid-column-one-half').slice(1);
    expect(columns).toHaveLength(2);
    columns.forEach((c) => expect(c).not.toMatch(/^[^<]*>\s*<h1/));
  });

  it('the patient header example uses the patient header banner, not a summary list table', () => {
    const example = read('preview/examples/layout-patient-header.html');
    expect(example).toContain('nhsw-patient-header__name');
    expect(example).toContain('Adverse reactions:');
    expect(example).toContain('View or change');
    expect(example).not.toContain('nhsw-summary-list');
    expect(page).not.toContain('nhsw-summary-list');
  });
});
