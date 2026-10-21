import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('documentation page spacing follows the design screenshots', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "layouts/docs-page";`);
  });

  it('leaves 16px under the page title, so "Updated in" sits close beneath it', () => {
    expect(block(css, '\\.nhsw-layout__content--docs \\.nhsw-h1')).toMatch(/margin-bottom:\s*16px/);
  });

  it('puts 32px above and below H2 and H3 headings', () => {
    for (const heading of ['nhsw-h2', 'nhsw-h3']) {
      const rule = block(css, `\\.nhsw-layout__content--docs \\.${heading}`);
      expect(rule, heading).toMatch(/margin-top:\s*32px/);
      expect(rule, heading).toMatch(/margin-bottom:\s*32px/);
    }
  });

  it('puts 24px above and 28px below H4 headings', () => {
    const rule = block(css, '\\.nhsw-layout__content--docs \\.nhsw-h4');
    expect(rule).toMatch(/margin-top:\s*24px/);
    expect(rule).toMatch(/margin-bottom:\s*28px/);
  });

  it('leaves 60px under the intro paragraph, and 40px above it after "Updated in"', () => {
    expect(block(css, '\\.nhsw-layout__content--docs \\.nhsw-lede-text')).toMatch(/margin-bottom:\s*60px/);
    expect(block(css, '\\.nhsw-layout__content--docs \\.nhsw-body--secondary \\+ \\.nhsw-lede-text')).toMatch(/margin-top:\s*40px/);
  });

  it('the roomy variant used by the Typography page has 40px around H2, 40px above H3 and 80px under the intro', () => {
    const h2 = block(css, '\\.nhsw-layout__content--docs\\.nhsw-layout__content--roomy \\.nhsw-h2');
    expect(h2).toMatch(/margin-top:\s*40px/);
    expect(h2).toMatch(/margin-bottom:\s*40px/);
    expect(block(css, '\\.nhsw-layout__content--docs\\.nhsw-layout__content--roomy \\.nhsw-h3')).toMatch(/margin-top:\s*40px/);
    expect(block(css, '\\.nhsw-layout__content--docs\\.nhsw-layout__content--roomy \\.nhsw-lede-text')).toMatch(/margin-bottom:\s*80px/);
  });

  it('is only applied to the documentation layout, not to component styles', () => {
    expect(css).not.toMatch(/(^|\n)\.nhsw-h2\s*\{/);
    expect(css).not.toMatch(/(^|\n)\.nhsw-h3\s*\{/);
  });
});

describe('the intro paragraph (caption XL)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/typography";`);
  });

  it('is 22px on mobile and 26px from the tablet breakpoint, with a 38px line height', () => {
    expect(block(css, '\\.nhsw-caption-xl')).toMatch(/font-size:\s*1\.375rem/);
    expect(css).toMatch(/@media \(min-width: 40\.0625em\)\s*\{[^@]*?\.nhsw-caption-xl\s*\{[^}]*font-size:\s*1\.625rem[^}]*line-height:\s*2\.375rem/);
  });
});

