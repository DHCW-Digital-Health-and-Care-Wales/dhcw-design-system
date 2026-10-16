import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';

const root = path.resolve(import.meta.dirname, '../../..');
const docs = fs.readFileSync(path.join(root, 'preview/patterns/page-templates.html'), 'utf8');
const env = configure({ noCache: true });

const unescape = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function njkSample(id) {
  const start = docs.indexOf(`id="${id}" open_url`);
  const open = '{% capture njk_sample %}{% raw %}';
  const a = docs.indexOf(open, start) + open.length;
  const b = docs.indexOf('{% endraw %}{% endcapture %}', a);
  return unescape(docs.slice(a, b));
}

const simple = ['pt-full-width', 'pt-one-half', 'pt-two-thirds', 'pt-one-third'];
const dashboards = ['pt-dashboard-default', 'pt-dashboard-transactional', 'pt-dashboard-content'];

describe('page template Nunjucks samples', () => {
  it.each(simple)('%s renders the simple header and footer, with no banner or navigation', (id) => {
    const html = env.renderString(njkSample(id));
    expect(html).toContain('nhsw-site-header__logo');
    expect(html).toContain('nhsw-site-footer__copyright');
    for (const cls of ['nhsw-phase-banner', 'nhsw-site-header__nav', 'nhsw-site-header__account', 'nhsw-site-footer__links']) {
      expect(html).not.toContain(cls);
    }
  });

  it('pt-customised puts a non-reversed phase banner after the navigation and uses the simple footer', () => {
    const html = env.renderString(njkSample('pt-customised'));
    expect(html).toContain('nhsw-site-header__nav');
    expect(html.indexOf('nhsw-phase-banner')).toBeGreaterThan(html.indexOf('</nav>'));
    expect(html).not.toContain('nhsw-phase-banner--reverse');
    expect(html).not.toContain('nhsw-site-footer__links');
    expect(html).toContain('nhsw-site-footer__copyright');
  });

  it.each(dashboards)('%s renders the simple footer', (id) => {
    const html = env.renderString(njkSample(id));
    expect(html).toContain('nhsw-site-footer__copyright');
    for (const cls of ['nhsw-site-footer__links', 'nhsw-site-footer__licence']) expect(html).not.toContain(cls);
  });
});

describe('footer macro with no links', () => {
  it('renders only the copyright line, without an empty list', () => {
    const html = env.renderString('{% from "footer/macro.njk" import nhswFooter %}{{ nhswFooter({}) }}');
    expect(html).toContain('nhsw-site-footer__copyright');
    expect(html).not.toContain('<ul');
  });

  it('still renders the links list when links are given', () => {
    const html = env.renderString('{% from "footer/macro.njk" import nhswFooter %}{{ nhswFooter({ links: [{ text: "Site map", href: "#" }] }) }}');
    expect(html).toContain('nhsw-site-footer__links');
    expect(html).toContain('Site map');
  });
});

describe('page templates docs wording', () => {
  it('ends with "Help improve this style" and no longer lists account information', () => {
    expect(docs).toContain('<h2 class="nhsw-h2">Help improve this style</h2>');
    expect(docs).not.toContain('Help improve this pattern');
    expect(docs).not.toContain('account information');
  });
});
