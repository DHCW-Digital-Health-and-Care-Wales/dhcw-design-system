import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('keyboard key', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/kbd";`);
  });

  it('is monospace text in a dark, rounded outline', () => {
    const key = block(css, '\\.nhsw-kbd');
    expect(key).toMatch(/border:\s*1px solid #212b32/);
    expect(key).toMatch(/border-radius:\s*4px/);
    expect(key).toMatch(/font-family:[^;]*monospace/);
  });
});

describe('highlighted code', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/code";`);
  });

  it('sits on a white background', () => {
    expect(block(css, '\\.nhsw-code--highlight')).toMatch(/background-color:\s*#ffffff/);
  });

  it('shows commands character for character, without ligatures', () => {
    expect(block(css, '\\.nhsw-code--highlight')).toMatch(/font-variant-ligatures:\s*none/);
  });

  it('leaves plain code as it was', () => {
    const code = block(css, '\\.nhsw-code');
    expect(code).toMatch(/font-family:\s*Consolas/);
    expect(code).not.toMatch(/background/);
  });
});
