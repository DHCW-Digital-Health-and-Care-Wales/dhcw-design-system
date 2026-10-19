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
