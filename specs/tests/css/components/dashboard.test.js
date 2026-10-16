import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// The left-hand navigation follows the WIS side menu (SideMenu.razor.css).
describe('dashboard page shell', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/dashboard";`);
  });

  it('puts the navy left-hand navigation, 322px wide, beside the page content from the tablet breakpoint', () => {
    const sidebar = block(css, '\\.nhsw-dashboard__sidebar');
    expect(sidebar).toMatch(/background-color:\s*#1b365d/);
    expect(sidebar).toMatch(/padding:\s*0 0 1rem/);
    expect(css).toMatch(/\.nhsw-dashboard\s*\{[^}]*flex-direction:\s*row/);
    expect(css).toMatch(/\.nhsw-dashboard__sidebar\s*\{[^}]*width:\s*322px/);
  });

  it('separates each group of navigation links with a faint white divider', () => {
    const group = block(css, '\\.nhsw-dashboard__nav-group');
    expect(group).toMatch(/border-bottom:\s*1px solid rgba\(255, 255, 255, 0\.2\)/);
    expect(group).toMatch(/padding:\s*0 0 0\.5rem/);
    expect(group).toMatch(/margin:\s*0 0 0\.5rem/);
  });

  it('navigation links are 3rem tall, white, 1.1rem text with a 24px icon and a 10px gap', () => {
    const link = block(css, '\\.nhsw-dashboard__nav-link');
    expect(link).toMatch(/height:\s*3rem/);
    expect(link).toMatch(/gap:\s*10px/);
    expect(link).toMatch(/color:\s*#ffffff/);
    expect(link).toMatch(/font-size:\s*1\.1rem/);
    expect(block(css, '\\.nhsw-dashboard__nav-icon')).toMatch(/width:\s*24px/);
  });

  it('hovering a link, and the current page, show a blue background with a white edge on the left', () => {
    const hover = block(css, '\\.nhsw-dashboard__nav-link:hover');
    expect(hover).toMatch(/background-color:\s*#0056b3/);
    expect(hover).toMatch(/border-left-color:\s*#ffffff/);
    const current = block(css, '\\.nhsw-dashboard__nav-link--current');
    expect(current).toMatch(/background-color:\s*#0056b3/);
    expect(current).toMatch(/border-left-color:\s*#ffffff/);
  });

  it('the left edge is always there (transparent) so the text does not move when it appears', () => {
    const link = block(css, '\\.nhsw-dashboard__nav-link');
    expect(link).toMatch(/border-left:\s*0\.475rem solid transparent/);
    expect(link).toMatch(/padding:\s*0\.75rem 1rem 0\.75rem calc\(1rem - 0\.475rem\)/);
  });

  it('a disabled link is faded, shows a not-allowed cursor and does not react to hover', () => {
    expect(css).toMatch(/\.nhsw-dashboard__nav-link--disabled[^{]*\{[^}]*opacity:\s*0\.6/);
    expect(css).toMatch(/\.nhsw-dashboard__nav-link--disabled[^{]*\{[^}]*cursor:\s*not-allowed/);
    expect(css).toMatch(/\.nhsw-dashboard__nav-link--disabled:hover\s*\{[^}]*background-color:\s*transparent/);
  });

  it('links use the yellow focus state', () => {
    expect(block(css, '\\.nhsw-dashboard__nav-link:focus')).toMatch(/background-color:\s*#ffeb3b/);
  });

  it('the top bar is white with a blue bottom border, and holds bordered chips', () => {
    const bar = block(css, '\\.nhsw-dashboard__topbar');
    expect(bar).toMatch(/border-bottom:\s*1px solid #005aa8/);
    expect(bar).toMatch(/background-color:\s*#ffffff/);
    expect(block(css, '\\.nhsw-dashboard__chip')).toMatch(/border:\s*1px solid #d8dde0/);
  });
});

describe('dashboard top bar chips match the logged-in header', () => {
  const css = compileProbe(`@use "components/site/dashboard";`);

  it('are 40px bordered chips with 16px text and a 4px radius', () => {
    const chip = block(css, '\.nhsw-dashboard__chip');
    expect(chip).toMatch(/min-height:\s*40px/);
    expect(chip).toMatch(/padding:\s*4px 12px 4px 4px/);
    expect(chip).toMatch(/border-radius:\s*4px/);
    expect(chip).toMatch(/font-size:\s*1rem/);
    expect(chip).toMatch(/line-height:\s*1\.5rem/);
  });

  it('hold a 32px blue square with a white 24px glyph', () => {
    const icon = block(css, '\.nhsw-dashboard__chip-icon');
    expect(icon).toMatch(/width:\s*32px/);
    expect(icon).toMatch(/height:\s*32px/);
    expect(icon).toMatch(/padding:\s*4px/);
    expect(icon).toMatch(/color:\s*#ffffff/);
    expect(css).toMatch(/\.nhsw-dashboard__chip-icon svg\s*\{[^}]*width:\s*24px/);
  });

  it('use the same glyphs and chip markup in the macro and the page template examples', () => {
    const fs = require('node:fs');
    const macro = fs.readFileSync('src/components/dashboard/macro.njk', 'utf8');
    expect(macro).toContain('<span class="nhsw-dashboard__chip-icon" aria-hidden="true"><svg');
    expect(macro).toContain('fill="currentColor"');
    for (const slug of ['dashboard-default', 'dashboard-transactional', 'dashboard-content']) {
      const html = fs.readFileSync(`preview/examples/page-template-${slug}.html`, 'utf8');
      expect(html).toContain('<span class="nhsw-dashboard__chip-icon" aria-hidden="true">');
      expect(html).not.toContain('fill="#005aa8"');
    }
  });
});

describe('dashboard logo section and top bar are the same height', () => {
  const css = compileProbe(`@use "components/site/dashboard";`);

  it('both are 67px: the 42px chip, 12px above and below, and the 1px line', () => {
    const brand = block(css, '\\.nhsw-dashboard__brand');
    expect(brand).toMatch(/height:\s*67px/);
    expect(brand).toMatch(/box-sizing:\s*border-box/);
    const bar = block(css, '\\.nhsw-dashboard__topbar');
    expect(bar).toMatch(/min-height:\s*67px/);
    expect(bar).toMatch(/box-sizing:\s*border-box/);
  });

  it('the side menu has no space above the logo section, so the two start level', () => {
    expect(block(css, '\\.nhsw-dashboard__sidebar')).toMatch(/padding:\s*0 0 1rem/);
  });
});
