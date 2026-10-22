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

describe('inline code references use the nhsw-inline-code class', () => {
  const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return e.name.startsWith('_site') || e.name === 'dist' ? [] : walk(rel);
    return rel.endsWith('.html') ? [rel] : [];
  });

  it('is red', () => {
    const css = compileProbe('@use "components/content/typography";');
    expect(block(css, '\\.nhsw-inline-code')).toMatch(/color:\s*#d4351c/);
  });

  it('no page colours a code element with an inline style, or leaves one uncoloured on the Header page', () => {
    for (const file of walk('preview')) {
      expect(read(file), file).not.toMatch(/<code style=/);
    }
    expect(read('preview/components/header.html')).not.toMatch(/<code>/);
  });
});

describe('Buttons page wording and the Breadcrumbs page address', () => {
  const buttons = () => read('preview/components/buttons.html');

  it('uses meaningful button text in the examples', () => {
    for (const file of [buttons(), read('preview/examples/button-exceptional.html'), read('preview/examples/button-grouping.html')]) {
      expect(file).not.toContain('Exception desktop');
      expect(file).not.toContain('Secondary-white desktop');
    }
    expect(buttons()).toContain('Override process');
    expect(read('preview/examples/button-grouping.html')).toContain('Save and come back later');
  });

  it('has a comma and lower case "you" after setting the double click attribute to true', () => {
    expect(buttons()).toContain('<code class="nhsw-inline-code">true</code>, you can do this directly in the HTML.');
  });

  it('serves the Breadcrumbs page as breadcrumbs.html, and nothing links to the old address', () => {
    expect(fs.existsSync(path.join(root, 'preview/components/breadcrumbs.html'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'preview/components/breadcrumb.html'))).toBe(false);
    expect(read('preview/_data/side_nav.yml')).toContain('url: /components/breadcrumbs.html');
    expect(read('preview/components/index.html')).toContain("/components/breadcrumbs.html");
    expect(read('preview/components/index.html')).not.toContain("/components/breadcrumb.html");
  });
});

describe('a list item without a bullet', () => {
  it('has no list marker, and the care card item on the Cards page uses it while the others keep theirs', () => {
    const css = compileProbe('@use "components/content/typography";');
    expect(block(css, '\.nhsw-u-no-bullet')).toMatch(/list-style:\s*none/);
    const cards = read('preview/components/cards.html');
    expect(cards).toContain('<li class="nhsw-u-no-bullet">the care card pattern');
    expect(cards.match(/nhsw-u-no-bullet/g)).toHaveLength(1);
  });
});

describe('component pages put the example before its description', () => {
  const panel = (file, id) => {
    const html = read(file);
    const start = html.indexOf(`id="${id}"`);
    const next = html.indexOf('<div class="nhsw-tabs__panel', start + 1);
    return html.slice(start, next === -1 ? undefined : next);
  };
  const sectionsOf = (html) => html.split('<section').slice(1).map((s) => s.slice(0, s.indexOf('</section>')));
  const textBeforeExample = (section) => {
    const afterHeading = section.slice(section.search(/<\/h[2-4]>/));
    const example = afterHeading.indexOf('{% capture example_body');
    return afterHeading.slice(0, example).includes('<p class="nhsw-body"');
  };

  it.each([
    ['preview/components/checkboxes.html', 'panel-variants'],
    ['preview/components/cards.html', 'panel-variants'],
    ['preview/components/text-input.html', 'panel-how-to-use'],
  ])('%s %s: no section has text between its heading and its example', (file, id) => {
    const sections = sectionsOf(panel(file, id)).filter((s) => s.includes('{% capture example_body'));
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) expect(textBeforeExample(section), section.slice(0, 120)).toBe(false);
  });

  it('text input "more than 1 question" has its example before the description', () => {
    const html = panel('preview/components/text-input.html', 'panel-how-to-use');
    const heading = html.indexOf("asking more than 1 question on the page</h3>");
    expect(html.indexOf('{% capture example_body', heading)).toBeLessThan(html.indexOf('Do not set the contents of the', heading));
  });

  it('text input How to use has no dividers between examples', () => {
    const html = panel('preview/components/text-input.html', 'panel-how-to-use');
    expect(html).not.toMatch(/<section class="preview-section">/);
    expect(html).not.toContain('<hr');
  });

  it('the Cards page uses "Jobs" for the stat card, and the basic card advice appears once', () => {
    const cards = read('preview/components/cards.html');
    expect(cards).not.toContain('Link goes here');
    expect(cards).toContain('>Jobs</a>');
    expect(cards.match(/Use basic cards to highlight important information within a page\./g)).toHaveLength(1);
    expect(cards).not.toContain('Consider using these components instead');
  });

  it('the Radios Variants tab does not repeat the error messages guidance from How to use', () => {
    const variants = panel('preview/components/radios.html', 'panel-variants');
    expect(variants).not.toContain('Error messages');
    expect(panel('preview/components/radios.html', 'panel-how-to-use')).toContain('Error messages');
  });
});

