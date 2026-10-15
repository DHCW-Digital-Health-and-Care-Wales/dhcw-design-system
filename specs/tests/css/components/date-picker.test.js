import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('date picker toggle, dialog and day states', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/date-picker";`);
  });

  it('toggle button is primary-blue with a fixed 44px width', () => {
    const toggle = block(css, '\\.nhsw-date-picker__toggle');
    expect(toggle).toMatch(/width:\s*44px/);
    expect(toggle).toMatch(/background-color:\s*#1b365d/);
    expect(toggle).toMatch(/border:\s*2px solid #4c6272/);
  });

  it('toggle hover darkens the background', () => {
    const hover = block(css, '\\.nhsw-date-picker__toggle:hover');
    expect(hover).toMatch(/background-color:\s*#32598a/i);
  });

  it('dialog has a dark 2px border and drop shadow', () => {
    const dialog = block(css, '\\.nhsw-date-picker__dialog');
    expect(dialog).toMatch(/border:\s*2px solid #212b32/);
    expect(dialog).toMatch(/box-shadow:/);
  });

  it('today is outlined and bold, pending selection is yellow-highlighted', () => {
    const today = block(css, '\\.nhsw-date-picker__day--today');
    const pending = block(css, '\\.nhsw-date-picker__day--pending');
    expect(today).toMatch(/border-color:\s*#212b32/);
    expect(today).toMatch(/font-weight:\s*700/);
    expect(pending).toMatch(/background-color:\s*#ffeb3b/);
    expect(pending).toMatch(/font-weight:\s*700/);
  });

  it('toggle text is white, and the expanded/disabled states get their own backgrounds', () => {
    const toggle = block(css, '\\.nhsw-date-picker__toggle\\b');
    expect(toggle).toMatch(/color:\s*#ffffff/);
    const expanded = block(css, '\\.nhsw-date-picker__toggle\\[aria-expanded=true\\]');
    expect(expanded).toMatch(/background-color:\s*#21355C/i);
    const disabled = block(css, '\\.nhsw-date-picker__toggle:disabled, \\.nhsw-date-picker__toggle\\[disabled\\]');
    expect(disabled).toMatch(/background-color:\s*#f0f4f5/);
  });

  it('dialog has a white background and a drop shadow', () => {
    const dialog = block(css, '\\.nhsw-date-picker__dialog');
    expect(dialog).toMatch(/background-color:\s*#ffffff/);
    expect(dialog).toMatch(/box-shadow:\s*0 4px 12px rgba\(0,\s*0,\s*0,\s*0\.15\)/);
  });

  it('hover states (nav button, day, shortcut) use the same light-grey background', () => {
    const navHover = block(css, '\\.nhsw-date-picker__nav-button:hover');
    expect(navHover).toMatch(/background-color:\s*#f0f4f5/);
    const dayHover = block(css, '\\.nhsw-date-picker__day:hover:not\\(\\[disabled\\]\\)');
    expect(dayHover).toMatch(/background-color:\s*#f0f4f5/);
    const shortcutHover = block(css, '\\.nhsw-date-picker__shortcut:hover');
    expect(shortcutHover).toMatch(/background-color:\s*#f0f4f5/);
  });

  it('shortcuts row has a grey top border', () => {
    const shortcuts = block(css, '\\.nhsw-date-picker__shortcuts');
    expect(shortcuts).toMatch(/border-top:\s*1px solid #d8dde0/);
  });

  it('all interactive buttons (toggle, nav, day, shortcut) inherit their font family instead of falling back to the browser default button font', () => {
    const toggle = block(css, '\\.nhsw-date-picker__toggle\\b');
    const navButton = block(css, '\\.nhsw-date-picker__nav-button\\b');
    const day = block(css, '\\.nhsw-date-picker__day\\b');
    const shortcut = block(css, '\\.nhsw-date-picker__shortcut\\b');
    for (const rule of [toggle, navButton, day, shortcut]) {
      expect(rule).toMatch(/font-family:\s*inherit/);
    }
  });
});
