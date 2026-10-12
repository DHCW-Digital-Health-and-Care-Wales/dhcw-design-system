const { test, expect } = require('@playwright/test');

test.describe('Site header brand', () => {
  test('logo and a long, wrapped title stay vertically centred against each other', async ({ page }) => {
    await page.setViewportSize({ width: 750, height: 300 });
    await page.goto('/examples/header-default.html');

    const title = page.locator('.nhsw-site-header__title').last();
    await title.evaluate((el) => {
      el.textContent = 'Digital Health and Care Wales Long Organisation Name Example';
    });

    const [logoBox, titleBox] = await Promise.all([
      page.locator('.nhsw-site-header__logo').last().boundingBox(),
      title.boundingBox(),
    ]);

    expect(titleBox.height).toBeGreaterThan(logoBox.height);
    const logoCentre = logoBox.y + logoBox.height / 2;
    const titleCentre = titleBox.y + titleBox.height / 2;
    expect(Math.abs(logoCentre - titleCentre)).toBeLessThan(2);
  });

  test('search box is hidden below the mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 300 });
    await page.goto('/examples/header-default.html');

    await expect(page.locator('.nhsw-site-header__search').last()).toBeHidden();
  });

  test('search box is visible above the mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 300 });
    await page.goto('/examples/header-default.html');

    await expect(page.locator('.nhsw-site-header__search').last()).toBeVisible();
  });
});

test.describe('Site header search focus ring', () => {
  test('the focus ring is not obscured by the adjacent search button', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 300 });
    await page.goto('/examples/header-default.html');

    const input = page.locator('.nhsw-site-header__search-input').last();
    await input.focus();

    const inputBox = await input.boundingBox();
    const topElement = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y) === document.activeElement,
      { x: inputBox.x + inputBox.width - 1, y: inputBox.y + inputBox.height / 2 },
    );
    expect(topElement).toBe(true);
  });
});

test.describe('Site navigation tag spacing', () => {
  test('a nav item’s tag sits 0.8rem (12.8px) to the right of the link text', async ({ page }) => {
    await page.goto('/examples/site-navigation-tag.html');

    const badge = page.locator('.nhsw-site-header__nav-badge').last();
    const marginLeft = await badge.evaluate((el) => getComputedStyle(el).marginLeft);
    expect(marginLeft).toBe('12.8px');
  });
});
