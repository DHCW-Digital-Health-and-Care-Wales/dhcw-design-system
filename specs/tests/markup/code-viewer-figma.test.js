import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const include = fs.readFileSync(path.join(root, 'preview/_includes/code-viewer.html'), 'utf8');

describe('code viewer Figma tab', () => {
  it('is only rendered when a figma url is passed, opening in a new tab', () => {
    expect(include).toMatch(/\{% if include\.figma %\}[\s\S]*href="\{\{ include\.figma \}\}"[\s\S]*target="_blank"[\s\S]*\{% endif %\}/);
    expect(include).toContain('rel="noopener"');
  });

  it('tells screen reader users the link opens in a new tab', () => {
    expect(include).toContain('nhsw-visually-hidden');
    expect(include).toContain('(opens in a new tab)');
  });
});

describe('checkboxes guidance', () => {
  it('links "radio" in the "only choose one option" guidance to the radios page', () => {
    const page = fs.readFileSync(path.join(root, 'preview/components/checkboxes.html'), 'utf8');
    expect(page).toContain(`In this case, use a <a class="nhsw-link" href="{{ '/components/radios.html' | relative_url }}">radio</a>.`);
  });
});

describe('error summary page examples', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/error-summary.html'), 'utf8');
  const rendered = page.split('\n').filter((line) => !line.includes('&lt;') && !line.includes('{% include'));

  it('no id is used by more than one example on the page, so each summary link goes to its own example', () => {
    const ids = rendered.join('\n').match(/\sid="[^"]+"/g) || [];
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('the timeout summary link points at the field in its own example, and has no separate Timeout heading', () => {
    expect(page).toContain('href="#full-name-timeout">Your login attempt timed out');
    expect(page).toContain('id="full-name-timeout"');
    expect(page).not.toContain('<h3 class="nhsw-h3">Timeout</h3>');
  });
});

describe('file upload variants tab', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/file-upload.html'), 'utf8');
  const variants = page.slice(page.indexOf('id="panel-variants"'), page.indexOf('id="panel-examples"'));

  it('follows the design: H2, then the small screens H3, then the example, then the two paragraphs', () => {
    const order = [
      '<h2 class="nhsw-h2">File upload variants</h2>',
      '<h3 class="nhsw-h3">File upload for small screens</h3>',
      '{% include example-preview.html id="fu-mobile"',
      '{% include code-viewer.html id="fu-mobile"',
      'Use the small screen variant when file uploads need to be completed on mobile devices or narrow viewports.',
      "The layout is optimised for smaller screens, helping users upload files easily without affecting the component's functionality or accessibility.",
    ].map((text) => variants.indexOf(text));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('no longer has the old mobile version heading or intro', () => {
    expect(variants).not.toContain('Mobile version of the file upload');
    expect(variants).not.toContain('you can use the smaller file upload version');
  });
});

describe('file upload small screen example', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/file-upload.html'), 'utf8');
  const variants = page.slice(page.indexOf('id="panel-variants"'), page.indexOf('id="panel-examples"'));

  it('uses an h3 for "Upload a file", so it does not jump back up to an h2 under the h3 section heading', () => {
    expect(variants).toContain('<h3 class="nhsw-h3">Upload a file</h3>');
    expect(variants).toContain('&lt;h3 class="nhsw-h3"&gt;Upload a file&lt;/h3&gt;');
    expect(variants).not.toMatch(/Upload a file<\/h2>|Upload a file&lt;\/h2&gt;/);
  });

  it('caps the small screen variant at a phone width of 343px', async () => {
    const { compileProbe, block } = await import('../support/compile-scss.js');
    const css = compileProbe('@use "components/forms/file-upload";');
    expect(block(css, '\.nhsw-file-upload--reverse')).toMatch(/max-width:\s*343px/);
  });
});

describe('footer page: how to use the footer', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/footer.html'), 'utf8');

  it('follows the design: H2, then the warning callout, then Adding links, then Copyright', () => {
    const order = [
      '<h2 class="nhsw-h2">How to use the footer</h2>',
      '<div class="nhsw-warning-callout">',
      '<h3 class="nhsw-h3">Adding links</h3>',
      '<h3 class="nhsw-h3">Copyright</h3>',
    ].map((text) => page.indexOf(text));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('notification banner page: the two versions link to their variants', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/notification-banner.html'), 'utf8');

  it('links the information and success banners to the matching variant headings', () => {
    expect(page).toContain('<a class="nhsw-link" href="#information-banner">the information banner (blue)</a>');
    expect(page).toContain('<a class="nhsw-link" href="#success-banner">the success banner (green)</a>');
    expect(page).toContain('<h3 class="nhsw-h3" id="information-banner">Information banner</h3>');
    expect(page).toContain('<h3 class="nhsw-h3" id="success-banner">Success banner</h3>');
  });
});

describe('warning callout page: important information variant', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/warning-callout.html'), 'utf8');

  it('links "warning callout" in "when not to use" to the warning callout section on the How to use tab', () => {
    expect(page).toContain('use a <a class="nhsw-link" href="#warning-callout">warning callout</a> instead.');
    const target = page.indexOf('id="warning-callout"');
    expect(target).toBeGreaterThan(page.indexOf('id="panel-how-to-use"'));
    expect(target).toBeLessThan(page.indexOf('id="panel-variants"'));
    expect(page.match(/id="warning-callout"/g)).toHaveLength(1);
  });
});

describe('pagination page: gaps in the page numbering', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/pagination.html'), 'utf8');
  const list = page.slice(page.indexOf('Use ellipses (…) to show gaps'), page.indexOf('</ul>', page.indexOf('Use ellipses (…) to show gaps')));

  it('puts the current page in square brackets in each example', () => {
    const items = [...list.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1].replace(/<\/?strong>/g, ''));
    expect(items).toEqual([
      '[1] 2 … 100',
      '1 [2] 3 … 100',
      '1 2 [3] 4 … 100',
      '1 2 3 [4] 5 … 100',
      '1 … 4 [5] 6 … 100',
      '1 … 97 [98] 99 100',
      '1 … 98 [99] 100',
      '1 … 99 [100]',
    ]);
  });
});

