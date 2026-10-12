import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('tabs match Figma Tabs component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tabs";`);
  });

  it('unselected tab has 8px vertical / 16px horizontal padding', () => {
    const tab = block(css, '\\.nhsw-tabs__tab');
    expect(tab).toMatch(/padding:\s*0\.5rem 1rem/);
  });

  // padding-top matches the unselected tab exactly (8px) so the label
  // starts at the same offset from the top of the row either way, keeping
  // the two variants' text on a shared baseline; the selected tab's extra
  // height comes only from a taller padding-bottom (16px), which is what
  // lets it visibly reach further down to meet the panel below while an
  // unselected tab stays shorter with a gap above the row's border-bottom.
  it('selected tab has 8px padding-top (matching unselected), 14px padding-bottom, 16px horizontal', () => {
    const selected = block(css, '\\.nhsw-tabs__tab--selected');
    expect(selected).toMatch(/padding:\s*0\.5rem 1rem 0\.875rem/);
  });

  it('tab button uses the base font family, not a browser default', () => {
    const tab = block(css, '\\.nhsw-tabs__tab\\b');
    expect(tab).toMatch(/font-family:\s*Roboto,\s*Arial,\s*sans-serif/);
  });
});

describe('tabs: hover removes the underline (not the background), focus highlights just the text, tabs stretch to align', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tabs";`);
  });

  it('hover only removes the underline on the text, with no background-colour change on the button', () => {
    const hover = block(css, '\\.nhsw-tabs__tab:hover \\.nhsw-tabs__tab-text');
    expect(hover).toMatch(/text-decoration:\s*none/);
    const buttonHover = block(css, '\\.nhsw-tabs__tab:hover');
    expect(buttonHover).not.toMatch(/background-color/);
  });

  it('focus highlights just the tab text with the yellow background, not the full padded button', () => {
    const focus = block(css, '\\.nhsw-tabs__tab:focus');
    expect(focus).toMatch(/outline:\s*none/);
    expect(focus).not.toMatch(/background-color/);
    const focusText = block(css, '\\.nhsw-tabs__tab:focus \\.nhsw-tabs__tab-text');
    expect(focusText).toMatch(/background-color:\s*#ffeb3b/);
    expect(focusText).toMatch(/color:\s*#0b0c0c/);
    // Matches the 3px focus underline used on .nhsw-card__title-link:focus.
    expect(focusText).toMatch(/text-decoration:\s*underline/);
    expect(focusText).toMatch(/text-decoration-thickness:\s*3px/);
  });

  it('tab text carries the default underline, not the button itself', () => {
    const text = block(css, '\\.nhsw-tabs__tab-text');
    expect(text).toMatch(/text-decoration:\s*underline/);
  });

  it('the tab list wraps tabs onto further rows when they do not fit, and never scrolls (NHS.UK floats its tabs, so they wrap too)', () => {
    const list = block(css, '\\.nhsw-tabs__list');
    expect(list).toMatch(/flex-wrap:\s*wrap/);
    expect(list).not.toMatch(/overflow/);
  });

  it('the tab list top-aligns items, so an unselected tab stays shorter and leaves a gap above the border-bottom line', () => {
    const list = block(css, '\\.nhsw-tabs__list');
    expect(list).toMatch(/align-items:\s*flex-start/);
    const tab = block(css, '\\.nhsw-tabs__tab');
    expect(tab).toMatch(/align-items:\s*flex-start/);
  });

  it('the visible tab box is drawn by ::before, filling whatever height the (variably-padded) button ends up with', () => {
    const before = block(css, '\\.nhsw-tabs__tab::before');
    expect(before).toMatch(/inset:\s*0/);
  });

  it('tab list has a grey bottom border, and the unselected tab background is drawn the same grey', () => {
    const list = block(css, '\\.nhsw-tabs__list');
    expect(list).toMatch(/border-bottom:\s*1px solid #d8dde0/);
    const before = block(css, '\\.nhsw-tabs__tab::before');
    expect(before).toMatch(/background-color:\s*#d8dde0/);
  });

  it('selected tab draws a white box with a grey border, its bottom edge painted white to fuse with the panel below', () => {
    const selectedBefore = block(css, '\\.nhsw-tabs__tab--selected::before');
    expect(selectedBefore).toMatch(/background-color:\s*#ffffff/);
    expect(selectedBefore).toMatch(/border:\s*1px solid #d8dde0/);
    expect(selectedBefore).toMatch(/border-bottom:\s*1px solid #ffffff/);
  });

  it('panel is white with a matching grey border, and the pagination row has a grey top border', () => {
    const panel = block(css, '\\.nhsw-tabs__panel');
    expect(panel).toMatch(/background-color:\s*#ffffff/);
    expect(panel).toMatch(/border:\s*1px solid #d8dde0/);
    const pagination = block(css, '\\.nhsw-tabs__pagination');
    expect(pagination).toMatch(/border-top:\s*1px solid #d8dde0/);
  });
});

describe('tabs below the tablet breakpoint: a list of jump links with every panel shown, as in NHS.UK', () => {
  let css = '';
  let small = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/tabs";`);
    const start = css.indexOf('@media (max-width: 40.0624em)');
    small = start === -1 ? '' : css.slice(start);
  });

  it('uses the media query that ends exactly where the script and the tablet breakpoint begin (40.0625em)', () => {
    expect(small).not.toBe('');
  });

  it('the list stops being a horizontal tab strip and becomes a plain list', () => {
    const list = block(small, '\\s*\\.nhsw-tabs__list');
    expect(list).toMatch(/display:\s*block/);
    expect(list).toMatch(/border-bottom:\s*0/);
    expect(list).not.toMatch(/overflow/);
  });

  it('tabs lose their drawn tab box, selected or not, and read as links', () => {
    expect(small).toMatch(/\.nhsw-tabs__tab::before,\s*\.nhsw-tabs__tab--selected::before\s*\{[^}]*content:\s*none/);
    const tab = block(small, '\\s*\\.nhsw-tabs__tab,\\s*\\.nhsw-tabs__tab--selected');
    expect(tab).toMatch(/color:\s*#005aa8/);
    expect(tab).toMatch(/margin-bottom:\s*0/);
  });

  it('the selected tab text keeps its underline, because there is no selected tab to mark', () => {
    const text = block(small, '\\s*\\.nhsw-tabs__tab-text,\\s*\\.nhsw-tabs__tab--selected \\.nhsw-tabs__tab-text');
    expect(text).toMatch(/text-decoration:\s*underline/);
  });

  it('stacked panels get a top border so each section is separated, and a jumped-to panel shows no focus ring', () => {
    const panel = block(small, '\\s*\\.nhsw-tabs__panel');
    expect(panel).toMatch(/border-top:\s*1px solid #d8dde0/);
    expect(block(small, '\\s*\\.nhsw-tabs__panel:focus')).toMatch(/outline:\s*none/);
  });
});

