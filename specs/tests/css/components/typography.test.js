import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('typography classes apply the token-driven mobile/tablet values', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/typography";`);
  });

  it('.nhsw-h1 is bold, 2rem mobile / 3rem tablet, with matching margin-bottom', () => {
    const h1 = block(css, '\\.nhsw-h1');
    expect(h1).toMatch(/font-weight:\s*700/);
    expect(h1).toMatch(/font-size:\s*2rem/);
    expect(h1).toMatch(/margin:\s*0 0 40px/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)[\s\S]*?\.nhsw-h1\s*\{[^}]*font-size:\s*3rem/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)[\s\S]*?\.nhsw-h1\s*\{[^}]*margin-bottom:\s*48px/);
  });

  it('.nhsw-body is regular weight, 1rem mobile / 1.1875rem tablet', () => {
    const body = block(css, '\\.nhsw-body');
    expect(body).toMatch(/font-weight:\s*400/);
    expect(body).toMatch(/font-size:\s*1rem/);
    expect(body).toMatch(/margin:\s*0 0 16px/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)[\s\S]*?\.nhsw-body\s*\{[^}]*font-size:\s*1\.1875rem/);
  });

  it('.nhsw-body-s uses the body-small size/line-height token', () => {
    const bodyS = block(css, '\\.nhsw-body-s');
    expect(bodyS).toMatch(/font-size:\s*1rem/);
    expect(bodyS).toMatch(/line-height:\s*1\.5rem/);
  });

  it('.nhsw-body--secondary recolours to the secondary text token', () => {
    const secondary = block(css, '\\.nhsw-body--secondary');
    expect(secondary).toMatch(/color:\s*#4c6272/);
  });

  it.each(['nhsw-h1', 'nhsw-h2', 'nhsw-h3', 'nhsw-h4', 'nhsw-h5', 'nhsw-body', 'nhsw-body-s'])(
    '.%s uses the base font family (Roboto, Arial, sans-serif)',
    (className) => {
      const rule = block(css, `\\.${className}`);
      expect(rule).toMatch(/font-family:\s*Roboto,\s*Arial,\s*sans-serif/);
    },
  );

  it.each([
    ['nhsw-caption-xl', '1.375rem'],
    ['nhsw-caption-l', '1.1875rem'],
    ['nhsw-caption-m', '1rem'],
    ['nhsw-caption-s', '0.875rem'],
  ])('.%s is %s, regular weight, secondary (grey) colour, not responsive', (className, fontSize) => {
    const rule = block(css, `\\.${className}`);
    expect(rule).toMatch(new RegExp(`font-size:\\s*${fontSize.replace('.', '\\.')}`));
    expect(rule).toMatch(/font-weight:\s*400/);
    expect(rule).toMatch(/color:\s*#4c6272/);
  });
});
