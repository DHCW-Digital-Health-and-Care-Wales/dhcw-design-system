const { test, expect } = require('@playwright/test');

test.describe('16px between a label or legend and its hint', () => {
  for (const [name, url, selector] of [
    ['label', '/examples/input-hint.html', '.nhsw-label'],
    ['legend', '/examples/checkboxes-hints.html', '.nhsw-fieldset__legend'],
  ]) {
    test(`${name} to hint`, async ({ page }) => {
      await page.goto(url);
      const gap = await page.evaluate((sel) => {
        const head = document.querySelector(`${sel}:has(+ .nhsw-hint)`);
        if (!head) return null;
        return document.querySelector(`${sel}:has(+ .nhsw-hint) + .nhsw-hint`).getBoundingClientRect().top - head.getBoundingClientRect().bottom;
      }, selector);
      expect(gap).toBe(16);
    });
  }
});
