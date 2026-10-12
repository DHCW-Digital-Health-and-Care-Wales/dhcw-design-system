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
  .map((file) => ({ file, rel: path.relative(previewDir, file).split(path.sep).join('/'), raw: fs.readFileSync(file, 'utf8') }))
  .filter(({ raw }) => raw.includes('nhsw-card'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

describe('groups of cards are exposed to assistive technology as a list (matches the NHS.UK card group pattern)', () => {
  it('finds pages that contain cards', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: every grid row of cards is a ul whose children are all li items', (_rel, { raw }) => {
    const doc = parse(raw);
    const rows = [...doc.querySelectorAll('.nhsw-grid-row')].filter((row) => row.querySelector('.nhsw-card'));

    for (const row of rows) {
      expect(row.tagName, `${row.outerHTML.slice(0, 80)} should be a <ul>`).toBe('UL');
      expect(row.getAttribute('role')).toBe('list');
      expect(row.classList.contains('nhsw-card-group')).toBe(true);
      for (const child of row.children) {
        expect(child.tagName, `${child.outerHTML.slice(0, 80)} should be an <li>`).toBe('LI');
        expect(child.classList.contains('nhsw-card-group__item')).toBe(true);
      }
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: no card grid is left as a div row, including escaped code samples', (_rel, { raw }) => {
    expect(raw).not.toMatch(/(?:<|&lt;)div class="nhsw-grid-row/);
  });

  it('the grouping example on the cards page shows list markup in both the HTML and Nunjucks code samples', () => {
    const cardsPage = pages.find((p) => p.rel === 'content/cards.html');
    const grouping = cardsPage.raw.slice(cardsPage.raw.indexOf('Grouping cards (card navigation)'));
    const htmlSample = grouping.slice(grouping.indexOf('{% capture html_sample %}'), grouping.indexOf('{% capture njk_sample %}'));
    const njkSample = grouping.slice(grouping.indexOf('{% capture njk_sample %}'), grouping.indexOf('{% include code-viewer.html'));

    for (const sample of [htmlSample, njkSample]) {
      expect(sample).toContain('&lt;ul class="nhsw-grid-row nhsw-card-group" role="list"&gt;');
      expect(sample).toContain('&lt;li class="nhsw-grid-column-one-half nhsw-card-group__item"&gt;');
      expect(sample).toContain('&lt;/li&gt;');
      expect(sample).toContain('&lt;/ul&gt;');
    }
  });
});
