import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('session row matches its list-item structure', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/session-row";`);
  });

  it('row has 12px 16px padding and a grey bottom border', () => {
    const row = block(css, '\\.nhsw-session-row');
    expect(row).toMatch(/padding:\s*12px 16px/);
    expect(row).toMatch(/border-bottom:\s*1px solid #d8dde0/);
  });

  it('title is link-blue and bold', () => {
    const title = block(css, '\\.nhsw-session-row__title');
    expect(title).toMatch(/color:\s*#005aa8/);
    expect(title).toMatch(/font-weight:\s*700/);
  });

  it('meta and detail text use the secondary text token', () => {
    const meta = block(css, '\\.nhsw-session-row__meta');
    const detail = block(css, '\\.nhsw-session-row__detail');
    expect(meta).toMatch(/color:\s*#4c6272/);
    expect(detail).toMatch(/color:\s*#4c6272/);
  });

  it('badge has a grey background and bold text', () => {
    const badge = block(css, '\\.nhsw-session-row__badge');
    expect(badge).toMatch(/background-color:\s*#f0f4f5/);
    expect(badge).toMatch(/font-weight:\s*700/);
  });
});

describe('session row recurring marker', () => {
  const css = compileProbe(`@use "components/content/session-row";`);
  it('underlines the recurring session text and lays the icon beside it', () => {
    expect(block(css, '\.nhsw-session-row__recurring')).toMatch(/display:\s*inline-flex/);
    expect(block(css, '\.nhsw-session-row__recurring')).toMatch(/text-decoration:\s*underline/);
  });
  it('the macro adds the icon and text when recurring is true', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure('src/components', { autoescape: true });
    const html = env.renderString('{% from "session-row/macro.njk" import nhswSessionRow %}{{ nhswSessionRow({ title: "T", meta: "8am to 5pm", recurring: true, href: "#" }) }}');
    expect(html).toContain('nhsw-session-row__recurring');
    expect(html).toContain('<svg class="nhsw-session-row__icon"');
    expect(html).toContain('8am to 5pm');
  });
});

describe('session row with a location', () => {
  it('renders the location as its own column and keeps links out of a link', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure('src/components', { autoescape: true });
    const html = env.renderString('{% from "session-row/macro.njk" import nhswSessionRow %}{{ nhswSessionRow({ title: "T", detail: "D", location: { text: "Place", href: "#" }, href: "#" }) }}');
    expect(html).toContain('<div class="nhsw-session-row"');
    expect(html).toContain('<a class="nhsw-session-row__title" href="#">T</a>');
    expect(html).toContain('<div class="nhsw-session-row__location"><a class="nhsw-link" href="#">Place</a></div>');
  });
});
