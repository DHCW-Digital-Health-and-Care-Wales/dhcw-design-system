import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const include = fs.readFileSync(path.join(root, 'preview/_includes/example-preview.html'), 'utf8');

describe('example preview footer', () => {
  it('has an HTML button and a Nunjucks button that open the same code viewer on their own tab', () => {
    expect(include).toMatch(/data-toggle="code-\{\{ include\.id \}\}" data-tab="html"[^>]*aria-expanded="false">HTML<\/button>/);
    expect(include).toMatch(/data-toggle="code-\{\{ include\.id \}\}" data-tab="njk"[^>]*aria-expanded="false">Nunjucks<\/button>/);
  });

  it('no longer offers Figma or a bare # link', () => {
    expect(include).not.toMatch(/Figma/);
    expect(include).not.toMatch(/footer-button" href="#"/);
  });
});
