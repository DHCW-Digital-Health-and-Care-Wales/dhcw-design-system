const { test, expect } = require('@playwright/test');

const pages = [
  'action-link', 'back-link', 'breadcrumb', 'buttons', 'cards', 'checkboxes',
  'date-input', 'details', 'error-summary', 'expander', 'file-upload',
  'footer', 'header', 'input', 'inset-text', 'notification-banner',
  'pagination', 'panel', 'radios', 'select', 'site-navigation', 'skip-link',
  'summary-list', 'table', 'tabs', 'tag', 'textarea', 'warning-callout',
  'warning-text',
];

test.describe('Manual test checklist counters', () => {
  for (const name of pages) {
    test(`${name}.html: "0 of N" label matches the number of checklist checkboxes`, async ({ page }) => {
      await page.goto(`/testing/${name}.html`);

      const tracker = page.locator('[data-module="nhsw-test-tracker"]');
      const count = await tracker.locator('input[type="checkbox"]').evaluateAll((boxes) =>
        boxes.filter((box) => !box.closest('.nhsw-example-preview')).length
      );

      await expect(tracker.locator('[data-tracker-count]')).toHaveText(`0 of ${count} checks complete`);
    });
  }
});
