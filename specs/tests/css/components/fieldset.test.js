import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('fieldset legend margin: a heading class combined onto the legend gets 16px spacing by default, tightened only when a hint follows', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/fieldset";`);
  });

  it('legend + nhsw-h2 gets a 16px margin-bottom by default (this is the safe fallback for browsers without :has() support)', () => {
    const compound = block(css, '\\.nhsw-fieldset__legend\\.nhsw-h2');
    expect(compound).toMatch(/margin-bottom:\s*16px/);
  });

  it('legend + nhsw-h2 keeps margin-bottom at 0 when a hint immediately follows it', () => {
    const withHint = block(css, '\\.nhsw-fieldset__legend\\.nhsw-h2:has\\(\\+ \\.nhsw-hint\\)');
    expect(withHint).toMatch(/margin-bottom:\s*0/);
  });
});
