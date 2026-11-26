import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { configure } from '../../../src/nunjucks.config.js';
import { projectRoot, findDocPages, extractExamples, importLinesFor } from '../support/doc-code-samples.js';

const env = configure({ noCache: true });
const WIRING = ['id', 'for', 'name', 'aria-controls', 'aria-describedby', 'aria-labelledby', 'data-aria-controls'];

const cases = findDocPages().flatMap((relativePath) => {
  const text = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
  return extractExamples(text).map((example) => [`${relativePath.replace('preview/', '')}#${example.id}`, importLinesFor(text), example.njkSample]);
});

const parse = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
};

describe('code copied from a Nunjucks tab is wired up', () => {
  it.each(cases)('%s renders no empty or half-made ids', (key, imports, sample) => {
    const broken = [...parse(env.renderString(`${imports.join('\n')}\n${sample}`)).querySelectorAll('*')].flatMap((node) => WIRING
      .filter((name) => node.hasAttribute(name) && (node.getAttribute(name).trim() === '' || /undefined|(^|\s)-/.test(node.getAttribute(name))))
      .map((name) => `${node.tagName.toLowerCase()} ${name}="${node.getAttribute(name)}"`));
    expect(broken).toEqual([]);
  });
});

describe('an expander without an id still opens', () => {
  const el = parse(env.renderString('{% from "expander/macro.njk" import nhswExpander %}{{ nhswExpander({ linkText: "Digital consent", text: "More" }) }}'));
  const button = el.querySelector('.nhsw-expander__button');

  it('makes an id from the link text and points the button at it', () => {
    expect(button.getAttribute('aria-controls')).toBe('expander-digital-consent');
    expect(el.querySelector('.nhsw-expander__content').id).toBe('expander-digital-consent');
  });
});
