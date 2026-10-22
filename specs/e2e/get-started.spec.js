const { test, expect } = require('@playwright/test');

test.describe('Start prototyping side navigation', () => {
  test('shows the "Start prototyping" heading and its link, highlighting the current page', async ({ page }) => {
    await page.goto('/get-started/setting-up-figma-prototypes.html');
    await expect(page.locator('.nhsw-side-nav__heading')).toHaveText('Start prototyping');
    const links = page.locator('.nhsw-side-nav__link');
    await expect(links).toHaveText(['Start prototyping', 'Set up a Figma prototype']);
    await expect(links.first()).toHaveAttribute('href', /get-started\/start-prototyping\.html$/);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('Set up a Figma prototype');
  });

  test('legal pages have no side nav, and the Start prototyping index page highlights "Start prototyping"', async ({ page }) => {
    await page.goto('/contact-us.html');
    await expect(page.locator('.nhsw-side-nav')).toHaveCount(0);

    await page.goto('/get-started/start-prototyping.html');
    await expect(page.locator('.nhsw-side-nav')).toHaveCount(1);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('Start prototyping');
  });
});

test.describe('Getting back to Start prototyping', () => {
  test('the "Start prototyping" link in the menu returns from Set up a Figma prototype', async ({ page }) => {
    await page.goto('/get-started/setting-up-figma-prototypes.html');
    await page.locator('.nhsw-side-nav__link', { hasText: /^Start prototyping$/ }).click();
    await expect(page).toHaveURL(/get-started\/start-prototyping\.html$/);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('Start prototyping');
  });
});

test.describe('Set up a Figma prototype tabs', () => {
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
