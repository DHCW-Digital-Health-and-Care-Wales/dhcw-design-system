import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('dashboard page shell', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/dashboard";`);
  });

  it('puts the navy left-hand navigation beside the page content from the tablet breakpoint', () => {
    expect(block(css, '\\.nhsw-dashboard__sidebar')).toMatch(/background-color:\s*#1b365d/);
    expect(css).toMatch(/\.nhsw-dashboard\s*\{[^}]*flex-direction:\s*row/);
    expect(css).toMatch(/\.nhsw-dashboard__sidebar\s*\{[^}]*width:\s*240px/);
  });

  it('separates each group of navigation links with a divider', () => {
    expect(block(css, '\\.nhsw-dashboard__nav-group')).toMatch(/border-bottom:\s*1px solid #32598a/);
  });

  it('navigation links are white 14px text and use the yellow focus state', () => {
    const link = block(css, '\\.nhsw-dashboard__nav-link');
    expect(link).toMatch(/color:\s*#ffffff/);
    expect(link).toMatch(/font-size:\s*0\.875rem/);
    expect(block(css, '\\.nhsw-dashboard__nav-link:focus')).toMatch(/background-color:\s*#ffeb3b/);
  });

  it('the current link is bold', () => {
    expect(block(css, '\\.nhsw-dashboard__nav-link--current')).toMatch(/font-weight:\s*700/);
  });

  it('the top bar is white with a blue bottom border, and holds bordered chips', () => {
    const bar = block(css, '\\.nhsw-dashboard__topbar');
    expect(bar).toMatch(/border-bottom:\s*1px solid #005aa8/);
    expect(bar).toMatch(/background-color:\s*#ffffff/);
    expect(block(css, '\\.nhsw-dashboard__chip')).toMatch(/border:\s*1px solid #d8dde0/);
  });
});
