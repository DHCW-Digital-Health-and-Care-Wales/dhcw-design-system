import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('summary list rows, keys and no-border modifier', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/summary-list";`);
  });

  it('row has a grey bottom border, full-width wrap below desktop', () => {
    const row = block(css, '\\.nhsw-summary-list__row');
    expect(row).toMatch(/border-bottom:\s*1px solid #d8dde0/);
    expect(row).toMatch(/padding:\s*8px 0/);
    expect(css).toMatch(/@media \(min-width: 48\.0625em\)[\s\S]*?\.nhsw-summary-list__row\s*\{[^}]*padding:\s*12px 0/);
  });

  it('key column is bold and full-width below desktop, 30% from desktop', () => {
    const key = block(css, '\\.nhsw-summary-list__key');
    expect(key).toMatch(/font-weight:\s*700/);
    expect(key).toMatch(/width:\s*100%/);
    expect(css).toMatch(/@media \(min-width: 48\.0625em\)[\s\S]*?\.nhsw-summary-list__key\s*\{[^}]*width:\s*30%/);
  });

  it('--no-border modifier removes the row border', () => {
    expect(css).toMatch(/\.nhsw-summary-list--no-border \.nhsw-summary-list__row\s*\{[^}]*border-bottom:\s*0/);
    expect(css).toMatch(/\.nhsw-summary-list__row--no-border\s*\{[^}]*border-bottom:\s*0/);
  });
});

describe('summary list action links hover to the maroon used elsewhere, not the near-identical default link-hover blue', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/summary-list";`);
  });

  it('"Change" links inside a summary list row hover to #7c2855', () => {
    const hover = block(css, '\\.nhsw-summary-list__actions a:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);
  });
});
