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

test.describe('Previous and next content links', () => {
  const pages = [
    { url: '/examples/pagination-content.html', sides: ['previous', 'next'] },
    { url: '/examples/pagination-next-only.html', sides: ['next'] },
    { url: '/components/pagination.html', sides: ['previous', 'next'], tab: '#tab-variants' },
    { url: '/prototype-kit/set-up-your-computer/install-github-desktop.html', sides: ['previous', 'next'] },
    { url: '/prototype-kit/create-a-new-prototype/open-and-run-the-prototype.html', sides: ['previous', 'next'] },
  ];

  for (const { url, sides, tab } of pages) {
    test(`the yellow focus highlight fits the text and arrow on ${url}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url);
      if (tab) await page.locator(tab).click();
      for (const side of sides) {
        const link = page.locator(`.nhsw-pagination-item--${side} .nhsw-pagination__link:visible`).first();
        await link.focus();
        await expect(link).toHaveCSS('background-color', 'rgb(255, 235, 59)');
        const sizes = await link.evaluate((el) => {
          const textWidths = [...el.querySelectorAll('span')].map((span) => {
            const range = document.createRange();
            range.selectNodeContents(span);
            return range.getBoundingClientRect().width;
          });
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          const parent = el.parentElement.getBoundingClientRect();
          const arrow = el.querySelector('.nhsw-icon').getBoundingClientRect();
          return {
            spare: box.width - Math.max(...textWidths) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
            fromLeft: box.left - parent.left,
            fromRight: parent.right - box.right,
            arrowInside: arrow.left >= box.left - 0.5 && arrow.right <= box.right + 0.5,
          };
        });
        expect(Math.abs(sizes.spare), side).toBeLessThanOrEqual(1);
        expect(Math.abs(side === 'previous' ? sizes.fromLeft : sizes.fromRight), side).toBeLessThanOrEqual(1);
        expect(sizes.arrowInside, side).toBe(true);
      }
    });
  }
});

test.describe('Numbered pagination on a narrow screen', () => {
  async function visible(page, example) {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(`/examples/${example}.html`);
    return page.evaluate(() => {
      const nav = document.querySelector('.nhsw-pagination--numbered');
      const out = [];
      if (nav.querySelector('.nhsw-pagination__previous')) out.push('Previous');
      for (const li of nav.querySelectorAll('.nhsw-pagination__list > li')) {
        if (getComputedStyle(li).display === 'none') continue;
        const marker = getComputedStyle(li, '::before').content;
        if (marker && marker !== 'none' && marker !== 'normal') out.push('…');
        out.push(li.classList.contains('nhsw-pagination__item--ellipsis') ? '…' : li.textContent.trim() + (li.classList.contains('nhsw-pagination__item--current') ? '*' : ''));
      }
      if (nav.querySelector('.nhsw-pagination__next')) out.push('Next');
      return out;
    });
  }

  test('shows Previous, first page, an ellipsis, the current page, an ellipsis, the last page and Next', async ({ page }) => {
    expect(await visible(page, 'pagination-numbered')).toEqual(['Previous', '1', '…', '10*', '…', '42', 'Next']);
  });

  test('on the first page there is no Previous, and a gap marker sits between the current and last pages', async ({ page }) => {
    expect(await visible(page, 'pagination-first')).toEqual(['1*', '…', '3', 'Next']);
  });

  test('on the last page there is no Next, and a gap marker sits between the first and current pages', async ({ page }) => {
    expect(await visible(page, 'pagination-last')).toEqual(['Previous', '1', '…', '3*']);
  });

  test('on a wide screen every page number is shown', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/examples/pagination-numbered.html');
    const shown = await page.locator('.nhsw-pagination__list > li').evaluateAll((lis) => lis.filter((li) => getComputedStyle(li).display !== 'none').length);
    expect(shown).toBe(9);
  });

  test('the row fits a 320px screen without scrolling sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/examples/pagination-numbered.html');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
});
