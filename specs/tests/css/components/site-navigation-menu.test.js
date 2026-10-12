import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('site navigation: the default is unchanged, and the overflow menu variant is opt-in (as in the NHS.UK header)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/header";`);
  });

  it('the default navigation is still hidden below 40rem, exactly as before', () => {
    expect(css).toMatch(/@media \(max-width: 40rem\)\s*\{\s*\.nhsw-site-header__nav\s*\{[^}]*display:\s*none/);
  });

  it('the default navigation has no border and its list is not positioned, so nothing about it changed', () => {
    expect(block(css, '\\.nhsw-site-header__nav')).not.toMatch(/border/);
    expect(block(css, '\\.nhsw-site-header__nav-list')).not.toMatch(/position/);
  });

  it('the overflow variant is never hidden, which is what keeps it available at 400% zoom', () => {
    expect(css).toMatch(/@media \(max-width: 40rem\)\s*\{[^}]*\.nhsw-site-header__nav--overflow\s*\{[^}]*display:\s*block/);
  });

  it('the overflow variant has a zero-width bottom border in its own colour, which the script grows to make room for an open menu', () => {
    expect(block(css, '\\.nhsw-site-header__nav--overflow')).toMatch(/border:\s*0 solid #ffffff/);
    expect(block(css, '\\.nhsw-site-header__nav--reverse\\.nhsw-site-header__nav--overflow')).toMatch(/border-color:\s*#1b365d/);
  });

  it('the overflow variant positions its list, so the menu can sit directly under it', () => {
    expect(block(css, '\\.nhsw-site-header__nav--overflow \\.nhsw-site-header__nav-list')).toMatch(/position:\s*relative/);
  });

  it('once the script is running the bar stops wrapping, so overflow goes to the menu instead of a second row', () => {
    const enhanced = block(css, '\\.nhsw-site-header__nav--enhanced \\.nhsw-site-header__nav-list');
    expect(enhanced).toMatch(/flex-wrap:\s*nowrap/);
  });

  it('the menu item stays hidden while hidden, despite the list items being display: flex', () => {
    const hidden = block(css, '\\.nhsw-site-header__menu\\[hidden\\]');
    expect(hidden).toMatch(/display:\s*none/);
  });

  it('the menu button looks like a nav link without an underline, with a chevron that flips when open', () => {
    const toggle = block(css, '\\.nhsw-site-header__menu-toggle');
    expect(toggle).toMatch(/background:\s*none/);
    expect(toggle).toMatch(/border:\s*0/);
    expect(toggle).toMatch(/font-family:\s*inherit/);
    expect(css).toMatch(/\.nhsw-site-header__menu-toggle::after\s*\{[^}]*content:\s*""/);
    expect(css).toMatch(/\.nhsw-site-header__menu-toggle\[aria-expanded=true\]::after\s*\{[^}]*rotate\(-135deg\)/);
  });

  it('the menu drops down directly under the list, across its full width', () => {
    const menuList = block(css, '\\.nhsw-site-header__menu-list');
    expect(menuList).toMatch(/position:\s*absolute/);
    expect(menuList).toMatch(/top:\s*100%/);
    expect(menuList).toMatch(/left:\s*0/);
    expect(menuList).toMatch(/right:\s*0/);
    expect(menuList).toMatch(/list-style:\s*none/);
  });

  it('menu items stack as rows with a divider, and the current page is marked on the left edge, not by an underline', () => {
    expect(block(css, '\\.nhsw-site-header__menu-list li')).toMatch(/border-bottom:\s*1px solid #d8dde0/);
    expect(block(css, '\\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link')).toMatch(/display:\s*block/);
    expect(block(css, '\\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link--current')).toMatch(/box-shadow:\s*inset 4px 0 0 0 #212b32/);
  });

  it('the reverse variant gets a dark menu with a white current-page marker', () => {
    expect(block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__menu-list')).toMatch(/background-color:\s*#1b365d/);
    expect(block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link--current')).toMatch(/inset 4px 0 0 0 #ffffff/);
  });
});

describe('example boxes on the component pages keep a navigation demo in view', () => {
  it('shows the navigation inside an example box even below 40rem, where the component itself would be hidden', () => {
    const css = compileProbe(`@use "components/content/example-preview";`);
    expect(block(css, '\\.nhsw-example-preview__body \\.nhsw-site-header__nav')).toMatch(/display:\s*block/);
  });
});
