import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../support/compile-scss.js';

// Covers foundations/_input-base.scss, the shared mixin included by input,
// select, textarea and date-input — kept as one probe (rather than split
// across each component's own file) so it stays clear this is testing the
// shared foundation cascading correctly, not a coincidence across components.

describe('shared input focus/hover: no hover border change, focus looks like a thicker near-black border but does not resize the box', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/input"; @use "components/forms/select"; @use "components/forms/textarea";`);
  });

  it('input and select have no :hover rule at all (the border-darkening hover was removed)', () => {
    expect(css).not.toMatch(/\.nhsw-input:hover/);
    expect(css).not.toMatch(/\.nhsw-select:hover/);
  });

  // border-width itself must stay fixed on focus (never grow) so the element
  // doesn't resize for inputs whose height is intrinsic (auto), not fixed —
  // border-box only keeps an EXPLICIT width/height constant, not an auto one.
  // The extra visual weight instead comes from a 2px inset box-shadow flush
  // against the (still 2px) border, giving the same 4px total look.
  it('input focus adds a 2px inset box-shadow rather than growing the border, so it does not resize', () => {
    const focus = block(css, '\\.nhsw-input:focus');
    expect(focus).toMatch(/border-color:\s*#212b32/);
    expect(focus).not.toMatch(/border-width/);
    expect(focus).toMatch(/box-shadow:\s*inset 0 0 0 2px #212b32/);
  });

  it('select focus adds a 2px inset box-shadow rather than growing the border, so it does not resize', () => {
    const focus = block(css, '\\.nhsw-select:focus');
    expect(focus).toMatch(/border-color:\s*#212b32/);
    expect(focus).not.toMatch(/border-width/);
    expect(focus).toMatch(/box-shadow:\s*inset 0 0 0 2px #212b32/);
  });

  it('textarea focus gets the same fixed-size treatment via the shared input-base mixin', () => {
    const focus = block(css, '\\.nhsw-textarea:focus');
    expect(focus).toMatch(/border-color:\s*#212b32/);
    expect(focus).not.toMatch(/border-width/);
    expect(focus).toMatch(/box-shadow:\s*inset 0 0 0 2px #212b32/);
  });
});

describe('shared input error state: focus swaps the red border for near-black', () => {
  const css = compileProbe(`@use "components/forms/input";`);
  const focused = block(css, '\\.nhsw-input\\[aria-invalid=true\\]:focus, \\.nhsw-input\\.nhsw-is-invalid:focus');

  it('keeps the red border when not focused', () => {
    expect(block(css, '\\.nhsw-input\\[aria-invalid=true\\], \\.nhsw-input\\.nhsw-is-invalid')).toMatch(/border-color:\s*#d5281b/);
  });

  it('uses the primary near-black for the border and inset ring on focus, with no red', () => {
    expect(focused).toMatch(/border-color:\s*#212b32/);
    expect(focused).toMatch(/box-shadow:\s*inset 0 0 0 2px #212b32/);
    expect(focused).not.toMatch(/#d5281b/);
  });
});
