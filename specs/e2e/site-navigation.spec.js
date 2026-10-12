const { test, expect } = require('@playwright/test');

const NAV = '.nhsw-site-header__nav';
const barLinks = (page) => page.locator(`${NAV} .nhsw-site-header__nav-list > li:not(.nhsw-site-header__menu) a`);
const menuLinks = (page) => page.locator(`${NAV} .nhsw-site-header__menu-list a`);
const toggle = (page) => page.locator(`${NAV} .nhsw-site-header__menu-toggle`);

test.describe('Site navigation by default: unchanged, hidden on small screens', () => {
  test('shows all of the items on a wide screen, with no "More" button', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/examples/site-navigation-default.html');

    await expect(barLinks(page)).toHaveCount(3);
    await expect(toggle(page)).toHaveCount(0);
  });

  test('is hidden on a small screen, as before', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/examples/site-navigation-default.html');

    await expect(page.locator(NAV)).toBeHidden();
  });
});

test.describe('Site navigation inside the example boxes on the component page', () => {
  test.use({ viewport: { width: 320, height: 700 } });

  test('stays in view when the window is narrow, instead of vanishing', async ({ page }) => {
    await page.goto('/site/site-navigation.html');

    const demo = page.locator('#panel-how-to-use .nhsw-example-preview__body .nhsw-site-header__nav').first();
    await expect(demo).toBeVisible();
    await expect(demo.locator('.nhsw-site-header__nav-link').first()).toBeVisible();
  });

  test('the example opened in a new tab is the real component, so it is hidden on a small screen', async ({ page }) => {
    await page.goto('/examples/site-navigation-default.html');
    await expect(page.locator(NAV)).toBeHidden();
  });
});

test.describe('Site navigation overflow menu variant on a wide screen', () => {
  test.use({ viewport: { width: 1000, height: 700 } });

  test('shows every item in the bar and no "More" button', async ({ page }) => {
    await page.goto('/examples/site-navigation-overflow.html');

    await expect(barLinks(page)).toHaveCount(3);
    await expect(toggle(page)).toBeHidden();
    await expect(menuLinks(page)).toHaveCount(0);
  });
});

test.describe('Site navigation overflow menu variant at 400% zoom (a 320px wide viewport)', () => {
  test.use({ viewport: { width: 320, height: 700 } });

  test('is still there: every item is reachable through the "More" menu, with no sideways scrolling', async ({ page }) => {
    await page.goto('/examples/site-navigation-overflow.html');

    await expect(page.locator(NAV)).toBeVisible();
    await expect(toggle(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(menuLinks(page)).toHaveText(['Navigation Item 1', 'Navigation Item 2', 'Navigation Item 3']);
    for (const link of await menuLinks(page).all()) {
      await expect(link).toBeVisible();
    }

    const scrollsSideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(scrollsSideways).toBe(false);
  });

  test('marks the current page in the menu and closes with Escape, returning focus to the button', async ({ page }) => {
    await page.goto('/examples/site-navigation-overflow.html');

    await toggle(page).click();
    await expect(menuLinks(page).first()).toHaveAttribute('aria-current', 'page');

    await menuLinks(page).nth(1).focus();
    await page.keyboard.press('Escape');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toBeFocused();
    await expect(menuLinks(page).first()).toBeHidden();
  });

  test('can be used from the keyboard alone', async ({ page }) => {
    await page.goto('/examples/site-navigation-overflow.html');

    await toggle(page).focus();
    await page.keyboard.press('Enter');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Tab');
    await expect(menuLinks(page).first()).toBeFocused();
  });

  test('an open menu pushes the content below it down instead of covering it', async ({ page }) => {
    await page.goto('/examples/site-navigation-overflow.html');

    const nav = page.locator(NAV);
    const before = (await nav.boundingBox()).height;
    await toggle(page).click();
    const after = (await nav.boundingBox()).height;
    expect(after).toBeGreaterThan(before);
  });

  test('the variant shown in the component page example box works there too', async ({ page }) => {
    await page.goto('/site/site-navigation.html');

    const demo = page.locator('#sn-overflow, .nhsw-example-preview__body:has(.nhsw-site-header__nav--overflow)').first();
    const nav = demo.locator('.nhsw-site-header__nav--overflow');
    await expect(nav).toBeVisible();
    await nav.locator('.nhsw-site-header__menu-toggle').click();
    await expect(nav.locator('.nhsw-site-header__menu-list a').first()).toBeVisible();
  });
});

test.describe('Site navigation overflow menu variant follows the available width', () => {
  test('moves items into "More" as the window narrows, and back as it widens', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/examples/site-navigation-overflow.html');
    await expect(barLinks(page)).toHaveCount(3);

    await page.setViewportSize({ width: 320, height: 700 });
    await expect(toggle(page)).toBeVisible();
    await expect(barLinks(page)).toHaveCount(0);

    await page.setViewportSize({ width: 1000, height: 700 });
    await expect(toggle(page)).toBeHidden();
    await expect(barLinks(page)).toHaveCount(3);
  });
});
