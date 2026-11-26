import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { projectRoot, findDocPages, stripRaw } from '../support/doc-code-samples.js';

const read = (rel) => fs.readFileSync(path.join(projectRoot, rel), 'utf8');
const DIFFERENT_ON_PURPOSE = new Set(['components/skip-link.html#sl-overview']);

const visibleText = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[^}]*\}\}/g, '#');
  el.querySelectorAll('script, style, .nhsw-visually-hidden').forEach((node) => node.remove());
  return el.textContent.replace(/\s+/g, '');
};

const cases = [];
for (const page of findDocPages()) {
  const re = /\{%\s*capture example_body\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}\s*\{%\s*include example-preview\.html([^%]*)%\}/g;
  const text = read(page);
  let match;
  while ((match = re.exec(text))) {
    const id = match[2].match(/\bid="([^"]+)"/)?.[1];
    const url = match[2].match(/open_url="([^"]+)"/)?.[1];
    const key = `${page.replace('preview/', '')}#${id}`;
    if (url && !DIFFERENT_ON_PURPOSE.has(key)) cases.push([key, url, stripRaw(match[1])]);
  }
}

describe('an example opened in a new tab says the same as its preview', () => {
  it.each(cases)('%s opens %s', (key, url, body) => {
    const newTab = read(`preview${url}`).replace(/^---[\s\S]*?\n---\r?\n/, '');
    expect(visibleText(newTab)).toBe(visibleText(body));
  });

  it('warning text on dark backgrounds opens on a dark background, in its reverse colours', () => {
    const [, url] = cases.find(([key]) => key === 'components/warning-callout.html#wc-text-dark');
    const el = document.createElement('div');
    el.innerHTML = read(`preview${url}`).replace(/^---[\s\S]*?\n---\r?\n/, '');
    expect(el.querySelector('.nhsw-example-preview__body--dark .nhsw-warning-text--reverse')).not.toBeNull();
  });
});
