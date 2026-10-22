const { test, expect } = require('@playwright/test');

const pages = [
  '/index.html',
  '/components/tag.html',
  '/components/index.html',
  '/styles/colours.html',
  '/styles.html',
  '/patterns/page-templates.html',
  '/get-started/start-prototyping.html',
  '/content-guide.html',
  '/privacy-policy.html',
];

test.describe('Site footer on every documentation page', () => {
  for (const url of pages) {
    test(`${url} shows the links, the OGL logo and licence text, and the copyright`, async ({ page }) => {
      await page.goto(url);
      const footer = page.locator('.nhsw-site-footer');

      await expect(footer.locator('.nhsw-site-footer__links a')).toHaveText([
        'Accessibility statement',
        'Cookie policy',
        'Privacy policy',
        'Terms of use',
        'Site map',
      ]);

      const logo = footer.locator('.nhsw-site-footer__licence-badge');
      await expect(logo).toBeVisible();
      expect((await logo.boundingBox()).width, 'the OGL logo has drawn').toBeGreaterThan(0);
      expect(await logo.evaluate((el) => el.tagName.toLowerCase()), 'the OGL logo is inline SVG').toBe('svg');

      await expect(footer.locator('.nhsw-site-footer__licence-text')).toContainText(
        'All content is available under the Open Government Licence v3.0, except where otherwise stated.'
      );
      await expect(footer.getByRole('link', { name: 'Open Government Licence v3.0' })).toHaveAttribute(
        'href',
        'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
      );
      await expect(footer.locator('.nhsw-site-footer__copyright')).toHaveText('© Digital Health and Care Wales');
    });
  }

  test('does not show the old short footer', async ({ page }) => {
    await page.goto('/components/tag.html');
    await expect(page.locator('.nhsw-site-footer')).not.toContainText('Service guidance');
  });

  test('on a phone the links stack vertically with the logo and licence text beneath, in 16px text', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/styles/colours.html');
    const links = page.locator('.nhsw-site-footer__links');
    expect(await links.evaluate((el) => getComputedStyle(el).flexDirection)).toBe('column');

    const tops = await links.locator('a').evaluateAll((els) => els.map((a) => Math.round(a.getBoundingClientRect().top)));
    expect(new Set(tops).size, 'each link is on its own row').toBe(tops.length);

    const sizes = await page.evaluate(() => [
      getComputedStyle(document.querySelector('.nhsw-site-footer__links a')).fontSize,
      getComputedStyle(document.querySelector('.nhsw-site-footer__licence-text')).fontSize,
      getComputedStyle(document.querySelector('.nhsw-site-footer__copyright')).fontSize,
    ]);
    expect(sizes).toEqual(['16px', '16px', '16px']);

    const linksBottom = await links.evaluate((el) => el.getBoundingClientRect().bottom);
    const licenceTop = await page.locator('.nhsw-site-footer__licence').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.round(licenceTop - linksBottom)).toBe(48);
  });
});
