import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('page template headers line up with the page content using the fluid containers', () => {
  it.each(['default', 'full-width', 'one-half', 'two-thirds', 'one-third', 'customised-content'])(
    'the %s page template example pairs the fluid header with the fluid container',
    (name) => {
      const html = read(`preview/examples/page-template-${name}.html`);
      const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
      const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
      expect(header).toContain('class="nhsw-site-header__container nhsw-site-header__container--fluid"');
      expect(main).toContain('<div class="nhsw-fluid-container">');
      expect(html).not.toContain('nhsw-width-container');
    },
  );

  it('the code samples on the page templates page match the examples', () => {
    const html = read('preview/patterns/page-templates.html');
    expect(html).not.toContain('nhsw-width-container');
    expect(html).not.toMatch(/class="nhsw-site-header__container"/);
    expect(html).not.toContain('--contained');
    expect(html).toContain('&lt;div class="nhsw-site-header__container nhsw-site-header__container--fluid"&gt;');
  });
});
