import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('phase banner', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/phase-banner";`);
  });

  it('has a light grey bottom border that separates it from the page', () => {
    expect(block(css, '\\.nhsw-phase-banner__container')).toMatch(/border-bottom:\s*1px solid #d8dde0/);
  });

  it('lines the tag up with the first navigation link, and stops the line 40px short of the right edge', () => {
    expect(css).toMatch(/margin-right:\s*2\.5rem/);
    expect(css).toMatch(/padding:\s*10px 2rem 10px calc\(2rem \+ 4px\)/);
  });

  it('the tag is 24px tall: 22px line height plus its border', () => {
    const tag = block(css, '\\.nhsw-phase-banner__tag');
    expect(tag).toMatch(/line-height:\s*22px/);
    expect(tag).toMatch(/padding:\s*0 8px/);
  });

  it('shows the phase as a bold tag with a blue border and light blue background', () => {
    const tag = block(css, '\\.nhsw-phase-banner__tag');
    expect(tag).toMatch(/border:\s*1px solid #004281/);
    expect(tag).toMatch(/background-color:\s*#cce0f1/);
    expect(tag).toMatch(/color:\s*#004281/);
    expect(tag).toMatch(/font-weight:\s*700/);
  });

  it('the reverse variant, used inside the dark header, has white text and a solid blue tag', () => {
    expect(block(css, '\\.nhsw-phase-banner--reverse')).toMatch(/color:\s*#ffffff/);
    const tag = block(css, '\\.nhsw-phase-banner--reverse \\.nhsw-phase-banner__tag');
    expect(tag).toMatch(/background-color:\s*#004281/);
    expect(tag).toMatch(/color:\s*#ffffff/);
  });
});

describe('header account area', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/header";`);
  });

  it('shows the signed-in user in a bordered chip with white 16px text, as in the Figma account information', () => {
    const user = block(css, '\\.nhsw-site-header__user');
    expect(user).toMatch(/border:\s*1px solid #d8dde0/);
    expect(user).toMatch(/border-radius:\s*4px/);
    expect(user).toMatch(/padding:\s*4px 12px 4px 4px/);
    expect(user).toMatch(/min-height:\s*40px/);
    expect(user).toMatch(/color:\s*#ffffff/);
    expect(user).toMatch(/font-size:\s*1rem/);
    expect(user).toMatch(/line-height:\s*1\.5rem/);
  });

  it('the icon is a 32px white square with a navy glyph on the navy header', () => {
    const icon = block(css, '\\.nhsw-site-header__user-icon');
    expect(icon).toMatch(/width:\s*32px/);
    expect(icon).toMatch(/height:\s*32px/);
    expect(icon).toMatch(/padding:\s*4px/);
    expect(icon).toMatch(/border-radius:\s*4px/);
    expect(icon).toMatch(/background-color:\s*#ffffff/);
    expect(icon).toMatch(/color:\s*#1b365d/);
    expect(css).toMatch(/\.nhsw-site-header__user-icon svg\s*\{[^}]*width:\s*24px[^}]*height:\s*24px/);
  });

  it('puts 8px between the chips and 32px before the sign out link', () => {
    expect(block(css, '\\.nhsw-site-header__account-info')).toMatch(/gap:\s*8px/);
    expect(block(css, '\\.nhsw-site-header__account')).toMatch(/gap:\s*8px 32px/);
  });

  it('the log out link is white, 16px and underlined, and loses the underline on hover', () => {
    expect(block(css, '\\.nhsw-site-header__logout')).toMatch(/text-decoration:\s*underline/);
    expect(block(css, '\\.nhsw-site-header__logout')).toMatch(/font-size:\s*1rem/);
    expect(block(css, '\\.nhsw-site-header__logout:hover')).toMatch(/text-decoration:\s*none/);
  });

  it('the log out link uses the yellow focus state', () => {
    expect(block(css, '\\.nhsw-site-header__logout:focus')).toMatch(/background-color:\s*#ffeb3b/);
  });
});
