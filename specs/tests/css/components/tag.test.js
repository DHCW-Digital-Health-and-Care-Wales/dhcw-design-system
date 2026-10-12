import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('tag matches Figma Tag component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tag";`);
  });

  it('base tag has 4px vertical / 8px horizontal padding and a 1px border', () => {
    const base = block(css, '\\.nhsw-tag');
    expect(base).toMatch(/padding:\s*4px 8px/);
    expect(base).toMatch(/border:\s*1px solid/);
  });

  it('blue variant matches Extended/blue-light background and blue-dark border+text', () => {
    const variant = block(css, '\\.nhsw-tag--blue');
    expect(variant).toMatch(/background-color:\s*#ccdff1/);
    expect(variant).toMatch(/border-color:\s*#004281/);
    expect(variant).toMatch(/color:\s*#004281/);
  });

  it('grey variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--grey');
    expect(variant).toMatch(/background-color:\s*#dbe0e3/);
    expect(variant).toMatch(/border-color:\s*#354550/);
  });

  it('green variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--green');
    expect(variant).toMatch(/background-color:\s*#cce5d8/);
    expect(variant).toMatch(/border-color:\s*#004c23/);
  });
});

describe('tag centres multi-line text and can be grouped with no gap between two tags', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tag";`);
  });

  it('tag text is centre-aligned, so a stat tag\'s two lines line up', () => {
    const base = block(css, '\\.nhsw-tag');
    expect(base).toMatch(/text-align:\s*center/);
  });

  it('no-colour removes the fill and text colour, keeping a light grey border (matches NHS.UK tag--no-colour)', () => {
    const variant = block(css, '\\.nhsw-tag--no-colour');
    expect(variant).toMatch(/background-color:\s*transparent/);
    expect(variant).toMatch(/border-color:\s*#aeb7bd/);
    expect(variant).toMatch(/color:\s*inherit/);
  });

  it('no-border makes the border transparent, so the tag keeps its size (matches NHS.UK tag--no-border)', () => {
    const variant = block(css, '\\.nhsw-tag--no-border');
    expect(variant).toMatch(/border-color:\s*transparent/);
  });

  it('no-colour and no-border come after every colour variant, so they win when combined with one', () => {
    const lastColour = css.indexOf('.nhsw-tag--dhcw-blue');
    expect(css.indexOf('.nhsw-tag--no-colour')).toBeGreaterThan(lastColour);
    expect(css.indexOf('.nhsw-tag--no-border')).toBeGreaterThan(css.indexOf('.nhsw-tag--no-colour'));
  });

  it('a tag-group removes the border between its first and second tag so they sit flush, even though visually hidden text now comes before the first tag', () => {
    expect(css).not.toMatch(/\.nhsw-tag-group \.nhsw-tag:first-child/);
    const firstTag = block(css, '\\.nhsw-tag-group \\.nhsw-tag:first-of-type');
    expect(firstTag).toMatch(/border-right:\s*none/);
  });
});

describe('tag colour coverage (remaining Figma swatches)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tag";`);
  });

  it('base tag is navy with white text', () => {
    const base = block(css, '\\.nhsw-tag');
    expect(base).toMatch(/border:\s*1px solid #183154/);
    expect(base).toMatch(/background-color:\s*#183154/);
    expect(base).toMatch(/color:\s*#ffffff/);
  });

  it('white variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--white');
    expect(variant).toMatch(/background-color:\s*#ffffff/);
  });

  it('aqua-green variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--aqua-green');
    expect(variant).toMatch(/background-color:\s*#ccedeb/);
    expect(variant).toMatch(/border-color:\s*#00524d/);
    expect(variant).toMatch(/color:\s*#00524d/);
  });

  it('purple variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--purple');
    expect(variant).toMatch(/background-color:\s*#d6cce3/);
    expect(variant).toMatch(/border-color:\s*#240050/);
    expect(variant).toMatch(/color:\s*#240050/);
  });

  it('pink variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--pink');
    expect(variant).toMatch(/background-color:\s*#efd3e3/);
    expect(variant).toMatch(/border-color:\s*#57133a/);
    expect(variant).toMatch(/color:\s*#57133a/);
  });

  it('red variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--red');
    expect(variant).toMatch(/background-color:\s*#f7d4d1/);
    expect(variant).toMatch(/border-color:\s*#6b140e/);
    expect(variant).toMatch(/color:\s*#6b140e/);
  });

  it('orange variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--orange');
    expect(variant).toMatch(/background-color:\s*#ffdc8e/);
    expect(variant).toMatch(/border-color:\s*#4d3708/);
    expect(variant).toMatch(/color:\s*#4d3708/);
  });

  it('yellow variant matches Figma swatch', () => {
    const variant = block(css, '\\.nhsw-tag--yellow');
    expect(variant).toMatch(/background-color:\s*#fff59d/);
    expect(variant).toMatch(/border-color:\s*#4d4712/);
    expect(variant).toMatch(/color:\s*#4d4712/);
  });

  it('dhcw-blue variant text is white', () => {
    const variant = block(css, '\\.nhsw-tag--dhcw-blue');
    expect(variant).toMatch(/color:\s*#ffffff/);
  });
});
