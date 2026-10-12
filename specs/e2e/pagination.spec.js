const { test, expect } = require('@playwright/test');

test.describe('Numbered pagination', () => {
  test('Previous and Next stay aligned to the top row on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto('/examples/pagination-numbered.html');

    const previous = page.locator('.nhsw-pagination__previous');
    const next = page.locator('.nhsw-pagination__next');
    const list = page.locator('.nhsw-pagination__list');

    const [previousBox, nextBox, listBox] = await Promise.all([
      previous.boundingBox(),
      next.boundingBox(),
      list.boundingBox(),
    ]);

    expect(Math.abs(previousBox.y - nextBox.y)).toBeLessThan(2);
    expect(listBox.y).toBeGreaterThan(previousBox.y + previousBox.height - 1);
  });

  test('never overflows its container while resizing across the tablet breakpoint', async ({ page }) => {
    await page.goto('/examples/pagination-numbered.html');

    for (const width of [200, 280, 320, 375, 480, 600, 639, 640, 641, 700, 768]) {
      await page.setViewportSize({ width, height: 600 });

      const overflow = await page.evaluate(() => {
        const container = document.querySelector('.nhsw-fluid-container');
        const nav = document.querySelector('.nhsw-pagination');
        return {
          navOverflowsContainer: nav.getBoundingClientRect().right > container.getBoundingClientRect().right + 0.5,
          pageHasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 0.5,
        };
      });

      expect(overflow, `overflow at ${width}px`).toEqual({
        navOverflowsContainer: false,
        pageHasHorizontalScroll: false,
      });
    }
  });
});
