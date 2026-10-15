const { test, expect } = require('@playwright/test');

const items = ['All Styles', 'Colours', 'Branding', 'Icons', 'Layout', 'Page templates', 'Typography', 'WCAG 2.2 Guidance'];

const pages = [
  { url: '/styles.html', current: 'All Styles' },
  { url: '/styles/colours.html', current: 'Colours' },
  { url: '/styles/branding.html', current: 'Branding' },
  { url: '/styles/icons.html', current: 'Icons' },
  { url: '/styles/layout.html', current: 'Layout' },
  { url: '/patterns/page-templates.html', current: 'Page templates' },
  { url: '/styles/typography.html', current: 'Typography' },
  { url: '/styles/wcag-guidance.html', current: 'WCAG 2.2 Guidance' },
];

test.describe('Styles side navigation', () => {
  for (const { url, current } of pages) {
    test(`${url} shows the Styles navigation with "${current}" as the current page`, async ({ page }) => {
      await page.goto(url);
      const nav = page.locator('.nhsw-side-nav');
      await expect(nav.locator('> ul > li > a')).toHaveText(items);
      await expect(nav.locator('.nhsw-side-nav__link--current')).toHaveText(current);
      await expect(nav.locator('.nhsw-side-nav__link--current')).toHaveAttribute('aria-current', 'page');
    });
  }

  test('every entry in the Styles navigation opens a real page', async ({ page, request, baseURL }) => {
    await page.goto('/styles.html');
    const hrefs = await page.locator('.nhsw-side-nav > ul > li > a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      expect(href, 'no stubbed # links are left').not.toBe('#');
      const res = await request.get(new URL(href, baseURL).toString());
      expect(res.status(), href).toBeLessThan(400);
    }
  });
});
