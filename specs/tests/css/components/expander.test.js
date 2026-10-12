import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('expander matches Figma Expander component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/expander";`);
  });

  it('button has 24px padding', () => {
    const button = block(css, '\\.nhsw-expander__button');
    expect(button).toMatch(/padding:\s*24px/);
  });

  it('icon is 28x28px with a 12px gap before the label', () => {
    const icon = block(css, '\\.nhsw-expander__icon');
    expect(icon).toMatch(/width:\s*28px/);
    expect(icon).toMatch(/height:\s*28px/);
    expect(icon).toMatch(/margin-right:\s*12px/);
  });

  it('expanded content is flush with the button padding (no indent under the label)', () => {
    const content = block(css, '\\.nhsw-expander__content');
    expect(content).toMatch(/padding:\s*0 24px 24px/);
  });
});

describe('expander hover/focus states and default appearance', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/expander";`);
  });

  it('default state is a white box with a 1px border, thicker on the bottom edge', () => {
    const base = block(css, '\\.nhsw-expander');
    expect(base).toMatch(/background-color:\s*#ffffff/);
    expect(base).toMatch(/border:\s*1px solid #d8dde0/);
    expect(base).toMatch(/border-bottom-width:\s*4px/);
  });

  it('hover recolours the link text and icon, without changing the border colour', () => {
    const hover = block(css, '\\.nhsw-expander:hover');
    expect(hover).not.toMatch(/border-color/);
    const hoverText = block(css, '\\.nhsw-expander:hover \\.nhsw-expander__link-text');
    expect(hoverText).toMatch(/color:\s*#7c2855/);
    expect(hoverText).toMatch(/text-decoration:\s*none/);
    const hoverIcon = block(css, '\\.nhsw-expander:hover \\.nhsw-expander__icon');
    expect(hoverIcon).toMatch(/background-color:\s*#7c2855/);
  });

  it('focus highlights the icon+text heading with a yellow background and black underline, not the whole button', () => {
    const focusButton = block(css, '\\.nhsw-expander__button:focus');
    expect(focusButton).toMatch(/outline:\s*none/);
    const focusHeading = block(css, '\\.nhsw-expander__button:focus \\.nhsw-expander__heading');
    expect(focusHeading).toMatch(/background-color:\s*#ffeb3b/);
    expect(focusHeading).toMatch(/border-bottom:\s*max\(4px, 0\.25rem\) solid #212b32/);
  });

  it('focus turns the link text and icon near-black and removes the underline, keeping the yellow heading highlight', () => {
    const focusText = block(css, '\\.nhsw-expander__button:focus \\.nhsw-expander__link-text');
    expect(focusText).toMatch(/color:\s*#0b0c0c/);
    expect(focusText).toMatch(/text-decoration:\s*none/);
    const focusIcon = block(css, '\\.nhsw-expander__button:focus \\.nhsw-expander__icon');
    expect(focusIcon).toMatch(/background-color:\s*#0b0c0c/);
    const focusHeading = block(css, '\\.nhsw-expander__button:focus \\.nhsw-expander__heading');
    expect(focusHeading).toMatch(/background-color:\s*#ffeb3b/);
  });

  it('heading top-aligns the icon with wrapped text instead of centring it', () => {
    const heading = block(css, '\\.nhsw-expander__heading');
    expect(heading).toMatch(/align-items:\s*flex-start/);
  });

  it('link text can break within an unbreakable long word instead of overflowing', () => {
    const text = block(css, '\\.nhsw-expander__link-text');
    expect(text).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it('default icon and link text are link-blue', () => {
    const icon = block(css, '\\.nhsw-expander__icon');
    expect(icon).toMatch(/background-color:\s*#005aa8/);
    const text = block(css, '\\.nhsw-expander__link-text');
    expect(text).toMatch(/color:\s*#005aa8/);
  });

  it('reverse variant swaps to a transparent box with white border, icon and text', () => {
    const reverse = block(css, '\\.nhsw-expander--reverse');
    expect(reverse).toMatch(/background-color:\s*transparent/);
    expect(reverse).toMatch(/border-color:\s*#ffffff/);
    const reverseText = block(css, '\\.nhsw-expander--reverse \\.nhsw-expander__link-text');
    expect(reverseText).toMatch(/color:\s*#ffffff/);
    const reverseIcon = block(css, '\\.nhsw-expander--reverse \\.nhsw-expander__icon');
    expect(reverseIcon).toMatch(/background-color:\s*#ffffff/);
    expect(reverseIcon).toMatch(/color:\s*#1b365d/);
  });

  it('reverse variant keeps everything white on hover instead of switching to the purple hover colour, and removes the underline', () => {
    const reverseHover = block(css, '\\.nhsw-expander--reverse:hover');
    expect(reverseHover).toMatch(/border-color:\s*#ffffff/);
    const reverseHoverText = block(css, '\\.nhsw-expander--reverse:hover \\.nhsw-expander__link-text');
    expect(reverseHoverText).toMatch(/color:\s*#ffffff/);
    expect(reverseHoverText).toMatch(/text-decoration:\s*none/);
    const reverseHoverIcon = block(css, '\\.nhsw-expander--reverse:hover \\.nhsw-expander__icon');
    expect(reverseHoverIcon).toMatch(/background-color:\s*#ffffff/);
  });
});
