import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('warning callout matches Figma Warning callout component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/callouts/warning-callout";`);
  });

  it('heading has a 10px icon/text gap and 8px vertical / 32px horizontal padding', () => {
    // The heading selector appears twice (once from the typography mixin,
    // once with its own layout rules) — the layout block is the one with `gap`.
    const headingBlocks = [...css.matchAll(/^\.nhsw-warning-callout__heading\s*\{([^}]*)\}/gm)].map((m) => m[1]);
    const layoutBlock = headingBlocks.find((b) => b.includes('gap')) ?? '';
    expect(layoutBlock).toMatch(/gap:\s*0\.625rem/);
    expect(layoutBlock).toMatch(/padding:\s*0\.5rem 2rem/);
  });

  it('content has 48px top / 32px sides / 32px bottom padding', () => {
    const content = block(css, '\\.nhsw-warning-callout__content');
    expect(content).toMatch(/padding:\s*3rem 2rem 2rem/);
  });

  it('heading background and content border use the Extended/yellow token (#ffeb3b)', () => {
    const headingBlocks = [...css.matchAll(/^\.nhsw-warning-callout__heading\s*\{([^}]*)\}/gm)].map((m) => m[1]);
    const layoutBlock = headingBlocks.find((b) => b.includes('background-color')) ?? '';
    const content = block(css, '\\.nhsw-warning-callout__content');
    expect(layoutBlock).toMatch(/background-color:\s*#ffeb3b/);
    expect(content).toMatch(/border:\s*1px solid #ffeb3b/);
  });

  it('content background matches Extended/yellow-light (#fff9c4)', () => {
    const content = block(css, '\\.nhsw-warning-callout__content');
    expect(content).toMatch(/background-color:\s*#fff9c4/);
  });

  it('important variant content border matches the light-grey token (#d8dde0), not navy', () => {
    const importantContent = block(css, '\\.nhsw-warning-callout--important \\.nhsw-warning-callout__content');
    expect(importantContent).toMatch(/border-color:\s*#d8dde0/);
  });

  it('the icon is the design-system warning icon, painted dark with the exclamation mark cut out', () => {
    const icon = block(css, '\.nhsw-warning-callout__icon');
    expect(icon).toMatch(/background-color:\s*#212b32/);
    expect(icon).toMatch(/mask:\s*url\("data:image\/svg\+xml/);
  });

  it('important variant inverts heading/icon colours to navy and gives content a white background', () => {
    const heading = block(css, '\\.nhsw-warning-callout--important \\.nhsw-warning-callout__heading');
    expect(heading).toMatch(/background-color:\s*#1b365d/);
    expect(heading).toMatch(/color:\s*#ffffff/);

    const icon = block(css, '\\.nhsw-warning-callout--important \\.nhsw-warning-callout__icon');
    expect(icon).toMatch(/background-color:\s*#ffffff/);

    const importantContent = block(css, '\\.nhsw-warning-callout--important \\.nhsw-warning-callout__content');
    expect(importantContent).toMatch(/background-color:\s*#ffffff/);
  });

  it('the icon is as tall as one line of the heading, as NHS England does for icons beside text, so it lines up with the text without any offset', () => {
    const icon = block(css, '\.nhsw-warning-callout__icon');
    expect(icon).toMatch(/width:\s*1\.6875rem/);
    expect(icon).toMatch(/height:\s*1\.6875rem/);
    expect(icon).not.toMatch(/margin-top/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)\s*\{\s*\.nhsw-warning-callout__icon\s*\{[^}]*width:\s*2\.0625rem[^}]*height:\s*2\.0625rem/);
  });
});
