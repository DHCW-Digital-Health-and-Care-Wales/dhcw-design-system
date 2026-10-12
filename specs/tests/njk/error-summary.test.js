import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswErrorSummary opts in to the script that moves focus to it (SCEN-ERROR-003)', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params = {}) {
    const html = env.renderString(
      '{% from "error-summary/macro.njk" import nhswErrorSummary %}{{ nhswErrorSummary(params) }}',
      { params: { errorList: [{ text: 'Enter your name', href: '#name' }], ...params } },
    );
    return new JSDOM(`<body>${html}</body>`).window.document.querySelector('.nhsw-error-summary');
  }

  it('renders data-module="nhsw-error-summary", so nhsw-behaviours.js moves focus to it', () => {
    expect(render().getAttribute('data-module')).toBe('nhsw-error-summary');
  });

  it('is still focusable and announced: tabindex="-1", role="alert" and labelled by its title', () => {
    const summary = render();
    expect(summary.getAttribute('tabindex')).toBe('-1');
    expect(summary.getAttribute('role')).toBe('alert');
    expect(summary.getAttribute('aria-labelledby')).toBe('error-summary-title');
  });

  it('disableAutoFocus adds data-disable-auto-focus="true"', () => {
    expect(render({ disableAutoFocus: true }).getAttribute('data-disable-auto-focus')).toBe('true');
    expect(render().hasAttribute('data-disable-auto-focus')).toBe(false);
  });

  it('keeps the links in the order they are given', () => {
    const summary = render({ errorList: [{ text: 'One', href: '#a' }, { text: 'Two', href: '#b' }, { text: 'Three', href: '#c' }] });
    expect([...summary.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['#a', '#b', '#c']);
  });
});
