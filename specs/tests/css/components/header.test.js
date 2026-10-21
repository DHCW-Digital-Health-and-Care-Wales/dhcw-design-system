import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('site header nav matches Figma Service navigation component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/header";`);
  });

  it('nav link has 16px vertical / 4px horizontal padding', () => {
    const link = block(css, '\\.nhsw-site-header__nav-link');
    expect(link).toMatch(/padding:\s*1rem 0\.25rem/);
  });

  it('inactive nav link is link-blue', () => {
    const link = block(css, '\\.nhsw-site-header__nav-link\\b');
    expect(link).toMatch(/color:\s*#005aa8/);
  });

  it('focus highlights the wrapping span with a yellow background, near-black text and a dark bottom-edge box-shadow', () => {
    const focusSpan = block(css, '\\.nhsw-site-header__nav-link:focus span');
    expect(focusSpan).toMatch(/background-color:\s*#ffeb3b/);
    expect(focusSpan).toMatch(/color:\s*#212b32/);
    expect(focusSpan).toMatch(/box-shadow:\s*0 4px 0 0 #212b32/);
  });

  it('nav list has a 2rem gap between items', () => {
    const list = block(css, '\\.nhsw-site-header__nav-list');
    expect(list).toMatch(/gap:\s*2rem/);
  });

  it('inactive nav links are underlined by default', () => {
    const link = block(css, '\\.nhsw-site-header__nav-link');
    expect(link).toMatch(/text-decoration:\s*underline/);
  });

  it('hover removes the underline without changing the link colour', () => {
    const hover = block(css, '\\.nhsw-site-header__nav-link:hover');
    expect(hover).toMatch(/text-decoration:\s*none/);
    expect(hover).not.toMatch(/color/);
  });

  it('focus removes the underline on the link itself, not just the highlighted span', () => {
    const focus = block(css, '\\.nhsw-site-header__nav-link:focus');
    expect(focus).toMatch(/text-decoration:\s*none/);
  });

  it('the nav bar itself has no border-bottom — the grey line is an inset box-shadow on the full-width .nav instead', () => {
    const nav = css.match(/\n\.nhsw-site-header__nav \{([^}]*)\}/)?.[1] ?? '';
    expect(nav).not.toMatch(/border-bottom/);
    expect(nav).toMatch(/box-shadow:\s*inset 0 -4px 0 0 #d8dde0/);
    expect(block(css, '\\.nhsw-site-header__nav-list\\b')).not.toMatch(/box-shadow/);
  });

  it('current-page link overrides that same box-shadow to #212b32, not a border — same band as .nav-list\'s own shadow (verified via real rendered layout: both boxes end at the same y, so both shadows occupy the identical inset region — a border-bottom on .nav was confirmed via Playwright to render in a wholly separate band no link-level inset shadow could ever reach)', () => {
    const current = block(css, '\\.nhsw-site-header__nav-link--current');
    expect(current).toMatch(/box-shadow:\s*inset 0 -4px 0 0 #212b32/);
    expect(current).not.toMatch(/border-bottom/);
    expect(current).toMatch(/text-decoration:\s*none/);
  });

  it('on a dark background, the bar is #004281 with the same 4px bottom stroke as the default, in #1b365d, and the current-page indicator is white', () => {
    const reverseNav = css.match(/\n\.nhsw-site-header__nav--reverse \{([^}]*)\}/)?.[1] ?? '';
    expect(reverseNav).toMatch(/background-color:\s*#004281/);
    expect(reverseNav).toMatch(/box-shadow:\s*inset 0 -4px 0 0 #1b365d/);
    const current = block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__nav-link--current');
    expect(current).toMatch(/box-shadow:\s*inset 0 -4px 0 0 #ffffff/);
    const hover = block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__nav-link:hover');
    expect(hover).toMatch(/text-decoration:\s*none/);
  });

  it('nav badge is positioning glue only — no bespoke colours, so it must be paired with a real .nhsw-tag in markup', () => {
    const badge = block(css, '\\.nhsw-site-header__nav-badge');
    expect(badge).not.toMatch(/background-color/);
    expect(badge).not.toMatch(/color/);
  });

  it('nav badge sits 0.8rem to the right of the link text', () => {
    const badge = block(css, '\\.nhsw-site-header__nav-badge');
    expect(badge).toMatch(/margin-left:\s*0\.8rem/);
  });

  it('nav list items are flexed too, so the link fills the item fully instead of leaving an inline-strut gap below it', () => {
    const li = block(css, '\\.nhsw-site-header__nav-list li');
    expect(li).toMatch(/display:\s*flex/);
  });
});

describe('site header top bar', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/header";`);
  });

  it('has no gold border-bottom', () => {
    const header = block(css, '\\.nhsw-site-header');
    expect(header).not.toMatch(/border-bottom/);
  });

  it('logo is 5rem tall and the top bar has vertical padding around it', () => {
    const logo = css.match(/\.nhsw-site-header__logo img,\n\.nhsw-site-header__logo svg \{([^}]*)\}/);
    expect(logo[1]).toMatch(/height:\s*5rem/);
    const top = block(css, '\\.nhsw-site-header__top');
    expect(top).toMatch(/padding:\s*1rem 0/);
  });

  it('service name title has no divider border and is regular weight, not bold', () => {
    const title = block(css, '\\.nhsw-site-header__title');
    expect(title).not.toMatch(/border-left/);
    expect(title).toMatch(/font-weight:\s*400/);
  });

  it('service name title uses the base font family, not a browser default', () => {
    const title = block(css, '\\.nhsw-site-header__title');
    expect(title).toMatch(/font-family:\s*Roboto,\s*Arial,\s*sans-serif/);
  });

  it('search button is link-blue, darkening to the link-hover colour on hover', () => {
    const button = block(css, '\\.nhsw-site-header__search-button\\b');
    expect(button).toMatch(/background-color:\s*#005aa8/);
    const hover = block(css, '\\.nhsw-site-header__search-button:hover');
    expect(hover).toMatch(/background-color:\s*#003087/);
  });

  it('search input focus adds a black inset border alongside the yellow outline, raised above the adjacent button so it is not painted over', () => {
    const focus = block(css, '\\.nhsw-site-header__search-input:focus');
    expect(focus).toMatch(/outline:\s*3px solid #ffeb3b/);
    expect(focus).toMatch(/box-shadow:\s*inset 0 0 0 4px #212b32/);
    expect(focus).toMatch(/position:\s*relative/);
    expect(focus).toMatch(/z-index:\s*1/);
  });

  it('brand vertically centres the logo and title against each other', () => {
    const brand = block(css, '\\.nhsw-site-header__brand\\b');
    expect(brand).toMatch(/align-items:\s*center/);
  });

  it('title can wrap onto multiple lines: min-width: 0 overrides the flex-item default that would otherwise force it to overflow instead of wrapping', () => {
    const title = block(css, '\\.nhsw-site-header__title\\b');
    expect(title).toMatch(/min-width:\s*0/);
    expect(title).toMatch(/overflow-wrap:\s*break-word/);
  });

  it('the search box is never hidden: it takes the full width on its own row on a small screen', () => {
    expect(css).not.toMatch(/\.nhsw-site-header__search\s*\{\s*display:\s*none/);
    expect(css).toMatch(/@media \(max-width: 40rem\)\s*\{[\s\S]*?\.nhsw-site-header__search\s*\{[^}]*flex-basis:\s*100%/);
  });

  it('the row wraps, with the logo and name growing to fill it and the search box wrapping below when it no longer fits (as in the NHS.UK header)', () => {
    expect(block(css, '\.nhsw-site-header__top')).toMatch(/flex-flow:\s*row wrap/);
    expect(block(css, '\.nhsw-site-header__brand')).toMatch(/flex:\s*999 1 13\.75rem/);
    expect(block(css, '\.nhsw-site-header__search')).toMatch(/flex:\s*1 1 18rem/);
  });

  it('the service name wraps in balanced lines, up to 54 characters wide', () => {
    const title = block(css, '\.nhsw-site-header__title');
    expect(title).toMatch(/max-width:\s*54ch/);
    expect(title).toMatch(/text-wrap:\s*balance/);
  });
});
