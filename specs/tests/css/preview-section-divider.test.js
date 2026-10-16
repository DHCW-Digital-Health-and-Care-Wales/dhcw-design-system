import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe, block } from '../support/compile-scss.js';

const root = path.resolve(import.meta.dirname, '../../..');
const css = compileProbe('@use "components/content/code-viewer";');

describe('divider after the examples in a variants section', () => {
  it('a preview section has a divider line by default, except the last one', () => {
    expect(block(css, '\\.preview-section')).toMatch(/border-bottom:\s*1px solid #d8dde0/);
    expect(block(css, '\\.preview-section:last-child')).toMatch(/border-bottom:\s*none/);
  });

  it('--no-divider removes the line and the extra space after the examples', () => {
    const rule = block(css, '\\.preview-section--no-divider');
    expect(rule).toMatch(/border-bottom:\s*none/);
    expect(rule).toMatch(/margin-bottom:\s*0/);
    expect(rule).toMatch(/padding-bottom:\s*0/);
    expect(block(css, '\\.preview-section')).toMatch(/margin-bottom:\s*48px/);
  });

  it('every variants section on the notification banner page uses it', () => {
    const page = fs.readFileSync(path.join(root, 'preview/components/notification-banner.html'), 'utf8');
    const sections = page.match(/<section class="preview-section[^"]*">/g) || [];
    expect(sections.length).toBeGreaterThan(0);
    for (const tag of sections) expect(tag).toContain('preview-section--no-divider');
  });
});
