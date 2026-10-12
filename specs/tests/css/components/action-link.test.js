import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('action link matches Figma Action link component (icon+text row)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/actions/action-link";`);
  });

  it('icon is 32x32px with an 8px gap before the label', () => {
    const icon = block(css, '\\.nhsw-action-link__icon');
    expect(icon).toMatch(/width:\s*32px/);
    expect(icon).toMatch(/height:\s*32px/);
    expect(icon).toMatch(/margin-right:\s*8px/);
  });

  it('default state is fully link-blue (icon and text), not the old invented green', () => {
    const icon = block(css, '\\.nhsw-action-link__icon');
    const link = block(css, '\\.nhsw-action-link');
    const text = block(css, '\\.nhsw-action-link__text');
    expect(icon).toMatch(/fill:\s*#005aa8/);
    // Text colour is set on the link itself and inherited by .__text, rather
    // than redeclared directly on .__text — :visited can only ever restyle
    // the element it matches, never a descendant, so the colour has to live
    // on .nhsw-action-link for the :visited state to work at all.
    expect(link).toMatch(/color:\s*#005aa8/);
    expect(text).toMatch(/color:\s*inherit/);
  });

  it('hover recolours the text to #7c2855 but leaves the icon link-blue', () => {
    const hoverText = block(css, '\\.nhsw-action-link:hover \\.nhsw-action-link__text');
    expect(hoverText).toMatch(/color:\s*#7c2855/);
    expect(css).not.toMatch(/\.nhsw-action-link:hover \.nhsw-action-link__icon/);
  });

  it('hover underline is 2px thick', () => {
    const hoverText = block(css, '\\.nhsw-action-link:hover \\.nhsw-action-link__text');
    expect(hoverText).toMatch(/text-decoration-thickness:\s*2px/);
  });

  it('link shrinks to fit its content instead of stretching full width', () => {
    const link = block(css, '\\.nhsw-action-link');
    expect(link).toMatch(/width:\s*fit-content/);
  });

  it('focus state is a tight yellow highlight with a dark underline and no separate outline', () => {
    const focus = block(css, '\\.nhsw-action-link:focus');
    expect(focus).toMatch(/outline:\s*none/);
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/border-bottom:\s*max\(4px, 0\.25rem\) solid #212b32/);
  });

  it('focus text and icon are the same dark colour', () => {
    const focusText = block(css, '\\.nhsw-action-link:focus \\.nhsw-action-link__text');
    const focusIcon = block(css, '\\.nhsw-action-link:focus \\.nhsw-action-link__icon');
    expect(focusText).toMatch(/color:\s*#0b0c0c/);
    expect(focusIcon).toMatch(/fill:\s*#0b0c0c/);
  });

  it('visited state recolours the link itself, not a descendant (required for :visited to apply at all)', () => {
    const visited = block(css, '\\.nhsw-action-link:visited');
    expect(visited).toMatch(/color:\s*#7c2855/);
  });

  it('active state underlines the text', () => {
    const active = block(css, '\\.nhsw-action-link:active \\.nhsw-action-link__text');
    expect(active).toMatch(/text-decoration:\s*underline/);
  });

  it('on dark backgrounds, hover stays white — not the light-background hover colour', () => {
    const reverseHover = block(css, '\\.nhsw-action-link--reverse:hover \\.nhsw-action-link__text');
    expect(reverseHover).toMatch(/color:\s*#ffffff/);
    expect(reverseHover).not.toMatch(/#7c2855/);
  });

  it('on dark backgrounds, focus still wins over a simultaneous hover (mouse click = both at once)', () => {
    const reverseFocusText = block(css, '\\.nhsw-action-link--reverse:focus \\.nhsw-action-link__text');
    const reverseFocusIcon = block(css, '\\.nhsw-action-link--reverse:focus \\.nhsw-action-link__icon');
    expect(reverseFocusText).toMatch(/color:\s*#0b0c0c/);
    expect(reverseFocusIcon).toMatch(/fill:\s*#0b0c0c/);
  });
});

describe('action link colour variants (navy/red icon overrides)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/actions/action-link";`);
  });

  it('navy variant icon is navy, and darkens further on hover', () => {
    const icon = block(css, '\\.nhsw-action-link--navy \\.nhsw-action-link__icon');
    expect(icon).toMatch(/fill:\s*#1b365d/);
    const hover = block(css, '\\.nhsw-action-link--navy:hover \\.nhsw-action-link__icon');
    expect(hover).toMatch(/fill:\s*#1B2A49/);
  });

  it('red variant icon is red, and darkens further on hover', () => {
    const icon = block(css, '\\.nhsw-action-link--red \\.nhsw-action-link__icon');
    expect(icon).toMatch(/fill:\s*#d5281b/);
    const hover = block(css, '\\.nhsw-action-link--red:hover \\.nhsw-action-link__icon');
    expect(hover).toMatch(/fill:\s*#902419/);
  });
});
