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

describe('checkboxes: regular-weight labels, centred tick, no row hover, thicker focus border, matching hint/divider colours', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/checkboxes";`);
  });

  it('item row has no hover background, and the default size has no hover ring: only the small checkboxes do', () => {
    expect(css).not.toMatch(/(^|\n)\.nhsw-checkboxes__item:hover/);
    expect(css).not.toMatch(/(^|\n)\.nhsw-checkboxes__input:hover/);
    expect(block(css, '\\.nhsw-checkboxes__item:hover')).toBe('');
  });

  it('hovering a small checkbox rings just the box with a grey shadow, not a background wash, and not when it is disabled', () => {
    const hoverRing = block(css, '\\.nhsw-checkboxes--small \\.nhsw-checkboxes__item:hover \\.nhsw-checkboxes__input:not\\(:disabled\\) \\+ \\.nhsw-checkboxes__label::before');
    expect(hoverRing).toMatch(/box-shadow:\s*0 0 0 4px #afb8bf/);
    expect(hoverRing).not.toMatch(/background/);
  });

  it('hovering a focused small checkbox layers the grey ring around the outside of the yellow focus ring (4px yellow, then grey out to 8px)', () => {
    const combined = block(css, '\\.nhsw-checkboxes--small \\.nhsw-checkboxes__item:hover \\.nhsw-checkboxes__input:not\\(:disabled\\):focus \\+ \\.nhsw-checkboxes__label::before');
    expect(combined).toMatch(/box-shadow:\s*0 0 0 4px #ffeb3b,\s*0 0 0 8px #afb8bf/);
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

  it('tick is the Figma tick (20x17), centred in the 40px box, and dark', () => {
    const tick = block(css, '\\.nhsw-checkboxes__label::after');
    expect(tick).toMatch(/width:\s*20px/);
    expect(tick).toMatch(/height:\s*17px/);
    expect(tick).toMatch(/left:\s*10px/);
    expect(tick).toMatch(/top:\s*11\.5px/);
    expect(tick).toMatch(/background-color:\s*#212b32/);
    expect(tick).toContain('M6.66667%2016.1905L0%209.56777L2.96459%206.62272L6.66667%2010.3108L17.0354%200L20%202.94505L6.66667%2016.1905Z');
    expect(tick).not.toMatch(/border-left/);
    expect(tick).not.toMatch(/transform/);
  });

  it('small variant tick is the same shape scaled down (12x10), centred in the 24px box', () => {
    const smallTick = block(css, '\\.nhsw-checkboxes--small \\.nhsw-checkboxes__label::after');
    expect(smallTick).toMatch(/left:\s*6px/);
    expect(smallTick).toMatch(/top:\s*7px/);
    expect(smallTick).toMatch(/width:\s*12px/);
    expect(smallTick).toMatch(/height:\s*10px/);
  });

  it('hint matches the label size (19px), and the "or" divider is near-black, not grey', () => {
    const hint = block(css, '\\.nhsw-checkboxes__hint');
    expect(hint).toMatch(/font-size:\s*1\.1875rem/);
    const divider = block(css, '\\.nhsw-checkboxes__divider');
    expect(divider).toMatch(/color:\s*#212b32/);
    expect(divider).toMatch(/margin:\s*6px 0/);
    expect(divider).not.toMatch(/margin-bottom:\s*16px/);
  });

  it('items are spaced 10px apart, and smaller checkboxes 16px apart', () => {
    const item = block(css, '\\.nhsw-checkboxes__item\\b');
    expect(item).toMatch(/margin-bottom:\s*10px/);
    const small = block(css, '\\.nhsw-checkboxes--small \\.nhsw-checkboxes__item');
    expect(small).toMatch(/margin-bottom:\s*16px/);
  });

  it('an option above a visible conditional line keeps the line 6px below it', () => {
    expect(css).toMatch(/\.nhsw-checkboxes__item:has\(\+ \.nhsw-checkboxes__conditional:not\(\.nhsw-checkboxes__conditional--hidden\)\)\s*\{\s*margin-bottom:\s*0/);
  });

  it('the item is at least as tall as the 40px box, so the box never overhangs the gap below it', () => {
    expect(block(css, '\\.nhsw-checkboxes__item\\b')).toMatch(/min-height:\s*40px/);
  });

  it('the label itself carries no bottom margin, so item spacing is controlled only by the item, not by the shared .nhsw-label hint-aware margin', () => {
    const label = block(css, '\\.nhsw-checkboxes__label\\.nhsw-label');
    expect(label).toMatch(/margin-bottom:\s*0/);
  });

  it('conditional content indents 52px total (margin + border + padding), aligning with the 52px item label', () => {
    const conditional = block(css, '\\.nhsw-checkboxes__conditional\\b');
    expect(conditional).toMatch(/margin:\s*6px 0 2px 18px/);
    expect(conditional).toMatch(/padding-left:\s*30px/);
    expect(conditional).toMatch(/border-left:\s*4px/);
  });

  it('the line has 6px above and 2px below, and the option after it has 14px (22px from the tablet breakpoint), the same as the radios', () => {
    expect(block(css, '\\.nhsw-checkboxes__conditional \\+ \\.nhsw-checkboxes__item')).toMatch(/margin-top:\s*14px/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)\s*\{\s*\.nhsw-checkboxes__conditional \+ \.nhsw-checkboxes__item\s*\{\s*margin-top:\s*22px/);
    expect(block(css, '\\.nhsw-checkboxes__conditional--hidden \\+ \\.nhsw-checkboxes__item')).toMatch(/margin-top:\s*0/);
  });

  it('a nested field label inside conditional content is regular weight, matching the checkbox label rather than the bold default', () => {
    const conditionalLabel = block(css, '\\.nhsw-checkboxes__conditional \\.nhsw-label');
    expect(conditionalLabel).toMatch(/font-weight:\s*400/);
  });
});
