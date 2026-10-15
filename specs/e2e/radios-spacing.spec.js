const { test, expect } = require('@playwright/test');

const box = (locator) => locator.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height, width: r.width };
});

test.describe('Radios spacing, aligned with the NHS.UK radios', () => {
  test('each option is a 44px row, the label has 6px top and bottom and 12px side padding around the text, and options are 6px apart', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    const items = page.locator('.nhsw-radios__item');
    const first = await box(items.nth(0));
    const second = await box(items.nth(1));
    expect(first.height).toBeGreaterThanOrEqual(44);
    expect(Math.round(second.top - first.bottom)).toBe(6);

    const padding = await page.locator('.nhsw-radios__label').first().evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft];
    });
    expect(padding).toEqual(['6px', '12px', '6px', '12px']);
  });

  test('the option text starts 52px from the left edge of the circle', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    const item = await box(page.locator('.nhsw-radios__item').first());
    const textLeft = await page.locator('.nhsw-radios__label').first().evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().left;
    });
    expect(Math.round(textLeft - item.left)).toBe(52);
  });

  test('the default radios have no hover ring', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    await page.locator('.nhsw-radios__item').first().hover();
    const shadow = await page.locator('.nhsw-radios__label').first().evaluate((el) => getComputedStyle(el, '::before').boxShadow);
    expect(shadow).toBe('none');
  });

  test('the small radios have the grey hover ring, and 44px rows with no extra gap', async ({ page }) => {
    await page.goto('/examples/radios-small.html');
    const items = page.locator('.nhsw-radios__item');
    const first = await box(items.nth(0));
    const second = await box(items.nth(1));
    expect(Math.round(first.height)).toBe(44);
    expect(Math.round(second.top - first.bottom)).toBe(0);

    await items.first().hover();
    const shadow = await page.locator('.nhsw-radios__label').first().evaluate((el) => getComputedStyle(el, '::before').boxShadow);
    expect(shadow).toContain('rgb(175, 184, 191)');
    expect(shadow).toContain('4px');
  });

  test('a disabled small radio shows no hover ring', async ({ page }) => {
    await page.goto('/examples/radios-small.html');
    await page.locator('.nhsw-radios__input').first().evaluate((el) => { el.disabled = true; });
    await page.locator('.nhsw-radios__item').first().hover();
    const shadow = await page.locator('.nhsw-radios__label').first().evaluate((el) => getComputedStyle(el, '::before').boxShadow);
    expect(shadow).toBe('none');
  });

  test('the conditional line is centred under the circle, has space above and below it, and its content lines up with the option text', async ({ page }) => {
    await page.goto('/examples/radios-conditional.html');
    await page.locator('#hpv-ready-no').check();

    const conditional = page.locator('.nhsw-radios__conditional');
    await expect(conditional).toBeVisible();

    const noItem = await box(page.locator('.nhsw-radios__item').nth(1));
    const line = await box(conditional);
    const info = await conditional.evaluate((el) => {
      const s = getComputedStyle(el);
      return { marginTop: s.marginTop, marginBottom: s.marginBottom, border: s.borderLeftWidth };
    });

    expect(info.marginTop).toBe('6px');
    expect(info.marginBottom).toBe('2px');
    expect(info.border).toBe('4px');
    expect(Math.round(line.top - noItem.bottom)).toBe(6);

    const lineCentre = line.left + 2;
    const circleCentre = noItem.left + 20;
    expect(Math.abs(lineCentre - circleCentre)).toBeLessThanOrEqual(1);

    const optionText = await page.locator('.nhsw-radios__label').nth(1).evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().left;
    });
    const contentLeft = await conditional.locator('> *').first().evaluate((el) => el.getBoundingClientRect().left);
    expect(Math.abs(contentLeft - optionText)).toBeLessThanOrEqual(1);
  });

  test('an option after the conditional content has more room above it than the usual 6px, and the usual 6px when the content is hidden', async ({ page }) => {
    await page.goto('/examples/radios-conditional.html');
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.locator('#hpv-ready-no').check();

    const after = await page.evaluate(() => {
      const conditional = document.querySelector('.nhsw-radios__conditional');
      const next = document.createElement('div');
      next.className = 'nhsw-radios__item';
      next.innerHTML = '<input class="nhsw-radios__input" type="radio" name="hpv-ready" id="extra"><label class="nhsw-label nhsw-radios__label" for="extra">Not sure</label>';
      conditional.after(next);
      const c = conditional.getBoundingClientRect();
      const n = next.getBoundingClientRect();
      const visibleGap = n.top - c.bottom;
      conditional.classList.add('nhsw-radios__conditional--hidden');
      const hiddenMargin = getComputedStyle(next).marginTop;
      return { visibleGap, hiddenMargin };
    });
    // the 2px margin below the line and the 22px above the next option collapse to the larger one
    expect(Math.round(after.visibleGap)).toBe(22);
    expect(after.hiddenMargin).toBe('6px');
  });
});
