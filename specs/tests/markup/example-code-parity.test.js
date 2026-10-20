import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';
import { projectRoot, findDocPages, extractExamples, importLinesFor, canonicalHtml } from '../support/doc-code-samples.js';

// Every live example on a component page has a code window with an HTML tab and a
// Nunjucks tab. These tests check that what people copy is what they were shown:
//   1. the markup in the live example matches the HTML tab, and
//   2. the Nunjucks tab renders, through the real macros, to the same markup as the HTML tab.
// Ids, links, alt text and other values that only wire elements together or point at a
// destination are ignored (see doc-code-samples.js); structure, classes, roles, text and
// the remaining attributes must match.
//
// example-code-parity.known.json lists the examples that already differ. They are
// skipped, not hidden: a known example that starts matching fails until it is removed
// from the list, so the list can only shrink, and any new difference fails straight away.

const known = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'example-code-parity.known.json'), 'utf8'));
const knownExample = new Set(known.exampleDiffersFromHtmlSample);
const knownNunjucks = new Set(known.nunjucksDiffersFromHtmlSample);
const env = configure({ noCache: true });

const cases = [];
for (const relativePath of findDocPages()) {
  const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
  const imports = importLinesFor(text);
  for (const example of extractExamples(text)) {
    cases.push({ key: `${relativePath.replace('preview/', '')}#${example.id}`, imports, ...example });
  }
}

describe('the live example matches the HTML tab', () => {
  it.each(cases.map((c) => [c.key, c]))('%s', (key, c) => {
    const example = canonicalHtml(c.exampleHtml.replace(/\{\{[^}]*\}\}/g, '#'));
    const sample = canonicalHtml(c.htmlSample);
    if (knownExample.has(key)) {
      expect(example, `${key} now matches: remove it from exampleDiffersFromHtmlSample in example-code-parity.known.json`).not.toBe(sample);
    } else {
      expect(example, `${key}: the live example and the HTML tab have drifted apart`).toBe(sample);
    }
  });
});

describe('the Nunjucks tab renders to the same markup as the HTML tab', () => {
  it.each(cases.map((c) => [c.key, c]))('%s', (key, c) => {
    let rendered;
    try {
      rendered = env.renderString(`${c.imports.join('\n')}\n${c.njkSample}`);
    } catch (error) {
      throw new Error(`${key}: the Nunjucks tab does not render: ${error.message}`);
    }
    const output = canonicalHtml(rendered);
    const sample = canonicalHtml(c.htmlSample);
    if (knownNunjucks.has(key)) {
      expect(output, `${key} now matches: remove it from nunjucksDiffersFromHtmlSample in example-code-parity.known.json`).not.toBe(sample);
    } else {
      expect(output, `${key}: the Nunjucks tab and the HTML tab render different markup`).toBe(sample);
    }
  });
});
