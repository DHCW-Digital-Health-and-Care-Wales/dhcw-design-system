const { test, expect } = require('@playwright/test');

test.describe('Breadcrumb', () => {
  test('every breadcrumb item is a real link, on the doc page', async ({ page }) => {
    await page.goto('/components/breadcrumbs.html');
    const items = page.locator('.nhsw-breadcrumb .nhsw-breadcrumb__list-item');
    await expect(items.first()).toBeVisible();
    const count = await items.count();
    for (let i = 0; i < count; i += 1) {
      await expect(items.nth(i).locator('a.nhsw-breadcrumb__link')).toHaveCount(1);
    }
  });

  const pagesWithoutCurrentPage = [
    '/components/breadcrumbs.html',
    '/examples/breadcrumb-default.html',
    '/examples/breadcrumb-dark.html',
    '/testing/breadcrumbs.html',
  ];

  for (const url of pagesWithoutCurrentPage) {
    test(`${url} never renders a non-link "current page" breadcrumb item`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('.nhsw-breadcrumb__current')).toHaveCount(0);
      await expect(page.locator('.nhsw-breadcrumb [aria-current="page"]')).toHaveCount(0);
    });
  }
});
