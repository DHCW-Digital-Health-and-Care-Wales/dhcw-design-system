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
  .filter(({ raw }) => raw.includes('nhsw-tag-group'));

function parse(raw) {
  const withoutFrontMatter = raw.replace(/^---[\s\S]*?---\n/, '');
  const withoutLiquid = withoutFrontMatter.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, 'x');
  return new JSDOM(`<!doctype html><body>${withoutLiquid}</body>`).window.document;
}

describe('every two-part tag is announced as one phrase, "Tag: <category>: <status>"', () => {
  it('finds pages that contain two-part tags', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: each tag group has hidden "Tag: " first, then a hidden ": " between exactly two tags', (_rel, { raw }) => {
    const doc = parse(raw);
    for (const group of doc.querySelectorAll('.nhsw-tag-group')) {
      const kinds = [...group.children].map((c) => (c.classList.contains('nhsw-visually-hidden') ? `hidden:${c.textContent}` : 'tag'));
      expect(kinds, group.outerHTML.slice(0, 120)).toEqual(['hidden:Tag: ', 'tag', 'hidden:: ', 'tag']);
      const [first, second] = group.querySelectorAll('.nhsw-tag');
      expect(group.textContent.replace(/\s+/g, ' ').trim()).toBe(`Tag: ${first.textContent.trim()}: ${second.textContent.trim()}`);
    }
  });

  it.each(pages.map((p) => [p.rel, p]))('%s: escaped code samples of a tag group also include the hidden text', (_rel, { raw }) => {
    const samples = raw.match(/&lt;span class="nhsw-tag-group"&gt;[\s\S]*?&lt;\/span&gt;(?=\s*\{% endraw)/g) || [];
    for (const sample of samples) {
      expect(sample).toContain('&lt;span class="nhsw-visually-hidden"&gt;Tag: &lt;/span&gt;');
      expect(sample).toContain('&lt;span class="nhsw-visually-hidden"&gt;: &lt;/span&gt;');
    }
  });

  it('the Nunjucks code sample on the tag page uses the nhswTagGroup macro, not hand-built spans', () => {
    const tagPage = pages.find((p) => p.rel === 'content/tag.html');
    expect(tagPage.raw).toContain('import nhswTagGroup');
    expect(tagPage.raw).not.toMatch(/&lt;span class="nhsw-tag-group"&gt;\s*\{\{ nhswTag\(/);
  });
});