describe('heading-size specimens leave 40px above and below', () => {
  it('has the same margin at every breakpoint', () => {
    const css = compileProbe(`@use "components/content/type-specimen";`);
    const rule = block(css, '\\.nhsw-type-specimen');
    expect(rule).toMatch(/margin:\s*40px 0 40px/);
    expect(css).not.toMatch(/@media[^{]*\{\s*\.nhsw-type-specimen\s*\{[^}]*margin-bottom/);
  });
});

describe('documentation layout wiring', () => {
  it('the side-nav layout adds the docs spacing class, and a page can ask for the roomy variant', () => {
    const layout = read('preview/_layouts/simple.html');
    expect(layout).toContain('nhsw-layout__content nhsw-layout__content--docs');
    expect(layout).toContain('{% if page.docs_spacing %} nhsw-layout__content--{{ page.docs_spacing }}{% endif %}');
  });

  it('only the Typography page uses the roomy variant', () => {
    expect(read('preview/styles/typography.html')).toMatch(/^docs_spacing: roomy$/m);
    for (const page of ['styles/colours', 'styles/icons', 'styles/layout', 'patterns/page-templates']) {
      expect(read(`preview/${page}.html`), page).not.toContain('docs_spacing');
    }
  });

  it('component pages keep their own heading spacing', () => {
    expect(read('preview/_layouts/component.html')).not.toContain('nhsw-layout__content--docs');
  });
});

describe('documentation pages with a side navigation', () => {
  it('start level with the first side navigation link: no top padding on the content', () => {
    const css = compileProbe('@use "layouts/docs-page";');
    expect(block(css, '\\.nhsw-layout__content\\.nhsw-layout__content--docs')).toMatch(/padding-top:\s*0/);
  });
});

describe('the Page templates page sits under Styles', () => {
  it('highlights the Styles tab, and its breadcrumb goes back to Styles', () => {
    expect(read('preview/_includes/primary-nav.html')).toMatch(/page\.url == "\/patterns\/page-templates\.html" %\}\{% assign nav_active = "styles"/);
    const page = read('preview/patterns/page-templates.html');
    expect(page).toContain('breadcrumb_parent_title: Styles');
    expect(page).toContain('breadcrumb_parent_url: /styles.html');
  });
});

describe('a footer example fills its preview', () => {
  const css = compileProbe('@use "components/content/example-preview";');

  it('has no padding around the footer, and the footer has no top margin', () => {
    expect(block(css, '\\.nhsw-example-preview__body:has\\(> \\.nhsw-site-footer:only-child\\)')).toMatch(/padding:\s*0/);
    expect(block(css, '\\.nhsw-example-preview__body:has\\(> \\.nhsw-site-footer:only-child\\) > \\.nhsw-site-footer')).toMatch(/margin-top:\s*0/);
  });
});

describe('links in page text use the NHSW link styling', () => {
  for (const page of ['preview/components/radios.html', 'preview/components/skip-link.html', 'preview/privacy-policy.html']) {
    it(`${page} has no plain links`, () => {
      expect(read(page)).not.toMatch(/<a href=/);
    });
  }
});

describe('template examples keep the footer at the bottom of the page', () => {
  const css = compileProbe('@use "layouts/docs-page";');

  it('makes the page a full-height column where the main content takes the spare space', () => {
    const page = block(css, '\.nhsw-template-page');
    expect(page).toMatch(/display:\s*flex/);
    expect(page).toMatch(/flex-direction:\s*column/);
    expect(page).toMatch(/min-height:\s*100vh/);
    expect(block(css, '\.nhsw-template-page > \.nhsw-main-wrapper')).toMatch(/flex:\s*1 0 auto/);
  });

  it('is applied to the template layout', () => {
    expect(read('preview/_layouts/template.html')).toContain('<body class="nhsw-template-page">');
  });
});

describe('the Styles pages use lede text for their intro paragraph', () => {
  for (const page of ['patterns/page-templates', 'styles/branding', 'styles/colours', 'styles/icons', 'styles/layout', 'styles/typography', 'styles/wcag-guidance']) {
    it(`${page} uses nhsw-lede-text, not nhsw-caption-xl`, () => {
      const html = read(`preview/${page}.html`);
      expect(html).toContain('<p class="nhsw-lede-text">');
      expect(html).not.toContain('<p class="nhsw-caption-xl">');
    });
  }
});

describe('page template examples do not link away from the example', () => {
  for (const file of fs.readdirSync(path.join(root, 'preview/examples')).filter((f) => f.startsWith('page-template-'))) {
    it(`${file} has no links to the design system`, () => {
      expect(read(`preview/examples/${file}`)).not.toMatch(/<a [^>]*href="\/[^"]*"/);
    });
  }
});
