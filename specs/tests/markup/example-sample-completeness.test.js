import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../../..');

function findDocPages() {
  const dirs = ['actions', 'callouts', 'components', 'content', 'forms', 'get-started', 'site'];
  const files = [];
  for (const dir of dirs) {
    const full = path.join(projectRoot, 'preview', dir);
    if (!fs.existsSync(full)) continue;
    for (const entry of fs.readdirSync(full)) {
      if (entry.endsWith('.html') && entry !== 'index.html') {
        files.push(['preview', dir, entry].join('/'));
      }
    }
  }
  return files.sort();
}

function extractExamplePreviews(text) {
  const re = /\{%\s*capture example_body\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}\s*\{%\s*include example-preview\.html[^%]*id="([^"]+)"[^%]*%\}/g;
  const ids = [];
  let m;
  while ((m = re.exec(text))) {
    ids.push(m[2]);
  }
  return ids;
}

function extractCodeSamples(text) {
  const re = /\{%\s*capture html_sample\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}(?:\s*\{%\s*capture njk_sample\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\})?\s*\{%\s*include code-viewer\.html[^%]*id="([^"]+)"[^%]*%\}/g;
  const samples = new Map();
  const ids = [];
  let m;
  while ((m = re.exec(text))) {
    const id = m[3];
    ids.push(id);
    samples.set(id, { html: m[1] || '', njk: m[2] || '' });
  }
  return { samples, ids };
}

describe('every example-preview id has a unique, matching code sample with both HTML and Nunjucks', () => {
  const pages = findDocPages();

  it.each(pages)('%s', (relativePath) => {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    const previewIds = extractExamplePreviews(text);
    const { samples, ids: codeViewerIds } = extractCodeSamples(text);

    const duplicatePreviewIds = previewIds.filter((id, i) => previewIds.indexOf(id) !== i);
    expect(duplicatePreviewIds, 'duplicate example-preview id on this page').toEqual([]);

    const duplicateCodeViewerIds = codeViewerIds.filter((id, i) => codeViewerIds.indexOf(id) !== i);
    expect(duplicateCodeViewerIds, 'duplicate code-viewer id on this page').toEqual([]);

    for (const id of previewIds) {
      const sample = samples.get(id);
      expect(sample, `id="${id}" has a live preview but no code-viewer sample`).toBeTruthy();
      expect(sample.html.trim(), `id="${id}" html_sample is empty`).not.toBe('');
      expect(sample.njk.trim(), `id="${id}" njk_sample is missing or empty`).not.toBe('');
    }
  });
});
