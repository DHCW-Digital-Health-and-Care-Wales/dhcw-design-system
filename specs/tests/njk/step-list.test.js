import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswStepList and nhswKbd', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  function render(component, macro, params) {
    const html = env.renderString(
      `{% from "${component}/macro.njk" import ${macro} %}{{ ${macro}(params) }}`,
      { params },
    );
    return new JSDOM(`<body>${html}</body>`).window.document.body.firstElementChild;
  }

  it('renders an ordered list that keeps its list role', () => {
    const list = render('step-list', 'nhswStepList', { items: [{ text: 'One' }, { text: 'Two' }] });
    expect(list.tagName).toBe('OL');
    expect(list.getAttribute('role')).toBe('list');
    expect([...list.children].map((li) => li.className)).toEqual(['nhsw-step-list__item', 'nhsw-step-list__item']);
    expect([...list.children].map((li) => li.textContent)).toEqual(['One', 'Two']);
  });

  it('escapes text and renders html as markup', () => {
    const list = render('step-list', 'nhswStepList', { items: [{ text: '<b>no</b>' }, { html: '<b>yes</b>', text: 'ignored' }] });
    expect(list.children[0].querySelector('b')).toBeNull();
    expect(list.children[1].querySelector('b').textContent).toBe('yes');
    expect(list.children[1].textContent).toBe('yes');
  });

  it('takes extra classes and attributes', () => {
    const list = render('step-list', 'nhswStepList', { items: [], classes: 'nhsw-step-list--tight', attributes: { id: 'steps' } });
    expect(list.className).toBe('nhsw-step-list nhsw-step-list--tight');
    expect(list.id).toBe('steps');
  });

  it('renders a key as a kbd element', () => {
    const key = render('kbd', 'nhswKbd', { text: 'Enter' });
    expect(key.tagName).toBe('KBD');
    expect(key.className).toBe('nhsw-kbd');
    expect(key.textContent).toBe('Enter');
  });
});
