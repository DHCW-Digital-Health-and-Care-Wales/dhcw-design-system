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

const anchors = collectHtml(previewDir).flatMap((file) => {
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  return [...doc.querySelectorAll('a')].map((a) => ({
    file: path.relative(projectRoot, file).split(path.sep).join('/'),
    text: a.textContent.trim().replace(/\s+/g, ' '),
    href: a.getAttribute('href'),
  }));
});

describe('Reference links that name an external standard', () => {
  it('send every WCAG link to w3.org, not a # placeholder', () => {
    const wcag = anchors.filter((a) => /^(WCAG 2\.2 Success Criterion|Web Content Accessibility Guidelines)/.test(a.text));
    expect(wcag.length).toBeGreaterThan(0);
    expect(wcag.filter((a) => !a.href.startsWith('https://www.w3.org/'))).toEqual([]);
  });

  it('send the Open Government Licence links to the National Archives', () => {
    const ogl = anchors.filter((a) => /^Open Government Licence/.test(a.text));
    expect(ogl.length).toBeGreaterThan(0);
    expect(ogl.filter((a) => !a.href.startsWith('https://www.nationalarchives.gov.uk/doc/open-government-licence/'))).toEqual([]);
  });
});
