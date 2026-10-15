import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const skipped = new Set(['_site', '_site_test', 'dist', 'node_modules', '.jekyll-cache']);

function collect(dir, exts) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return skipped.has(entry.name) ? [] : collect(full, exts);
    return exts.some((e) => entry.name.endsWith(e)) ? [full] : [];
  });
}

const files = [...collect(path.join(root, 'preview'), ['.html']), ...collect(path.join(root, 'src'), ['.njk'])].map((file) => ({
  rel: path.relative(root, file).split(path.sep).join('/'),
  text: fs.readFileSync(file, 'utf8'),
}));

// Real elements, and the escaped copies shown in the code samples.
const OPEN = /(?:<|&lt;)(caption|figcaption)\b([^>]*?)(?:>|&gt;)/g;

// A bare escaped tag, such as "use the &lt;caption&gt; element", is prose about the
// element, not a caption on the page.
const found = files.flatMap(({ rel, text }) =>
  [...text.matchAll(OPEN)]
    .filter((m) => !(m[0].startsWith('&lt;') && m[2].trim() === ''))
    .map((m) => ({ rel, tag: m[1], attrs: m[2], snippet: m[0].slice(0, 110) }))
);

const CAPTION_CLASS = /nhsw-caption-(?:xl|l|m|s|\{\{ captionSize \}\})/;

describe('every <caption> and <figcaption> uses a caption class', () => {
  it('finds the captions on the site', () => {
    expect(found.filter((f) => f.tag === 'caption').length).toBeGreaterThan(20);
    expect(found.filter((f) => f.tag === 'figcaption').length).toBeGreaterThan(0);
  });

  it.each(found.map((f) => [`${f.rel}: ${f.snippet}`, f]))('%s', (_name, { attrs }) => {
    expect(attrs).toMatch(CAPTION_CLASS);
  });

  it('a table caption uses the caption class that matches its size modifier', () => {
    for (const { rel, tag, attrs } of found.filter((f) => f.tag === 'caption')) {
      const modifier = attrs.match(/nhsw-table__caption--(xl|l|m|s)\b/);
      const caption = attrs.match(/nhsw-caption-(xl|l|m|s)\b/);
      if (modifier) expect(caption?.[1], `${rel} ${tag}`).toBe(modifier[1]);
    }
  });

  it('the table macro defaults to the regular (m) caption size', () => {
    const macro = fs.readFileSync(path.join(root, 'src/components/table/macro.njk'), 'utf8');
    expect(macro).toContain('captionSize = params.captionSize or "m"');
    expect(macro).toContain('nhsw-caption-{{ captionSize }}');
  });

  it('the screenshot caption uses the small caption, the closest to its 15px size', () => {
    const include = fs.readFileSync(path.join(root, 'preview/_includes/example-screenshot.html'), 'utf8');
    expect(include).toContain('<figcaption class="nhsw-example-screenshot__caption nhsw-caption-s">');
  });
});
