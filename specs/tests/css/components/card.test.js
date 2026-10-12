import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('card hover/focus states, chevron icon and actions header', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/cards/card";`);
  });

  it('title-link hover recolours to the maroon hover colour and drops the underline, instead of just thickening it', () => {
    const hover = block(css, '\\.nhsw-card__title-link:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);
    expect(hover).toMatch(/text-decoration:\s*none/);
  });

  it('card border on title-link hover uses the secondary border colour; the bottom box-shadow colour stays fixed', () => {
    const cardHover = block(css, '\\.nhsw-card:has\\(\\.nhsw-card__title-link:hover\\)');
    expect(cardHover).toMatch(/border-color:\s*#4c6272/);
    expect(cardHover).not.toMatch(/box-shadow/);
  });

  it('title-link focus highlights just the heading text with a yellow background, not the whole card', () => {
    expect(css).not.toMatch(/\.nhsw-card:focus-within/);
    const focus = block(css, '\\.nhsw-card__title-link:focus');
    expect(focus).toMatch(/outline:\s*none/);
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/color:\s*#0b0c0c/);
    expect(focus).toMatch(/text-decoration:\s*underline/);
    expect(focus).toMatch(/text-decoration-thickness:\s*3px/);
  });

  it('links inside a card body hover to the same maroon as the title-link', () => {
    const linkHover = block(css, '\\.nhsw-card \\.nhsw-link:hover');
    expect(linkHover).toMatch(/color:\s*#7c2855/);
  });

  it('chevron variant renders a filled circle badge (link blue) with a rounded-stroke SVG arrow, not a thin border arrow', () => {
    const chevron = block(css, '\\.nhsw-card--chevron \\.nhsw-card__title-link::before');
    expect(chevron).toMatch(/border-radius:\s*50%/);
    expect(chevron).toMatch(/background-color:\s*#005aa8/);
    expect(chevron).toMatch(/background-image:\s*url/);
    expect(chevron).not.toMatch(/border-top:/);
  });

  it('chevron badge recolours to the maroon hover colour when the card is hovered', () => {
    const chevronHover = block(css, '\\.nhsw-card:has\\(\\.nhsw-card__title-link:hover\\)\\.nhsw-card--chevron \\.nhsw-card__title-link::before');
    expect(chevronHover).toMatch(/background-color:\s*#7c2855/);
  });

  it('header wraps the title and actions list on the same row, space-between', () => {
    const header = block(css, '\\.nhsw-card__header');
    expect(header).toMatch(/display:\s*flex/);
    expect(header).toMatch(/justify-content:\s*space-between/);
  });

  it('header has a 24px bottom margin, matching the NHS.UK card heading spacing', () => {
    const header = block(css, '\\.nhsw-card__header');
    expect(header).toMatch(/margin:\s*0 0 1\.5rem/);
  });

  it('description (the first p tag in a card body) has a 24px bottom margin', () => {
    const description = block(css, '\\.nhsw-card__description\\b');
    expect(description).toMatch(/margin:\s*0 0 1\.5rem/);
  });

  it('a title-only card (no description) centres the heading vertically', () => {
    const onlyChild = block(css, '\\.nhsw-card:has\\(> \\.nhsw-card__title:only-child\\)');
    expect(onlyChild).toMatch(/display:\s*flex/);
    expect(onlyChild).toMatch(/align-items:\s*center/);
    const onlyChildTitle = block(css, '\\.nhsw-card:has\\(> \\.nhsw-card__title:only-child\\) \\.nhsw-card__title');
    expect(onlyChildTitle).toMatch(/margin:\s*0\b/);
  });

  it('base card has a grey 1px border; the drop shadow only applies to clickable cards', () => {
    const base = block(css, '\\.nhsw-card');
    expect(base).toMatch(/border:\s*1px solid #d8dde0/);
    expect(base).not.toMatch(/box-shadow/);

    const clickable = block(css, '\\.nhsw-card:has\\(\\.nhsw-card__title-link\\)');
    expect(clickable).toMatch(/box-shadow:\s*0 4px 0 #d8dde0/);
  });

  it('preview panel has a grey 1px border', () => {
    const preview = block(css, '\\.nhsw-card__preview\\b');
    expect(preview).toMatch(/border:\s*1px solid #d8dde0/);
  });

  it('card group list drops the default list padding, bullets and vertical margin so a ul/li grid lays out like the old div grid', () => {
    const group = block(css, '\\.nhsw-card-group\\b');
    expect(group).toMatch(/padding:\s*0/);
    expect(group).toMatch(/list-style:\s*none/);
    expect(group).toMatch(/margin-top:\s*0/);
    expect(group).toMatch(/margin-bottom:\s*0/);
    expect(group).not.toMatch(/margin-left|margin-right/);
  });

  it('card group item has no list marker', () => {
    expect(block(css, '\\.nhsw-card-group__item')).toMatch(/list-style:\s*none/);
  });

  it('long unbroken text such as an email address wraps inside the card, so it never pushes out of it', () => {
    expect(block(css, '\\.nhsw-card\\b')).toMatch(/overflow-wrap:\s*anywhere/);
  });
});
