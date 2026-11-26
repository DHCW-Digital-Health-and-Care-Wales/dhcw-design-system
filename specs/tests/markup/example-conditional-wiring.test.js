import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';
import { projectRoot, findDocPages, extractExamples, importLinesFor } from '../support/doc-code-samples.js';

const env = configure({ noCache: true });

const cases = [];
for (const relativePath of findDocPages()) {
  const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
  const imports = importLinesFor(text);
  for (const example of extractExamples(text)) {
    if (!example.htmlSample.includes('data-aria-controls')) continue;
    cases.push([`${relativePath.replace('preview/', '')}#${example.id}`, imports, example]);
  }
}

const brokenTargets = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  const ids = new Set([...el.querySelectorAll('[id]')].map((node) => node.id));
  return [...el.querySelectorAll('[data-aria-controls]')].map((node) => node.getAttribute('data-aria-controls')).filter((id) => !ids.has(id));
};

describe('every revealing option in a code example points at content in that example', () => {
  it('checks the checkbox and radio examples', () => {
    expect(cases.length).toBeGreaterThanOrEqual(2);
  });

  it.each(cases)('%s', (key, imports, example) => {
    expect(brokenTargets(example.exampleHtml), 'live example').toEqual([]);
    expect(brokenTargets(example.htmlSample), 'HTML tab').toEqual([]);
    expect(brokenTargets(env.renderString(`${imports.join('\n')}\n${example.njkSample}`)), 'Nunjucks tab').toEqual([]);
  });
});
