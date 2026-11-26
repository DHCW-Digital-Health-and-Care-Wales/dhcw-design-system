const { test, expect } = require('@playwright/test');

const KIT_PAGE = '/prototype-kit/create-a-new-prototype/publish-and-share.html';
const SITE_PAGE = '/get-started/start-prototyping.html';

const SHARED = [
  '.nhsw-site-header__top',
  '.nhsw-site-header__logo img',
  '.nhsw-site-header__title',
  '.nhsw-site-header__search-input',
  '.nhsw-site-header__search-button',
  '.nhsw-site-header__nav-link',
  '.nhsw-main-wrapper',
  '.nhsw-layout',
  '.nhsw-layout__content',
  '.nhsw-side-nav',
  '.nhsw-side-nav__link',
  '.nhsw-layout__content .nhsw-h2',
  '.nhsw-site-footer',
  '.nhsw-site-footer__container',
  '.nhsw-site-footer__links',
  '.nhsw-site-footer__copyright',
];

const PROPERTIES = ['font-size', 'line-height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-bottom-width', 'min-height', 'flex-wrap', 'column-gap'];

for (const width of [375, 1440]) {
  test(`prototype kit pages are styled the same as the rest of the site at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const styles = async (url) => {
      await page.goto(url);
      return page.evaluate(([selectors, properties]) => Object.fromEntries(selectors.map((selector) => {
        const el = document.querySelector(selector);
        return [selector, el ? Object.fromEntries(properties.map((property) => [property, getComputedStyle(el).getPropertyValue(property)])) : null];
      })), [SHARED, PROPERTIES]);
    };
    const kit = await styles(KIT_PAGE);
    const site = await styles(SITE_PAGE);
    for (const selector of SHARED) expect(kit[selector], selector).toEqual(site[selector]);
  });
}

test('the prototype kit landing page uses the large hero from the library', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototype-kit/index.html');
  const hero = page.locator('.nhsw-site-header__hero--large');
  await expect(hero).toHaveCSS('padding-top', '40px');
  await expect(hero.locator('.nhsw-site-header__hero-text')).toHaveCSS('font-size', '26px');
});
