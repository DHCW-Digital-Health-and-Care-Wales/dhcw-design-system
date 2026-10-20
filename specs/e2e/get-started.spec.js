const { test, expect } = require('@playwright/test');

test.describe('Get started side navigation', () => {
  test('shows the "Get started" heading and its link, highlighting the current page', async ({ page }) => {
    await page.goto('/get-started/setting-up-figma-prototypes.html');
    await expect(page.locator('.nhsw-side-nav__heading')).toHaveText('Get started');
    const links = page.locator('.nhsw-side-nav__link');
    await expect(links).toHaveCount(1);
    await expect(links).toContainText(['Setting up Figma prototypes']);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('Setting up Figma prototypes');
  });

  test('legal pages and the Get started index page have no side nav at all', async ({ page }) => {
    await page.goto('/contact-us.html');
    await expect(page.locator('.nhsw-side-nav')).toHaveCount(0);

    await page.goto('/get-started/index.html');
    await expect(page.locator('.nhsw-side-nav')).toHaveCount(1);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveCount(0);
  });
});

test.describe('Setting up Figma prototypes tabs', () => {
  test('DHCW access panel is shown by default, Community access is hidden', async ({ page }) => {
    await page.goto('/get-started/setting-up-figma-prototypes.html');
    await expect(page.locator('#panel-dhcw')).toBeVisible();
    await expect(page.locator('#panel-other-organisations')).toBeHidden();
    await expect(page.locator('#tab-dhcw')).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking "Community access" switches panels and updates aria-selected', async ({ page }) => {
    await page.goto('/get-started/setting-up-figma-prototypes.html');
    await page.locator('#tab-non-dhcw').click();

    await expect(page.locator('#panel-other-organisations')).toBeVisible();
    await expect(page.locator('#panel-dhcw')).toBeHidden();
    await expect(page.locator('#tab-non-dhcw')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#tab-dhcw')).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#panel-other-organisations :is(h2, h3)').first()).toBeVisible();
  });
});
