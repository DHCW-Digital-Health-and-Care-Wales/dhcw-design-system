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
