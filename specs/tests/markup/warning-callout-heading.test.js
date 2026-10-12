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
  .filter(({ raw }) => raw.includes('nhsw-warning-callout__heading'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

const announces = (text) => /important|warning/i.test(text);

describe('every warning callout heading is announced as important or a warning by screen readers (NVDA reads the heading text, including visually hidden text)', () => {
  it('finds pages that contain warning callouts', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: heading text includes "important" or "warning", either visible or visually hidden', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const heading of doc.querySelectorAll('.nhsw-warning-callout__heading')) {
      const spoken = heading.textContent.replace(/\s+/g, ' ').trim();
      expect(announces(spoken), `"${spoken}" would be read with nothing to say it is a callout`).toBe(true);
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: hidden text sits inside the heading and does not repeat a heading that already says it', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const heading of doc.querySelectorAll('.nhsw-warning-callout__heading')) {
      const hidden = heading.querySelector('.nhsw-visually-hidden');
      if (!hidden) continue;
      const visible = heading.textContent.replace(hidden.textContent, '').replace(/\s+/g, ' ').trim();
      expect(announces(visible), `"${visible}" already says it, so the hidden "${hidden.textContent.trim()}" repeats it`).toBe(false);
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: escaped code samples never show a callout heading without the announcement', (_rel, { raw }) => {
    const samples = raw.match(/&lt;h3 class="nhsw-warning-callout__heading"&gt;[\s\S]*?&lt;\/h3&gt;/g) || [];
    for (const sample of samples) {
      const spoken = sample
        .replace(/&lt;[^&]*?&gt;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      expect(announces(spoken), `code sample "${spoken}" has no hidden Important/Warning text`).toBe(true);
    }
  });
});
