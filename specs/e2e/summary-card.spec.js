const { test, expect } = require('@playwright/test');

test.describe('Summary cards', () => {
  test('in the grouped example every sub header has a white background, like the card header', async ({ page }) => {
    await page.goto('/examples/summary-cards-grouped.html');
    const subheaders = page.locator('.nhsw-summary-card__subheader');
    expect(await subheaders.count()).toBeGreaterThanOrEqual(2);
    const colours = await subheaders.evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
    expect(new Set(colours)).toEqual(new Set(['rgb(255, 255, 255)']));
  });

  test('the body has equal padding on the top, bottom, left and right', async ({ page }) => {
    await page.goto('/examples/summary-cards-grouped.html');
    const padding = await page.locator('.nhsw-summary-card__body').first().evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.paddingTop, s.paddingBottom, s.paddingLeft, s.paddingRight];
    });
    expect(padding).toEqual(['24px', '24px', '24px', '24px']);
  });
});
