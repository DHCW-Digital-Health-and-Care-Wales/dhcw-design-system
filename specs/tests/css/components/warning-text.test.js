import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('warning text matches Figma Warning text component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/warning-text";`);
  });

  it('has a 12px gap between icon and text', () => {
    const base = block(css, '\\.nhsw-warning-text');
    expect(base).toMatch(/gap:\s*12px/);
  });
});

describe('warning text icon aligns to the first line, not the vertical centre', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/warning-text";`);
  });

  it('icon is pinned to the top of the container, with no centring transform', () => {
    const icon = block(css, '\\.nhsw-warning-text__icon');
    expect(icon).toMatch(/top:\s*0/);
    expect(icon).not.toMatch(/transform:\s*translateY/);
  });

  it('icon is a navy badge with white text', () => {
    const icon = block(css, '\\.nhsw-warning-text__icon');
    expect(icon).toMatch(/background-color:\s*#1b365d/);
    expect(icon).toMatch(/color:\s*#ffffff/);
  });

  it('reverse variant swaps the icon to a white badge with navy text, and the message text to white', () => {
    const reverseIcon = block(css, '\\.nhsw-warning-text--reverse \\.nhsw-warning-text__icon');
    expect(reverseIcon).toMatch(/background-color:\s*#ffffff/);
    expect(reverseIcon).toMatch(/color:\s*#1b365d/);
    const reverseText = block(css, '\\.nhsw-warning-text--reverse \\.nhsw-warning-text__text');
    expect(reverseText).toMatch(/color:\s*#ffffff/);
  });
});

describe('warning text sits level with its icon', () => {
  const css = compileProbe(`@use "components/content/warning-text";`);

  it('the text line is as tall as the 32px icon', () => {
    expect(block(css, '\\.nhsw-warning-text__text')).toMatch(/line-height:\s*2rem/);
    expect(block(css, '\\.nhsw-warning-text__icon')).toMatch(/height:\s*32px/);
  });
});