describe('pagination variants: structure and descriptions', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/pagination.html'), 'utf8');
  const variants = page.slice(page.indexOf('id="panel-variants"'), page.indexOf('id="panel-examples"'));
  const at = (text) => variants.indexOf(text);

  it('content pages: heading, then the component, then the description', () => {
    const order = [
      'For navigating between content pages</h3>',
      '{% include example-preview.html id="pg-content"',
      '{% include code-viewer.html id="pg-content"',
      "Use pagination at the bottom of pages of content to allow users to navigate around a topic that's divided into multiple pages (up to 8 pages).",
    ].map(at);
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('1st and last pages: each example is followed by its description', () => {
    const order = [
      '{% include code-viewer.html id="pg-first"',
      'Do not show a “Previous” link on the first page of a set of results. There is no page before the first page.',
      '{% include example-preview.html id="pg-last"',
      '{% include code-viewer.html id="pg-last"',
      'Do not show a “Next” link on the last page of a set of results. There are no more pages after the last page.',
    ].map(at);
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('textarea page: warning callout and width', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/textarea.html'), 'utf8');

  it('puts the warning callout at the top of How to use, before the first example, with the updated text', () => {
    const callout = page.indexOf('<div class="nhsw-warning-callout">');
    expect(callout).toBeGreaterThan(page.indexOf('id="panel-how-to-use"'));
    expect(callout).toBeLessThan(page.indexOf('{% include example-preview.html id="ta-overview"'));
    expect(page).toContain('Consider an alternative first</span>');
    expect(page).toContain('Use textareas with caution. In public-facing services, users may enter unexpected clinical or safeguarding information. Consider structured questions, radios or checkboxes first.');
    expect(page.match(/<div class="nhsw-warning-callout">/g)).toHaveLength(1);
    expect(page).not.toContain('Consider the risks');
  });

  it('is two-thirds wide from tablet up, and the full modifier still makes it full width', async () => {
    const { compileProbe } = await import('../support/compile-scss.js');
    const css = compileProbe('@use "components/forms/textarea";');
    expect(css).toMatch(/@media[^{]*\{\s*\.nhsw-textarea\s*\{\s*width:\s*66\.6667%/);
    expect(css).toMatch(/\.nhsw-textarea--full\s*\{\s*width:\s*100%/);
  });
});

describe('textarea first example label', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/textarea.html'), 'utf8');
  const first = page.slice(page.indexOf('id="panel-how-to-use"'), page.indexOf('{% include code-viewer.html id="ta-overview"'));

  it('uses the extra large label in the example, its HTML sample and its Nunjucks sample', () => {
    expect(first).toContain('<label class="nhsw-label nhsw-label--xl" for="ta-ov-mobility">');
    expect(first).toContain('&lt;label class="nhsw-label nhsw-label--xl" for="mobility"&gt;');
    expect(first).toContain('(your mobility)?", classes: "nhsw-label--xl" }');
  });

  it('the standalone example matches', () => {
    const example = fs.readFileSync(path.join(root, 'preview/examples/textarea-default.html'), 'utf8');
    expect(example).toContain('<label class="nhsw-label nhsw-label--xl" for="ta-mobility">');
  });
});

describe('select page label weights', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/select.html'), 'utf8');

  it('the error example label is regular weight too, in the example and both samples', () => {
    expect(page).toContain('<label class="nhsw-label nhsw-label--regular" for="sel-htu-err">');
    expect(page).toContain('&lt;label class="nhsw-label nhsw-label--regular" for="region"&gt;Choose region');
    expect(page).toContain('label: { text: "Choose region", classes: "nhsw-label--regular" },');
  });

  it('every label on the page is regular weight, none left as the bold default', () => {
    const labels = [...page.matchAll(/<label class="([^"]*)"/g)].map((m) => m[1]);
    expect(labels.length).toBeGreaterThan(0);
    for (const c of labels) expect(c).toContain('nhsw-label--regular');
  });

  it('the select examples follow the same rule, error example included', () => {
    const dir = path.join(root, 'preview/examples');
    for (const f of fs.readdirSync(dir).filter((n) => n.startsWith('select-'))) {
      const html = fs.readFileSync(path.join(dir, f), 'utf8');
      const expected = 'nhsw-label--regular';
      for (const m of html.matchAll(/<label class="([^"]*)"/g)) expect(m[1], f).toContain(expected);
    }
  });
});

describe('select page: meaningful example copy and the multiple options heading', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/select.html'), 'utf8');

  it('no example still uses placeholder copy', () => {
    expect(page).not.toContain('Hint text goes here');
    expect(page).not.toContain('Error message goes here');
    expect(page).not.toContain('Label desktop');
  });

  it('the error and hint examples read: label, hint, error message, in the example and both samples', () => {
    expect(page).toContain('<div class="nhsw-hint" id="sel-htu-err-hint">This can be different to what you selected before</div>');
    expect(page).toContain('</span>Choose region</p>');
    expect(page).toContain('hint: { text: "This can be different to what you selected before" },');
    expect(page).toContain('errorMessage: { text: "Choose region" },');
    expect(page).toContain('<div class="nhsw-hint" id="sel-hint-hint">This can be different to what you selected before</div>');
  });

  it('puts a heading before the paragraph about not selecting multiple options', () => {
    const heading = page.indexOf('<h3 class="nhsw-h3">Avoid adding functionality to allow selecting multiple options</h3>');
    const paragraph = page.indexOf('The select component does not support selecting multiple options');
    expect(heading).toBeGreaterThan(-1);
    expect(heading).toBeLessThan(paragraph);
    expect(paragraph - heading).toBeLessThan(200);
  });
});

describe('select page: when not to use select', () => {
  it('links "radios" to the Radios page', () => {
    const page = fs.readFileSync(path.join(root, 'preview/components/select.html'), 'utf8');
    expect(page).toContain(`such as <a class="nhsw-link" href="{{ '/components/radios.html' | relative_url }}">radios</a>.`);
  });
});

describe('cards page: heading sizes in the accessibility examples', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/cards.html'), 'utf8').replace(/\r\n/g, '\n');
  const sizes = page.slice(page.indexOf('id="card-heading-sizes"') - 2500, page.indexOf('id="card-heading-sizes" html'));

  it('size l is an h2, m is an h3 and s is an h4, in the example, the HTML sample and the Nunjucks sample', () => {
    for (const [level, size] of [['2', 'l'], ['3', 'm'], ['4', 's']]) {
      expect(sizes).toContain(`<h${level} class="nhsw-card__title nhsw-card__title--${size}">Heading level ${size}</h${level}>`);
      expect(sizes).toContain(`&lt;h${level} class="nhsw-card__title nhsw-card__title--${size}"&gt;Heading level ${size}&lt;/h${level}&gt;`);
      expect(sizes).toContain(`headingLevel: ${level},\n  titleSize: "${size}",`);
    }
  });
});

describe('styles home page', () => {
  const page = fs.readFileSync(path.join(root, 'preview/styles.html'), 'utf8').replace(/\r\n/g, '\n');

  it('is the "All styles" page: heading, introduction, then a card for each style', () => {
    expect(page).toContain('<h1 class="nhsw-h1">All styles</h1>');
    expect(page).toContain('Make your service look and feel like other NHS Wales services with these tested styles.');
    const cards = [...page.matchAll(/<h3 class="nhsw-card__title"><a class="nhsw-card__title-link" href="\{\{ '([^']+)' \| relative_url \}\}">([^<]+)<\/a><\/h3>\s*<p class="nhsw-card__description">([^<]+)<\/p>/g)]
      .map((m) => [m[2], m[1], m[3]]);
    expect(cards).toEqual([
      ['Colours', '/styles/colours.html', 'Apply the NHS Wales colour palette consistently across your service.'],
      ['Icons', '/styles/icons.html', 'Use approved icons to help users understand and navigate content.'],
      ['Layout', '/styles/layout.html', 'Create clear, consistent and responsive page layouts.'],
      ['Page templates', '/patterns/page-templates.html', 'Use templates to create pages that are consistent with other services.'],
      ['Typography', '/styles/typography.html', 'Use typography standards to make content clear, readable and accessible.'],
    ]);
  });

  it('lays the cards out three to a row, like the components page', () => {
    expect(page).toContain('<ul class="nhsw-grid-row nhsw-card-group" role="list">');
    expect(page.match(/nhsw-grid-column-one-third nhsw-card-group__item/g)).toHaveLength(5);
  });

  it('the side navigation calls the page "All styles"', () => {
    expect(fs.readFileSync(path.join(root, 'preview/_data/styles_nav.yml'), 'utf8')).toContain('- title: All styles');
  });
});

describe('card with an image example opened in a new tab', () => {
  it('shows the card in a half width column, not the full width of the page', () => {
    const example = fs.readFileSync(path.join(root, 'preview/examples/card-image.html'), 'utf8');
    expect(example).toMatch(/<ul class="nhsw-grid-row nhsw-card-group" role="list">\s*<li class="nhsw-grid-column-one-half nhsw-card-group__item">\s*<div class="nhsw-card">/);
  });
});

describe('select examples show the dropdown options', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/select.html'), 'utf8').replace(/\r\n/g, '\n');
  const regions = ['Choose region', 'North Wales', 'Mid Wales', 'West Wales', 'South Wales'];

  it.each([['sel-ov', 'overview'], ['sel-htu-err', 'error message'], ['sel-hint', 'select with hint (variants)']])('the %s (%s) live example lists every option', (id) => {
    const start = page.indexOf(`id="${id}"`);
    const select = page.slice(start, page.indexOf('</select>', start));
    for (const region of regions) expect(select, `${id} is missing "${region}"`).toContain(`<option>${region}</option>`);
  });

  it('every HTML and Nunjucks sample on the page lists the same five options', () => {
    expect(page.match(/&lt;option value="south-wales"&gt;South Wales&lt;\/option&gt;/g)).toHaveLength(3);
    expect(page.match(/\{ value: "south-wales", text: "South Wales" \}/g)).toHaveLength(3);
  });
});

describe('styles home page has no breadcrumb, like the design', () => {
  it('turns the breadcrumb off for this page only', () => {
    const page = fs.readFileSync(path.join(root, 'preview/styles.html'), 'utf8');
    expect(page).toContain('no_breadcrumb: true');
    const include = fs.readFileSync(path.join(root, 'preview/_includes/breadcrumb.html'), 'utf8');
    expect(include).toMatch(/^\{% unless page\.no_breadcrumb %\}/);
    expect(include.trimEnd()).toMatch(/\{% endunless %\}$/);
    const others = ['preview/index.html', 'preview/components/index.html', 'preview/get-started/index.html'];
    for (const file of others) expect(fs.readFileSync(path.join(root, file), 'utf8')).not.toContain('no_breadcrumb');
  });
});

describe('panel without an icon: large is the default 48px title, small is 32px', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/panel.html'), 'utf8').replace(/\r\n/g, '\n');
  const large = page.slice(page.indexOf('Panel without icon (large)'), page.indexOf('id="pn-no-icon" html'));

  it('the large example, its HTML and its Nunjucks use the standard title, with the icon switched off by icon: false', () => {
    expect(large).toContain('<h1 class="nhsw-panel__title">Application complete</h1>');
    expect(large).toContain('&lt;h1 class="nhsw-panel__title"&gt;Application complete&lt;/h1&gt;');
    expect(large).toContain('icon: false,');
    expect(large).not.toContain('nhsw-panel__title--l');
    expect(large).not.toContain('titleSize');
  });

  it('the standalone large example matches', () => {
    const example = fs.readFileSync(path.join(root, 'preview/examples/panel-no-icon.html'), 'utf8');
    expect(example).toContain('<h1 class="nhsw-panel__title">Application complete</h1>');
    expect(example).not.toContain('title--l');
  });

  it('icon: false renders the plain, full size title with no icon', async () => {
    const { configure } = await import('../../../src/nunjucks.config.js');
    const html = configure({ noCache: true }).renderString('{% from "panel/macro.njk" import nhswPanel %}{{ nhswPanel({ titleText: "T", icon: false, html: "B" }) }}');
    expect(html).toContain('<h1 class="nhsw-panel__title">T</h1>');
    expect(html).not.toContain('nhsw-panel__icon');
  });
});
