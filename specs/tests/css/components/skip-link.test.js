import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('skip link is not underlined and shows a bordered focus state', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/navigation/skip-link";`);
  });

  it('base state has no underline', () => {
    const base = block(css, '\\.nhsw-skip-link');
    expect(base).toMatch(/text-decoration:\s*none/);
  });

  it('base state is fully clipped so no sliver of the yellow bar shows until focused', () => {
    expect(block(css, '\\.nhsw-skip-link\\b')).toMatch(/clip-path:\s*inset\(100%\)/);
    expect(block(css, '\\.nhsw-skip-link:focus')).toMatch(/clip-path:\s*none/);
  });

  it('base state is a yellow highlight with near-black text', () => {
    const base = block(css, '\\.nhsw-skip-link\\b');
    expect(base).toMatch(/background-color:\s*#ffeb3b/);
    expect(base).toMatch(/color:\s*#212b32/);
  });

  it('focus state adds a thick 4px bottom-edge border on top of the yellow highlight, with the default UA outline suppressed', () => {
    const focus = block(css, '\\.nhsw-skip-link:focus');
    expect(focus).toMatch(/box-shadow:\s*0 4px 0 #212b32/);
    expect(focus).toMatch(/outline:\s*none/);
  });
});
