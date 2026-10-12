import { describe, it, expect, beforeAll } from 'vitest';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswTabs count badge', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  it('wraps the label in nhsw-tabs__tab-text and renders no badge when count is omitted', () => {
    const html = env.renderString(
      '{% from "tabs/macro.njk" import nhswTabs %}{{ nhswTabs(data) }}',
      { data: { items: [{ label: 'Past day', text: 'Panel content' }] } },
    );
    expect(html).toMatch(/<span class="nhsw-tabs__tab-text">Past day<\/span>/);
    expect(html).not.toContain('nhsw-tag');
  });

  it('renders the count using the shared nhsw-tag component, not a one-off badge class', () => {
    const html = env.renderString(
      '{% from "tabs/macro.njk" import nhswTabs %}{{ nhswTabs(data) }}',
      { data: { items: [{ label: 'Past day', count: '112', text: 'Panel content' }] } },
    );
    expect(html).toMatch(/<span class="nhsw-tabs__tab-text">Past day<\/span> <strong class="nhsw-tag nhsw-tag--blue">112<\/strong>/);
  });
});
