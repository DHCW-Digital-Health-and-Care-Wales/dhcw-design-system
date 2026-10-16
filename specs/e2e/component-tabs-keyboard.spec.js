const { test, expect } = require('@playwright/test');

test.describe('Component page tabs (How to use / Variants / Examples) work with the keyboard alone', () => {
  test.use({ viewport: { width: 1200, height: 900 } });

  test('the arrow, Home and End keys move between the tabs and show the matching panel', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    await page.locator('#tab-how-to-use').focus();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-variants')).toBeFocused();
    await expect(page.locator('#panel-variants')).toBeVisible();

    await page.keyboard.press('End');
    await expect(page.locator('#tab-examples')).toBeFocused();
    await expect(page.locator('#panel-examples')).toBeVisible();

    await page.keyboard.press('Home');
    await expect(page.locator('#tab-how-to-use')).toBeFocused();
    await expect(page.locator('#panel-how-to-use')).toBeVisible();
  });

  test('Enter and Space activate a tab that has focus', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    await page.locator('#tab-variants').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#panel-variants')).toBeVisible();
    await page.locator('#tab-examples').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#panel-examples')).toBeVisible();
  });

  test('the focused tab has a visible yellow focus highlight', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    await page.locator('#tab-how-to-use').focus();
    await page.keyboard.press('ArrowRight');
    const text = page.locator('#tab-variants .nhsw-tabs__tab-text');
    await expect(text).toHaveCSS('background-color', 'rgb(255, 235, 59)');
  });

  test('the page that opens from "Open this example in a new tab" is titled "Example - name - DHCW Design System"', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    const link = page.getByRole('link', { name: 'Open this example in a new tab' }).first();
    const href = await link.getAttribute('href');
    await page.goto(href);
    await expect(page).toHaveTitle(/^Example - .+ - DHCW Design System$/);
    await page.goto('/examples/checkboxes-none.html');
    await expect(page).toHaveTitle('Example - Checkboxes with none option - DHCW Design System');
  });

  test('every component page puts the tab label in the span the focus style relies on', async ({ page }) => {
    for (const slug of ['action-link', 'tabs', 'warning-callout']) {
      await page.goto(`/components/${slug}.html`);
      for (const id of ['how-to-use', 'variants', 'examples']) {
        await expect(page.locator(`#tab-${id} > .nhsw-tabs__tab-text`)).toHaveCount(1);
      }
    }
  });
});
