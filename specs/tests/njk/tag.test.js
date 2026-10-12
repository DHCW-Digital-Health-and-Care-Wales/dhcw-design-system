import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswTag colour, border and id params (same options as the NHS.UK tag)', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params) {
    const html = env.renderString(
      '{% from "tag/macro.njk" import nhswTag %}{{ nhswTag(params) }}',
      { params },
    );
    return new JSDOM(`<body>${html}</body>`).window.document.querySelector('strong');
  }

  it('renders a plain <strong class="nhsw-tag"> with no new params, exactly as before', () => {
    const tag = render({ text: 'New', classes: 'nhsw-tag--green' });
    expect(tag.tagName).toBe('STRONG');
    expect(tag.className).toBe('nhsw-tag nhsw-tag--green');
    expect(tag.hasAttribute('id')).toBe(false);
    expect(tag.textContent).toBe('New');
  });

  it.each([
    'white', 'grey', 'green', 'aqua-green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'dhcw-blue',
  ])('colour: "%s" adds the matching modifier class', (colour) => {
    expect(render({ text: 'x', colour }).className).toBe(`nhsw-tag nhsw-tag--${colour}`);
  });

  it('ignores an unknown colour', () => {
    expect(render({ text: 'x', colour: 'magenta' }).className).toBe('nhsw-tag');
  });

  it('ignores colour when classes already contains a colour modifier, so the two never fight', () => {
    expect(render({ text: 'x', colour: 'red', classes: 'nhsw-tag--green' }).className).toBe('nhsw-tag nhsw-tag--green');
    expect(render({ text: 'x', colour: 'red', classes: 'nhsw-tag--dhcw-blue' }).className).toBe('nhsw-tag nhsw-tag--dhcw-blue');
  });

  it('still adds other classes alongside colour', () => {
    expect(render({ text: 'x', colour: 'grey', classes: 'extra' }).className).toBe('nhsw-tag nhsw-tag--grey extra');
  });

  it('colour: false adds no-colour', () => {
    expect(render({ text: 'x', colour: false }).className).toBe('nhsw-tag nhsw-tag--no-colour');
  });

  it('border: false adds no-border, and can be combined with a colour', () => {
    expect(render({ text: 'x', border: false }).className).toBe('nhsw-tag nhsw-tag--no-border');
    expect(render({ text: 'x', colour: 'blue', border: false }).className).toBe('nhsw-tag nhsw-tag--blue nhsw-tag--no-border');
    expect(render({ text: 'x', colour: false, border: false }).className).toBe('nhsw-tag nhsw-tag--no-colour nhsw-tag--no-border');
  });

  it('does not repeat a modifier that classes already supplies', () => {
    expect(render({ text: 'x', colour: false, classes: 'nhsw-tag--no-colour' }).className).toBe('nhsw-tag nhsw-tag--no-colour');
    expect(render({ text: 'x', border: false, classes: 'nhsw-tag--no-border' }).className).toBe('nhsw-tag nhsw-tag--no-border');
  });

  it('id is rendered on the tag, before any other attributes', () => {
    const tag = render({ text: 'Urgent', id: 'urgent-tag', attributes: { 'data-x': 'y' } });
    expect(tag.id).toBe('urgent-tag');
    expect(tag.getAttribute('data-x')).toBe('y');
  });

  it('nhswTagGroup passes the same options through to each of its two tags', () => {
    const html = env.renderString(
      '{% from "tag/macro.njk" import nhswTagGroup %}{{ nhswTagGroup(params) }}',
      {
        params: {
          category: { text: 'Flu', colour: 'white' },
          status: { text: 'Due vaccination', colour: 'green', id: 'flu-status', border: false },
        },
      },
    );
    const tags = [...new JSDOM(`<body>${html}</body>`).window.document.querySelectorAll('strong')];
    expect(tags.map((t) => t.className)).toEqual(['nhsw-tag nhsw-tag--white', 'nhsw-tag nhsw-tag--green nhsw-tag--no-border']);
    expect(tags[1].id).toBe('flu-status');
  });
});
