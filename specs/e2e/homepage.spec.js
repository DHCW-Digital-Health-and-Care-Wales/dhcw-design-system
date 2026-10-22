const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('shows the hero title and a "Start prototyping" button linking to the Start prototyping section', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Design and build accessible digital services');
    const getStarted = page.locator('.nhsw-site-header__hero a.nhsw-button');
    await expect(getStarted).toHaveAttribute('href', '/get-started/start-prototyping.html');
  });

  test('"What\'s new" shows exactly 3 section cards, not 6', async ({ page }) => {
    await page.goto('/index.html');
    const cards = page.locator('section[aria-label="Design system sections"] .nhsw-card');
    await expect(cards).toHaveCount(3);
    await expect(cards).toContainText(['Design principles', 'Styles', 'Components']);
  });

  test('closing section is titled "Support", not "Contact us"', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#support-heading')).toHaveText('Support');
    await expect(page.locator('#contact-heading')).toHaveCount(0);
  });

  test('has no active tab in the primary nav (the homepage is not any single nav section)', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveCount(0);
  });

  test('footer includes the full licence row with all 5 links', async ({ page }) => {
    await page.goto('/index.html');
    const footerLinks = page.locator('.nhsw-site-footer__links a');
    await expect(footerLinks).toHaveCount(5);
    const badge = page.locator('.nhsw-site-footer__licence-badge');
    await expect(badge).toBeVisible();
    expect(await badge.evaluate((el) => el.tagName.toLowerCase()), 'the OGL logo is inline SVG, so it cannot be a broken file reference').toBe('svg');
    await expect(badge.locator('path')).toHaveCount(1);
  });
});
