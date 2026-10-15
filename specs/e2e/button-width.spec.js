const { test, expect } = require('@playwright/test');

async function widths(page) {
  await page.goto('/examples/button-primary.html');
  return page.evaluate(() => {
    const host = document.querySelector('main > div');
    host.innerHTML =
      '<button class="nhsw-button nhsw-button--primary" id="b-default">Default</button>' +
      '<button class="nhsw-button nhsw-button--primary nhsw-button--inline" id="b-inline">Inline</button>' +
      '<button class="nhsw-button nhsw-button--primary nhsw-button--full" id="b-full">Full</button>';
    const style = getComputedStyle(host);
    const container = host.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const w = (id) => document.getElementById(id).getBoundingClientRect().width;
    return { container, default: w('b-default'), inline: w('b-inline'), full: w('b-full') };
  });
}

test.describe('Button width', () => {
  test('on a phone a default button fills the width, the inline variant stays its natural width, and the full variant fills it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    const w = await widths(page);
    expect(Math.round(w.default)).toBe(Math.round(w.container));
    expect(Math.round(w.full)).toBe(Math.round(w.container));
    expect(w.inline).toBeLessThan(w.container / 2);
  });

  test('from the tablet breakpoint a default button goes back to its natural width, and the full variant still fills the width', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    const w = await widths(page);
    expect(w.default).toBeLessThan(w.container / 2);
    expect(w.inline).toBeLessThan(w.container / 2);
    expect(Math.round(w.full)).toBe(Math.round(w.container));
  });
});
