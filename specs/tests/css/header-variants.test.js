import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('header variants (logged-in, with service name, public facing)', () => {
  const css = compileProbe('@use "components/site/header";');

  it('a light header is white with dark text and a blue sign out link', () => {
    const light = block(css, '\\.nhsw-site-header--light');
    expect(light).toMatch(/background-color:\s*#ffffff/);
    expect(light).toMatch(/color:\s*#212b32/);
    expect(block(css, '\\.nhsw-site-header--light \\.nhsw-site-header__logout')).toMatch(/color:\s*#005eb8|color:\s*#[0-9a-f]{6}/i);
  });

  it('the logged-in bar is compact, and the account area sits on the right', () => {
    expect(block(css, '\\.nhsw-site-header--compact \\.nhsw-site-header__top')).toMatch(/min-height:\s*60px/);
    expect(block(css, '\\.nhsw-site-header__account')).toMatch(/margin-left:\s*auto/);
  });

  it('on a light header the icon square is blue with a white glyph, and the text is dark', () => {
    const icon = block(css, '\\.nhsw-site-header--light \\.nhsw-site-header__user-icon');
    expect(icon).toMatch(/background-color:\s*#[0-9a-f]{6}/i);
    expect(icon).not.toMatch(/background-color:\s*#ffffff/);
    expect(icon).toMatch(/color:\s*#ffffff/);
    expect(block(css, '\\.nhsw-site-header--light \\.nhsw-site-header__user')).toMatch(/color:\s*#212b32/);
  });

  it('the service-name header uses a small icon in place of the full logo', () => {
    expect(css).toMatch(/\.nhsw-site-header__logo--icon img[^{]*\{[^}]*height:\s*2\.5rem/);
  });
});

describe('patient header follows the Figma banner CSS', () => {
  const css = compileProbe('@use "components/content/patient-header";');

  it('the name is Heading medium: 26px/32px bold from tablet', () => {
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-patient-header__name\s*\{[^}]*font-size:\s*1\.625rem[^}]*line-height:\s*2rem/);
    expect(block(css, '\\.nhsw-patient-header__name')).toMatch(/font-weight:\s*700/);
  });

  it('the details are 16px/24px with labels in bold', () => {
    const header = block(css, '\\.nhsw-patient-header');
    expect(header).toMatch(/font-size:\s*1rem/);
    expect(header).toMatch(/line-height:\s*1\.5rem/);
    expect(block(css, '\\.nhsw-patient-header__item dt')).toMatch(/font-weight:\s*700/);
  });

  it('items are separated by a 1px #d8dde0 divider, except the last', () => {
    expect(block(css, '\\.nhsw-patient-header__item')).toMatch(/border-right:\s*1px solid #d8dde0/);
    expect(block(css, '\\.nhsw-patient-header__item:last-child')).toMatch(/border-right:\s*0/);
  });

  it('is a white bar with 20px above and below and 8px/40px/16px inside from desktop', () => {
    expect(block(css, '\\.nhsw-patient-header')).toMatch(/padding:\s*20px 0/);
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-patient-header__inner\s*\{\s*padding:\s*8px 40px 16px/);
    expect(block(css, '\\.nhsw-patient-header__inner')).toMatch(/gap:\s*8px/);
  });
});

describe('header documentation', () => {
  const docs = read('preview/components/header.html');

  it('the Variants tab covers the logged-in, service name, public facing and patient headers, in that order', () => {
    const order = ['>Logged-in header<', '>Logged-in header (with service name)<', '>User information<', '>Public facing header<', '>Patient header<'].map((h) => docs.indexOf(h));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it.each([
    ['hd-li-light', 'header-logged-in-light'],
    ['hd-li-dark', 'header-logged-in-dark'],
    ['hd-sn-light', 'header-service-name-light'],
    ['hd-sn-dark', 'header-service-name-dark'],
    ['hd-pf-light', 'header-public-light'],
    ['hd-pf-dark', 'header-public-dark'],
    ['hd-patient', 'header-patient'],
  ])('%s has a preview, HTML and Nunjucks, and its example page exists', (id, slug) => {
    expect(docs).toContain(`id="${id}" open_url="/examples/${slug}.html"`);
    expect(docs).toContain(`include code-viewer.html id="${id}"`);
    expect(fs.existsSync(path.join(root, `preview/examples/${slug}.html`))).toBe(true);
  });

  it('shows the user and location chips and a Sign out link in the logged-in headers', () => {
    const example = read('preview/examples/header-logged-in-light.html');
    expect(example).toContain('Jane Doe');
    expect(example).toContain('Aneurin Bevan University Health Board');
    expect(example).toContain('>Sign out<');
    expect(example).toContain('nhsw-site-header--light');
  });

  it('the light headers use the dark logo and the dark headers the white one', () => {
    expect(read('preview/examples/header-public-light.html')).toContain('nhsw-logo-dark.svg');
    expect(read('preview/examples/header-public-dark.html')).toContain('/assets/nhsw-logo.svg');
    expect(read('preview/examples/header-service-name-light.html')).toContain('dhcw-icon.svg');
    expect(read('preview/examples/header-service-name-dark.html')).toContain('dhcw-icon-white.svg');
  });
});

describe('the Header page Variants tab matches the design exactly', () => {
  const docs = read('preview/components/header.html');
  const variants = docs.slice(docs.indexOf('id="panel-variants"'), docs.indexOf('<!-- Examples -->'));
  const howToUse = docs.slice(docs.indexOf('id="panel-how-to-use"'), docs.indexOf('<!-- Variants -->'));

  it('has only the design\'s headings: Header variants, then the five sections', () => {
    const headings = [...variants.matchAll(/<h([234]) class="nhsw-h\1">([^<]*)<\/h\1>/g)].map((m) => m[2]);
    expect(headings).toEqual(['Header variants', 'Logged-in header', 'Logged-in header (with service name)', 'User information', 'Public facing header', 'Patient header']);
  });

  it('has exactly the seven examples in the design, no more', () => {
    expect([...variants.matchAll(/include example-preview\.html id="([^"]+)"/g)].map((m) => m[1])).toEqual(
      ['hd-li-light', 'hd-li-dark', 'hd-sn-light', 'hd-sn-dark', 'hd-pf-light', 'hd-pf-dark', 'hd-patient'],
    );
  });

  it('shows each example on a white panel, and ends with Back to top', () => {
    expect(variants).not.toContain("grey=true");
    expect(variants.trimEnd().endsWith('</div>')).toBe(true);
    expect(variants).toMatch(/Back to top<\/a><\/p>\s*<\/div>\s*$/);
  });

  it('the search bar and mobile bottom navigation sections now live on the How to use tab', () => {
    expect(variants).not.toContain('Without a search bar');
    expect(variants).not.toContain('Mobile bottom navigation');
    expect(howToUse).toContain('Without a search bar');
    expect(howToUse).toContain('Mobile bottom navigation');
  });

  it('the compact header sizes exist in the CSS', () => {
    const header = compileProbe('@use "components/site/header";');
    expect(block(header, '\.nhsw-site-header--compact \.nhsw-site-header__logo img')).toMatch(/height:\s*3rem/);
    expect(read("preview/_includes/example-preview.html")).not.toContain("body--grey");
  });
});

describe('logged-in header markup follows the Figma account information', () => {
  const files = ['header-logged-in-light', 'header-logged-in-dark', 'header-service-name-light', 'header-service-name-dark'];

  it.each(files)('%s: transparent glyphs inside the icon squares, chips grouped, sign out last', (slug) => {
    const html = read(`preview/examples/${slug}.html`);
    expect(html).toContain('nhsw-site-header__account-info');
    expect(html.match(/nhsw-site-header__user-icon/g)).toHaveLength(2);
    expect(html).toContain('fill="currentColor"');
    expect(html).not.toContain('fill="#005AA8"');
    expect(html).not.toContain('--outline');
    expect(html.indexOf('nhsw-site-header__logout')).toBeGreaterThan(html.indexOf('Aneurin Bevan University Health Board'));
  });

  it('the header macro renders the same chip structure', () => {
    const macro = read('src/components/header/macro.njk');
    expect(macro).toContain('nhsw-site-header__account-info');
    expect(macro).toContain('<span class="nhsw-site-header__user-icon" aria-hidden="true">');
    expect(macro).not.toContain('fill="#005AA8"');
  });
});

describe('patient header keeps the name and details together as the screen narrows', () => {
  const css = compileProbe('@use "components/content/patient-header";');

  it('keeps the name and details side by side from 830px, drops them under the name below that, and the name does not shrink', () => {
    expect(css).toMatch(/@media \(min-width: 51\.875em\)\s*\{\s*\.nhsw-patient-header__row--identity\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(block(css, '\\.nhsw-patient-header__row')).toMatch(/flex-wrap:\s*wrap/);
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-patient-header__name\s*\{[^}]*flex:\s*0 0 auto/);
  });

  it('has smaller gaps between the details at tablet and desktop than at large desktop', () => {
    const gaps = [...css.matchAll(/@media \(min-width: ([\d.]+)em\)\s*\{\s*\.nhsw-patient-header__details\s*\{\s*gap:\s*8px (\d+)px/g)]
      .map((m) => [Number(m[1]), Number(m[2])]);
    expect(gaps).toEqual([[40.0625, 8], [48.0625, 12], [61.875, 16]]);
    expect(block(css, '\.nhsw-patient-header__details')).toMatch(/gap:\s*8px 24px/);
  });
});
