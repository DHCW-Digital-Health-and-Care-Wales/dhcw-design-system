import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('phase banner', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/phase-banner";`);
  });

  it('has a light grey bottom border that separates it from the page', () => {
    expect(block(css, '\\.nhsw-phase-banner')).toMatch(/border-bottom:\s*1px solid #d8dde0/);
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

  it('shows the signed-in user in a solid blue chip with white text', () => {
    const user = block(css, '\\.nhsw-site-header__user');
    expect(user).toMatch(/background-color:\s*#004281/);
    expect(user).toMatch(/color:\s*#ffffff/);
  });

  it('the log out link is white and underlined, and loses the underline on hover', () => {
    expect(block(css, '\\.nhsw-site-header__logout')).toMatch(/text-decoration:\s*underline/);
    expect(block(css, '\\.nhsw-site-header__logout:hover')).toMatch(/text-decoration:\s*none/);
  });

  it('the log out link uses the yellow focus state', () => {
    expect(block(css, '\\.nhsw-site-header__logout:focus')).toMatch(/background-color:\s*#ffeb3b/);
  });
});