describe('the Site navigation examples open the same design as they show on the page', () => {
  it('each example opened in a new tab matches the example beside it', () => {
    const page = read('preview/components/site-navigation.html');
    const norm = (s) => s.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    const pattern = /\{% capture example_body %\}\{% raw %\}((?:(?!\{% capture)[\s\S])*?)\{% endraw %\}\{% endcapture %\}\s*\{% include example-preview\.html id="([^"]+)" open_url="([^"]+)"/g;
    const examples = [...page.matchAll(pattern)];
    expect(examples.length).toBe(5);
    for (const [, body, id, url] of examples) {
      const opened = read(`preview${url}`).replace(/^---[\s\S]*?---\s*/, '');
      expect(norm(opened), id).toBe(norm(body));
    }
  });
});

describe('pages use only the floating Back to top link', () => {
  it('the Setting up Figma prototypes page has no hard-coded Back to top link', () => {
    expect(read('preview/get-started/setting-up-figma-prototypes.html')).not.toContain('Back to top');
  });
});

describe('side navigation highlights an index page served from its folder URL', () => {
  const nav = read('preview/_includes/side-nav.html');

  it('treats /folder/index.html as current when the page URL is /folder/', () => {
    expect(nav).toContain('assign index_dir = target_url | remove: "index.html"');
    expect(nav).toMatch(/target_url contains "\/index\.html" and page\.url == index_dir/);
  });

  it('lists Get started before Setting up Figma prototypes', () => {
    const data = read('preview/_data/get_started_nav.yml');
    expect(data.indexOf('title: Get started')).toBeGreaterThan(-1);
    expect(data.indexOf('title: Get started')).toBeLessThan(data.indexOf('Setting up Figma prototypes'));
  });
});

describe('the preview site loads quickly', () => {
  const layouts = ['default', 'example', 'template'];

  it.each(layouts)('the %s layout uses the shared head assets and not Google Fonts', (name) => {
    const html = read(`preview/_layouts/${name}.html`);
    expect(html).toContain('{% include head-assets.html %}');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });

  it.each(layouts)('the %s layout loads the minified behaviours script', (name) => {
    const html = read(`preview/_layouts/${name}.html`);
    expect(html).toContain('/dist/nhsw-behaviours.min.js');
    expect(html).not.toMatch(/\/dist\/nhsw-behaviours\.js/);
  });

  it('the head assets preload the main font and load the minified stylesheet', () => {
    const head = read('preview/_includes/head-assets.html');
    expect(head).toMatch(/rel="preload"[^>]*roboto-latin\.woff2[^>]*as="font"[^>]*crossorigin/);
    expect(head).toContain('/assets/nhsw-fonts.css');
    expect(head).toContain('/dist/nhsw.min.css');
    expect(head).not.toMatch(/\/dist\/nhsw\.css/);
  });

  it('serves Roboto from the site with font-display swap, including Latin Extended for Welsh', () => {
    const css = read('preview/assets/nhsw-fonts.css');
    expect(css.match(/@font-face/g)).toHaveLength(2);
    expect(css.match(/font-display:\s*swap/g)).toHaveLength(2);
    expect(css).toMatch(/font-weight:\s*400 800/);
    expect(css).not.toContain('http');
    for (const file of ['roboto-latin', 'roboto-latin-ext']) {
      expect(css).toContain(`fonts/${file}.woff2`);
      expect(fs.readFileSync(path.join(root, `preview/assets/fonts/${file}.woff2`)).subarray(0, 4).toString()).toBe('wOF2');
    }
  });

  it('example screenshots load lazily', () => {
    const img = read('preview/_includes/example-screenshot.html');
    expect(img).toContain('loading="lazy"');
    expect(img).toContain('decoding="async"');
  });
});

describe('package scripts', () => {
  it('has no sync:gptr script', () => {
    expect(JSON.parse(read('package.json')).scripts).not.toHaveProperty('sync:gptr');
  });
});

describe('footer variants', () => {
  const page = read('preview/components/footer.html');

  it('the Footer with navigation links variant is archived until after launch, and the other variants remain', () => {
    expect(page).not.toContain('Footer with navigation links');
    expect(page).not.toContain('id="ft-nav"');
    expect(page).toContain('Footer without links');
    expect(page).toContain('Footer with an open licence');
  });

  it('the archived example file is kept for when the variant comes back', () => {
    expect(fs.existsSync(path.join(root, 'preview/examples/footer-navigation.html'))).toBe(true);
  });
});

describe('dark site navigation example', () => {
  const css = compileProbe('@use "components/content/example-preview";');

  it('fills the example in the navigation colour, full width, instead of the navy used by other dark examples', () => {
    const rule = '\\.nhsw-example-preview__body--dark:has\\(> \\.nhsw-site-header__nav--reverse:only-child\\)';
    const body = block(css, rule);
    expect(body).toMatch(/background-color:\s*#004281/);
    expect(body).toMatch(/padding:\s*0/);
    expect(block(css, rule + ' > \\.nhsw-site-header__nav')).toMatch(/width:\s*100%/);
    expect(block(css, '\\.nhsw-example-preview__body--dark')).toMatch(/background-color:\s*#1b365d/);
  });
});
