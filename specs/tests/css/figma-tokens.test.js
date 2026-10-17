import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, readCustomProperty } from '../support/compile-scss.js';

// Every expected value below was read directly out of the Figma source of
// truth for this design system:
// https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2
//   - Colours: Pages > STYLES > Colours (a literal swatch chart with each
//     $nhswales-* token name and hex value written out as text).
//   - Typography: Properties panel > Styles > Text styles, expanded for both
//     the "Tablet and Desktop" and "Mobile" groups (each entry lists size/line-height in px).
// Checked 2026-08-11. If the Figma file changes, update BOTH the expectations
// here and the token files in src/tokens/ — this suite exists specifically to
// catch the two drifting from each other.
// (Button spacing, read from the same Figma file, now lives in
// components/buttons.test.js alongside the rest of the button coverage.)

let colourCss = '';
let typographyCss = '';

beforeAll(() => {
  colourCss = compileProbe(`
    @use "tokens/colours" as c;
    :root {
      --primary-text: #{c.$nhswales-primary-text-colour};
      --secondary-text: #{c.$nhswales-secondary-text-colour};
      --exceptional-text: #{c.$nhswales-exceptional-text-colour};
      --blue-text: #{c.$nhswales-blue-text-colour};
      --link: #{c.$nhswales-link-colour};
      --primary-button: #{c.$nhswales-primary-button};
      --secondary-button: #{c.$nhswales-secondary-button};
      --delete-button: #{c.$nhswales-delete-button};
      --exceptional-button-light: #{c.$nhswales-exceptional-button-light};
      --page-background-grey: #{c.$nhswales-page-background-grey};
      --page-background-white: #{c.$nhswales-page-background-white};
      --page-background-blue: #{c.$nhswales-page-background-blue};
      --primary-border: #{c.$nhswales-primary-border-colour};
      --secondary-border: #{c.$nhswales-secondary-border-colour};
      --grey-border: #{c.$nhswales-grey-border-colour};
      --gold-border: #{c.$nhswales-gold-border-colour};
      --primary-button-shadow: #{c.$nhswales-primary-button-shadow};
      --exceptional-button-shadow: #{c.$nhswales-exceptional-button-shadow};
      --focus: #{c.$nhswales-focus-colour};
    }
  `);

  typographyCss = compileProbe(`
    @use "tokens/typography" as t;
    :root {
      --font-family: #{t.$nhsw-font-family-base};
      --weight-bold: #{t.$nhsw-font-weight-bold};

      --h1-size: #{t.$nhsw-font-size-h1};
      --h1-line: #{t.$nhsw-line-height-h1};
      --h2-size: #{t.$nhsw-font-size-h2};
      --h2-line: #{t.$nhsw-line-height-h2};
      --h3-size: #{t.$nhsw-font-size-h3};
      --h3-line: #{t.$nhsw-line-height-h3};
      --h4-size: #{t.$nhsw-font-size-h4};
      --h4-line: #{t.$nhsw-line-height-h4};
      --h5-size: #{t.$nhsw-font-size-h5};
      --h5-line: #{t.$nhsw-line-height-h5};
      --body-size: #{t.$nhsw-font-size-body};
      --body-line: #{t.$nhsw-line-height-body};
      --body-small-size: #{t.$nhsw-font-size-body-small};
      --body-small-line: #{t.$nhsw-line-height-body-small};
      --body-extra-small-size: #{t.$nhsw-font-size-body-extra-small};
      --body-extra-small-line: #{t.$nhsw-line-height-body-extra-small};

      --h1-size-mobile: #{t.$nhsw-font-size-h1-mobile};
      --h1-line-mobile: #{t.$nhsw-line-height-h1-mobile};
      --h2-size-mobile: #{t.$nhsw-font-size-h2-mobile};
      --h2-line-mobile: #{t.$nhsw-line-height-h2-mobile};
      --h3-size-mobile: #{t.$nhsw-font-size-h3-mobile};
      --h3-line-mobile: #{t.$nhsw-line-height-h3-mobile};
      --h4-size-mobile: #{t.$nhsw-font-size-h4-mobile};
      --h4-line-mobile: #{t.$nhsw-line-height-h4-mobile};
      --h5-size-mobile: #{t.$nhsw-font-size-h5-mobile};
      --h5-line-mobile: #{t.$nhsw-line-height-h5-mobile};
      --body-size-mobile: #{t.$nhsw-font-size-body-mobile};
      --body-line-mobile: #{t.$nhsw-line-height-body-mobile};
    }
  `);
});

