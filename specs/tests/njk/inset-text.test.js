import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswInsetText tells screen reader users the content is set apart (WCAG 2.2 SC 1.3.1), as the NHS.UK inset text does', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params) {
    const html = env.renderString(
      '{% from "inset-text/macro.njk" import nhswInsetText %}{{ nhswInsetText(params) }}',
      { params },
    );
    return new JSDOM(`<body>${html}</body>`).window.document.querySelector('.nhsw-inset-text');
  }

  it('starts with visually hidden "Information: " before the content, so it is read as part of the text', () => {
    const box = render({ text: 'It can take up to 8 weeks.' });
    const first = box.firstElementChild;
    expect(first.classList.contains('nhsw-visually-hidden')).toBe(true);
    expect(first.textContent).toBe('Information: ');
    expect(box.textContent.replace(/\s+/g, ' ').trim()).toBe('Information: It can take up to 8 weeks.');
  });

  it('keeps the hidden text first when html is supplied, including a heading', () => {
    const box = render({ html: '<h3 class="nhsw-h3">Note</h3><p class="nhsw-body">Body</p>' });
    expect(box.firstElementChild.textContent).toBe('Information: ');
    expect([...box.children].map((c) => c.tagName)).toEqual(['SPAN', 'H3', 'P']);
  });

  it('no longer relies on role="note", which screen readers do not reliably announce', () => {
    expect(render({ text: 'x' }).hasAttribute('role')).toBe(false);
  });

  it('visuallyHiddenText changes the wording, and an empty string omits it', () => {
    expect(render({ text: 'x', visuallyHiddenText: 'Note' }).firstElementChild.textContent).toBe('Note: ');
    expect(render({ text: 'x', visuallyHiddenText: '' }).querySelector('.nhsw-visually-hidden')).toBeNull();
  });

  it('keeps the classes and attributes, so the colour variants still work', () => {
    const box = render({ text: 'x', classes: 'nhsw-inset-text--blue', attributes: { id: 'inset' } });
    expect(box.className).toBe('nhsw-inset-text nhsw-inset-text--blue');
    expect(box.id).toBe('inset');
  });
});
