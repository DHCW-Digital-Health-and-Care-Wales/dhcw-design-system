const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

// Systematic backstop for the hand-picked a11y checks elsewhere in this
// suite (specific contrast pairs, specific focus states): runs the full
// axe-core ruleset (WCAG 2.0/2.1 A+AA) against every rendered page, so
// issues nobody thought to assert individually still get caught.
const SITE_DIR = path.join(__dirname, '..', '..', 'preview', '_site_test');

function listRenderedPages() {
  const results = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(entry.name)) results.push(path.relative(SITE_DIR, full).split(path.sep).join('/'));
    }
  })(SITE_DIR);
  return results;
}

const pages = listRenderedPages();

function describeViolations(violations) {
  return violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)
    .join('\n\n');
}

test.describe('Automated accessibility scan (axe-core, WCAG 2.1 A+AA)', () => {
  for (const relPath of pages) {
    test(`${relPath} has no axe violations`, async ({ page }) => {
      await page.goto('/' + relPath);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations, describeViolations(results.violations)).toEqual([]);
    });
  }
});
