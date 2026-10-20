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

  it('the statuses on the right are the Tag component, with no tag styles of their own', () => {
    expect(css).not.toContain('.nhsw-session-row__badge {');
    expect(block(css, '\\.nhsw-session-row__badges \\.nhsw-tag')).toMatch(/margin:\s*0/);
  });

  it('the time, divider and recurring link sit on one centred line, so they line up', () => {
    const meta = block(css, '\\.nhsw-session-row__meta');
    expect(meta).toMatch(/display:\s*flex/);
    expect(meta).toMatch(/align-items:\s*center/);
    expect(block(css, '\\.nhsw-session-row__divider')).toMatch(/width:\s*1px/);
  });

  it('a row with no location is clickable all over through its title link, and the recurring link stays above that', () => {
    expect(css).toContain('.nhsw-session-row:not(:has(.nhsw-session-row__location)) .nhsw-session-row__title::after {');
    expect(block(css, '\\.nhsw-session-row__recurring')).toMatch(/z-index:\s*1/);
    expect(block(css, '\\.nhsw-session-row__location')).toMatch(/z-index:\s*1/);
  });
});

describe('session row markup', () => {
  it('the statuses render as Tag components and the recurring marker is a real link, outside the title link', async () => {
    const nunjucks = (await import('nunjucks')).default;
    const env = nunjucks.configure('src/components', { autoescape: true });
    const html = env.renderString('{% from "session-row/macro.njk" import nhswSessionRow %}{{ nhswSessionRow({ title: "T", meta: "8am to 5pm", recurring: true, badges: [{ label: "To do", value: "21 of 87" }, { label: "Free", value: "11" }], href: "#" }) }}');
    expect(html).toContain('<strong class="nhsw-tag nhsw-tag--blue">To do<br>21 of 87</strong>');
    expect(html).toContain('<strong class="nhsw-tag nhsw-tag--white">Free<br>11</strong>');
    expect(html).toContain('<a class="nhsw-link nhsw-session-row__recurring" href="#">');
    expect(html).not.toContain('<a class="nhsw-session-row"');
    expect(html).not.toContain('nhsw-session-row__badge"');
  });

  it('the two standalone examples start with valid front matter, so they load when opened in a new tab', async () => {
    const fs = await import('node:fs');
    for (const file of ['table-session-row.html', 'table-session-row-location.html']) {
      const text = fs.readFileSync(`preview/examples/${file}`, 'utf8').replace(/\r\n/g, '\n');
      expect(text, file).toMatch(/^---\nlayout: example\ntitle: [^\n]+\n---\n<div class="nhsw-session-row">/);
    }
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
