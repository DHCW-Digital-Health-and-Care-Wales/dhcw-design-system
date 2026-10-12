import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const projectRoot = path.resolve(import.meta.dirname, '../../..');
const previewDir = path.join(projectRoot, 'preview');
const skippedDirs = new Set(['_site', '_site_test', 'dist', 'node_modules']);

function collectHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return skippedDirs.has(entry.name) ? [] : collectHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

const pages = collectHtml(previewDir)
  .map((file) => ({ rel: path.relative(previewDir, file).split(path.sep).join('/'), raw: fs.readFileSync(file, 'utf8') }))
  .filter(({ raw }) => raw.includes('nhsw-site-header__nav-list'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

describe('only the overflow menu variant carries the hidden "More" menu item', () => {
  it('finds pages that contain a site navigation', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: a navigation has the menu item if and only if it is the overflow variant', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const nav of doc.querySelectorAll('.nhsw-site-header__nav')) {
      const menu = nav.querySelector('.nhsw-site-header__nav-list > .nhsw-site-header__menu');
      const isOverflow = nav.classList.contains('nhsw-site-header__nav--overflow');
      expect(Boolean(menu), `${nav.className}: menu item present should match the overflow class`).toBe(isOverflow);
      if (menu) {
        expect(menu.hasAttribute('hidden')).toBe(true);
        expect(menu.parentElement.lastElementChild).toBe(menu);
        const button = menu.querySelector('button.nhsw-site-header__menu-toggle');
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(button.textContent.trim()).toBe('Browse More');
      }
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: escaped code samples follow the same rule', (_rel, { raw }) => {
    const samples = raw.match(/&lt;nav class="nhsw-site-header__nav[^"]*"[\s\S]*?&lt;\/nav&gt;/g) || [];
    for (const sample of samples) {
      const isOverflow = sample.includes('nhsw-site-header__nav--overflow');
      expect(sample.includes('nhsw-site-header__menu-toggle'), sample.slice(0, 90)).toBe(isOverflow);
    }
  });

  it('the component page documents the overflow menu variant, with a live example, an example page, and a Nunjucks sample', () => {
    const page = pages.find((p) => p.rel === 'site/site-navigation.html');
    expect(page.raw).toContain('Site navigation with an overflow menu');
    expect(page.raw).toContain('/examples/site-navigation-overflow.html');
    expect(page.raw).toContain('overflowMenu: true');
    expect(pages.some((p) => p.rel === 'examples/site-navigation-overflow.html')).toBe(true);
  });
});
