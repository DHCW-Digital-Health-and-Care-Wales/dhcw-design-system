import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('agent configuration protects the written content of existing pages', () => {
  it('CLAUDE.md says not to change existing page content unless asked, and not as a side effect', () => {
    const text = read('CLAUDE.md');
    expect(text).toContain('## Existing page content');
    expect(text).toMatch(/Do not change the written content of existing pages unless you are explicitly asked/);
    expect(text).toMatch(/not do it as a side effect of another task/);
    expect(text).toMatch(/outside the example areas/);
  });

  it('CLAUDE.md says to report wording that looks wrong instead of editing it', () => {
    expect(read('CLAUDE.md')).toMatch(/say so in your summary instead of editing it/);
  });

  it('the design system rules list it under "Do not"', () => {
    const rules = read('.agent/design-system-rules.md');
    const doNot = rules.slice(rules.indexOf('## Do not'), rules.indexOf('## Accessibility rules'));
    expect(doNot).toMatch(/Change the written content of existing pages/);
    expect(doNot).toMatch(/Report wording you think is wrong instead of editing it/);
  });
});
