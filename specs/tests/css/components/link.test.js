import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('.nhsw-link matches the standalone link component states', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/actions/link";`);
  });

  it('base state is link-blue and underlined', () => {
    const link = block(css, '\\.nhsw-link');
    expect(link).toMatch(/color:\s*#005aa8/);
    expect(link).toMatch(/text-decoration:\s*underline/);
  });

  it(':visited recolours to the visited-link token', () => {
    const visited = block(css, '\\.nhsw-link:visited');
    expect(visited).toMatch(/color:\s*#330072/);
  });

  it(':hover recolours and removes the underline', () => {
    const hover = block(css, '\\.nhsw-link:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);
    expect(hover).toMatch(/text-decoration:\s*none/);
  });

  it(':focus uses the yellow focus background with dark text, no underline', () => {
    const focus = block(css, '\\.nhsw-link:focus');
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/color:\s*#212b32/);
    expect(focus).toMatch(/text-decoration:\s*none/);
  });

  it(':focus draws a 4px dark bottom bar via ::after', () => {
    const after = block(css, '\\.nhsw-link:focus::after');
    expect(after).toMatch(/height:\s*4px/);
    expect(after).toMatch(/background:\s*#212b32/);
  });
});
