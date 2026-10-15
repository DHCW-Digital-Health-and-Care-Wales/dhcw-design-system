const { test, expect } = require('@playwright/test');

const examples = ['warning-callout-default', 'warning-callout-important'];
const sizes = [
  { name: 'desktop', width: 1100 },
  { name: 'mobile', width: 360 },
];

test.describe('Warning callout icon', () => {
  for (const { name, width } of sizes) {
    for (const example of examples) {
      test(`is vertically centred on the heading text: ${example} at ${name} width`, async ({ page }) => {
        await page.setViewportSize({ width, height: 700 });
        await page.goto(`/examples/${example}.html`);

        const { iconCentre, textCentre } = await page.evaluate(() => {
          const icon = document.querySelector('.nhsw-warning-callout__icon').getBoundingClientRect();
          const visible = document.querySelector('.nhsw-warning-callout__heading-text');
          const range = document.createRange();
          range.selectNodeContents(visible);
          const line = [...range.getClientRects()].find((r) => r.height > 4);
          return { iconCentre: icon.top + icon.height / 2, textCentre: line.top + line.height / 2 };
        });

        expect(Math.abs(iconCentre - textCentre)).toBeLessThanOrEqual(1.5);
      });
    }
  }
});
