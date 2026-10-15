import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('side nav heading label (used above a grouped set of links, e.g. "Setup")', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/side-nav";`);
  });

  it('is bold, dark text, sitting above the link list', () => {
    const heading = block(css, '\\.nhsw-side-nav__heading');
    expect(heading).toMatch(/font-weight:\s*700/);
    expect(heading).toMatch(/color:\s*#212b32/);
  });
});

describe('side nav rail and link states', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/side-nav";`);
  });

  it('rail has a grey right-hand border', () => {
    const nav = block(css, '\\.nhsw-side-nav\\b');
    expect(nav).toMatch(/border-right:\s*1px solid #d8dde0/);
  });

  it('link is link-blue, darkening to the link-hover colour on hover', () => {
    const link = block(css, '\\.nhsw-side-nav__link\\b');
    expect(link).toMatch(/color:\s*#005aa8/);
    const hover = block(css, '\\.nhsw-side-nav__link:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);
  });

  it('focus highlights the wrapping span with a yellow background, near-black text and a dark bottom-edge box-shadow', () => {
    const focusSpan = block(css, '\\.nhsw-side-nav__link:focus span');
    expect(focusSpan).toMatch(/background-color:\s*#ffeb3b/);
    expect(focusSpan).toMatch(/color:\s*#212b32/);
    expect(focusSpan).toMatch(/box-shadow:\s*0 4px 0 0 #212b32/);
  });

  it('current link stays link-blue with a matching link-blue rail indicator', () => {
    const current = block(css, '\\.nhsw-side-nav__link--current\\b');
    expect(current).toMatch(/color:\s*#005aa8/);
    const indicator = block(css, '\\.nhsw-side-nav__link--current::before');
    expect(indicator).toMatch(/background-color:\s*#005aa8/);
  });
});
