import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const css = compileProbe('@use "layouts/docs-page";');
const ruleFor = (selector) => {
  const start = css.indexOf(`\n${selector} {`);
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
};
const C = '.nhsw-layout__content.nhsw-layout__content--component';

describe('component documentation pages', () => {
  it('start level with the first side navigation link: no top padding on the content', () => {
    expect(ruleFor(C)).toMatch(/padding-top:\s*0/);
  });

  it('group "Updated in" with the page title: 8px under the H1, then the usual 40px/48px', () => {
    expect(ruleFor(`${C} .nhsw-h1:has(+ .nhsw-body--secondary)`)).toMatch(/margin-bottom:\s*8px/);
    expect(ruleFor(`${C} .nhsw-h1 + .nhsw-body--secondary`)).toMatch(/margin-bottom:\s*40px/);
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-layout__content\.nhsw-layout__content--component \.nhsw-h1 \+ \.nhsw-body--secondary\s*\{\s*margin-bottom:\s*48px/);
  });

  it('put 32px between paragraphs and lists in a tab, not inside examples', () => {
    const start = css.indexOf(`${C} .nhsw-tabs__panel > p.nhsw-body`);
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(start, css.indexOf('}', start))).toMatch(/margin-bottom:\s*32px/);
    expect(css.slice(start, css.indexOf('{', start))).toContain('.nhsw-tabs__panel >');
  });

  it('separate each example after the first with a divider and 40px either side', () => {
    const rule = ruleFor(`${C} #panel-examples > .nhsw-h3:not(:first-of-type)`);
    expect(rule).toMatch(/margin-top:\s*40px/);
    expect(rule).toMatch(/padding-top:\s*40px/);
    expect(rule).toMatch(/border-top:\s*1px solid #d8dde0/);
  });

  it('example screenshot backgrounds are white, not grey', () => {
    const placeholder = compileProbe('@use "components/content/screenshot-placeholder";');
    const rule = placeholder.slice(placeholder.indexOf('.nhsw-screenshot-placeholder {'), placeholder.indexOf('}'));
    expect(rule).toMatch(/background-color:\s*#ffffff/);
  });

  it('use the component modifier on the content, in the component layout and on the All components page', () => {
    expect(read('preview/_layouts/component.html')).toContain('nhsw-layout__content--component');
    expect(read('preview/components/index.html')).toContain('content_modifier: component');
    expect(read('preview/_layouts/simple.html')).toContain('nhsw-layout__content--{{ page.content_modifier }}');
  });
});

describe('removed components', () => {
  const removed = ['dashboard', 'phase-banner', 'warning-text'];

  it.each(removed)('%s has no page, and is not in the sidebar or on the All components page', (slug) => {
    expect(fs.existsSync(path.join(root, `preview/components/${slug}.html`))).toBe(false);
    expect(read('preview/_data/side_nav.yml')).not.toContain(`/components/${slug}.html`);
    expect(read('preview/components/index.html')).not.toContain(`/components/${slug}.html`);
  });

  it('the sidebar no longer lists Filter, Language switch or Search', () => {
    const nav = read('preview/_data/side_nav.yml');
    for (const title of ['Dashboard', 'Filter', 'Language switch', 'Phase banner', 'Search', 'Warning text']) {
      expect(nav).not.toContain(`title: ${title}\n`);
    }
  });
});

describe('component pages have no previous/next links at the bottom of each tab', () => {
  const pages = fs.readdirSync(path.join(root, 'preview/components')).filter((f) => f.endsWith('.html'));

  it.each(pages)('%s', (page) => {
    expect(read(`preview/components/${page}`)).not.toContain('nhsw-tabs__pagination');
  });
});

describe('Back to top at the bottom of every tab', () => {
  const dir = path.join(root, 'preview/components');
  const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.html') && f !== 'index.html');

  it('is set off by a divider, with space above', () => {
    const docs = compileProbe('@use "layouts/docs-page";');
    const start = docs.indexOf('\n.nhsw-back-to-top {');
    expect(start).toBeGreaterThan(-1);
    const rule = docs.slice(start, docs.indexOf('}', start));
    expect(rule).toMatch(/border-top:\s*1px solid #d8dde0/);
    expect(rule).toMatch(/margin:\s*40px 0 0/);
  });

  it.each(pages)('%s ends each of its three tabs with a Back to top link', (page) => {
    const text = read(`preview/components/${page}`).replace(/\r\n/g, '\n');
    const panels = text.split(/^<div class="nhsw-tabs__panel/m).slice(1);
    expect(panels).toHaveLength(3);
    for (const panel of panels) {
      const end = panel.search(/\n<\/div>(?:\n|$)/);
      const body = panel.slice(0, end);
      expect(body.trimEnd().endsWith('Back to top</a></p>')).toBe(true);
      expect(body).toContain('<p class="nhsw-body nhsw-back-to-top"><a class="nhsw-link" href="#maincontent">');
    }
  });
});

describe('Notification banner Variants tab matches the design', () => {
  const page = read('preview/components/notification-banner.html');
  const variants = page.slice(page.indexOf('id="panel-variants"'), page.indexOf('<!-- Examples -->'));

  it('has the headings Notification banner variants, Information banner and Success banner, in that order', () => {
    expect([...variants.matchAll(/<h([23]) class="nhsw-h\1">([^<]*)<\/h\1>/g)].map((m) => m[2])).toEqual(
      ['Notification banner variants', 'Information banner', 'Success banner'],
    );
  });

  it('shows each example straight after its heading, on a grey panel, before the guidance', () => {
    const info = variants.indexOf('>Information banner<');
    const success = variants.indexOf('>Success banner<');
    expect(variants.indexOf('id="nb-service" grey=true')).toBeGreaterThan(info);
    expect(variants.indexOf('id="nb-service" grey=true')).toBeLessThan(variants.indexOf('Use an information banner to tell users'));
    expect(variants.indexOf('id="nb-success" grey=true')).toBeGreaterThan(success);
    expect(variants.indexOf('id="nb-success" grey=true')).toBeLessThan(variants.indexOf('Use a success banner to confirm'));
  });

  it('has the guidance paragraphs in the design\'s order and wording', () => {
    const order = [
      'Use an information banner to tell users about something that affects the service as a whole.',
      'For example:',
      'If your service is getting more demand than usual',
      'You can also use the information banner to tell users information about something that\'s happening elsewhere in the service.',
      'Use a success banner to confirm an action on a previous page was successful.',
      'Remove the success banner when the user moves to a new page.',
      'panel component</a> instead of a success banner when users have completed an entire journey or task. For example, after submitting a registration, application or consent form.',
      'Since you\'re using the notification banner to tell the user about the outcome of something they\'ve just done',
    ].map((t) => variants.indexOf(t));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('ends with Back to top, after a divider', () => {
    expect(variants).toMatch(/nhsw-back-to-top"><a class="nhsw-link" href="#maincontent">[\s\S]*Back to top<\/a><\/p>\s*<\/div>\s*$/);
  });
});

describe('Text input page address', () => {
  it('lives at /components/text-input.html, and every link to it uses that address', () => {
    expect(fs.existsSync(path.join(root, 'preview/components/text-input.html'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'preview/components/input.html'))).toBe(false);
    expect(read('preview/_data/side_nav.yml')).toContain('url: /components/text-input.html');
    for (const file of ['preview/components/index.html', 'preview/components/expander.html', 'preview/components/textarea.html', 'preview/testing/input.html']) {
      const text = read(file);
      expect(text).not.toContain('/components/input.html');
      expect(text).toContain('/components/text-input.html');
    }
  });
});
