import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';
import { projectRoot, extractExamples, importLinesFor } from '../support/doc-code-samples.js';

const read = (rel) => fs.readFileSync(path.join(projectRoot, rel), 'utf8');
const page = read('preview/components/checkboxes.html');
const examples = new Map(extractExamples(page).map((e) => [e.id, e]));
const env = configure({ noCache: true });

const labels = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return [...el.querySelectorAll('.nhsw-checkboxes__label')].map((label) => label.textContent.trim());
};

describe('every checkbox shown in an example is also in its code', () => {
  it.each([...examples.keys()])('%s', (id) => {
    const { exampleHtml, htmlSample, njkSample } = examples.get(id);
    const shown = labels(exampleHtml);
    expect(shown.length).toBeGreaterThan(1);
    expect(labels(htmlSample), 'HTML tab').toEqual(shown);
    expect(labels(env.renderString(`${importLinesFor(page).join('\n')}\n${njkSample}`)), 'Nunjucks tab').toEqual(shown);
  });

  it('the contact examples offer Email, Phone and Text message, including the one opened in a new tab', () => {
    const contact = ['Email', 'Phone', 'Text message'];
    for (const id of ['cb-overview', 'cb-error', 'cb-conditional']) expect(labels(examples.get(id).htmlSample), id).toEqual(contact);
    for (const name of ['default', 'error', 'conditional']) expect(labels(read(`preview/examples/checkboxes-${name}.html`)), name).toEqual(contact);
  });
});
