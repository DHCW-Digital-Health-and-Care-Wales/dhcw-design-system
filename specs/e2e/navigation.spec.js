const { test, expect } = require('@playwright/test');

test.describe('Primary navigation active state', () => {
  const cases = [
    { url: '/components/checkboxes.html', label: 'Components' },
    { url: '/components/action-link.html', label: 'Components' },
    { url: '/components/header.html', label: 'Components' },
    { url: '/testing/checkboxes.html', label: 'Components' },
    { url: '/get-started/index.html', label: 'Get started' },
    { url: '/get-started/prototyping.html', label: 'Get started' },
    { url: '/content-guide.html', label: 'Content guide' },
    { url: '/styles.html', label: 'Styles' },
    { url: '/patterns.html', label: 'Patterns' },
    { url: '/workshop/demo.html', label: 'Community and contribution' },
  ];

  for (const { url, label } of cases) {
    test(`${url} marks "${label}" as the current nav tab, and only that one`, async ({ page }) => {
      await page.goto(url);
      const current = page.locator('.nhsw-site-header__nav-link--current');
      await expect(current).toHaveCount(1);
      await expect(current).toContainText(label);
    });
  }

  const noActiveTabPages = [
    '/contact-us.html',
    '/terms-of-use.html',
    '/cookie-policy.html',
    '/privacy-policy.html',
    '/accessibility-statement.html',
    '/site-map.html',
  ];

  for (const url of noActiveTabPages) {
    test(`${url} has no active nav tab (it isn't part of any top-level section)`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveCount(0);
    });
  }
});

test.describe('Breadcrumbs', () => {
  test('a Get started sub-page shows only its ancestors, not the current page', async ({ page }) => {
    await page.goto('/get-started/prototyping.html');
    const crumbs = page.locator('.nhsw-breadcrumb__list-item');
    await expect(crumbs).toHaveCount(1);
    await expect(crumbs.nth(0)).toContainText('Home');
    await expect(page.locator('.nhsw-breadcrumb')).not.toContainText('Prototyping');
  });

  test('a legal page shows only its ancestors, not the current page', async ({ page }) => {
    await page.goto('/contact-us.html');
    const crumbs = page.locator('.nhsw-breadcrumb__list-item');
    await expect(crumbs).toHaveCount(1);
    await expect(page.locator('.nhsw-breadcrumb')).not.toContainText('Contact us');
  });
});
