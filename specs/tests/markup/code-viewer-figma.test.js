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
