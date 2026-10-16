import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import * as sass from 'sass';

const root = path.resolve(import.meta.dirname, '../../..');
let css = '';

beforeAll(() => {
  css = sass.compile(path.join(root, 'src/index.scss')).css;
});

describe('table captions use the default text colour', () => {
  it('.nhsw-table__caption sets the primary text colour', () => {
    const start = css.indexOf('\n.nhsw-table__caption {');
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(start, css.indexOf('}', start))).toMatch(/color:\s*#212b32/);
  });

  it('comes after the secondary-coloured .nhsw-caption-* classes so it overrides them', () => {
    expect(css.indexOf('\n.nhsw-table__caption {')).toBeGreaterThan(css.lastIndexOf('\n.nhsw-caption-s {'));
  });

  it('the general caption classes stay secondary-coloured', () => {
    const start = css.indexOf('\n.nhsw-caption-m {');
    expect(css.slice(start, css.indexOf('}', start))).toMatch(/color:\s*#4c6272/);
  });
});
