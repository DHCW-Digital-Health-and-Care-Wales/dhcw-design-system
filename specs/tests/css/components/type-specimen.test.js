import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../../support/compile-scss.js';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'preview/styles/typography.html'), 'utf8');
const tokensScss = fs.readFileSync(path.join(root, 'src/tokens/_typography.scss'), 'utf8');

const tokenPx = {};
for (const m of tokensScss.matchAll(/\$(nhsw-[\w-]+):\s*([\d.]+)rem/g)) {
  tokenPx[m[1]] = Math.round(parseFloat(m[2]) * 16 * 100) / 100;
}

const stated = (re) => {
  const out = [];
  for (const m of page.matchAll(re)) {
    const after = page.slice(m.index, m.index + 700);
    out.push({
      key: m[1],
      size: Number(after.match(/<li>(\d+)px<\/li>/)[1]),
      lineHeight: Number(after.match(/Line height: (\d+)px/)[1]),
    });
  }
  return out;
};

const headingSpecimens = stated(/nhsw-type-specimen--([\w-]+)">/g);
const bodySpecimens = stated(/<h4 class="nhsw-h4">(Body[\w ]*)<\/h4>/g);

// Typography page specimen -> the size and line-height tokens the library uses.
const headingTokens = {
  'desktop-h1': ['nhsw-font-size-h1', 'nhsw-line-height-h1'],
  'desktop-h2': ['nhsw-font-size-h2', 'nhsw-line-height-h2'],
  'desktop-h3': ['nhsw-font-size-h3', 'nhsw-line-height-h3'],
  'desktop-h4': ['nhsw-font-size-h4', 'nhsw-line-height-h4'],
  'desktop-h5': ['nhsw-font-size-h5', 'nhsw-line-height-h5'],
  'mobile-h1': ['nhsw-font-size-h1-mobile', 'nhsw-line-height-h1-mobile'],
  'mobile-h2': ['nhsw-font-size-h2-mobile', 'nhsw-line-height-h2-mobile'],
  'mobile-h3': ['nhsw-font-size-h3-mobile', 'nhsw-line-height-h3-mobile'],
  'mobile-h4': ['nhsw-font-size-h4-mobile', 'nhsw-line-height-h4-mobile'],
  'mobile-h5': ['nhsw-font-size-h5-mobile', 'nhsw-line-height-h5-mobile'],
};

// Body specimens in page order: Body, Body S, Body XS (desktop), Body (mobile).
const bodyTokens = [
  ['nhsw-font-size-body', 'nhsw-line-height-body'],
  ['nhsw-font-size-body-small', 'nhsw-line-height-body-small'],
  ['nhsw-font-size-body-extra-small', 'nhsw-line-height-body-extra-small'],
  ['nhsw-font-size-body-mobile', 'nhsw-line-height-body-mobile'],
];

describe('Typography page specimens', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/type-specimen";`);
  });

  it('documents ten heading specimens and four body specimens', () => {
    expect(headingSpecimens).toHaveLength(10);
    expect(bodySpecimens).toHaveLength(4);
  });

  it('every heading specimen is bold Roboto', () => {
    const base = block(css, '\\.nhsw-type-specimen');
    expect(base).toMatch(/font-weight:\s*700/);
    expect(base).toMatch(/font-family:\s*Roboto, Arial, sans-serif/);
  });

  describe('each heading specimen renders at the size and line height its text states', () => {
    for (const s of headingSpecimens) {
      it(`${s.key}: ${s.size}px / ${s.lineHeight}px`, () => {
        const rule = block(css, '\\.nhsw-type-specimen--' + s.key);
        expect(rule).toMatch(new RegExp(String.raw`font-size:\s*${s.size / 16}rem`));
        expect(rule).toMatch(new RegExp(String.raw`line-height:\s*${s.lineHeight / 16}rem`));
      });
    }
  });

  describe('documented heading sizes match the typography tokens', () => {
    for (const s of headingSpecimens) {
      const [sizeToken, lineToken] = headingTokens[s.key];
      it(`${s.key}: ${s.size}px / ${s.lineHeight}px`, () => {
        expect(tokenPx[sizeToken]).toBe(s.size);
        expect(tokenPx[lineToken]).toBe(s.lineHeight);
      });
    }
  });

  describe('documented body sizes match the typography tokens', () => {
    bodySpecimens.forEach((s, i) => {
      const [sizeToken, lineToken] = bodyTokens[i];
      it(`${s.key} (${i + 1}): ${s.size}px / ${s.lineHeight}px`, () => {
        expect(tokenPx[sizeToken]).toBe(s.size);
        expect(tokenPx[lineToken]).toBe(s.lineHeight);
      });
    });
  });
});
