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
    expect(block(css, '\\.nhsw-site-header--compact \\.nhsw-site-header__top')).toMatch(/min-height:\s*4rem/);
    expect(block(css, '\\.nhsw-site-header__account')).toMatch(/margin-left:\s*auto/);
  });

  it('the account chips can be outlined, in white on a dark header and light grey on a light one', () => {
    expect(block(css, '\\.nhsw-site-header__user--outline')).toMatch(/border:\s*1px solid #ffffff/);
    expect(block(css, '\\.nhsw-site-header--light \\.nhsw-site-header__user--outline')).toMatch(/border-color:\s*#d8dde0/);
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
