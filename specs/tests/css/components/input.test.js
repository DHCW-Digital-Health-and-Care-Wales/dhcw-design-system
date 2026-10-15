import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('input shares the standard input styling (border, background, placeholder, disabled, invalid states)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/input";`);
  });

  it('has a 2px secondary-coloured border and a white background', () => {
    const input = block(css, '\\.nhsw-input\\b');
    expect(input).toMatch(/border:\s*2px solid #4c6272/);
    expect(input).toMatch(/background-color:\s*#ffffff/);
  });

  it('placeholder text uses the secondary text colour', () => {
    const placeholder = block(css, '\\.nhsw-input::placeholder');
    expect(placeholder).toMatch(/color:\s*#4c6272/);
  });

  it('disabled state greys out the background and text', () => {
    const disabled = block(css, '\\.nhsw-input:disabled, \\.nhsw-input\\[disabled\\]');
    expect(disabled).toMatch(/background-color:\s*#f0f4f5/);
    expect(disabled).toMatch(/color:\s*#4c6272/);
  });

  it('invalid state (aria-invalid or .nhsw-is-invalid) shows a red border', () => {
    const invalid = block(css, '\\.nhsw-input\\[aria-invalid=true\\], \\.nhsw-input\\.nhsw-is-invalid');
    expect(invalid).toMatch(/border-color:\s*#d5281b/);
  });

  it('an invalid input keeps its red border (and red inset weight) when focused, alongside the yellow outline', () => {
    const focus = css.match(/\.nhsw-input\[aria-invalid=true\]:focus[^{]*\{([^}]*)\}/)[1];
    expect(focus).toMatch(/border-color:\s*#d5281b/);
    expect(focus).toMatch(/box-shadow:\s*inset 0 0 0 2px #d5281b/);
  });

  it('inherits its font family instead of falling back to the browser default input font', () => {
    const input = block(css, '\\.nhsw-input\\b');
    expect(input).toMatch(/font-family:\s*inherit/);
  });
});
