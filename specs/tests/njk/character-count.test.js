import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe.each([
  ['nhswTextarea', 'textarea/macro.njk', 'textarea'],
  ['nhswInput', 'input/macro.njk', 'input'],
])('%s character count markup (the live announcements are added by nhsw-behaviours.js, as in NHS.UK)', (macro, file, tag) => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params) {
    const html = env.renderString(
      `{% from "${file}" import ${macro} %}{{ ${macro}(params) }}`,
      { params: { id: 'field', label: { text: 'Label' }, ...params } },
    );
    return new JSDOM(`<body>${html}</body>`).window.document;
  }

  it('renders the count as plain text with the "You have N characters remaining" wording', () => {
    const doc = render({ maxlength: 150 });
    expect(doc.getElementById('field-count').textContent).toBe('You have 150 characters remaining');
  });

  it('does not put aria-live on the server-rendered count, so there is no live region to change on page load', () => {
    const doc = render({ maxlength: 150 });
    expect(doc.querySelectorAll('[aria-live]')).toHaveLength(0);
  });

  it('links the count to the field with aria-describedby, after any hint', () => {
    const doc = render({ maxlength: 150, hint: { text: 'A hint' } });
    expect(doc.querySelector(tag).getAttribute('aria-describedby')).toBe('field-hint field-count');
  });

  it('wires the behaviour script to the count with data attributes', () => {
    const el = render({ maxlength: 150 }).querySelector(tag);
    expect(el.getAttribute('data-max-length')).toBe('150');
    expect(el.getAttribute('data-max-length-target')).toBe('field-count');
  });

  it('characterCountMessage overrides the initial text', () => {
    const doc = render({ maxlength: 150, characterCountMessage: 'You have 150 words remaining' });
    expect(doc.getElementById('field-count').textContent).toBe('You have 150 words remaining');
  });

  it('characterCount: false keeps maxlength but renders no count and no behaviour hooks', () => {
    const doc = render({ maxlength: 150, characterCount: false });
    const el = doc.querySelector(tag);
    expect(doc.getElementById('field-count')).toBeNull();
    expect(el.getAttribute('maxlength')).toBe('150');
    expect(el.hasAttribute('data-max-length')).toBe(false);
  });
});
