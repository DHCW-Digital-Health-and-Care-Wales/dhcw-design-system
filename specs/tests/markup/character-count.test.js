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
  .filter(({ raw }) => raw.includes('nhsw-textarea__count') || raw.includes('data-max-length'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

describe('character count markup is static: the live region is created by nhsw-behaviours.js, never written into the page', () => {
  it('finds pages that use a character count', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: no count element carries aria-live', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const count of doc.querySelectorAll('.nhsw-textarea__count')) {
      expect(count.hasAttribute('aria-live'), `${count.outerHTML.slice(0, 100)} should not be a live region`).toBe(false);
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: no count in an escaped code sample carries aria-live either', (_rel, { raw }) => {
    expect(raw).not.toMatch(/nhsw-textarea__count[^&]*?(?:\\"|")\s+aria-live=/);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: every data-max-length-target points at a count element that the field also references with aria-describedby', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const field of doc.querySelectorAll('[data-max-length]')) {
      const targetId = field.getAttribute('data-max-length-target');
      expect(doc.getElementById(targetId), `#${targetId} should exist`).not.toBeNull();
      expect((field.getAttribute('aria-describedby') || '').split(/\s+/), `${field.id} should be described by #${targetId}`).toContain(targetId);
    }
  });
});
