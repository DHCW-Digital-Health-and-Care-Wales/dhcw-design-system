const { test, expect } = require('@playwright/test');

test.describe('Inputs do not resize on focus', () => {
  const cases = [
    { name: 'text input', url: '/examples/input-hint.html', selector: '.nhsw-input' },
    { name: 'select', url: '/examples/select-hint.html', selector: '.nhsw-select' },
    { name: 'textarea', url: '/examples/textarea-default.html', selector: '.nhsw-textarea' },
    { name: 'date input segment', url: '/examples/date-input-default.html', selector: '.nhsw-date-input .nhsw-input' },
  ];

  for (const { name, url, selector } of cases) {
    test(`${name} keeps the same bounding box before and after focus`, async ({ page }) => {
      await page.goto(url);
      const field = page.locator(selector).first();

      const before = await field.boundingBox();
      await field.focus();
      const after = await field.boundingBox();

      expect(after.width).toBe(before.width);
      expect(after.height).toBe(before.height);
      expect(after.x).toBe(before.x);
      expect(after.y).toBe(before.y);
    });
  }
});

test.describe('Prefix/suffix input focus ring', () => {
  test('a focused input with a prefix and suffix paints its outline above the suffix, not underneath it', async ({ page }) => {
    await page.goto('/examples/input-prefix-suffix.html');
    const input = page.locator('.nhsw-input-wrapper .nhsw-input');
    await input.focus();

    const style = await input.evaluate((el) => {
      const s = getComputedStyle(el);
      return { position: s.position, zIndex: s.zIndex };
    });
    expect(style.position).toBe('relative');
    expect(style.zIndex).toBe('1');

    const inputBox = await input.boundingBox();
    const topElement = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y) === document.activeElement,
      { x: inputBox.x + inputBox.width - 1, y: inputBox.y + inputBox.height / 2 },
    );
    expect(topElement).toBe(true);
  });
});
