import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';

const root = path.resolve(import.meta.dirname, '../../..');
let css = '';

beforeAll(() => {
  css = sass.compile(path.join(root, 'src/index.scss')).css;
});

const rule = (selector) => {
  const start = css.indexOf(`\n${selector} {`);
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
};

describe('.nhsw-lede-text matches the NHS.UK lede text', () => {
  it('uses 22px/29px on mobile with a 40px bottom margin', () => {
    const r = rule('.nhsw-lede-text');
    expect(r).toMatch(/font-size:\s*1\.375rem/);
    expect(r).toMatch(/line-height:\s*1\.8125rem/);
    expect(r).toMatch(/font-weight:\s*400/);
    expect(r).toMatch(/margin:\s*0 0 40px/);
  });

  it('steps up to 26px/32px with a 48px bottom margin from tablet', () => {
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-lede-text\s*\{[^}]*font-size:\s*1\.625rem[^}]*line-height:\s*2rem[^}]*margin-bottom:\s*48px/);
  });

  it('applies the lede size to a p or ul inside it', () => {
    expect(css).toMatch(/\.nhsw-lede-text p,\s*\.nhsw-lede-text ul\s*\{[^}]*font-size:\s*inherit/);
  });

  it('pulls up 8px when directly after a page heading', () => {
    expect(rule('.nhsw-h1 + .nhsw-lede-text,\n.nhsw-h1 + .nhsw-lede-text--small')).toMatch(/margin-top:\s*-8px/);
  });
});

describe('.nhsw-lede-text--small', () => {
  it('uses body size with a 24px bottom margin, then 32px from tablet', () => {
    const r = rule('.nhsw-lede-text--small');
    expect(r).toMatch(/font-size:\s*1rem/);
    expect(r).toMatch(/margin:\s*0 0 24px/);
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-lede-text--small\s*\{[^}]*font-size:\s*1\.1875rem[^}]*margin-bottom:\s*32px/);
  });
});

describe('component page layout', () => {
  it('renders the page intro as lede text', () => {
    const layout = fs.readFileSync(path.join(root, 'preview/_layouts/component.html'), 'utf8');
    expect(layout).toMatch(/<p class="nhsw-lede-text">\{\{ page\.intro \}\}<\/p>/);
  });
});
