import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('grid row/column/container gutters and breakpoint widths', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/layout/grid";`);
  });

  it('grid row cancels the gutter with negative margins', () => {
    const row = block(css, '\\.nhsw-grid-row');
    expect(row).toMatch(/margin-left:\s*-16px/);
    expect(row).toMatch(/margin-right:\s*-16px/);
  });

  it('grid columns pad by the gutter and are full-width below desktop', () => {
    const columns = block(css, '\\.nhsw-grid-column-full,\\s*\\n?\\.nhsw-grid-column-one-half,\\s*\\n?\\.nhsw-grid-column-one-third,\\s*\\n?\\.nhsw-grid-column-two-thirds,\\s*\\n?\\.nhsw-grid-column-one-quarter,\\s*\\n?\\.nhsw-grid-column-three-quarters');
    expect(columns).toMatch(/padding-left:\s*16px/);
    expect(columns).toMatch(/padding-right:\s*16px/);
    expect(columns).toMatch(/width:\s*100%/);
  });

  it('one-third and one-half columns resolve to their fractional widths at desktop', () => {
    expect(css).toMatch(/@media \(min-width: 48\.0625em\)[\s\S]*?\.nhsw-grid-column-one-half\s*\{[^}]*width:\s*50%/);
    expect(css).toMatch(/\.nhsw-grid-column-one-third\s*\{[^}]*width:\s*33\.3333%/);
  });

  it('fluid container pads 16px mobile, 40px desktop (the Layout page)', () => {
    const fluid = block(css, '\\.nhsw-fluid-container');
    expect(fluid).toMatch(/padding-left:\s*16px/);
    expect(css).toMatch(/@media \(min-width: 48\.0625em\)[\s\S]*?\.nhsw-fluid-container\s*\{[^}]*padding-left:\s*40px/);
  });

  it('page body has the light grey backdrop colour', () => {
    const body = block(css, 'body');
    expect(body).toMatch(/background-color:\s*#f0f4f5/);
  });
});

describe('grid gutters and page spacing follow the Layout page', () => {
  let layoutCss = '';

  beforeAll(() => {
    layoutCss = compileProbe(`@use "components/layout"; @use "layouts";`);
  });

  it('columns are 40px apart from the desktop breakpoint (20px gutter each side), 16px gutters below it', () => {
    expect(block(layoutCss, '\.nhsw-grid-row')).toMatch(/margin-left:\s*-16px/);
    expect(layoutCss).toMatch(/@media \(min-width: 48\.0625em\)\s*\{\s*\.nhsw-grid-row\s*\{[^}]*margin-left:\s*-20px/);
    expect(layoutCss).toMatch(/\.nhsw-grid-column-three-quarters\s*\{[^}]*padding-left:\s*16px/);
    expect(layoutCss).toMatch(/@media \(min-width: 48\.0625em\)\s*\{[^@]*?\.nhsw-grid-column-three-quarters\s*\{[^}]*padding-left:\s*20px/);
  });

  it('main content has 24px above it on mobile, then 32px top and bottom', () => {
    const wrapper = block(layoutCss, '\.nhsw-main-wrapper');
    expect(wrapper).toMatch(/padding-top:\s*24px/);
    expect(wrapper).toMatch(/padding-bottom:\s*32px/);
    expect(layoutCss).toMatch(/@media \(min-width: 40\.0625em\)\s*\{\s*\.nhsw-main-wrapper\s*\{[^}]*padding-top:\s*32px[^}]*padding-bottom:\s*32px/);
  });
});
