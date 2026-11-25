import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('step list', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/step-list";`);
  });

  it('replaces the browser numbering with a counter', () => {
    const list = block(css, '\\.nhsw-step-list');
    expect(list).toMatch(/list-style:\s*none/);
    expect(list).toMatch(/counter-reset:\s*nhsw-step/);
    expect(block(css, '\\.nhsw-step-list__item')).toMatch(/counter-increment:\s*nhsw-step/);
    expect(block(css, '\\.nhsw-step-list__item::before')).toMatch(/content:\s*counter\(nhsw-step\)/);
  });

  it('shows each number in white on a 32px navy square', () => {
    const number = block(css, '\\.nhsw-step-list__item::before');
    expect(number).toMatch(/width:\s*32px/);
    expect(number).toMatch(/height:\s*32px/);
    expect(number).toMatch(/background-color:\s*#1b365d/);
    expect(number).toMatch(/color:\s*#ffffff/);
  });

  it('keeps a border on the number so it still shows in forced colours mode', () => {
    expect(block(css, '\\.nhsw-step-list__item::before')).toMatch(/border:\s*2px solid transparent/);
  });

  it('has 40px above and below the list, and 12px between steps', () => {
    expect(block(css, '\\.nhsw-step-list')).toMatch(/margin:\s*40px 0/);
    expect(block(css, '\\.nhsw-step-list__item')).toMatch(/margin-bottom:\s*12px/);
    expect(block(css, '\\.nhsw-step-list__item:last-child')).toMatch(/margin-bottom:\s*0/);
  });

  it('can sit closer to a note that follows it', () => {
    expect(block(css, '\\.nhsw-step-list--tight')).toMatch(/margin-bottom:\s*12px/);
  });
});
