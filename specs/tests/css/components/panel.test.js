import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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
    expect(css.match(/^\.nhsw-panel__body\s*\{/gm)).toHaveLength(1);
  });
});

describe('smaller panel, from the Figma panel CSS', () => {
  const css = compileProbe(`@use "components/content/panel";`);

  it('has 32px/80px padding from tablet (32px/16px below), and 16px between the parts', () => {
    expect(block(css, '\\.nhsw-panel--small')).toMatch(/padding:\s*32px 16px/);
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-panel--small\s*\{\s*padding:\s*32px 80px/);
    expect(block(css, '\\.nhsw-panel--small \\.nhsw-panel__title')).toMatch(/margin-bottom:\s*16px/);
    expect(block(css, '\\.nhsw-panel--small \\.nhsw-panel__icon')).toMatch(/margin-bottom:\s*16px/);
  });

  it('has a 32px/38px title and 19px/27px body text', () => {
    const title = block(css, '\\.nhsw-panel--small \\.nhsw-panel__title');
    expect(title).toMatch(/font-size:\s*2rem/);
    expect(title).toMatch(/line-height:\s*2\.375rem/);
    const body = block(css, '\\.nhsw-panel--small \\.nhsw-panel__body');
    expect(body).toMatch(/font-size:\s*1\.1875rem/);
    expect(body).toMatch(/line-height:\s*1\.6875rem/);
  });

  it('keeps the blue (navy) styling in the CSS for later, even though the docs no longer show it', () => {
    expect(css).toContain('.nhsw-panel--navy');
  });
});

describe('panel documentation', () => {
  const read = (rel) => fs.readFileSync(path.join(import.meta.dirname, '../../../..', rel), 'utf8');
  const docs = read('preview/components/panel.html');

  it('has no blue panel examples or blue background section', () => {
    expect(docs).not.toContain('panel--navy');
    expect(docs).not.toContain('Blue background');
    expect(fs.existsSync(path.join(import.meta.dirname, '../../../..', 'preview/examples/panel-navy.html'))).toBe(false);
  });

  it('the smaller panel examples use the small variant, and the Nunjucks sets it too', () => {
    expect(docs).toContain('open_url="/examples/panel-small.html"');
    expect(docs).toContain('open_url="/examples/panel-no-icon-small.html"');
    expect(read('preview/examples/panel-small.html')).toContain('nhsw-panel nhsw-panel--small');
    expect(read('preview/examples/panel-no-icon-small.html')).toContain('nhsw-panel nhsw-panel--small');
    expect(docs.match(/classes: "nhsw-panel--small"/g)).toHaveLength(2);
    expect(docs).toContain('icon: false,');
  });
});
