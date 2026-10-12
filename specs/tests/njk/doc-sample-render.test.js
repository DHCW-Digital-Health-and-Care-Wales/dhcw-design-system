import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';

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

function extractNjkSamples(text) {
  const re = /\{%\s*capture html_sample\s*%\}[\s\S]*?\{%\s*endcapture\s*%\}(?:\s*\{%\s*capture njk_sample\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\})?\s*\{%\s*include code-viewer\.html[^%]*id="([^"]+)"[^%]*%\}/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    if (m[1] && m[1].trim()) out.push({ id: m[2], njk: m[1] });
  }
  return out;
}

function unescapeHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

function stripRaw(text) {
  return text.replace(/^\s*\{%\s*raw\s*%\}/, '').replace(/\{%\s*endraw\s*%\}\s*$/, '');
}

describe('every documented njk_sample renders through the real macro environment without error', () => {
  const env = configure({ noCache: true });
  const pages = findDocPages();

  for (const relativePath of pages) {
    const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    const samples = extractNjkSamples(text);
    if (samples.length === 0) continue;

    const importLines = [...new Set(
      (text.match(/\{%\s*from\s+"[^"]+"\s+import\s+[^%]+%\}/g) || []).map((line) => line.trim()),
    )];

    describe(relativePath, () => {
      it.each(samples.map(({ id, njk }) => [id, njk]))('id="%s"', (id, njk) => {
        const source = importLines.join('\n') + '\n' + unescapeHtml(stripRaw(njk));

        expect(() => env.renderString(source)).not.toThrow();
        const output = env.renderString(source);
        expect(output.trim(), `njk_sample for id="${id}" rendered no output`).not.toBe('');
      });
    });
  }
});
