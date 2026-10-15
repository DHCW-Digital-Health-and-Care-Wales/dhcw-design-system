const { test, expect } = require('@playwright/test');

test.describe('Skip link', () => {
  test('is the first thing focused on a fresh page load', async ({ page }) => {
    await page.goto('/components/skip-link.html');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/nhsw-skip-link/);
  });

  // NOTE: "activating it jumps straight to the main content" (focus moves to
  // #maincontent) is not implemented as a Playwright test. The link's href
  // correctly points at #maincontent, but <main id="maincontent"> has no
  // tabindex="-1", so per the HTML fragment-navigation spec the browser only
  // scrolls there — it does NOT move keyboard focus. Verified empirically:
  // after pressing Enter on the focused skip link, document.activeElement
  // stays on <body>, not <main>. This is a genuine accessibility bug (WCAG
  // 2.4.1) in src's page shell, not a test gap — flagged here rather than
  // adding a test that would assert the current (broken) behaviour.

  test('is visible on screen once focused', async ({ page }) => {
    await page.goto('/components/skip-link.html');
    const skipLink = page.locator('a.nhsw-skip-link').first();
    const hiddenBox = await skipLink.boundingBox();
    expect(hiddenBox.y).toBeLessThan(0);

    await skipLink.focus();
    const visibleBox = await skipLink.boundingBox();
    expect(visibleBox.y).toBeGreaterThanOrEqual(0);
    expect(visibleBox.x).toBeGreaterThanOrEqual(0);
  });
});
