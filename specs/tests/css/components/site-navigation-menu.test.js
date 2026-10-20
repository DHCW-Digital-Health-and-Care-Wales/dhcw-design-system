import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('site navigation: the "More" overflow menu is the default, as in the NHS.UK header', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/site/header";`);
  });

  it('the navigation is never hidden on a small screen, which is what keeps it available at 400% zoom', () => {
    expect(block(css, '\.nhsw-site-header__nav')).not.toMatch(/display:\s*none/);
    expect(css).not.toMatch(/@media \(max-width: 40rem\)\s*\{\s*\.nhsw-site-header__nav\s*\{[^}]*display:\s*none/);
  });

  it('the navigation has a zero-width bottom border in its own colour, which the script grows to make room for an open menu', () => {
    expect(block(css, '\.nhsw-site-header__nav')).toMatch(/border:\s*0 solid #ffffff/);
    expect(block(css, '\.nhsw-site-header__nav--reverse')).toMatch(/border-color:\s*#1b365d/);
  });

  it('the list is positioned, so the menu can sit directly under it', () => {
    expect(block(css, '\.nhsw-site-header__nav \.nhsw-site-header__nav-list')).toMatch(/position:\s*relative/);
  });

  it('opting out (nav--no-menu) hides the navigation below 40rem, as the navigation used to behave', () => {
    expect(css).toMatch(/@media \(max-width: 40rem\)\s*\{\s*\.nhsw-site-header__nav--no-menu\s*\{[^}]*display:\s*none/);
  });

  it('no longer needs an overflow modifier class', () => {
    expect(css).not.toContain('nhsw-site-header__nav--overflow');
  });

  it('once the script is running the bar stops wrapping, so overflow goes to the menu instead of a second row', () => {
    const enhanced = block(css, '\\.nhsw-site-header__nav--enhanced \\.nhsw-site-header__nav-list');
    expect(enhanced).toMatch(/flex-wrap:\s*nowrap/);
  });

  it('the menu item stays hidden while hidden, despite the list items being display: flex', () => {
    const hidden = block(css, '\\.nhsw-site-header__menu\\[hidden\\]');
    expect(hidden).toMatch(/display:\s*none/);
  });

  it('the menu button looks like a nav link without an underline, with a chevron that flips when open', () => {
    const toggle = block(css, '\\.nhsw-site-header__menu-toggle');
    expect(toggle).toMatch(/background:\s*none/);
    expect(toggle).toMatch(/border:\s*0/);
    expect(toggle).toMatch(/font-family:\s*inherit/);
    expect(css).toMatch(/\.nhsw-site-header__menu-toggle::after\s*\{[^}]*content:\s*""/);
    expect(css).toMatch(/\.nhsw-site-header__menu-toggle\[aria-expanded=true\]::after\s*\{[^}]*rotate\(-135deg\)/);
  });

  it('the menu drops down directly under the list, across its full width', () => {
    const menuList = block(css, '\\.nhsw-site-header__menu-list');
    expect(menuList).toMatch(/position:\s*absolute/);
    expect(menuList).toMatch(/top:\s*100%/);
    expect(menuList).toMatch(/left:\s*0/);
    expect(menuList).toMatch(/right:\s*0/);
    expect(menuList).toMatch(/list-style:\s*none/);
  });

  it('menu items stack as rows with a divider, and the current page is marked on the left edge, not by an underline', () => {
    expect(block(css, '\\.nhsw-site-header__menu-list li')).toMatch(/border-bottom:\s*1px solid #d8dde0/);
    expect(block(css, '\\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link')).toMatch(/display:\s*block/);
    expect(block(css, '\\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link--current')).toMatch(/box-shadow:\s*inset 4px 0 0 0 #212b32/);
  });

  it('the reverse variant gets a dark menu with a white current-page marker', () => {
    expect(block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__menu-list')).toMatch(/background-color:\s*#1b365d/);
    expect(block(css, '\\.nhsw-site-header__nav--reverse \\.nhsw-site-header__menu-list \\.nhsw-site-header__nav-link--current')).toMatch(/inset 4px 0 0 0 #ffffff/);
  });
});

describe('example boxes on the component pages keep a navigation demo in view', () => {
  it('shows the navigation inside an example box even below 40rem, where the component itself would be hidden', () => {
    const css = compileProbe(`@use "components/content/example-preview";`);
    expect(block(css, '\\.nhsw-example-preview__body \\.nhsw-site-header__nav')).toMatch(/display:\s*block/);
  });
});

describe('example previews use the NHSW grey background', () => {
  const css = compileProbe(`@use "components/content/example-preview";`);

  it('the example body and the framed example are grey, not white', () => {
    expect(block(css, '\.nhsw-example-preview__body')).toMatch(/background-color:\s*#f0f4f5/);
    expect(block(css, '\.nhsw-example-preview__frame')).toMatch(/background-color:\s*#f0f4f5/);
  });

  it('the dark variant keeps its blue background', () => {
    expect(block(css, '\.nhsw-example-preview__body--dark')).toMatch(/background-color:\s*#1b365d/);
  });
});

describe('code viewer matches the example window design', () => {
  const css = compileProbe(`@use "components/content/code-viewer";`);

  it('is grey with a white code panel, and the tabs are links with a blue bar under the active one', () => {
    expect(block(css, '\.nhsw-code-viewer')).toMatch(/background-color:\s*#f0f4f5/);
    expect(block(css, '\.nhsw-code-viewer__panel')).toMatch(/background-color:\s*#ffffff/);
    expect(block(css, '\.nhsw-code-viewer__tab span, \.nhsw-code-viewer__link span')).toMatch(/text-decoration:\s*underline/);
    expect(block(css, '\.nhsw-code-viewer__tab, \.nhsw-code-viewer__link')).toMatch(/text-decoration:\s*none/);
    expect(block(css, '\.nhsw-code-viewer__tab--active, \.nhsw-code-viewer__link--active')).toMatch(/border-bottom-color:\s*#005aa8/);
  });

  it('colours tags, attributes and values', () => {
    expect(css).toMatch(/\.nhsw-code-viewer \.nhsw-code-token--attr\s*\{\s*color:\s*#007f3b/);
    expect(css).toMatch(/\.nhsw-code-viewer \.nhsw-code-token--value\s*\{\s*color:\s*#d5281b/);
  });

  it('an open viewer joins the example above it and hides the example footer', () => {
    expect(css).toContain('.nhsw-example-preview:has(+ .nhsw-code-viewer:not([hidden]))');
  });
});

describe('code window focus states behave like links, not buttons', () => {
  const viewer = compileProbe(`@use "components/content/code-viewer";`);
  const preview = compileProbe(`@use "components/content/example-preview";`);

  it('focusing a tab highlights only its text, with a black bar underneath, and leaves the tab itself unfilled', () => {
    expect(block(viewer, '\.nhsw-code-viewer__tab:focus, \.nhsw-code-viewer__link:focus')).toMatch(/outline:\s*none/);
    expect(block(viewer, '\.nhsw-code-viewer__tab:focus, \.nhsw-code-viewer__link:focus')).not.toMatch(/background-color/);
    const text = block(viewer, '\.nhsw-code-viewer__tab:focus span, \.nhsw-code-viewer__link:focus span');
    expect(text).toMatch(/background-color:\s*#ffeb3b/);
    expect(text).toMatch(/box-shadow:\s*0 4px 0 0 #212b32/);
  });

  it('the HTML, Nunjucks and Close links use the same link focus, with no outline', () => {
    const focus = block(preview, '\.nhsw-example-preview__footer-button:focus');
    expect(focus).toMatch(/outline:\s*none/);
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/box-shadow:\s*0 4px 0 0 #212b32/);
  });
});

describe('code window: larger Close link and optional Figma tab', () => {
  const viewer = compileProbe(`@use "components/content/code-viewer";`);
  const preview = compileProbe(`@use "components/content/example-preview";`);

  it('Close is larger than the example footer links', () => {
    expect(block(viewer, '\.nhsw-code-viewer__footer \.nhsw-example-preview__footer-button')).toMatch(/font-size:\s*1rem/);
    expect(block(preview, '\.nhsw-example-preview__footer-button')).toMatch(/font-size:\s*0\.9375rem/);
  });

  it('the Figma link is styled like the tabs and takes the same link focus', () => {
    expect(viewer).toMatch(/\.nhsw-code-viewer__tab,\s*\.nhsw-code-viewer__link\s*\{/);
    expect(viewer).toMatch(/\.nhsw-code-viewer__link:focus span\s*\{/);
  });

  it('the all-tag-colours example can opt into a temporary white background', () => {
    expect(block(preview, '\.nhsw-example-preview__body--white')).toMatch(/background-color:\s*#ffffff/);
  });
});

describe('temporary white example body for the tag colours page', () => {
  it('has a white body modifier, used only by tag-all-colours', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const css = compileProbe(`@use "components/content/example-preview";`);
    expect(block(css, '\.nhsw-example-preview__body--white')).toMatch(/background-color:\s*#ffffff/);
    const page = fs.readFileSync(path.resolve(import.meta.dirname, '../../../../preview/examples/tag-all-colours.html'), 'utf8');
    expect(page).toContain('nhsw-example-preview__body--white');
  });
});

describe('code viewer Figma tab and larger Close', () => {
  it('styles the Figma link like a tab and keeps Close at body size', () => {
    const css = compileProbe(`@use "components/content/code-viewer";`);
    expect(css).toMatch(/\.nhsw-code-viewer__link/);
    expect(css).toMatch(/\.nhsw-code-viewer__footer \.nhsw-example-preview__footer-button\s*\{\s*font-size:\s*1rem/);
  });
});

describe('card examples on the docs pages are sized to their content', () => {
  const preview = compileProbe(`@use "components/content/example-preview";`);
  const card = compileProbe(`@use "components/cards/card";`);

  it('stat and image cards no longer stretch across the whole example', () => {
    expect(preview).toMatch(/\.nhsw-card:has\(> \.nhsw-card__stat\) \{\s*width: fit-content;\s*min-width: 170px/);
    expect(preview).toMatch(/\.nhsw-card:has\(> \.nhsw-card__image\) \{\s*max-width: 27\.375rem/);
  });

  it('clickable cards follow the Figma sizes: 440px wide with 32px padding, stat card 24px padding, top task card 264px, all left aligned', () => {
    expect(preview).toMatch(/\.nhsw-card:not\(\.nhsw-card--top-task\):has\(> \.nhsw-card__title \.nhsw-card__title-link\) \{\s*width: 100%;\s*max-width: 440px;\s*min-height: 220px/);
    expect(card).toMatch(/\.nhsw-card:not\(\.nhsw-card--preview\):not\(\.nhsw-card--flat\):has\(\.nhsw-card__title-link\) \{[^}]*gap: 16px;\s*padding: 32px/);
    expect(card).toMatch(/\.nhsw-card:not\(\.nhsw-card--preview\):not\(\.nhsw-card--flat\):has\(> \.nhsw-card__stat\) \{\s*gap: 4px;\s*padding: 24px/);
    const top = block(card, '\\.nhsw-card\\.nhsw-card--top-task:not\\(\\.nhsw-card--preview\\):not\\(\\.nhsw-card--flat\\)');
    expect(top).toMatch(/width:\s*264px/);
    expect(top).toMatch(/padding:\s*2rem/);
    expect(top).not.toMatch(/text-align/);
    expect(preview).not.toContain('.nhsw-card--top-task {');
  });
});

describe('reverse breadcrumbs and card title links', () => {
  it('the chevrons between reverse breadcrumbs are filled white, not grey', () => {
    const css = compileProbe(`@use "components/navigation/breadcrumb";`);
    const rule = block(css, '\\.nhsw-breadcrumb--reverse \\.nhsw-breadcrumb__list-item:not\\(:last-child\\)::after');
    expect(rule).toMatch(/background-color:\s*#ffffff/);
  });

  it('plain list links on the Cards page use the normal link class, not the card title link', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const page = fs.readFileSync(path.resolve(import.meta.dirname, '../../../../preview/components/cards.html'), 'utf8');
    expect(page).not.toMatch(/<li>\s*<a class="nhsw-card__title-link"/);
  });
});

describe('example screenshots on the Examples tab', () => {
  it('have no grey background, border or padding behind or around the image', () => {
    const css = compileProbe(`@use "components/content/example-screenshot";`);
    const frame = block(css, '\.nhsw-example-screenshot');
    expect(frame).not.toMatch(/background/);
    expect(frame).not.toMatch(/border/);
    expect(frame).not.toMatch(/padding/);
    expect(block(css, '\.nhsw-example-screenshot__image')).not.toMatch(/border/);
  });
});

describe('Back to top on every page', () => {
  it('is added by the default layout to every page except component pages, which have their own at the end of each tab', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(import.meta.dirname, '../../../..');
    const layout = fs.readFileSync(path.join(root, 'preview/_layouts/default.html'), 'utf8');
    expect(layout).toContain("{% unless page.layout == 'component' %}{% include back-to-top.html %}{% endunless %}");
    const include = fs.readFileSync(path.join(root, 'preview/_includes/back-to-top.html'), 'utf8');
    expect(include).toContain('<p class="nhsw-body nhsw-back-to-top"><a class="nhsw-link" href="#maincontent">');
    expect(fs.readFileSync(path.join(root, 'preview/_layouts/workshop.html'), 'utf8')).toContain('id="maincontent"');
  });

  it.each(['colours', 'typography', 'icons', 'layout'])('the styles %s page has no static Back to top link, only the floating one from the layout', async (page) => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(import.meta.dirname, '../../../..');
    const html = fs.readFileSync(path.join(root, `preview/styles/${page}.html`), 'utf8');
    expect(html).not.toMatch(/<a class="nhsw-link" href="#maincontent">[\s\S]*?Back to top<\/a>/);
  });
});

describe('component examples on the docs pages follow the design widths', () => {
  const css = compileProbe(`@use "components/content/example-preview";`);
  const rule = (selector) => {
    const start = css.indexOf(selector);
    return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
  };

  it('holds error summary, file upload, tables and tabs to two-thirds (at least 640px), border-box so padding is included', () => {
    const group = rule('.nhsw-example-preview__body > .nhsw-error-summary:not([class*="--full"]),');
    for (const selector of ['.nhsw-error-summary', '.nhsw-error-summary:not([class*="--full"]) ~ .nhsw-form-group', '.nhsw-file-upload', '.nhsw-table', '.nhsw-summary-list', '.nhsw-summary-card', '.nhsw-table-responsive', '.nhsw-tabs']) {
      expect(group).toContain(`.nhsw-example-preview__body > ${selector}`);
    }
    expect(group).toMatch(/box-sizing:\s*border-box/);
    expect(group).toMatch(/max-width:\s*max\(66\.6667%,\s*640px\)/);
  });

  it('leaves the small screen file upload at its own 343px, which the 640px cap must not override', () => {
    expect(css).toContain('.nhsw-file-upload:not([class*="--full"]):not(.nhsw-file-upload--reverse)');
    const upload = compileProbe('@use "components/forms/file-upload";');
    expect(block(upload, '\.nhsw-file-upload--reverse')).toMatch(/max-width:\s*343px/);
  });

  it('caps the panel at the 960px page width and sizes the site navigation to its content', () => {
    expect(rule('.nhsw-example-preview__body > .nhsw-panel:not([class*="--full"])')).toMatch(/max-width:\s*960px/);
    expect(rule('.nhsw-example-preview__body > .nhsw-site-header__nav:not([class*="--full"])')).toMatch(/width:\s*fit-content/);
  });

  it('keeps plain text inputs to 730px but leaves the fixed and fluid width classes alone', () => {
    expect(css).toContain('.nhsw-example-preview__body .nhsw-input:not([class*=nhsw-input--]) {');
    expect(rule('.nhsw-example-preview__body .nhsw-input:not([class*=nhsw-input--])')).toMatch(/max-width:\s*730px/);
  });
});

describe('--full width modifiers', () => {
  const cases = [
    ['components/forms/error-summary', 'nhsw-error-summary'],
    ['components/content/expander', 'nhsw-expander'],
    ['components/forms/file-upload', 'nhsw-file-upload'],
    ['components/callouts/notification-banner', 'nhsw-notification-banner'],
    ['components/content/panel', 'nhsw-panel'],
    ['components/content/table', 'nhsw-table'],
    ['components/content/summary-list', 'nhsw-summary-list'],
    ['components/content/summary-card', 'nhsw-summary-card'],
    ['components/content/table', 'nhsw-table-responsive'],
    ['components/content/tabs', 'nhsw-tabs'],
    ['components/site/header', 'nhsw-site-header__nav'],
    ['components/forms/textarea', 'nhsw-textarea'],
    ['components/forms/input', 'nhsw-input'],
  ];

  it.each(cases)('%s has a %s--full modifier that fills the width', (module, cls) => {
    const css = compileProbe(`@use "${module}";`);
    const full = block(css, `\.${cls}--full`);
    expect(full).toMatch(/width:\s*100%/);
  });

  it('the docs width caps step aside for any --full modifier', () => {
    const css = compileProbe(`@use "components/content/example-preview";`);
    expect(css.match(/:not\(\[class\*="--full"\]\)/g).length).toBeGreaterThanOrEqual(8);
  });
});

describe('label weight modifiers', () => {
  const label = compileProbe(`@use "components/forms/label";`);
  const group = compileProbe(`@use "components/forms/form-group";`);

  it('has a regular weight label modifier, and the default label stays bold', () => {
    expect(block(label, '\.nhsw-label--regular')).toMatch(/font-weight:\s*400/);
    expect(block(label, '\.nhsw-label')).toMatch(/font-weight:\s*700/);
    expect(label).not.toContain('nhsw-label--bold');
  });

  it('an error group drops the label to regular weight', () => {
    expect(group).toContain('.nhsw-form-group--error .nhsw-label {');
  });
});

describe('non-clickable cards and heading sizes', () => {
  const card = compileProbe(`@use "components/cards/card";`);

  it('non-clickable cards have 2rem padding, with 1.5rem under a basic card title and nothing under its description', () => {
    const selector = '.nhsw-card:not(.nhsw-card--preview):not(.nhsw-card--flat):not(:has(.nhsw-card__title-link))';
    const start = card.indexOf(`${selector} {`);
    expect(start).toBeGreaterThan(-1);
    expect(card.slice(start, card.indexOf('}', start))).toMatch(/padding:\s*2rem/);
    const title = card.indexOf(`${selector} .nhsw-card__title:has(+ .nhsw-card__description) {`);
    expect(card.slice(title, card.indexOf('}', title))).toMatch(/margin-bottom:\s*1\.5rem/);
    const description = card.indexOf(`${selector} .nhsw-card__description {`);
    expect(card.slice(description, card.indexOf('}', description))).toMatch(/margin-bottom:\s*0/);
  });

  it('card title sizes: l matches an h2, m an h3 and s an h4', () => {
    expect(block(card, '\.nhsw-card__title--m')).toMatch(/font-size:\s*1\.625rem/);
    expect(card).toMatch(/\.nhsw-card__title--l\s*\{\s*font-size:\s*1\.6875rem/);
    expect(card).toMatch(/\.nhsw-card__title--s\s*\{\s*font-size:\s*1\.1875rem/);
    expect(card).toMatch(/@media[^{]*\{\s*\.nhsw-card__title--l\s*\{\s*font-size:\s*2\.25rem/);
    expect(card).toMatch(/@media[^{]*\{\s*\.nhsw-card__title--s\s*\{\s*font-size:\s*1\.375rem/);
  });
});

describe('card padding and the card image', () => {
  const card = compileProbe(`@use "components/cards/card";`);

  it('the second top task card has the same 32px padding as the other cards', () => {
    expect(block(card, '\\.nhsw-card\\.nhsw-card--top-task:not\\(\\.nhsw-card--preview\\):not\\(\\.nhsw-card--flat\\)')).toMatch(/padding:\s*2rem/);
  });

  it('the image runs edge to edge across the top, cancelling the 32px padding, with the padding kept for the content below', () => {
    const image = block(card, '\\.nhsw-card__image');
    expect(image).toMatch(/margin:\s*-2rem -2rem 2rem/);
    expect(image).toMatch(/width:\s*calc\(100% \+ 4rem\)/);
    expect(card).toMatch(/\.nhsw-card__image\s*\{\s*align-self:\s*stretch;\s*margin-bottom:\s*1rem/);
  });
});

describe('pagination underline thickness is the same in every variant', () => {
  const css = compileProbe(`@use "components/content/pagination";`);
  const selectors = [
    '.nhsw-pagination--numbered .nhsw-pagination__previous,\n.nhsw-pagination--numbered .nhsw-pagination__next',
    '.nhsw-pagination--numbered .nhsw-pagination__number-link',
    '.nhsw-pagination__link .nhsw-pagination__title',
    '.nhsw-pagination__page',
  ];

  it.each(selectors)('%s is underlined at 1px', (selector) => {
    const start = css.indexOf(`\n${selector} {`);
    expect(start).toBeGreaterThan(-1);
    expect(css.slice(start, css.indexOf('}', start))).toMatch(/text-decoration-thickness:\s*1px/);
  });
});

describe('panel without an icon (small)', () => {
  const css = compileProbe(`@use "components/content/panel";`);

  it('keeps the standard 40px side padding from the tablet breakpoint, not the 80px of the icon version', () => {
    expect(css).toMatch(/\.nhsw-panel--small:not\(:has\(\.nhsw-panel__icon\)\)\s*\{\s*padding:\s*32px 40px/);
    expect(css).toMatch(/\.nhsw-panel--small\s*\{\s*padding:\s*32px 80px/);
  });
});
