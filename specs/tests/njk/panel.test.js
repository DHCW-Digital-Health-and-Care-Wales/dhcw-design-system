import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswPanel title sizes', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(params = {}) {
    const html = env.renderString(
      '{% from "panel/macro.njk" import nhswPanel %}{{ nhswPanel(params) }}',
      { params: { titleText: 'Application complete', text: 'Your reference number', ...params } },
    );
    return new JSDOM(`<body>${html}</body>`).window.document;
  }

  it('is Heading XL by default: no size modifier on the title, and the tick icon is shown', () => {
    const doc = render();
    const title = doc.querySelector('h1');
    expect(title.className).toBe('nhsw-panel__title');
    expect(doc.querySelector('.nhsw-panel__icon')).not.toBeNull();
  });

  it('titleSize "xl" is the same as the default', () => {
    expect(render({ titleSize: 'xl' }).querySelector('h1').className).toBe('nhsw-panel__title');
  });

  it('titleSize "l" is Heading L, and omits the icon as before', () => {
    const doc = render({ titleSize: 'l' });
    expect(doc.querySelector('h1').className).toBe('nhsw-panel__title nhsw-panel__title--l');
    expect(doc.querySelector('.nhsw-panel__icon')).toBeNull();
  });

  it('titleSize "m" is Heading M, and keeps the icon', () => {
    const doc = render({ titleSize: 'm' });
    expect(doc.querySelector('h1').className).toBe('nhsw-panel__title nhsw-panel__title--m');
    expect(doc.querySelector('.nhsw-panel__icon')).not.toBeNull();
  });

  it('icon can still be set explicitly for any size', () => {
    expect(render({ titleSize: 'l', icon: true }).querySelector('.nhsw-panel__icon')).not.toBeNull();
    expect(render({ titleSize: 'xl', icon: false }).querySelector('.nhsw-panel__icon')).toBeNull();
  });

  it('the title stays an h1, and an unknown size falls back to the default', () => {
    const title = render({ titleSize: 'xxl' }).querySelector('h1');
    expect(title.tagName).toBe('H1');
    expect(title.className).toBe('nhsw-panel__title');
  });
});
