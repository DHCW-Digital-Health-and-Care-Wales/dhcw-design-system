import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

// Expected values read directly out of Figma component nodes for this design
// system: https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2

describe('panel matches Figma Panel component (Small, Green variant)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/panel";`);
  });

  it('has 32px vertical / 40px horizontal padding', () => {
    const base = block(css, '\\.nhsw-panel');
    expect(base).toMatch(/padding:\s*32px 40px/);
  });

  it('background matches Figma green', () => {
    const base = block(css, '\\.nhsw-panel');
    expect(base).toMatch(/background-color:\s*#007f3b/);
  });

  it('text is white: base panel, title and body', () => {
    const base = block(css, '\\.nhsw-panel\\b');
    expect(base).toMatch(/color:\s*#ffffff/);
    // The heading mixin writes the title's selector twice: the white colour is in the later block.
    const title = [...css.matchAll(/^\.nhsw-panel__title\s*\{([^}]*)\}/gm)].map((m) => m[1]).join('\n');
    expect(title).toMatch(/color:\s*#ffffff/);
    const body = block(css, '\\.nhsw-panel__body');
    expect(body).toMatch(/color:\s*#ffffff/);
  });

  it('navy variant overrides the background to the primary button navy', () => {
    const navy = block(css, '\\.nhsw-panel--navy');
    expect(navy).toMatch(/background-color:\s*#1b365d/);
  });
});

describe('panel left-aligns text by default, keeping the icon variant centred', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/panel";`);
  });

  it('panel is centred by default', () => {
    const base = block(css, '\\.nhsw-panel');
    expect(base).toMatch(/text-align:\s*center/);
  });

  it('a panel without an icon left-aligns its text', () => {
    const noIcon = block(css, '\\.nhsw-panel:not\\(:has\\(\\.nhsw-panel__icon\\)\\)');
    expect(noIcon).toMatch(/text-align:\s*left/);
  });
});

describe('panel body text is 22px', () => {
  it('uses a 22px font size with a matching line height at every screen size', () => {
    const css = compileProbe(`@use "components/content/panel";`);
    const body = block(css, '\.nhsw-panel__body');
    expect(body).toMatch(/font-size:\s*1\.375rem/);
    expect(body).toMatch(/line-height:\s*1\.8125rem/);
    expect(css.match(/\.nhsw-panel__body\s*\{/g)).toHaveLength(1);
  });
});
