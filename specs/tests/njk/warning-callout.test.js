import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswWarningCallout announces itself as important to screen readers', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params) {
    const html = env.renderString(
      '{% from "warning-callout/macro.njk" import nhswWarningCallout %}{{ nhswWarningCallout(params) }}',
      { params },
    );
    const heading = new JSDOM(html).window.document.querySelector('.nhsw-warning-callout__heading');
    return {
      heading,
      hidden: heading.querySelector('.nhsw-visually-hidden'),
      announced: heading.textContent.replace(/\s+/g, ' ').trim(),
    };
  }

  it('adds a visually hidden "Important:" prefix inside the heading when the heading text does not say so itself', () => {
    const { heading, hidden, announced } = render({ heading: 'School, nursery or work', text: 'x' });
    expect(heading.tagName).toBe('H3');
    expect(hidden.textContent).toBe('Important: ');
    expect(announced).toBe('! Important: School, nursery or work');
  });

  it('uses "Important" for the important variant too, not "Warning"', () => {
    const { hidden } = render({ heading: 'Getting access to Figma', classes: 'nhsw-warning-callout--important', text: 'x' });
    expect(hidden.textContent).toBe('Important: ');
  });

  it('keeps the icon hidden from assistive technology, so the hidden text is the only thing announced before the heading', () => {
    const { heading } = render({ heading: 'School, nursery or work', text: 'x' });
    expect(heading.querySelector('.nhsw-warning-callout__icon').getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    ['Important information'],
    ['important: check your appointment'],
    ['Warning callout'],
    ['A warning about rashes'],
  ])('adds no prefix when the heading already contains "important" or "warning": %s', (heading) => {
    const { hidden } = render({ heading, text: 'x' });
    expect(hidden).toBeNull();
  });

  it('looks at the visible text of headingHtml, ignoring its tags', () => {
    expect(render({ headingHtml: '<em>Chickenpox</em> and rashes', text: 'x' }).hidden.textContent).toBe('Important: ');
    expect(render({ headingHtml: '<strong>Important</strong> news', text: 'x' }).hidden).toBeNull();
  });

  it('headingPrefixText replaces the default prefix, and an empty string removes it', () => {
    expect(render({ heading: 'School, nursery or work', headingPrefixText: 'Safeguarding', text: 'x' }).hidden.textContent).toBe('Safeguarding: ');
    expect(render({ heading: 'School, nursery or work', headingPrefixText: '', text: 'x' }).hidden).toBeNull();
  });
});
