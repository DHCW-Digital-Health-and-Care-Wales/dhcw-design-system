const { test, expect } = require('@playwright/test');

test.describe('space between a label or legend and its hint', () => {
  for (const [name, url, selector, expected] of [
    ['label', '/examples/input-hint.html', '.nhsw-label', 4],
    ['legend', '/examples/checkboxes-hints.html', '.nhsw-fieldset__legend', 16],
  ]) {
    test(`${name} to hint is ${expected}px`, async ({ page }) => {
      await page.goto(url);
      const gap = await page.evaluate((sel) => {
        const head = document.querySelector(`${sel}:has(+ .nhsw-hint)`);
        if (!head) return null;
        return document.querySelector(`${sel}:has(+ .nhsw-hint) + .nhsw-hint`).getBoundingClientRect().top - head.getBoundingClientRect().bottom;
      }, selector);
      expect(gap).toBe(expected);
    });
  }

  test('hint to input is 8px', async ({ page }) => {
    await page.goto('/examples/input-hint.html');
    const gap = await page.evaluate(() => {
      const hint = document.querySelector('.nhsw-label + .nhsw-hint');
      return hint.nextElementSibling.getBoundingClientRect().top - hint.getBoundingClientRect().bottom;
    });
    expect(gap).toBe(8);
  });
});
