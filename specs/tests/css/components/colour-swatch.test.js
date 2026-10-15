import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../../support/compile-scss.js';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'preview/styles/colours.html'), 'utf8');
const tokensScss = fs.readFileSync(path.join(root, 'src/tokens/_colours.scss'), 'utf8');

const tokens = {};
for (const m of tokensScss.matchAll(/\$(nhsw-colour-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  tokens[m[1]] = m[2].toLowerCase();
}

const swatches = [
  ...page.matchAll(
    /nhsw-colour-swatch--([\w-]+)">\s*<span class="nhsw-colour-swatch__name">([^<]+)<\/span>\s*<span class="nhsw-colour-swatch__hex">(#[0-9A-Fa-f]{6})<\/span>/g
  ),
].map((m) => ({ modifier: m[1], label: m[2], hex: m[3].toLowerCase() }));

// Swatch modifier -> the design token the library actually uses for it.
const tokenFor = {
  'primary-text-colour': 'nhsw-colour-text-primary',
  'exceptional-text-colour': 'nhsw-colour-text-exceptional',
  'blue-text-colour': 'nhsw-colour-text-blue',
  'secondary-text-colour': 'nhsw-colour-text-secondary',
  'link-colour': 'nhsw-colour-link',
  'link-hover-colour': 'nhsw-colour-link-hover',
  'link-visited-colour': 'nhsw-colour-link-visited',
  'link-active-colour': 'nhsw-colour-link-active',
  'focus-colour': 'nhsw-colour-focus',
  'focus-text-colour': 'nhsw-colour-focus-text',
  'primary-button-interrupt': 'nhsw-colour-button-primary-interrupt',
  'primary-button': 'nhsw-colour-button-primary',
  'secondary-button': 'nhsw-colour-button-secondary',
  'delete-button': 'nhsw-colour-button-delete',
  'exceptional-button-light': 'nhsw-colour-button-exceptional-light',
  'page-background-grey': 'nhsw-colour-background-grey',
  'page-background-white': 'nhsw-colour-background-white',
  'page-background-blue': 'nhsw-colour-background-blue',
  'primary-border-colour': 'nhsw-colour-border-primary',
  'secondary-border-colour': 'nhsw-colour-border-secondary',
  'grey-border-colour': 'nhsw-colour-border-grey',
  'exceptional-button-shadow': 'nhsw-colour-shadow-exceptional-button',
  'primary-button-shadow': 'nhsw-colour-shadow-primary-button',
  'gold-border-colour': 'nhsw-colour-border-gold',
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
