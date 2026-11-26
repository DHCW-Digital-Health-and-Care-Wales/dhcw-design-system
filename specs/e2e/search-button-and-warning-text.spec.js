const { test, expect } = require('@playwright/test');

test('the header search button turns pale blue with a navy magnifying glass on hover', async ({ page }) => {
  await page.goto('/examples/header-default.html');
  const button = page.locator('.nhsw-site-header__search-button').first();
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(237, 244, 250)');
  const glass = await button.evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
  expect(glass).toBe('rgb(27, 54, 93)');
});

for (const width of [375, 1440]) {
  test(`a one line warning is level with its icon at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/examples/warning-callout-text.html');
    await page.locator('.nhsw-warning-text__text').first().evaluate((el) => {
      el.lastChild.textContent = 'Check the date';
    });
    const middles = await page.locator('.nhsw-warning-text').first().evaluate((el) => {
      const middle = (rect) => rect.top + rect.height / 2;
      const range = document.createRange();
      range.selectNodeContents(el.querySelector('.nhsw-warning-text__text').lastChild);
      return { icon: middle(el.querySelector('.nhsw-warning-text__icon').getBoundingClientRect()), text: middle(range.getBoundingClientRect()) };
    });
    expect(Math.abs(middles.icon - middles.text)).toBeLessThanOrEqual(1.5);
  });
}
