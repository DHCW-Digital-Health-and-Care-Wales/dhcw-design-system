import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { projectRoot, extractExamples, canonicalHtml } from '../support/doc-code-samples.js';

const read = (rel) => fs.readFileSync(path.join(projectRoot, rel), 'utf8');

describe('the numbers in a table example opened in a new tab', () => {
  const live = extractExamples(read('preview/components/table.html')).find((example) => example.id === 'tbl-numeric');
  const newTab = read('preview/examples/table-numeric.html').replace(/^---[\s\S]*?\n---\r?\n/, '');

  it('shows the same table as the component page', () => {
    expect(canonicalHtml(newTab)).toBe(canonicalHtml(live.exampleHtml));
  });
});
