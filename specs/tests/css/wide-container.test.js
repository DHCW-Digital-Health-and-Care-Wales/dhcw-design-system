import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const centred = (name) => new RegExp(`@media \\(min-width: 1180px\\)\\s*\\{\\s*\\.${name}\\s*\\{[^}]*margin-left:\\s*auto`);

describe('wide container', () => {
  it('nhsw-wide-container is capped at 1100px and keeps the standard container margins', () => {
    const css = compileProbe('@use "components/layout/grid";');
    const wide = block(css, '\\.nhsw-wide-container');
    expect(wide).toMatch(/max-width:\s*1100px/);
    expect(wide).toMatch(/margin-left:\s*16px/);
  });

  it('keeps its desktop margins until there is room to centre it', () => {
    const css = compileProbe('@use "components/layout/grid";');
    expect(css).toMatch(centred('nhsw-wide-container'));
    expect(css).not.toMatch(/@media \(min-width: 1024px\)\s*\{\s*\.nhsw-wide-container\s*\{/);
  });

  it('the side navigation drops from 19px to 16px inside a wide container', () => {
    const css = compileProbe('@use "components/site/side-nav";');
    expect(block(css, '\\.nhsw-side-nav__link')).toMatch(/font-size:\s*1\.1875rem/);
    expect(block(css, '\\.nhsw-wide-container \\.nhsw-side-nav__link')).toMatch(/font-size:\s*1rem/);
    expect(css).toMatch(/\.nhsw-wide-container \.nhsw-side-nav__heading,\s*\.nhsw-wide-container \.nhsw-side-nav__link\s*\{/);
  });
});

describe('site chrome lines up with the wide container', () => {
  it.each([
    ['components/site/header', 'nhsw-site-header__container--wide'],
    ['components/site/header', 'nhsw-site-header__nav-container--wide'],
    ['components/site/footer', 'nhsw-site-footer__container--wide'],
    ['components/site/phase-banner', 'nhsw-phase-banner__container--wide'],
  ])('%s gives %s the wide container width and margins', (module, name) => {
    const css = compileProbe(`@use "${module}";`);
    const rule = block(css, `\\.${name}`);
    expect(rule).toMatch(/max-width:\s*1100px/);
    expect(rule).toMatch(/margin-left:\s*16px/);
    expect(rule).toMatch(/padding-left:\s*0/);
    expect(css).toMatch(centred(name));
  });
});

describe('the wide phase banner', () => {
  it('counts the tag inset inside the 1100px, so it stays centred with the other containers', () => {
    const css = compileProbe('@use "components/site/phase-banner";');
    expect(block(css, '\\.nhsw-phase-banner__container--wide')).toMatch(/box-sizing:\s*border-box/);
  });
});

describe('the prototype kit uses the wide container', () => {
  it.each([
    ['preview/_includes/prototype-kit-header.html', 'nhsw-site-header__container--wide'],
    ['preview/_includes/prototype-kit-nav.html', 'nhsw-site-header__nav-container--wide'],
    ['preview/_includes/prototype-kit-footer.html', 'nhsw-site-footer__container--wide'],
    ['preview/_layouts/prototype-kit-guide.html', 'class="nhsw-wide-container"'],
    ['preview/prototype-kit/index.html', 'class="nhsw-wide-container"'],
    ['preview/prototype-kit/index.html', 'nhsw-site-header__container--wide'],
  ])('%s uses %s', (file, name) => {
    const html = read(file);
    expect(html).toContain(name);
    expect(html).not.toMatch(/nhsw-fluid-container|__container--fluid/);
  });

  it('does not override the side spacing of the wide containers', () => {
    const css = compileProbe('@use "layouts/prototype-kit";');
    expect(css).not.toMatch(/\.nhsw-prototype-kit \.nhsw-site-header__nav-container\s*\{/);
    expect(css).not.toMatch(/\.nhsw-prototype-kit \.nhsw-phase-banner__container\s*\{/);
    const footer = block(css, '\\.nhsw-prototype-kit \\.nhsw-site-footer__container');
    expect(footer).toMatch(/padding-top:\s*30px/);
    expect(footer).not.toMatch(/padding:|padding-left|padding-right/);
  });
});

describe('the preview site uses the wide container', () => {
  it.each(['component', 'simple', 'home', 'workshop'])('the %s layout wraps its content in it', (layout) => {
    const html = read(`preview/_layouts/${layout}.html`);
    expect(html).toContain('class="nhsw-wide-container"');
    expect(html).not.toMatch(/nhsw-(width|fluid)-container/);
  });

  it('the cookie banner uses it', () => {
    expect(read('preview/_includes/cookie-banner.html')).toContain('class="nhsw-wide-container"');
  });

  it.each([
    ['site-header', 'nhsw-site-header__container--wide'],
    ['primary-nav', 'nhsw-site-header__nav-container--wide'],
    ['phase-banner', 'nhsw-phase-banner__container--wide'],
    ['site-footer', 'nhsw-site-footer__container--wide'],
  ])('the %s include uses %s', (include, name) => {
    expect(read(`preview/_includes/${include}.html`)).toContain(name);
  });

  it.each(['home', 'workshop'])('the %s hero lines up with the page content', (layout) => {
    expect(read(`preview/_layouts/${layout}.html`)).toContain('nhsw-site-header__container--wide');
  });
});
