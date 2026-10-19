const { test, expect } = require('@playwright/test');

test('a focused invalid text input swaps the red border for near-black and shows the yellow outline', async ({ page }) => {
  await page.goto('/examples/input-hint.html');
  const style = await page.evaluate(() => {
    const el = document.querySelector('.nhsw-input');
    el.setAttribute('aria-invalid', 'true');
    el.focus();
    const s = getComputedStyle(el);
    return { border: s.borderTopColor, shadow: s.boxShadow, outline: s.outlineColor };
  });
  expect(style.border).toBe('rgb(33, 43, 50)');
  expect(style.shadow).toContain('rgb(33, 43, 50)');
  expect(style.shadow).not.toContain('rgb(213, 40, 27)');
  expect(style.outline).not.toBe('rgb(213, 40, 27)');
});

test('a file upload in an error group keeps its normal border colour', async ({ page }) => {
  await page.goto('/examples/file-upload-default.html');
  const colours = await page.evaluate(() => {
    const box = document.querySelector('.nhsw-file-upload');
    const before = getComputedStyle(box).borderTopColor;
    box.closest('.nhsw-form-group, body').classList.add('nhsw-form-group--error');
    return [before, getComputedStyle(box).borderTopColor];
  });
  expect(colours[1]).toBe(colours[0]);
});