describe('colour tokens match Figma STYLES > Colours', () => {
  const expected = {
    '--primary-text': '#212b32',
    '--secondary-text': '#4c6272',
    '--exceptional-text': '#ffffff',
    '--blue-text': '#1b365d',
    '--link': '#005aa8',
    '--primary-button': '#1b365d',
    '--secondary-button': '#4c6272',
    '--delete-button': '#d5281b',
    '--exceptional-button-light': '#f5bb6b',
    '--page-background-grey': '#f0f4f5',
    '--page-background-white': '#ffffff',
    '--page-background-blue': '#1b365d',
    '--primary-border': '#212b32',
    '--secondary-border': '#4c6272',
    '--grey-border': '#d8dde0',
    '--gold-border': '#aa8630',
    '--primary-button-shadow': '#0e1b2f',
    '--exceptional-button-shadow': '#554318',
    '--focus': '#ffeb3b',
  };

  it.each(Object.entries(expected))('%s resolves to %s', (name, hex) => {
    const actual = readCustomProperty(colourCss, name.replace('--', '--'));
    expect(actual?.toLowerCase()).toBe(hex);
  });
});

describe('type scale matches Figma Text styles — Tablet and Desktop', () => {
  // Figma lists sizes in px "size/line-height"; our tokens are in rem at a
  // 16px root, so 1px == 1/16 rem == 0.0625rem.
  const px = (n) => `${n / 16}rem`;
  const scale = {
    h1: { size: 48, line: 54 },
    h2: { size: 36, line: 42 },
    h3: { size: 26, line: 32 },
    // Deliberately differs from Figma (30): the Typography page documents a 33px
    // line height for desktop H4, and the library follows the page.
    h4: { size: 22, line: 33 },
    h5: { size: 19, line: 28 },
    body: { size: 19, line: 28 },
    'body-small': { size: 16, line: 24 },
    'body-extra-small': { size: 14, line: 20 },
  };

  it.each(Object.entries(scale))('%s is %spx/%spx line-height', (name, { size, line }) => {
    expect(readCustomProperty(typographyCss, `--${name}-size`)).toBe(px(size));
    expect(readCustomProperty(typographyCss, `--${name}-line`)).toBe(px(line));
  });
});

describe('type scale matches Figma Text styles — Mobile', () => {
  const px = (n) => `${n / 16}rem`;
  const scale = {
    h1: { size: 32, line: 38 }, // Heading-extra-large
    h2: { size: 27, line: 33 }, // Heading-large
    h3: { size: 22, line: 29 }, // Heading-medium
    h4: { size: 19, line: 27 }, // Heading-small
    h5: { size: 16, line: 24 }, // Heading-extra-small
    body: { size: 16, line: 24 },
  };

  it.each(Object.entries(scale))('%s-mobile is %spx/%spx line-height', (name, { size, line }) => {
    expect(readCustomProperty(typographyCss, `--${name}-size-mobile`)).toBe(px(size));
    expect(readCustomProperty(typographyCss, `--${name}-line-mobile`)).toBe(px(line));
  });

  it('Mobile "Body-small" (14/20) matches the same value as Tablet/Desktop "Body-extra-small" — one token covers both, since there is no separate mobile tier for it', () => {
    expect(readCustomProperty(typographyCss, '--body-extra-small-size')).toBe(px(14));
    expect(readCustomProperty(typographyCss, '--body-extra-small-line')).toBe(px(20));
  });
});

describe('base font matches Figma (Roboto, bold = 700)', () => {
  it('font family leads with Roboto', () => {
    expect(readCustomProperty(typographyCss, '--font-family')).toMatch(/^Roboto/);
  });

  it('bold weight is 700', () => {
    expect(readCustomProperty(typographyCss, '--weight-bold')).toBe('700');
  });
});
