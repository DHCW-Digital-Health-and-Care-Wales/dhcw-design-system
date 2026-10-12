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
  .filter(({ raw }) => raw.includes('nhsw-inset-text'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

describe('every inset text starts with visually hidden "Information: ", so screen readers say it is set apart (WCAG 2.2 SC 1.3.1)', () => {
  it('finds pages that contain inset text', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: each inset text opens with the hidden text, before the content', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const box of doc.querySelectorAll('.nhsw-inset-text')) {
      const first = box.firstElementChild;
      expect(first && first.classList.contains('nhsw-visually-hidden'), `${box.outerHTML.slice(0, 120)} has no hidden text first`).toBe(true);
      expect(first.textContent).toBe('Information: ');
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: no inset text still relies on role="note"', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const box of doc.querySelectorAll('.nhsw-inset-text')) {
      expect(box.getAttribute('role')).not.toBe('note');
    }
    expect(raw).not.toMatch(/nhsw-inset-text[^"]*" role="note"/);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: escaped code samples include the hidden text too', (_rel, { raw }) => {
    const samples = raw.match(/&lt;div class="nhsw-inset-text[^"]*"[^&]*&gt;[\s\S]*?&lt;\/div&gt;/g) || [];
    for (const sample of samples) {
      expect(sample).toContain('&lt;span class="nhsw-visually-hidden"&gt;Information: &lt;/span&gt;');
    }
  });
});
