const { test, expect } = require('@playwright/test');

test.describe('Beta banner', () => {
  for (const url of ['/index.html', '/get-started/index.html', '/components/tag.html', '/styles/colours.html', '/patterns/page-templates.html', '/privacy-policy.html']) {
    test(`${url} shows the Beta banner directly under the primary navigation`, async ({ page }) => {
      await page.goto(url);
      const banner = page.locator('.nhsw-phase-banner').first();
      await expect(banner).toBeVisible();
      await expect(banner.locator('.nhsw-phase-banner__tag')).toHaveText('Beta');
      await expect(banner).toContainText('This is a new service. Your feedback will help us improve it.');
      await expect(banner.getByRole('link', { name: 'feedback' })).toBeVisible();

      const navBottom = await page.locator('.nhsw-site-header__nav').evaluate((el) => el.getBoundingClientRect().bottom);
      const bannerTop = await banner.evaluate((el) => el.getBoundingClientRect().top);
      expect(bannerTop).toBeGreaterThanOrEqual(navBottom - 1);
    });
  }

  test('is not shown on a bare example page', async ({ page }) => {
    await page.goto('/examples/page-template-one-half.html');
    await expect(page.locator('.nhsw-phase-banner:not(.nhsw-phase-banner--reverse)')).toHaveCount(0);
  });
});

test.describe('Page templates side navigation', () => {
  test('Page templates is current and lists its two sections underneath, with the Patterns tab highlighted', async ({ page }) => {
    await page.goto('/patterns/page-templates.html');
    const current = page.locator('.nhsw-side-nav__link--current');
    await expect(current).toHaveText('Page templates');
    await expect(current).toHaveAttribute('aria-current', 'page');

    const sub = page.locator('.nhsw-side-nav__sublist a');
    await expect(sub).toHaveText(['— Public facing page template', '— Dashboard page template']);
    await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveText('Patterns');
  });

  test('the sections the side navigation points to exist on the page', async ({ page }) => {
    await page.goto('/patterns/page-templates.html');
    await page.getByRole('link', { name: '— Dashboard page template' }).click();
    await expect(page.locator('#dashboard-page-templates')).toBeInViewport();
  });

  test('other pages in the section do not expand the Page templates entry', async ({ page }) => {
    await page.goto('/styles/colours.html');
    await expect(page.locator('.nhsw-side-nav__sublist')).toHaveCount(0);
  });
});

test.describe('Page template previews', () => {
  test('each of the nine templates is previewed in a frame with an open-in-new-tab link', async ({ page }) => {
    await page.goto('/patterns/page-templates.html');
    await expect(page.locator('iframe.nhsw-example-preview__frame')).toHaveCount(9);
    await expect(page.getByRole('link', { name: 'Open this example in a new tab' })).toHaveCount(9);
  });

  test('the public-facing templates show an Alpha banner, signed-in user and a service navigation with counts', async ({ page }) => {
    await page.goto('/examples/page-template-full-width.html');
    await expect(page.locator('.nhsw-phase-banner--reverse .nhsw-phase-banner__tag')).toHaveText('Alpha');
    await expect(page.locator('.nhsw-site-header__user-name')).toHaveText('Jane Doe');
    await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
    await expect(page.locator('.nhsw-site-header__nav-badge')).toHaveText(['5', '4', '0']);
    await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveText('Sessions');
  });

  test('the dashboard templates put the navigation on the left and the top bar above the content', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/examples/page-template-dashboard-default.html');
    const sidebar = await page.locator('.nhsw-dashboard__sidebar').boundingBox();
    const main = await page.locator('.nhsw-dashboard__main').boundingBox();
    expect(sidebar.width).toBeCloseTo(240, 0);
    expect(main.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width - 1);
    const bar = await page.locator('.nhsw-dashboard__topbar').boundingBox();
    const content = await page.locator('.nhsw-dashboard__content').boundingBox();
    expect(bar.y + bar.height).toBeLessThanOrEqual(content.y + 1);
  });

  test('the dashboard stacks the navigation above the content on a small screen', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/examples/page-template-dashboard-default.html');
    const sidebar = await page.locator('.nhsw-dashboard__sidebar').boundingBox();
    const main = await page.locator('.nhsw-dashboard__main').boundingBox();
    expect(main.y).toBeGreaterThanOrEqual(sidebar.y + sidebar.height - 1);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(400);
  });
});
