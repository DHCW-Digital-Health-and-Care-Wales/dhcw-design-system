const { test, expect } = require('@playwright/test');

const sizes = {
  mobile: { width: 390, xl: ['32px', '38px'], l: ['27px', '33px'], m: ['22px', '29px'], body: '16px' },
  desktop: { width: 1100, xl: ['48px', '54px'], l: ['36px', '42px'], m: ['26px', '32px'], body: '19px' },
};

for (const [name, spec] of Object.entries(sizes)) {
  test(`panel titles follow the heading scale on ${name}, and are clearly bigger than the body text`, async ({ page }) => {
    await page.setViewportSize({ width: spec.width, height: 800 });
    await page.goto('/examples/panel-default.html');

    const result = await page.evaluate(() => {
      const base = document.querySelector('.nhsw-panel');
      for (const size of ['l', 'm']) {
        const copy = base.cloneNode(true);
        copy.querySelector('.nhsw-panel__title').classList.add(`nhsw-panel__title--${size}`);
        copy.dataset.size = size;
        base.parentNode.appendChild(copy);
      }
      base.dataset.size = 'xl';
      const out = {};
      document.querySelectorAll('.nhsw-panel').forEach((panel) => {
        const title = getComputedStyle(panel.querySelector('.nhsw-panel__title'));
        out[panel.dataset.size] = [title.fontSize, title.lineHeight, title.fontWeight];
      });
      out.body = getComputedStyle(base.querySelector('.nhsw-panel__body')).fontSize;
      return out;
    });

    expect(result.xl).toEqual([...spec.xl, '700']);
    expect(result.l).toEqual([...spec.l, '700']);
    expect(result.m).toEqual([...spec.m, '700']);
    expect(result.body).toBe(spec.body);
    expect(parseFloat(result.xl[0]) / parseFloat(result.body)).toBeGreaterThanOrEqual(2);
  });
}

test('a long panel title wraps inside the panel instead of overflowing, at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/examples/panel-default.html');
  await page.locator('.nhsw-panel__title').evaluate((el) => {
    el.textContent = 'Supercalifragilisticexpialidocious application reference confirmation';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
