const { test, expect } = require('@playwright/test');

test.describe('Site header brand', () => {
  test('logo and a long, wrapped title stay vertically centred against each other', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 300 });
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

  test('search box is never hidden: on a narrow screen it wraps onto its own row at the full width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto('/examples/header-default.html');

    const search = page.locator('.nhsw-site-header__search').last();
    await expect(search).toBeVisible();
    const [brand, box, container] = await Promise.all([
      page.locator('.nhsw-site-header__brand').last().boundingBox(),
      search.boundingBox(),
      page.locator('.nhsw-site-header__top').last().boundingBox(),
    ]);
    expect(box.y).toBeGreaterThanOrEqual(brand.y + brand.height - 1);
    expect(Math.round(box.width)).toBe(Math.round(container.width));
  });

  test('on a wide screen the search sits beside the logo and service name, which take the remaining space', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/examples/header-default.html');

    const [brand, search] = await Promise.all([
      page.locator('.nhsw-site-header__brand').last().boundingBox(),
      page.locator('.nhsw-site-header__search').last().boundingBox(),
    ]);
    expect(search.x).toBeGreaterThanOrEqual(brand.x + brand.width);
    expect(Math.abs(search.y + search.height / 2 - (brand.y + brand.height / 2))).toBeLessThan(2);
  });

  test('the search box wraps below the service name as the window narrows, and is visible at every width', async ({ page }) => {
    await page.goto('/examples/header-default.html');
    for (const width of [1280, 900, 700, 641, 500, 390, 320]) {
      await page.setViewportSize({ width, height: 600 });
      await expect(page.locator('.nhsw-site-header__search').last(), `${width}px`).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `no sideways scroll at ${width}px`).toBeLessThanOrEqual(width);
    }
  });

  test('the logo keeps its 80px height and shrinks only when the screen is narrower than the logo', async ({ page }) => {
    await page.goto('/examples/header-default.html');

    await page.setViewportSize({ width: 1100, height: 600 });
    const wide = await page.locator('.nhsw-site-header__logo img').last().boundingBox();
    expect(Math.round(wide.height)).toBe(80);
    expect(Math.round(wide.width)).toBeGreaterThan(200);

    await page.setViewportSize({ width: 200, height: 600 });
    const narrow = await page.locator('.nhsw-site-header__logo img').last().boundingBox();
    const container = await page.locator('.nhsw-site-header__top').last().boundingBox();
    expect(narrow.width).toBeLessThanOrEqual(container.width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(200);
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
