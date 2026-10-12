const { test, expect } = require('@playwright/test');

test.describe('Summary card', () => {
  test('has a white background and no bottom border under the header when it has a title', async ({ page }) => {
    await page.goto('/examples/summary-card-actions.html');

    const card = page.locator('.nhsw-summary-card').first();
    const header = page.locator('.nhsw-summary-card__header').first();

    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(header).toHaveCSS('border-bottom-width', '0px');
  });

  test('has a transparent background when it has no title/header', async ({ page }) => {
    await page.goto('/examples/summary-card-actions.html');

    await page.evaluate(() => {
      const card = document.querySelector('.nhsw-summary-card');
      const noHeaderCard = document.createElement('div');
      noHeaderCard.className = 'nhsw-summary-card nhsw-summary-card--test-no-header';
      noHeaderCard.innerHTML = '<div class="nhsw-summary-card__body"><dl class="nhsw-summary-list"><div class="nhsw-summary-list__row"><dt class="nhsw-summary-list__key">Key</dt><dd class="nhsw-summary-list__value">Value</dd></div></dl></div>';
      card.after(noHeaderCard);
    });

    const noHeaderCard = page.locator('.nhsw-summary-card--test-no-header');
    await expect(noHeaderCard).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });
});
