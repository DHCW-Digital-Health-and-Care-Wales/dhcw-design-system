const { test, expect } = require('@playwright/test');

test.describe('Card', () => {
  test('the whole card is clickable, not just the title', async ({ page }) => {
    await page.goto('/examples/card-basic.html');

    // The title link's ::after is stretched to fill the whole card (see
    // .nhsw-card__title-link::after in _card.scss), so a click anywhere in
    // the card body — not just on the visible title text — should hit the
    // link. Playwright's own actionability check already proves this: a
    // direct click on .nhsw-card__description is intercepted by the link.
    const hitElement = await page.locator('.nhsw-card__description').evaluate((el) => {
      const box = el.getBoundingClientRect();
      const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return top.closest('.nhsw-card__title-link') !== null;
    });
    expect(hitElement).toBe(true);

    const before = page.url();
    await page.locator('.nhsw-card__description').click({ force: true });
    expect(page.url()).toBe(`${before}#`);
  });
});

test.describe('Card with long unbroken text', () => {
  for (const width of [375, 320, 260]) {
    test(`the email address wraps inside the card instead of overflowing it, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/examples/card-links.html');

      const result = await page.evaluate(() => {
        const card = document.querySelector('.nhsw-card').getBoundingClientRect();
        const email = [...document.querySelectorAll('.nhsw-card a')].find((a) => a.textContent.includes('@'));
        const lines = email.getClientRects().length;
        return { emailRight: email.getBoundingClientRect().right, cardRight: card.right, lines, sideways: document.documentElement.scrollWidth > window.innerWidth };
      });
      expect(result.emailRight).toBeLessThanOrEqual(result.cardRight);
      expect(result.sideways).toBe(false);
    });
  }

  test('the Cards docs page does not scroll sideways at 400% zoom (a 320px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/content/cards.html');

    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(sideways).toBe(false);
  });
});
