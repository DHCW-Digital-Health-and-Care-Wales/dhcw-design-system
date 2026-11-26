const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const COMPONENTS = path.resolve(__dirname, '../../preview/components');
const pagesWithCode = fs.readdirSync(COMPONENTS).filter((name) => fs.readFileSync(path.join(COMPONENTS, name), 'utf8').includes('include code-viewer.html'));

const style = (locator, property) => locator.evaluate((el, name) => getComputedStyle(el)[name], property);

test.describe('Code tabs text size', () => {
  for (const width of [375, 1440]) {
    test(`the HTML, Nunjucks and Close text is 19px before and after opening at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/components/buttons.html');
      const preview = page.locator('.nhsw-example-preview').first();
      for (const tab of ['html', 'njk']) {
        expect(await style(preview.locator(`[data-tab="${tab}"]`), 'fontSize')).toBe('19px');
      }

      await preview.locator('[data-tab="html"]').click();
      const viewer = page.locator('.nhsw-code-viewer:not([hidden])').first();
      for (const tab of await viewer.locator('.nhsw-code-viewer__tab').all()) {
        expect(await style(tab, 'fontSize')).toBe('19px');
      }
      expect(await style(viewer.locator('[data-close]'), 'fontSize')).toBe('19px');
    });

    test(`an open code viewer fits the screen at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const url of ['/components/buttons.html', '/components/cards.html']) {
        await page.goto(url);
        await page.locator('.nhsw-example-preview [data-tab="njk"]').first().click();
        const header = page.locator('.nhsw-code-viewer:not([hidden]) .nhsw-code-viewer__header').first();
        expect(await header.evaluate((el) => el.scrollWidth - el.clientWidth), url).toBeLessThanOrEqual(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), url).toBeLessThanOrEqual(0);
        const copy = page.locator('.nhsw-code-viewer:not([hidden]) .nhsw-code-viewer__copy').first();
        expect((await copy.boundingBox()).height, `${url} Copy code stays on one line`).toBeLessThan(48);
      }
    });
  }
});

test.describe('Code samples', () => {
  test('all the code is 19px, bold only for Nunjucks keywords and macro names', async ({ page }) => {
    test.slow();
    for (const name of pagesWithCode) {
      await page.goto(`/components/${name}`);
      const found = await page.locator('.nhsw-code-viewer__panel code, .nhsw-code-viewer__panel code span').evaluateAll((els) => {
        const sizes = new Set();
        const normal = new Set();
        const bold = new Set();
        for (const el of els) {
          const s = getComputedStyle(el);
          sizes.add(s.fontSize);
          (el.matches('.nhsw-code-token--keyword, .nhsw-code-token--function') ? bold : normal).add(s.fontWeight);
        }
        return { sizes: [...sizes], normal: [...normal], bold: [...bold] };
      });
      expect(found.sizes, name).toEqual(['19px']);
      expect(found.normal, name).toEqual(['400']);
      expect(found.bold.filter((weight) => weight !== '700'), name).toEqual([]);
    }
  });

  test('Nunjucks samples are coloured', async ({ page }) => {
    await page.goto('/components/buttons.html');
    const code = page.locator('.nhsw-code-viewer__panel[id$="-njk"] code').first();
    await expect(code.locator('.nhsw-code-token--function').first()).toHaveCSS('color', 'rgb(153, 0, 0)');
    await expect(code.locator('.nhsw-code-token--function').first()).toHaveCSS('font-weight', '700');
    await expect(code.locator('.nhsw-code-token--keyword').first()).toHaveCSS('font-weight', '700');
    await expect(code.locator('.nhsw-code-token--value').first()).toHaveCSS('color', 'rgb(213, 40, 27)');
    await expect(code.locator('.nhsw-code-token--attr').first()).toHaveCSS('color', 'rgb(0, 127, 59)');
  });

  test('colouring leaves the text of every sample unchanged', async ({ page, browser, baseURL }) => {
    test.slow();
    const plainContext = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const plain = await plainContext.newPage();
    const samples = (target) => target.locator('.nhsw-code-viewer__panel code').allTextContents();
    for (const name of pagesWithCode) {
      await plain.goto(`/components/${name}`);
      await page.goto(`/components/${name}`);
      expect(await samples(page), name).toEqual(await samples(plain));
    }
    await plainContext.close();
  });
});
