import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../../support/compile-scss.js';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'preview/styles/colours.html'), 'utf8');
const tokensScss = fs.readFileSync(path.join(root, 'src/tokens/_colours.scss'), 'utf8');

const tokens = {};
for (const m of tokensScss.matchAll(/\$(nhsw(?:-colour|ales)-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  tokens[m[1]] = m[2].toLowerCase();
}

const swatches = [
  ...page.matchAll(
    /nhsw-colour-swatch--([\w-]+)">\s*<span class="nhsw-colour-swatch__name">([^<]+)<\/span>\s*<span class="nhsw-colour-swatch__hex">(#[0-9A-Fa-f]{6})<\/span>/g
  ),
].map((m) => ({ modifier: m[1], label: m[2], hex: m[3].toLowerCase() }));

// Swatch modifier -> the design token the library actually uses for it.
const tokenFor = {
  'primary-text-colour': 'nhswales-primary-text-colour',
  'exceptional-text-colour': 'nhswales-exceptional-text-colour',
  'blue-text-colour': 'nhswales-blue-text-colour',
  'secondary-text-colour': 'nhswales-secondary-text-colour',
  'link-colour': 'nhswales-link-colour',
  'link-hover-colour': 'nhswales-link-hover-colour',
  'link-visited-colour': 'nhswales-link-visited-colour',
  'link-active-colour': 'nhswales-link-active-colour',
  'focus-colour': 'nhswales-focus-colour',
  'focus-text-colour': 'nhswales-focus-text-colour',
  'primary-button-interrupt': 'nhswales-primary-button-interrupt',
  'primary-button': 'nhswales-primary-button',
  'secondary-button': 'nhswales-secondary-button',
  'delete-button': 'nhswales-delete-button',
  'exceptional-button-light': 'nhswales-exceptional-button-light',
  'page-background-grey': 'nhswales-page-background-grey',
  'page-background-white': 'nhswales-page-background-white',
  'page-background-blue': 'nhswales-page-background-blue',
  'primary-border-colour': 'nhswales-primary-border-colour',
  'secondary-border-colour': 'nhswales-secondary-border-colour',
  'grey-border-colour': 'nhswales-grey-border-colour',
  'exceptional-button-shadow': 'nhswales-exceptional-button-shadow',
  'primary-button-shadow': 'nhswales-primary-button-shadow',
  'gold-border-colour': 'nhswales-gold-border-colour',
};

describe('Colours page swatches', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/colour-swatch";`);
  });

  it('documents every swatch the page shows', () => {
    expect(swatches).toHaveLength(24);
  });

  it('lays the name and hex value out on one row', () => {
    const swatch = block(css, '\.nhsw-colour-swatch');
    expect(swatch).toMatch(/display:\s*flex/);
    expect(swatch).toMatch(/justify-content:\s*space-between/);
  });

  describe('each swatch paints the colour its label states', () => {
    for (const s of swatches) {
      it(`${s.label} is ${s.hex}`, () => {
        const rule = block(css, `\.nhsw-colour-swatch--${s.modifier}`);
        expect(rule.toLowerCase()).toMatch(new RegExp(String.raw`background-color:\s*` + s.hex));
      });
    }
  });

  describe('documented colours match the colour tokens the library uses', () => {
    for (const s of swatches) {
      it(`${s.label} ${s.hex} equals $${tokenFor[s.modifier]}`, () => {
        expect(tokenFor[s.modifier], `no token mapped for ${s.modifier}`).toBeDefined();
        expect(tokens[tokenFor[s.modifier]]).toBe(s.hex);
      });
    }
  });
});
