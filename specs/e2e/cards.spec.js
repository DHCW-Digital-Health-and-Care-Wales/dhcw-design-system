const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EXAMPLES = path.resolve(__dirname, '../../preview/examples');

test.describe('Card', () => {
  test('the whole card is clickable, not just the title', async ({ page }) => {
    await page.goto('/examples/card-basic.html');

    // The title link's ::after is stretched to fill the whole card (see
    // .nhsw-card__title-link::after in _card.scss), so a click anywhere in
    // the card body — not just on the visible title text — should hit the
    // link. Playwright's own actionability check already proves this: a
    // direct click on .nhsw-card__description is intercepted by the link.
    const hitElement = await page.locator('.nhsw-card__description').evaluate((el) => {
      const box = el.getBoundingClientRect();
      const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return top.closest('.nhsw-card__title-link') !== null;
    });
    expect(hitElement).toBe(true);

    const before = page.url();
    await page.locator('.nhsw-card__description').click({ force: true });
    expect(page.url()).toBe(`${before}#`);
  });
});

test.describe('Card with long unbroken text', () => {
  for (const width of [375, 320, 260]) {
    test(`the email address wraps inside the card instead of overflowing it, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/examples/card-links.html');

      const result = await page.evaluate(() => {
        const card = document.querySelector('.nhsw-card').getBoundingClientRect();
        const email = [...document.querySelectorAll('.nhsw-card a')].find((a) => a.textContent.includes('@'));
        const lines = email.getClientRects().length;
        return { emailRight: email.getBoundingClientRect().right, cardRight: card.right, lines, sideways: document.documentElement.scrollWidth > window.innerWidth };
      });
      expect(result.emailRight).toBeLessThanOrEqual(result.cardRight);
      expect(result.sideways).toBe(false);
    });
  }

  test('the Cards docs page does not scroll sideways at 400% zoom (a 320px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/cards.html');

    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(sideways).toBe(false);
  });
});

const CARD_EXAMPLES = fs.readdirSync(EXAMPLES).filter((name) => name.startsWith('card-') && name !== 'card-grid.html');

const snippet = (name) => fs.readFileSync(path.join(EXAMPLES, name), 'utf8').replace(/^---[\s\S]*?\n---\r?\n/, '');

test.describe('Card code pasted between other content, as on a prototype page', () => {
  for (const name of CARD_EXAMPLES) {
    test(`${name} keeps to its own height and leaves the content below it in place`, async ({ page }) => {
      await page.setViewportSize({ width: 900, height: 800 });
      await page.goto(`/examples/${name}`);
      await page.evaluate((html) => {
        document.querySelector('main .nhsw-fluid-container').innerHTML = `<div class="nhsw-grid-row"><div class="nhsw-grid-column-two-thirds" id="column"><p class="nhsw-body">Before</p>${html}<h2 class="nhsw-h2" id="after">Next steps</h2></div></div>`;
      }, snippet(name));
      const result = await page.evaluate(() => {
        const bottom = (el) => el.getBoundingClientRect().bottom;
        const cards = [...document.querySelectorAll('#column .nhsw-card')];
        const stretched = cards.filter((card) => {
          const before = card.getBoundingClientRect().height;
          card.style.height = 'auto';
          const natural = card.getBoundingClientRect().height;
          card.style.height = '';
          return Math.abs(before - natural) > 1 && !card.matches('.nhsw-grid-row > * > .nhsw-card:only-child, .nhsw-card-group__item > .nhsw-card');
        });
        return { stretched: stretched.length, overflow: bottom(document.querySelector('#after')) - bottom(document.querySelector('#column')) };
      });
      expect(result.stretched).toBe(0);
      expect(result.overflow).toBeLessThanOrEqual(1);
    });
  }
});

test.describe('Cards side by side', () => {
  test('cards alone in their grid columns share the height of the tallest', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/examples/card-basic.html');
    await page.evaluate(() => {
      const card = (text) => `<div class="nhsw-grid-column-one-half"><div class="nhsw-card"><h3 class="nhsw-card__title">Title</h3><p class="nhsw-card__description">${text}</p></div></div>`;
      document.querySelector('main .nhsw-fluid-container').innerHTML = `<div class="nhsw-grid-row">${card('Short')}${card('Much longer description. '.repeat(30))}</div>`;
    });
    const heights = await page.locator('.nhsw-card').evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
    expect(Math.abs(heights[0] - heights[1])).toBeLessThanOrEqual(1);
  });

  test('grouped cards fill their row, 20px apart', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/examples/card-grid.html');
    const gaps = await page.locator('.nhsw-card-group__item').evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().bottom - item.querySelector('.nhsw-card').getBoundingClientRect().bottom)));
    expect([...new Set(gaps)]).toEqual([20]);
  });
});

test.describe('Short cards', () => {
  const link = '<a class="nhsw-card__title-link" href="#">Title</a>';
  const short = {
    'title only, clickable': `<h3 class="nhsw-card__title">${link}</h3>`,
    'title only': '<h3 class="nhsw-card__title">Title</h3>',
    stat: '<span class="nhsw-card__stat">24</span><a class="nhsw-card__title-link" href="#">Waiting</a>',
  };

  for (const [name, content] of Object.entries(short)) {
    test(`a ${name} card is at least 120px tall with its content in the middle`, async ({ page }) => {
      await page.setViewportSize({ width: 900, height: 800 });
      await page.goto('/examples/card-basic.html');
      await page.evaluate((html) => {
        document.querySelector('main .nhsw-fluid-container').innerHTML = `<div class="nhsw-card">${html}</div>`;
      }, content);
      const gaps = await page.locator('.nhsw-card').evaluate((card) => {
        const box = card.getBoundingClientRect();
        const parts = [...card.children].map((child) => child.getBoundingClientRect());
        return { height: box.height, above: Math.min(...parts.map((p) => p.top)) - box.top, below: box.bottom - Math.max(...parts.map((p) => p.bottom)) };
      });
      expect(gaps.height).toBeGreaterThanOrEqual(120);
      expect(Math.abs(gaps.above - gaps.below)).toBeLessThanOrEqual(2);
    });
  }

  test('a top task card keeps its title at the top of its 160px', async ({ page }) => {
    await page.goto('/examples/card-top-task.html');
    const card = await page.locator('.nhsw-card').boundingBox();
    const title = await page.locator('.nhsw-card__title').boundingBox();
    expect(card.height).toBeGreaterThanOrEqual(160);
    expect(Math.round(title.y - card.y)).toBe(33);
  });

  test('a flat card is only as tall as its content', async ({ page }) => {
    await page.goto('/examples/card-basic.html');
    await page.evaluate(() => {
      document.querySelector('main .nhsw-fluid-container').innerHTML = '<div class="nhsw-card nhsw-card--flat"><h3 class="nhsw-card__title">Title</h3></div>';
    });
    expect((await page.locator('.nhsw-card').boundingBox()).height).toBeLessThan(80);
  });
});

for (const width of [375, 1440]) {
  test(`the links card has the same space under its last link as at its sides, at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/examples/card-links.html');
    const space = await page.locator('.nhsw-card').evaluate((card) => {
      const last = card.lastElementChild;
      return { below: Math.round(card.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom), side: Math.round(last.getBoundingClientRect().left - card.getBoundingClientRect().left) };
    });
    expect(space.below).toBe(space.side);
  });
}
