import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswTagGroup announces a two-part tag as one phrase to screen readers', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  const base = {
    category: { text: 'Flu', classes: 'nhsw-tag--white' },
    status: { text: 'Due vaccination', classes: 'nhsw-tag--green' },
  };

  function render(params = base) {
    const html = env.renderString(
      '{% from "tag/macro.njk" import nhswTagGroup %}{{ nhswTagGroup(params) }}',
      { params },
    );
    const group = new JSDOM(`<body>${html}</body>`).window.document.querySelector('.nhsw-tag-group');
    return { group, html, spoken: group.textContent };
  }

  it('is read as "Tag: Flu: Due vaccination", saying it is a tag and linking the two parts', () => {
    expect(render().spoken).toBe('Tag: Flu: Due vaccination');
  });

  it('keeps the two visible parts as separate tags with their own colours', () => {
    const tags = [...render().group.querySelectorAll('strong.nhsw-tag')];
    expect(tags.map((t) => t.textContent)).toEqual(['Flu', 'Due vaccination']);
    expect(tags[0].classList.contains('nhsw-tag--white')).toBe(true);
    expect(tags[1].classList.contains('nhsw-tag--green')).toBe(true);
  });

  it('puts the hidden text in visually hidden spans: "Tag: " first and ": " between the parts', () => {
    const hidden = [...render().group.querySelectorAll('.nhsw-visually-hidden')].map((h) => h.textContent);
    expect(hidden).toEqual(['Tag: ', ': ']);
    const kinds = [...render().group.children].map((c) => (c.classList.contains('nhsw-visually-hidden') ? 'hidden' : 'tag'));
    expect(kinds).toEqual(['hidden', 'tag', 'hidden', 'tag']);
  });

  it('puts no whitespace between the parts, so the inline-flex group renders exactly as before', () => {
    expect(render().html).not.toMatch(/>\s+</);
  });

  it('prefixText replaces "Tag", and an empty string removes it while keeping the link between the parts', () => {
    expect(render({ ...base, prefixText: 'Vaccination' }).spoken).toBe('Vaccination: Flu: Due vaccination');
    expect(render({ ...base, prefixText: '' }).spoken).toBe('Flu: Due vaccination');
  });

  it('accepts html for either part, and classes and attributes for the group', () => {
    const { group, spoken } = render({
      category: { html: 'Flu<br>2025', classes: 'nhsw-tag--white' },
      status: { text: 'Due', classes: 'nhsw-tag--green' },
      classes: 'extra',
      attributes: { 'data-x': 'y' },
    });
    expect(group.querySelector('br')).not.toBeNull();
    expect(group.classList.contains('extra')).toBe(true);
    expect(group.getAttribute('data-x')).toBe('y');
    expect(spoken).toBe('Tag: Flu2025: Due');
  });
});
