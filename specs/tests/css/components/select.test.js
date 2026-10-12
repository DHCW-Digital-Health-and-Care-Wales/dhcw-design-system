import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('select shares the standard input styling (border, background, placeholder, disabled, invalid states)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/select";`);
  });

  it('has a 2px secondary-coloured border and a white background', () => {
    const select = block(css, '\\.nhsw-select\\b');
    expect(select).toMatch(/border:\s*2px solid #4c6272/);
    expect(select).toMatch(/background-color:\s*#ffffff/);
  });

  it('placeholder text uses the secondary text colour', () => {
    const placeholder = block(css, '\\.nhsw-select::placeholder');
    expect(placeholder).toMatch(/color:\s*#4c6272/);
  });

  it('disabled state greys out the background and text', () => {
    const disabled = block(css, '\\.nhsw-select:disabled, \\.nhsw-select\\[disabled\\]');
    expect(disabled).toMatch(/background-color:\s*#f0f4f5/);
    expect(disabled).toMatch(/color:\s*#4c6272/);
  });

  it('invalid state (aria-invalid or .nhsw-is-invalid) shows a red border', () => {
    const invalid = block(css, '\\.nhsw-select\\[aria-invalid=true\\], \\.nhsw-select\\.nhsw-is-invalid');
    expect(invalid).toMatch(/border-color:\s*#d5281b/);
  });

  it('inherits its font family instead of falling back to the browser default select font', () => {
    const select = block(css, '\\.nhsw-select\\b');
    expect(select).toMatch(/font-family:\s*inherit/);
  });

  it('never grows wider than its container: a minimum width beats max-width, so each minimum is capped at 100%', () => {
    expect(css).toMatch(/\.nhsw-select\s*\{[^}]*max-width:\s*100%/);
    expect(css).toMatch(/\.nhsw-select\s*\{[^}]*min-width:\s*min\(12rem,\s*100%\)/);
    for (const [name, width] of [['xs', '4rem'], ['s', '8rem'], ['m', '12rem'], ['l', '16rem'], ['xl', '24rem']]) {
      expect(css, `--${name}`).toMatch(new RegExp(`\\.nhsw-select--${name}\\s*\\{[^}]*min-width:\\s*min\\(${width},\\s*100%\\)`));
    }
    expect(css).not.toMatch(/min-width:\s*(?:4|8|12|16|24)rem\s*;/);
  });
});
