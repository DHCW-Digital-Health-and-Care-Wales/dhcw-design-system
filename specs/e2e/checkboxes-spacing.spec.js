const { test, expect } = require('@playwright/test');

const box = (locator) => locator.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left };
});

test.describe('Checkboxes conditional line spacing, the same as the radios', () => {
  test('the line has 6px above and 2px below it, and is centred under the checkbox', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await page.locator('#cb-contact2-1').check({ force: true });

    const conditional = page.locator('#conditional-cb2-1');
    await expect(conditional).toBeVisible();
    const item = await box(page.locator('.nhsw-checkboxes__item').first());
    const line = await box(conditional);
    const margins = await conditional.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.marginTop, s.marginBottom, s.borderLeftWidth];
    });

    expect(margins).toEqual(['6px', '2px', '4px']);
    expect(Math.round(line.top - item.bottom)).toBe(6);
    expect(Math.abs(line.left + 2 - (item.left + 20))).toBeLessThanOrEqual(1);
  });

  test('the next option has 22px above it on a wide screen and 14px on a phone', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await page.locator('#cb-contact2-1').check({ force: true });

    for (const [width, gap] of [[1000, 22], [390, 14]]) {
      await page.setViewportSize({ width, height: 800 });
      const line = await box(page.locator('#conditional-cb2-1'));
      const next = await box(page.locator('.nhsw-checkboxes__item').nth(1));
      expect(Math.round(next.top - line.bottom), `${width}px`).toBe(gap);
    }
  });

  test('with the content hidden the options keep the usual 6px between them', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await expect(page.locator('#conditional-cb2-1')).toBeHidden();
    const first = await box(page.locator('.nhsw-checkboxes__item').first());
    const second = await box(page.locator('.nhsw-checkboxes__item').nth(1));
    expect(Math.round(second.top - first.bottom)).toBe(6);
  });

  test('the content still lines up with the option text', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await page.locator('#cb-contact2-1').check({ force: true });
    const textLeft = await page.locator('.nhsw-checkboxes__label').first().evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().left;
    });
    const contentLeft = await page.locator('#conditional-cb2-1 > *').first().evaluate((el) => el.getBoundingClientRect().left);
    expect(Math.abs(contentLeft - textLeft)).toBeLessThanOrEqual(1);
  });
});

test.describe('Checkboxes on the component page', () => {
  test('each item is as tall as its 40px box, and the conditional line starts 6px below the box', async ({ page }) => {
    await page.goto('/components/checkboxes.html');
    await page.locator('#tab-variants').click();
    const gaps = await page.evaluate(() => {
      const conditional = document.querySelector('#conditional-cb2-1');
      const item = conditional.previousElementSibling;
      const label = item.querySelector('.nhsw-checkboxes__label').getBoundingClientRect();
      return { itemHeight: item.getBoundingClientRect().height, gap: conditional.getBoundingClientRect().top - item.getBoundingClientRect().bottom, boxBottom: label.top + 40, itemBottom: item.getBoundingClientRect().bottom };
    });
    expect(gaps.itemHeight).toBeGreaterThanOrEqual(40);
    expect(Math.round(gaps.gap)).toBe(6);
    expect(gaps.boxBottom).toBeLessThanOrEqual(gaps.itemBottom + 0.5);
  });
});
