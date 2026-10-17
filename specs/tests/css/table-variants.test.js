import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const page = fs.readFileSync(path.join(root, 'preview/components/table.html'), 'utf8');
const variants = page.slice(page.indexOf('id="panel-variants"'), page.indexOf('<!-- Examples -->'));

describe('Table Variants tab matches the design', () => {
  it('has only Displaying missing data and Session row, with the two session row examples', () => {
    expect([...variants.matchAll(/<h([234]) class="nhsw-h\1">([^<]*)<\/h\1>/g)].map((m) => m[2])).toEqual([
      'Table variants', 'Displaying missing data', 'Session row', 'Standard session row', 'Session row with location',
    ]);
  });

  it('names the secondary text colour utility and styles it dark grey', () => {
    expect(variants).toContain('nhsw-u-secondary-text-colour</code> modifier class');
    expect(block(compileProbe('@use "components/content/typography";'), '\.nhsw-u-secondary-text-colour')).toMatch(/color:\s*#4c6272/);
  });

  it('ends with Back to top', () => {
    expect(variants).toContain('Back to top</a></p>');
  });
});
