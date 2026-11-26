const { test, expect } = require('@playwright/test');

test.describe('Side navigation divider', () => {
  for (const url of ['/components/buttons.html', '/styles/layout.html', '/prototype-kit/create-a-new-prototype/publish-and-share.html']) {
    test(`ends with the navigation, not the page content, on ${url}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      const nav = await page.locator('.nhsw-side-nav').boundingBox();
      const list = await page.locator('.nhsw-side-nav > .nhsw-side-nav__list').boundingBox();
      const content = await page.locator('.nhsw-layout__content').boundingBox();
      expect(Math.abs(nav.y + nav.height - (list.y + list.height))).toBeLessThanOrEqual(1);
      expect(nav.height).toBeLessThan(content.height);
    });
  }
});

test.describe('Back to top button', () => {
  test('has no border or shadow', async ({ page }) => {
    await page.goto('/styles/layout.html');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const button = page.locator('.nhsw-back-to-top');
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS('border-top-style', 'none');
    await expect(button).toHaveCSS('box-shadow', 'none');
    await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('still shows the yellow focus highlight', async ({ page }) => {
    await page.goto('/styles/layout.html');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const link = page.locator('.nhsw-back-to-top a');
    await expect(link).toBeVisible();
    await link.focus();
    await expect(link).toHaveCSS('background-color', 'rgb(255, 235, 59)');
  });
});

test.describe('Side navigation sizing', () => {
  const pages = [
    '/get-started/start-prototyping.html',
    '/components/buttons.html',
    '/styles/layout.html',
    '/prototype-kit/create-a-new-prototype/publish-and-share.html',
  ];

  test('the Start prototyping side navigation has its heading', async ({ page }) => {
    await page.goto('/get-started/start-prototyping.html');
    await expect(page.locator('.nhsw-side-nav__heading')).toHaveText('Start prototyping');
  });

  for (const url of pages) {
    test(`is 240px wide with a 19px grey heading and 16px links 12px apart on ${url}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      expect((await page.locator('.nhsw-side-nav').boundingBox()).width).toBe(240);
      for (const heading of await page.locator('.nhsw-side-nav__heading').all()) {
        await expect(heading).toHaveCSS('font-size', '19px');
        await expect(heading).toHaveCSS('color', 'rgb(76, 98, 114)');
      }
      await expect(page.locator('.nhsw-side-nav__link').first()).toHaveCSS('font-size', '16px');
      await expect(page.locator('.nhsw-side-nav__list').first()).toHaveCSS('row-gap', '12px');
      const left = await page.locator('.nhsw-side-nav').evaluate((nav) => {
        const textLeft = (el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().left;
        };
        return { rail: nav.getBoundingClientRect().left, link: textLeft(nav.querySelector('.nhsw-side-nav__link')) };
      });
      expect(Math.abs(left.rail - left.link)).toBeLessThanOrEqual(1);
    });
  }
});
