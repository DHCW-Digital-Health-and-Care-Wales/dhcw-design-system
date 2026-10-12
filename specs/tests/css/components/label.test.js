import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('label grows to 19px at tablet, matching hint/error-message', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/label";`);
  });

  it('base label (no size modifier) is 19px from the tablet breakpoint up', () => {
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)[\s\S]*?\.nhsw-label\s*\{[^}]*font-size:\s*1\.1875rem/);
  });

  it('the xl label variant (used as a page-heading-style question) always has a 16px margin-bottom, regardless of a following hint', () => {
    const xl = block(css, '\\.nhsw-label--xl');
    expect(xl).toMatch(/margin-bottom:\s*16px/);
  });

  it('base label margin-bottom is 16px by default (safe fallback for browsers without :has() support), 0 when a hint immediately follows', () => {
    const base = block(css, '\\.nhsw-label\\b');
    expect(base).toMatch(/margin-bottom:\s*16px/);
    const withHint = block(css, '\\.nhsw-label:has\\(\\+ \\.nhsw-hint\\)');
    expect(withHint).toMatch(/margin-bottom:\s*0/);
  });
});
