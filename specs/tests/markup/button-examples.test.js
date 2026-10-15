import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const examples = path.join(root, 'preview/examples');

const buttonExamples = fs
  .readdirSync(examples)
  .filter((f) => /^button-.*\.html$/.test(f))
  .map((f) => `preview/examples/${f}`);

describe('button example pages and the Buttons docs page rely on the default width, not the inline variant', () => {
  it('finds the button examples', () => {
    expect(buttonExamples.length).toBeGreaterThanOrEqual(8);
  });

  it.each([...buttonExamples, 'preview/components/buttons.html'])('%s does not use nhsw-button--inline', (rel) => {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    expect(text).not.toContain('nhsw-button--inline');
  });

  it('every button example still contains a button', () => {
    for (const rel of buttonExamples) {
      expect(fs.readFileSync(path.join(root, rel), 'utf8'), rel).toMatch(/class="nhsw-button /);
    }
  });
});
