import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('radios match Figma Radios component (40x40px circle)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/radios";`);
  });

  it('input hit target is 44x44px, as in the NHS.UK radios, with the 40px circle inside it', () => {
    const rules = [...css.matchAll(/^\.nhsw-radios__input\s*\{([^}]*)\}/gm)].map((m) => m[1]).join('\n');
    expect(rules).toMatch(/width:\s*44px/);
    expect(rules).toMatch(/height:\s*44px/);
    expect(block(css, '\\.nhsw-radios__item')).toMatch(/min-height:\s*44px/);
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

  it('there is 6px above each option except the first, rather than a margin below', () => {
    const item = block(css, '\\.nhsw-radios__item');
    expect(item).toMatch(/margin-top:\s*6px/);
    expect(item).not.toMatch(/margin-bottom/);
    expect(block(css, '\\.nhsw-radios__item:first-child')).toMatch(/margin-top:\s*0/);
  });

  it('the label has padding around the option text: 6px top and bottom, 12px left and right (NHS.UK)', () => {
    const rules = [...css.matchAll(/^\.nhsw-radios__label\s*\{([^}]*)\}/gm)].map((m) => m[1]).join('\n');
    expect(rules).toMatch(/padding:\s*6px 12px/);
    expect(rules).toMatch(/align-self:\s*center/);
  });

  it('the hint lines up with the option text: 12px padding either side and a -4px top margin', () => {
    const hint = block(css, '\\.nhsw-radios__hint');
    expect(hint).toMatch(/padding:\s*0 12px 4px/);
    expect(hint).toMatch(/margin:\s*-4px 0 0/);
  });

  it('the label itself carries no bottom margin, so item spacing is controlled only by the item, not by the shared .nhsw-label hint-aware margin', () => {
    const label = block(css, '\\.nhsw-radios__label\\.nhsw-label');
    expect(label).toMatch(/margin-bottom:\s*0/);
  });

  it('item row has no hover background wash', () => {
    const hover = block(css, '\\.nhsw-radios__item:hover');
    expect(hover).toBe('');
  });

  it('the default size has no hover ring: only the small radios do (NHS.UK)', () => {
    expect(css).not.toMatch(/(^|\n)\.nhsw-radios__item:hover/);
    expect(css).not.toMatch(/(^|\n)\.nhsw-radios__input:hover/);
  });

  it('hovering a small radio rings just the circle with a grey shadow, not a background wash, and not when it is disabled', () => {
    const hoverRing = block(css, '\\.nhsw-radios--small \\.nhsw-radios__item:hover \\.nhsw-radios__input:not\\(:disabled\\) \\+ \\.nhsw-radios__label::before');
    expect(hoverRing).toMatch(/box-shadow:\s*0 0 0 4px #afb8bf/);
  });

  it('hovering a focused small radio layers the grey ring around the outside of the yellow focus ring (4px yellow, then grey out to 8px)', () => {
    const combined = block(css, '\\.nhsw-radios--small \\.nhsw-radios__item:hover \\.nhsw-radios__input:not\\(:disabled\\):focus \\+ \\.nhsw-radios__label::before');
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

  it('the divider has 6px above and below, matching the 6px between options', () => {
    expect(block(css, '\\.nhsw-radios__divider')).toMatch(/margin:\s*6px 0/);
  });

  it('conditional content indents 52px total (margin + border + padding), aligning with the option text', () => {
    const conditional = block(css, '\\.nhsw-radios__conditional\\b');
    expect(conditional).toMatch(/margin:\s*6px 0 2px 18px/);
    expect(conditional).toMatch(/padding-left:\s*30px/);
    expect(conditional).toMatch(/border-left:\s*4px/);
  });

  it('the line has 6px above and 2px below, and the option after it has 14px (22px from the tablet breakpoint), as in the NHS.UK radios', () => {
    expect(block(css, '\\.nhsw-radios__conditional \\+ \\.nhsw-radios__item')).toMatch(/margin-top:\s*14px/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)\s*\{\s*\.nhsw-radios__conditional \+ \.nhsw-radios__item\s*\{\s*margin-top:\s*22px/);
    expect(block(css, '\\.nhsw-radios__conditional--hidden \\+ \\.nhsw-radios__item')).toMatch(/margin-top:\s*6px/);
  });

  it('small radios: 44px rows with no gap, the conditional line under the small circle and the content lined up with the text (10px + 4px + 22px = 36px)', () => {
    const item = block(css, '\\.nhsw-radios--small \\.nhsw-radios__item');
    expect(item).toMatch(/min-height:\s*44px/);
    expect(item).toMatch(/margin-top:\s*0/);
    const conditional = block(css, '\\.nhsw-radios--small \\.nhsw-radios__conditional');
    expect(conditional).toMatch(/margin-left:\s*10px/);
    expect(conditional).toMatch(/padding-left:\s*22px/);
  });

  it('a nested field label inside conditional content is regular weight, matching the radio label rather than the bold default', () => {
    const conditionalLabel = block(css, '\\.nhsw-radios__conditional \\.nhsw-label');
    expect(conditionalLabel).toMatch(/font-weight:\s*400/);
  });
});
