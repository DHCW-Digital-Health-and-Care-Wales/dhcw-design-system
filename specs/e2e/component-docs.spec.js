const { test, expect } = require('@playwright/test');

test.describe('Component doc page tabs (How to use / Variants / Examples)', () => {
  test('Variants tab is hidden until clicked, then becomes visible and selected', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    await expect(page.locator('#panel-how-to-use')).toBeVisible();
    await expect(page.locator('#panel-variants')).toBeHidden();

    await page.locator('#tab-variants').click();

    await expect(page.locator('#panel-variants')).toBeVisible();
    await expect(page.locator('#panel-how-to-use')).toBeHidden();
    await expect(page.locator('#tab-variants')).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Code viewer', () => {
  test('the HTML/Nunjucks tabs inside a code sample switch which <pre> is shown', async ({ page }) => {
    await page.goto('/components/action-link.html');
    // This code-viewer is toggleable=true, so it starts hidden behind the
    // example-preview's own "HTML" reveal button (covered separately below).
    await page.locator('[data-toggle="code-al-overview"]').first().click();

    const viewer = page.locator('.nhsw-code-viewer').first();
    const htmlPanel = viewer.locator('.nhsw-code-viewer__panel').first();
    const njkPanel = viewer.locator('.nhsw-code-viewer__panel').nth(1);

    await expect(htmlPanel).toBeVisible();
    await expect(njkPanel).toBeHidden();

    await viewer.locator('.nhsw-code-viewer__tab').nth(1).click();

    await expect(njkPanel).toBeVisible();
    await expect(htmlPanel).toBeHidden();
    await expect(njkPanel.locator('code')).toContainText('nhswActionLink');
  });

  test('the "HTML" reveal button on an example-preview shows its paired code viewer', async ({ page }) => {
    await page.goto('/components/action-link.html');
    const codeViewer = page.locator('#code-al-overview');
    await expect(codeViewer).toBeHidden();

    await page.locator('[data-toggle="code-al-overview"]').first().click();

    await expect(codeViewer).toBeVisible();
  });
});

test.describe('Expander', () => {
  test('expands to reveal its content when clicked, and collapses again', async ({ page }) => {
    await page.goto('/components/expander.html');
    const button = page.locator('.nhsw-expander__button').first();
    const contentId = await button.getAttribute('aria-controls');
    const content = page.locator(`#${contentId}`);

    await expect(content).toBeHidden();
    await button.click();
    await expect(content).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await button.click();
    await expect(content).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
