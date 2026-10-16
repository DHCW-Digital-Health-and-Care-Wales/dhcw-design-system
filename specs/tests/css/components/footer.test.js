import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('site footer matches Figma Footer component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/footer";`);
  });

  it('footer background is white, not grey — grey is only the surrounding page backdrop', () => {
    const footer = block(css, '\\.nhsw-site-footer\\b');
    expect(footer).toMatch(/background-color:\s*#ffffff/);
  });

  it('footer has no blue border-top', () => {
    const footer = block(css, '\\.nhsw-site-footer\\b');
    expect(footer).not.toMatch(/border-top/);
  });

  it('container has 30px vertical / 40px horizontal padding', () => {
    const container = block(css, '\\.nhsw-site-footer__container');
    expect(container).toMatch(/padding:\s*1\.875rem 2\.5rem/);
  });

  it('the --stacked container modifier switches to a block layout, so links/licence/copyright each get their own full-width row', () => {
    const stacked = block(css, '\\.nhsw-site-footer__container--stacked');
    expect(stacked).toMatch(/display:\s*block/);
  });

  it('the open-licence row pairs the OGL logo image with description text', () => {
    const licence = block(css, '\\.nhsw-site-footer__licence\\b');
    expect(licence).toMatch(/display:\s*flex/);
    const badge = block(css, '\\.nhsw-site-footer__licence-badge');
    expect(badge).toMatch(/flex:\s*0 0 auto/);
  });

  it('licence text and version use the secondary (grey) text colour', () => {
    const licenceText = block(css, '\\.nhsw-site-footer__licence-text');
    expect(licenceText).toMatch(/color:\s*#4c6272/);
    const version = block(css, '\\.nhsw-site-footer__version');
    expect(version).toMatch(/color:\s*#4c6272/);
  });

  it('licence text is 19px, and the copyright line is grey to match', () => {
    const licenceText = block(css, '\\.nhsw-site-footer__licence-text');
    expect(licenceText).toMatch(/font-size:\s*1\.1875rem/);
    const copyright = block(css, '\\.nhsw-site-footer__copyright');
    expect(copyright).toMatch(/color:\s*#4c6272/);
  });

  it('licence block has a 3rem bottom margin before the copyright line', () => {
    const licence = block(css, '\\.nhsw-site-footer__licence\\b');
    expect(licence).toMatch(/margin:\s*0 0 3rem/);
  });

  it('nav row has a grey bottom border', () => {
    const nav = block(css, '\\.nhsw-site-footer__nav\\b');
    expect(nav).toMatch(/border-bottom:\s*1px solid #d8dde0/);
  });

  it('the stacked links have the same 3rem gap below them as the licence row has below it', () => {
    expect(css).toMatch(/\.nhsw-site-footer__container--stacked \.nhsw-site-footer__links\s*\{[^}]*margin-bottom:\s*3rem/);
    expect(block(css, '\\.nhsw-site-footer__licence\\b')).toMatch(/margin:\s*0 0 3rem/);
  });

  it('on mobile the links stack vertically, and the links and licence text are 16px', () => {
    expect(css).toMatch(/@media \(max-width: 40\.0624em\)\s*\{\s*\.nhsw-site-footer__container--stacked \.nhsw-site-footer__links\s*\{[^}]*flex-direction:\s*column[^}]*font-size:\s*1rem/);
    expect(css).toMatch(/@media \(max-width: 40\.0624em\)\s*\{\s*\.nhsw-site-footer__licence-text\s*\{[^}]*font-size:\s*1rem/);
  });
});

describe('footer without links: the organisation descriptor', () => {
  it('is grey and regular weight, not bold', () => {
    const css = compileProbe('@use "components/site/footer";');
    const org = block(css, '\\.nhsw-site-footer__org');
    expect(org).toMatch(/color:\s*#4c6272/);
    expect(org).toMatch(/font-weight:\s*400/);
    expect(org).not.toMatch(/700/);
  });
});
