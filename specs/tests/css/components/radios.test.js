import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('radios match Figma Radios component (40x40px circle)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/radios";`);
  });

  it('input hit target is 40x40px', () => {
    const input = block(css, '\\.nhsw-radios__input');
    expect(input).toMatch(/width:\s*40px/);
    expect(input).toMatch(/height:\s*40px/);
  });

  it('visible circle is 40x40px with a 2px border and full radius', () => {
    const before = block(css, '\\.nhsw-radios__label::before');
    expect(before).toMatch(/width:\s*40px/);
    expect(before).toMatch(/height:\s*40px/);
    expect(before).toMatch(/border:\s*2px solid #4c6272/);
    expect(before).toMatch(/border-radius:\s*50%/);
    expect(before).toMatch(/background:\s*#ffffff/);
  });
});

describe('radios: regular-weight labels, tighter item spacing, no row hover wash, thicker focus border, matching hint/divider colours', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/radios";`);
  });

  it('item spacing is 6px, not 16px', () => {
    const item = block(css, '\\.nhsw-radios__item');
    expect(item).toMatch(/margin-bottom:\s*6px/);
  });

  it('the label itself carries no bottom margin, so item spacing is controlled only by the item, not by the shared .nhsw-label hint-aware margin', () => {
    const label = block(css, '\\.nhsw-radios__label\\.nhsw-label');
    expect(label).toMatch(/margin-bottom:\s*0/);
  });

  it('item row has no hover background wash', () => {
    const hover = block(css, '\\.nhsw-radios__item:hover');
    expect(hover).toBe('');
  });

  it('hovering the item rings just the circle with a grey shadow, not a background wash', () => {
    const hoverRing = block(css, '\\.nhsw-radios__item:hover \\.nhsw-radios__label::before');
    expect(hoverRing).toMatch(/box-shadow:\s*0 0 0 4px #afb8bf/);
  });

  it('hovering a focused item layers the grey ring around the outside of the yellow focus ring (4px yellow, then grey out to 8px)', () => {
    const combined = block(css, '\\.nhsw-radios__item:hover \\.nhsw-radios__input:focus \\+ \\.nhsw-radios__label::before');
    expect(combined).toMatch(/box-shadow:\s*0 0 0 4px #ffeb3b,\s*0 0 0 8px #afb8bf/);
  });

  it('focus adds a thicker near-black border alongside the yellow ring', () => {
    const focus = block(css, '\\.nhsw-radios__input:focus \\+ \\.nhsw-radios__label::before');
    expect(focus).toMatch(/border-color:\s*#212b32/);
    expect(focus).toMatch(/border-width:\s*4px/);
    expect(focus).toMatch(/box-shadow:\s*0 0 0 4px #ffeb3b/);
  });

  it('small variant focus border is slightly thinner (3px) than the default size (4px)', () => {
    const smallFocus = block(css, '\\.nhsw-radios--small \\.nhsw-radios__input:focus \\+ \\.nhsw-radios__label::before');
    expect(smallFocus).toMatch(/border-width:\s*3px/);
  });

  it('label is regular weight, not bold', () => {
    const label = block(css, '\\.nhsw-radios__label');
    expect(label).toMatch(/font-weight:\s*400/);
  });

  it('hint matches the label size (19px), and the "or" divider is near-black, not grey', () => {
    const hint = block(css, '\\.nhsw-radios__hint');
    expect(hint).toMatch(/font-size:\s*1\.1875rem/);
    const divider = block(css, '\\.nhsw-radios__divider');
    expect(divider).toMatch(/color:\s*#212b32/);
  });

  it('divider margin-bottom matches the 6px item spacing, not the old 16px', () => {
    const divider = block(css, '\\.nhsw-radios__divider');
    expect(divider).toMatch(/margin-bottom:\s*6px/);
  });

  it('conditional content indents 52px total (margin + border + padding), aligning with the 52px item label', () => {
    const conditional = block(css, '\\.nhsw-radios__conditional\\b');
    expect(conditional).toMatch(/margin-left:\s*18px/);
    expect(conditional).toMatch(/padding-left:\s*30px/);
    expect(conditional).toMatch(/border-left:\s*4px/);
  });

  it('a nested field label inside conditional content is regular weight, matching the radio label rather than the bold default', () => {
    const conditionalLabel = block(css, '\\.nhsw-radios__conditional \\.nhsw-label');
    expect(conditionalLabel).toMatch(/font-weight:\s*400/);
  });
});
