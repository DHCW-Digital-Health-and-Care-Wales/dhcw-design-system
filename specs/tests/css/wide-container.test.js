import { describe, it, expect } from 'vitest';
import { compileProbe, block } from '../support/compile-scss.js';

describe('wide container', () => {
  it('nhsw-wide-container is capped at 1100px and keeps the standard container margins', () => {
    const css = compileProbe('@use "components/layout/grid";');
    const wide = block(css, '\.nhsw-wide-container');
    expect(wide).toMatch(/max-width:\s*1100px/);
    expect(wide).toMatch(/margin-left:\s*16px/);
  });

  it('the side navigation drops from 19px to 16px inside a wide container', () => {
    const css = compileProbe('@use "components/site/side-nav";');
    expect(block(css, '\.nhsw-side-nav__link')).toMatch(/font-size:\s*1\.1875rem/);
    expect(block(css, '\.nhsw-wide-container \.nhsw-side-nav__link')).toMatch(/font-size:\s*1rem/);
    expect(css).toMatch(/\.nhsw-wide-container \.nhsw-side-nav__heading,\s*\.nhsw-wide-container \.nhsw-side-nav__link\s*\{/);
  });
});
