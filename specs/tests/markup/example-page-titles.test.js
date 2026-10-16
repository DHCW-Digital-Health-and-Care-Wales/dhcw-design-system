import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

// What the layouts produce: "Example - <name> - DHCW Design System", where <name> is the page
// title with its first " example" removed.
const renderedTitle = (frontMatterTitle) => `Example - ${frontMatterTitle.replace(' example', '')} - DHCW Design System`;

const examples = fs.readdirSync(path.join(root, 'preview/examples')).filter((f) => f.endsWith('.html')).map((file) => {
  const text = read(`preview/examples/${file}`);
  return { file, title: text.match(/^title:\s*(.+?)\s*$/m)?.[1] };
});

describe('pages opened with "Open this example in a new tab"', () => {
  it.each(['example', 'template'])('the %s layout titles the page "Example - name - DHCW Design System"', (layout) => {
    expect(read(`preview/_layouts/${layout}.html`)).toContain(
      "<title>Example - {{ page.title | replace_first: ' example', '' }} - DHCW Design System</title>",
    );
  });

  it('every example page has a title', () => {
    expect(examples.length).toBeGreaterThan(100);
    expect(examples.filter((e) => !e.title)).toEqual([]);
  });

  it('gives every example its own page title, so you can tell them apart', () => {
    const titles = examples.map((e) => renderedTitle(e.title));
    const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect([...new Set(duplicates)]).toEqual([]);
  });

  it('names a variant after the component and the variant', () => {
    expect(renderedTitle('Checkboxes with none option example')).toBe('Example - Checkboxes with none option - DHCW Design System');
    expect(renderedTitle('Action link example (dark background)')).toBe('Example - Action link (dark background) - DHCW Design System');
  });
});
