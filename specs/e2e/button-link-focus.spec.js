const { test, expect } = require('@playwright/test');

test.describe('Link-styled button focus state', () => {
  test('applies the focus treatment on mousedown, before the button is released', async ({ page }) => {
    await page.goto('/examples/button-link.html');

    const cancel = page.locator('.nhsw-button--link').filter({ hasText: 'Cancel' });
    const box = await cancel.boundingBox();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    await expect(cancel).toBeFocused();
    const duringPress = await cancel.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        background: style.backgroundColor,
        color: style.color,
        textDecoration: style.textDecorationLine,
        borderRadius: style.borderRadius,
      };
    });
    expect(duringPress.background).toBe('rgb(255, 235, 59)');
    expect(duringPress.color).toBe('rgb(33, 43, 50)');
    expect(duringPress.textDecoration).toBe('none');
    expect(duringPress.borderRadius).toBe('0px');

    await page.mouse.up();
  });

  test('does not affect other button variants: primary button text stays white while pressed', async ({ page }) => {
    await page.goto('/examples/button-primary.html');

    const button = page.locator('.nhsw-button--primary');
    const box = await button.boundingBox();

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    await expect(button).toBeFocused();
    const color = await button.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');

    await page.mouse.up();
  });
});
