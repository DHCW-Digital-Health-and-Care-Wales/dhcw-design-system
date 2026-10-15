import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// The panel title follows the heading type scale, as in the NHS.UK panel.
describe('panel title sizes follow the heading type scale', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/panel";`);
  });

  const atTablet = (selector, declaration) =>
    new RegExp(String.raw`@media \(min-width: 40\.0625em\)\s*\{[\s\S]*?${selector}\s*\{[^}]*${declaration}`);

  it('the default title is Heading XL: 32px on mobile with a 38px line height, 48px and 54px from the tablet breakpoint', () => {
    const title = block(css, '\\.nhsw-panel__title');
    expect(title).toMatch(/font-size:\s*2rem/);
    expect(title).toMatch(/line-height:\s*2\.375rem/);
    expect(title).toMatch(/font-weight:\s*700/);
    expect(css).toMatch(atTablet(String.raw`\.nhsw-panel__title`, String.raw`font-size:\s*3rem[^}]*line-height:\s*3\.375rem`));
  });

  it('the large title is Heading L: 27px/33px on mobile, 36px/42px from the tablet breakpoint', () => {
    const title = block(css, '\\.nhsw-panel__title--l');
    expect(title).toMatch(/font-size:\s*1\.6875rem/);
    expect(title).toMatch(/line-height:\s*2\.0625rem/);
    expect(css).toMatch(atTablet(String.raw`\.nhsw-panel__title--l`, String.raw`font-size:\s*2\.25rem[^}]*line-height:\s*2\.625rem`));
  });

  it('the medium title is Heading M: 22px/29px on mobile, 26px/32px from the tablet breakpoint', () => {
    const title = block(css, '\\.nhsw-panel__title--m');
    expect(title).toMatch(/font-size:\s*1\.375rem/);
    expect(title).toMatch(/line-height:\s*1\.8125rem/);
    expect(css).toMatch(atTablet(String.raw`\.nhsw-panel__title--m`, String.raw`font-size:\s*1\.625rem[^}]*line-height:\s*2rem`));
  });

  it('every size keeps the white colour and a 16px gap under the title, which the heading styles would otherwise set to 40px or more', () => {
    for (const selector of ['\\.nhsw-panel__title', '\\.nhsw-panel__title--l', '\\.nhsw-panel__title--m']) {
      const rules = [...css.matchAll(new RegExp(`^${selector}\\s*\\{([^}]*)\\}`, 'gm'))].map((m) => m[1]).join('\n');
      expect(rules, selector).toMatch(/color:\s*#ffffff/);
      expect(rules, selector).toMatch(/margin:\s*0 0 16px/);
    }
  });

  it('is much bigger than the body text on a desktop: 48px against 19px', () => {
    expect(48 / 19).toBeGreaterThan(2.5);
  });
});
