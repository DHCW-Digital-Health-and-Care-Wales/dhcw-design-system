import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('checkboxes match Figma Checkboxes component (40x40px input square)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/checkboxes";`);
  });

  it('input hit target is 40x40px', () => {
    const input = block(css, '\\.nhsw-checkboxes__input');
    expect(input).toMatch(/width:\s*40px/);
    expect(input).toMatch(/height:\s*40px/);
  });

  it('visible box is 40x40px with a 2px border, square (no radius)', () => {
    const before = block(css, '\\.nhsw-checkboxes__label::before');
    expect(before).toMatch(/width:\s*40px/);
    expect(before).toMatch(/height:\s*40px/);
    expect(before).toMatch(/border:\s*2px solid #4c6272/);
    expect(before).toMatch(/border-radius:\s*0/);
    expect(before).toMatch(/background:\s*#ffffff/);
  });
});

describe('checkboxes: regular-weight labels, centred tick, row hover, thicker focus border, matching hint/divider colours', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/checkboxes";`);
  });

  it('item row highlights on hover', () => {
    const hover = block(css, '\\.nhsw-checkboxes__item:hover');
    expect(hover).toMatch(/background-color:\s*#f0f4f5/);
  });

  it('focus adds a thicker near-black border alongside the yellow ring', () => {
    const focus = block(css, '\\.nhsw-checkboxes__input:focus \\+ \\.nhsw-checkboxes__label::before');
    expect(focus).toMatch(/border-color:\s*#212b32/);
    expect(focus).toMatch(/border-width:\s*4px/);
    expect(focus).toMatch(/box-shadow:\s*0 0 0 4px #ffeb3b/);
  });

  it('label is regular weight, not bold', () => {
    const label = block(css, '\\.nhsw-checkboxes__label');
    expect(label).toMatch(/font-weight:\s*400/);
  });

  it('tick is a thick (4px), slightly-flattened (23x10) glyph, vertically centred on its ink centroid (top: 12px)', () => {
    // The glyph is an L-shape (adjacent border-left + border-bottom) rotated
    // -45deg. Its ink isn't centred in its own bounding box, so naively
    // centring the box overshoots — top has to be recomputed from the ink
    // centroid whenever width/height/border here change.
    const tick = block(css, '\\.nhsw-checkboxes__label::after');
    expect(tick).toMatch(/width:\s*23px/);
    expect(tick).toMatch(/height:\s*10px/);
    expect(tick).toMatch(/border-left:\s*4px/);
    expect(tick).toMatch(/border-bottom:\s*4px/);
    expect(tick).toMatch(/top:\s*12px/);
  });

  it('small variant tick is vertically centred by its ink centroid (top: 8px)', () => {
    const smallTick = block(css, '\\.nhsw-checkboxes--small \\.nhsw-checkboxes__label::after');
    expect(smallTick).toMatch(/top:\s*8px/);
  });

  it('hint matches the label size (19px), and the "or" divider is near-black, not grey', () => {
    const hint = block(css, '\\.nhsw-checkboxes__hint');
    expect(hint).toMatch(/font-size:\s*1\.1875rem/);
    const divider = block(css, '\\.nhsw-checkboxes__divider');
    expect(divider).toMatch(/color:\s*#212b32/);
  });

  it('items are spaced 6px apart, narrower than the 16px used elsewhere', () => {
    const item = block(css, '\\.nhsw-checkboxes__item\\b');
    expect(item).toMatch(/margin-bottom:\s*6px/);
  });

  it('the label itself carries no bottom margin, so item spacing is controlled only by the item, not by the shared .nhsw-label hint-aware margin', () => {
    const label = block(css, '\\.nhsw-checkboxes__label\\.nhsw-label');
    expect(label).toMatch(/margin-bottom:\s*0/);
  });

  it('conditional content indents 52px total (margin + border + padding), aligning with the 52px item label', () => {
    const conditional = block(css, '\\.nhsw-checkboxes__conditional\\b');
    expect(conditional).toMatch(/margin-left:\s*18px/);
    expect(conditional).toMatch(/padding-left:\s*30px/);
    expect(conditional).toMatch(/border-left:\s*4px/);
  });

  it('a nested field label inside conditional content is regular weight, matching the checkbox label rather than the bold default', () => {
    const conditionalLabel = block(css, '\\.nhsw-checkboxes__conditional \\.nhsw-label');
    expect(conditionalLabel).toMatch(/font-weight:\s*400/);
  });
});
