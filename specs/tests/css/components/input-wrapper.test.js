import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('input-wrapper prefix/suffix use the border-grey token, not the lighter background-grey', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/input-wrapper";`);
  });

  it('prefix/suffix background is #d8dde0', () => {
    const block1 = block(css, '\\.nhsw-input-wrapper__prefix, \\.nhsw-input-wrapper__suffix');
    expect(block1).toMatch(/background-color:\s*#d8dde0/);
  });
});

describe('input wrapper prefix/suffix styling', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/input-wrapper";`);
  });

  it('wrapper lays out as an inline flex row', () => {
    const wrapper = block(css, '\\.nhsw-input-wrapper');
    expect(wrapper).toMatch(/display:\s*inline-flex/);
  });

  it('prefix and suffix share a 2px border and 8px/12px padding', () => {
    const shared = block(css, '\\.nhsw-input-wrapper__prefix,\\s*\\.nhsw-input-wrapper__suffix');
    expect(shared).toMatch(/padding:\s*8px 12px/);
    expect(shared).toMatch(/border:\s*2px solid #4c6272/);
  });

  it('prefix drops its right border, suffix drops its left border', () => {
    const prefix = block(css, '\\.nhsw-input-wrapper__prefix');
    const suffix = block(css, '\\.nhsw-input-wrapper__suffix');
    expect(prefix).toMatch(/border-right:\s*0/);
    expect(suffix).toMatch(/border-left:\s*0/);
  });

  it('prefix/suffix inherit their font family to match the paired input', () => {
    const shared = block(css, '\\.nhsw-input-wrapper__prefix,\\s*\\.nhsw-input-wrapper__suffix');
    expect(shared).toMatch(/font-family:\s*inherit/);
  });

  it('a focused input is raised above its prefix/suffix siblings, so its outline is not painted over by the suffix', () => {
    const focus = block(css, '\\.nhsw-input-wrapper \\.nhsw-input:focus');
    expect(focus).toMatch(/position:\s*relative/);
    expect(focus).toMatch(/z-index:\s*1/);
  });
});
