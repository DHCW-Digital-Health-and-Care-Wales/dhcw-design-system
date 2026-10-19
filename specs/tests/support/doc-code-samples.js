import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

export const projectRoot = path.resolve(import.meta.dirname, '../../..');

const DOC_DIRS = ['actions', 'callouts', 'components', 'content', 'forms', 'get-started', 'site'];

export function findDocPages() {
  const files = [];
  for (const dir of DOC_DIRS) {
    const full = path.join(projectRoot, 'preview', dir);
    if (!fs.existsSync(full)) continue;
    for (const entry of fs.readdirSync(full)) {
      if (entry.endsWith('.html') && entry !== 'index.html') files.push(['preview', dir, entry].join('/'));
    }
  }
  return files.sort();
}

export function stripRaw(text) {
  return text.replace(/\{%-?\s*raw\s*-?%\}/g, '').replace(/\{%-?\s*endraw\s*-?%\}/g, '');
}

export function unescapeHtml(text) {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// Returns [{ id, exampleHtml, htmlSample, njkSample }] for every live example on a docs page.
export function extractExamples(text) {
  const examples = new Map();
  const bodyRe = /\{%\s*capture example_body\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}\s*\{%\s*include example-preview\.html[^%]*?\bid="([^"]+)"[^%]*%\}/g;
  let m;
  while ((m = bodyRe.exec(text))) examples.set(m[2], { id: m[2], exampleHtml: stripRaw(m[1]) });

  const sampleRe = /\{%\s*capture html_sample\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\}(?:\s*\{%\s*capture njk_sample\s*%\}([\s\S]*?)\{%\s*endcapture\s*%\})?\s*\{%\s*include code-viewer\.html[^%]*?\bid="([^"]+)"[^%]*%\}/g;
  while ((m = sampleRe.exec(text))) {
    const entry = examples.get(m[3]);
    if (!entry) continue;
    entry.htmlSample = unescapeHtml(stripRaw(m[1]));
    entry.njkSample = m[2] ? unescapeHtml(stripRaw(m[2])) : '';
  }
  return [...examples.values()].filter((e) => e.htmlSample !== undefined);
}

export function importLinesFor(text) {
  return [...new Set((text.match(/\{%\s*from\s+"[^"]+"\s+import\s+[^%]+%\}/g) || []).map((line) => line.trim()))];
}

// Attributes whose value only wires one element to another or points at a real
// destination. They legitimately differ between the live example (unique ids,
// "#" links) and the sample you copy, so they are left out of the comparison.
const IGNORED_ATTRS = new Set([
  'id', 'for', 'name', 'href', 'src', 'alt', 'target', 'rel', 'value', 'maxlength',
  'aria-describedby', 'aria-labelledby', 'aria-controls', 'aria-owns',
  'data-max-length-target', 'data-module', 'tabindex',
]);

function canonical(node) {
  if (node.nodeType === 3) {
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    return text ? JSON.stringify(text) : '';
  }
  if (node.nodeType !== 1) return '';
  const attrs = [...node.attributes]
    .filter((a) => !IGNORED_ATTRS.has(a.name))
    .map((a) => `${a.name}="${a.name === 'class' ? [...node.classList].sort().join(' ') : a.value.replace(/\s+/g, ' ').trim()}"`)
    .sort()
    .join(' ');
  const children = [...node.childNodes].map(canonical).filter(Boolean).join(' ');
  return `<${node.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>${children}</>`;
}

export function canonicalHtml(html) {
  const dom = new JSDOM(`<body>${html}</body>`);
  return [...dom.window.document.body.childNodes].map(canonical).filter(Boolean).join('\n');
}
