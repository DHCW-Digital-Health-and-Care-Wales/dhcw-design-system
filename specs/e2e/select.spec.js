const { test, expect } = require('@playwright/test');

test.describe('Select with long options', () => {
  for (const width of [1100, 700, 320]) {
    test(`stays inside its container, and the page does not scroll sideways, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/testing/select.html');

      // the fixture for "Long selected values remain readable" puts an extra large select in a 200px column
      const fixture = page.locator('#select-manual-9').locator('xpath=ancestor::div[contains(@class,"nhsw-checkboxes__item")]');
      const select = fixture.locator('select');
      const column = fixture.locator('select').locator('xpath=ancestor::div[@style][1]');

      const selectBox = await select.boundingBox();
      const columnBox = await column.boundingBox();
      expect(selectBox.x + selectBox.width).toBeLessThanOrEqual(columnBox.x + columnBox.width + 0.5);

      const scrollsSideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(scrollsSideways).toBe(false);
    });
  }

  test('shows the whole selected value in the long-values fixture when the screen is wide enough', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto('/testing/select.html');

    const select = page.locator('#select-xl-select-s9');
    const fit = await select.evaluate((el) => {
      const style = getComputedStyle(el);
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const textWidth = context.measureText(el.options[el.selectedIndex].text).width;
      const room = el.getBoundingClientRect().width
        - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
        - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
      return { textWidth, room };
    });
    expect(fit.room).toBeGreaterThanOrEqual(fit.textWidth);
  });

  test('keeps its full size when there is room for it', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto('/examples/select-widths.html');

    const widths = await page.locator('select.nhsw-select').evaluateAll((selects) => selects.map((s) => Math.round(s.getBoundingClientRect().width)));
    expect(widths.some((w) => w >= 192)).toBe(true);
  });
});
