import { describe, it, expect } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('hint margin-bottom matches the design system spec (16px)', () => {
  it('hint margin-bottom is 16px', () => {
    const css = compileProbe(`@use "components/forms/hint";`);
    const hint = block(css, '\\.nhsw-hint');
    expect(hint).toMatch(/margin-bottom:\s*16px/);
  });

  it('hint text uses the secondary (grey) text colour', () => {
    const css = compileProbe(`@use "components/forms/hint";`);
    const hint = block(css, '\\.nhsw-hint');
    expect(hint).toMatch(/color:\s*#4c6272/);
  });
});
