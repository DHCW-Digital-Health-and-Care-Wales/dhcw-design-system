import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const docs = read('preview/patterns/page-templates.html');

// slug -> what that template must contain
const templates = {
  'page-template-default': { h1: 'Default page template', has: ['nhsw-site-header__logo'], not: ['nhsw-back-link', 'nhsw-breadcrumb', 'nhsw-site-header__nav'] },
  'page-template-full-width': { h1: 'Full width', has: ['nhsw-back-link', 'nhsw-phase-banner--reverse', 'nhsw-site-header__logout'], not: ['nhsw-grid-column'] },
  'page-template-one-half': { h1: 'One-half', has: ['nhsw-grid-column-one-half', 'nhsw-back-link'] },
  'page-template-two-thirds': { h1: 'Two-thirds', has: ['nhsw-grid-column-two-thirds', 'nhsw-back-link'] },
  'page-template-one-third': { h1: 'One-third', has: ['nhsw-grid-column-one-third', 'nhsw-back-link'] },
  'page-template-customised-content': { h1: 'Customised content page template', has: ['nhsw-breadcrumb', 'nhsw-phase-banner--reverse'] },
  'page-template-dashboard-default': { h1: 'Default page template', has: ['nhsw-dashboard__sidebar', 'nhsw-dashboard__topbar'], not: ['nhsw-back-link', 'nhsw-breadcrumb'] },
  'page-template-dashboard-transactional': { h1: 'Transactional page template', has: ['nhsw-dashboard__sidebar', 'nhsw-back-link'] },
  'page-template-dashboard-content': { h1: 'Content page template', has: ['nhsw-dashboard__sidebar', 'nhsw-breadcrumb'] },
};

describe('Page templates docs page', () => {
  it('previews and documents all nine templates', () => {
    for (const slug of Object.keys(templates)) {
      expect(docs, slug).toContain(`open_url="/examples/${slug}.html"`);
      expect(docs, slug).toContain(`/examples/${slug}.html' | relative_url }}" title=`);
    }
  });

  it('has public-facing and dashboard sections the side navigation links to', () => {
    expect(docs).toContain('id="public-facing-page-templates"');
    expect(docs).toContain('id="dashboard-page-templates"');
    const nav = read('preview/_data/styles_nav.yml');
    expect(nav).toContain('/patterns/page-templates.html#public-facing-page-templates');
    expect(nav).toContain('/patterns/page-templates.html#dashboard-page-templates');
  });

  it('shows the HTML and Nunjucks for every template', () => {
    expect([...docs.matchAll(/include code-viewer\.html id="pt-[\w-]+"/g)]).toHaveLength(9);
  });
});

describe.each(Object.entries(templates))('%s example page', (slug, spec) => {
  const page = read(`preview/examples/${slug}.html`);

  it('exists as a full page with one h1, one main landmark and a footer', () => {
    expect(page).toMatch(/^---\r?\nlayout: template\r?\n/);
    expect(page.match(/<h1 /g)).toHaveLength(1);
    expect(page).toContain(`>${spec.h1}</h1>`);
    expect(page.match(/<main /g)).toHaveLength(1);
    expect(page).toMatch(/<footer class="nhsw-site-footer/);
  });

  it('uses the expected components', () => {
    for (const cls of spec.has || []) expect(page, cls).toContain(cls);
    for (const cls of spec.not || []) expect(page, cls).not.toContain(cls);
  });

  it('hides decorative icons from screen readers', () => {
    for (const svg of page.match(/<svg[\s\S]*?>/g) || []) expect(svg).toContain('aria-hidden="true"');
  });
});

describe('Beta phase banner on every documentation page', () => {
  it('is included once by the default layout, after the primary navigation', () => {
    const layout = read('preview/_layouts/default.html');
    expect(layout.match(/include phase-banner\.html/g)).toHaveLength(1);
    expect(layout.indexOf('include primary-nav.html')).toBeLessThan(layout.indexOf('include phase-banner.html'));
  });

  it('says the service is new and links to feedback', () => {
    const banner = read('preview/_includes/phase-banner.html');
    expect(banner).toContain('>Beta</strong>');
    expect(banner).toContain('This is a new service. Your');
    expect(banner).toMatch(/<a class="nhsw-link" href="[^"]+">feedback<\/a> will help us improve it\./);
  });

  it('is not added to the bare example and template layouts', () => {
    expect(read('preview/_layouts/example.html')).not.toContain('phase-banner');
    expect(read('preview/_layouts/template.html')).not.toContain('phase-banner');
  });
});
