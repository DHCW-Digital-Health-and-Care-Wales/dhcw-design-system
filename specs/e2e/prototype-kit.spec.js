const { test, expect } = require('@playwright/test');

const KIT = '/prototype-kit';

test.describe('Prototype kit navigation', () => {
  test('the landing page highlights no section and has no side navigation', async ({ page }) => {
    await page.goto(`${KIT}/index.html`);
    await expect(page.locator('h1')).toHaveText('Digital Health and Care Wales Prototype Kit');
    await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveCount(0);
    await expect(page.locator('.nhsw-side-nav')).toHaveCount(0);
  });

  test('a step highlights its section and its place in the side navigation', async ({ page }) => {
    await page.goto(`${KIT}/create-a-new-prototype/open-and-run-the-prototype.html`);
    await expect(page.locator('.nhsw-site-header__nav-link--current')).toHaveText('Guides');
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('3. Open and run it');
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.nhsw-step-list__item')).toHaveCount(6);
  });

  test('the last set up screen is step 6, Start prototyping', async ({ page }) => {
    await page.goto(`${KIT}/set-up-your-computer/check-your-computer-is-ready.html`);
    await page.locator('.nhsw-pagination-item--next a').click();
    await expect(page.locator('h1')).toHaveText('Step 6: Start prototyping');
    await expect(page.locator('.nhsw-side-nav__link')).toHaveCount(6);
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveText('6. Start prototyping');
    await expect(page.locator('.nhsw-side-nav__link--current')).toHaveAttribute('aria-current', 'page');
  });

  test('the Service Desk section links to the Service Desk email address', async ({ page }) => {
    await page.goto(`${KIT}/support.html`);
    const section = page.locator('#contact-the-service-desk + p a');
    await expect(section).toHaveText('Service Desk');
    await expect(section).toHaveAttribute('href', 'mailto:it.servicedesk@wales.nhs.uk');
  });

  for (const journey of [
    { start: 'set-up-your-computer.html', action: 'Start setting up your computer', steps: 6 },
    { start: 'create-a-new-prototype.html', action: 'Start creating a prototype', steps: 7 },
    { start: 'work-on-an-existing-prototype.html', action: 'Start working on an existing prototype', steps: 6 },
  ]) {
    test(`Next leads through every page from "${journey.action}"`, async ({ page }) => {
      await page.goto(`${KIT}/${journey.start}`);
      await page.getByRole('link', { name: journey.action }).click();
      let visited = 1;
      const next = page.locator('.nhsw-pagination-item--next a');
      while (await next.count()) {
        const href = await next.getAttribute('href');
        await next.click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        visited += 1;
      }
      expect(visited).toBe(journey.steps);
    });
  }
});

test.describe('Prototype kit layout', () => {
  for (const width of [375, 700, 1440]) {
    test(`pages do not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const url of ['index.html', 'support.html', 'create-a-new-prototype/publish-and-share.html', 'set-up-your-computer/check-your-computer-is-ready.html']) {
        await page.goto(`${KIT}/${url}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, url).toBeLessThanOrEqual(0);
      }
    });
  }
});
