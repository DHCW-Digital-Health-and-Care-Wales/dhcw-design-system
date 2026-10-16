import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';

const root = path.resolve(import.meta.dirname, '../../..');
let css = '';

beforeAll(() => {
  css = sass.compile(path.join(root, 'src/index.scss')).css;
});

describe('.nhsw-lede-text', () => {
  it('is defined with a larger, regular-weight type size and a bottom margin', () => {
    const rule = css.match(/\.nhsw-lede-text\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/font-size:\s*1\.375rem/);
    expect(rule).toMatch(/font-weight:\s*400/);
    expect(rule).toMatch(/margin:\s*0 0 24px/);
  });

  it('steps up to the tablet type size and margin', () => {
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-lede-text\s*\{[^}]*font-size:\s*1\.625rem[^}]*margin-bottom:\s*32px/);
  });
});

describe('component page layout', () => {
  it('renders the page intro as lede text', () => {
    const layout = fs.readFileSync(path.join(root, 'preview/_layouts/component.html'), 'utf8');
    expect(layout).toMatch(/<p class="nhsw-lede-text">\{\{ page\.intro \}\}<\/p>/);
  });
});
