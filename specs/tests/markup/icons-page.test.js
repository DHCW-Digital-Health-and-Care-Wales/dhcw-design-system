import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../../..');
const preview = (rel) => fs.readFileSync(path.join(projectRoot, 'preview', rel), 'utf8');

const page = preview('styles/icons.html');

const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const normalise = (s) => s.replace(/\s+/g, ' ').trim();

// One entry per icon section: the example page, and the fills the icon must use.
const expected = {
  'icon-search': { heading: 'Search', fills: ['#1B365D'] },
  'icon-arrows': { heading: 'Left and right arrows', fills: ['#0E1B2F', '#0E1B2F'] },
  'icon-arrow-circle': { heading: 'Right arrow (inside a circle)', fills: ['#005AA8'] },
  'icon-up-arrow': { heading: 'Up arrow', fills: ['#0E1B2F'] },
  'icon-chevron-left': { heading: 'Left chevron', fills: ['#005AA8'] },
  'icon-chevron-right': { heading: 'Right chevron', fills: ['#4C6272'] },
  'icon-warning': { heading: 'Warning', fills: ['#005AA8'] },
  'icon-user-profile': { heading: 'User profile', fills: ['#005AA8', 'white'] },
};

const previews = [
  ...page.matchAll(
    /\{% capture example_body %\}\{% raw %\}([\s\S]*?)\{% endraw %\}\{% endcapture %\}\s*\{% include example-preview\.html id="([\w-]+)" open_url="([^"]+)"/g
  ),
].map((m) => ({ id: m[2], openUrl: m[3], svgs: m[1].match(/<svg[\s\S]*?<\/svg>/g) }));

const samples = Object.fromEntries(
  [
    ...page.matchAll(
      /\{% capture html_sample %\}\{% raw %\}([\s\S]*?)\{% endraw %\}\{% endcapture %\}[\s\S]*?\{% include code-viewer\.html id="([\w-]+)"/g
    ),
  ].map((m) => [m[2], unescape(m[1])])
);

describe('Icons page', () => {
  it('documents every icon, each with a live preview and an HTML code sample', () => {
    expect(previews.map((p) => p.id)).toEqual(Object.keys(expected));
    expect(Object.keys(samples)).toEqual(Object.keys(expected));
  });

  it('has a heading for each icon', () => {
    for (const [id, { heading }] of Object.entries(expected)) {
      expect(page, id).toContain(`<h3 class="nhsw-h3">${heading}</h3>`);
    }
  });

  describe.each(previews.map((p) => [p.id, p]))('%s', (id, p) => {
    it('has an example page to open in a new tab', () => {
      const file = path.join(projectRoot, 'preview', p.openUrl.replace(/^\//, ''));
      expect(fs.existsSync(file), p.openUrl).toBe(true);
    });

    it('shows the same SVG in the preview, the example page and the HTML sample', () => {
      const example = preview(p.openUrl.replace(/^\//, '')).match(/<svg[\s\S]*?<\/svg>/g);
      const sample = samples[id].match(/<svg[\s\S]*?<\/svg>/g);
      expect(example.map(normalise)).toEqual(p.svgs.map(normalise));
      expect(sample.map(normalise)).toEqual(p.svgs.map(normalise));
    });

    it('hides the decorative icon from screen readers', () => {
      for (const svg of p.svgs) {
        expect(svg).toMatch(/<svg aria-hidden="true" focusable="false"/);
      }
    });

    it('uses the colours from the design', () => {
      const fills = p.svgs.flatMap((s) => [...s.matchAll(/fill="(#[0-9A-Fa-f]{6}|white)"/g)].map((m) => m[1]));
      expect(fills).toEqual(expected[id].fills);
    });
  });

  it('links to the component each icon appears in', () => {
    for (const slug of ['header', 'pagination', 'action-link', 'back-link', 'breadcrumbs', 'warning-callout']) {
      expect(page, slug).toContain(`/components/${slug}.html`);
      expect(fs.existsSync(path.join(projectRoot, `preview/components/${slug}.html`)), slug).toBe(true);
    }
  });
});
