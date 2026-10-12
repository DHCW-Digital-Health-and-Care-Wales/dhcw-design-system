const { test, expect } = require('@playwright/test');

test.describe('Tabs focus state', () => {
  test('the active (selected) tab still shows an underline when focused', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    const selectedTab = page.locator('#demo-tab-day');
    await expect(selectedTab).toHaveClass(/nhsw-tabs__tab--selected/);
    await selectedTab.focus();

    const text = selectedTab.locator('.nhsw-tabs__tab-text');
    const style = await text.evaluate((el) => {
      const s = getComputedStyle(el);
      return { line: s.textDecorationLine, thickness: s.textDecorationThickness };
    });
    expect(style.line).toBe('underline');
    expect(style.thickness).toBe('3px');
  });

  test('an unselected tab also shows an underline when focused', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    const tab = page.locator('#demo-tab-week');
    await tab.focus();

    const text = tab.locator('.nhsw-tabs__tab-text');
    const style = await text.evaluate((el) => {
      const s = getComputedStyle(el);
      return { line: s.textDecorationLine, thickness: s.textDecorationThickness };
    });
    expect(style.line).toBe('underline');
    expect(style.thickness).toBe('3px');
  });
});

test.describe('Tabs count badge variant', () => {
  test('renders a visible count badge alongside the tab label', async ({ page }) => {
    await page.goto('/examples/tabs-count.html');

    const tab = page.locator('#demo-tab-day');
    const badge = tab.locator('.nhsw-tag');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('112');
    await expect(tab.locator('.nhsw-tabs__tab-text')).toHaveText('Past day');
  });
});

test.describe('Tabs keyboard behaviour, matching the NHS.UK tabs', () => {
  test('only the selected tab is a tab stop, and Left/Right move the selection without wrapping', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    const tabindexes = () => page.locator('.nhsw-tabs__tab').evaluateAll((tabs) => tabs.map((t) => t.getAttribute('tabindex')));
    expect(await tabindexes()).toEqual(['0', '-1', '-1', '-1']);

    await page.locator('#demo-tab-day').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#demo-tab-week')).toBeFocused();
    await expect(page.locator('#demo-tab-week')).toHaveAttribute('aria-selected', 'true');
    expect(await tabindexes()).toEqual(['-1', '0', '-1', '-1']);

    await page.locator('#demo-tab-year').click();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#demo-tab-year')).toBeFocused();
  });

  test('Up and Down arrows are left alone, so a screen reader can move down into the panel', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    await page.locator('#demo-tab-day').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#demo-tab-day')).toBeFocused();
    await expect(page.locator('#demo-tab-day')).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Tabs on a small screen', () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test('are switched off: no tab roles, and every panel is shown', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    await expect(page.locator('.nhsw-tabs__list')).not.toHaveAttribute('role', /.+/);
    await expect(page.locator('.nhsw-tabs__tab[role]')).toHaveCount(0);
    await expect(page.locator('.nhsw-tabs__panel[role]')).toHaveCount(0);
    const visible = await page.locator('.nhsw-tabs__panel').evaluateAll((panels) => panels.map((p) => getComputedStyle(p).display !== 'none'));
    expect(visible).toEqual([true, true, true, true]);
  });

  test('the tabs stack as a list of links, and pressing one moves focus to its section', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');

    const tops = await page.locator('.nhsw-tabs__tab').evaluateAll((tabs) => tabs.map((t) => Math.round(t.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(4);

    await page.locator('#demo-tab-month').click();
    await expect(page.locator('#demo-panel-month')).toBeFocused();
  });

  test('switch back to tabs when the window is widened past the breakpoint', async ({ page }) => {
    await page.goto('/examples/tabs-default.html');
    await page.setViewportSize({ width: 900, height: 700 });

    await expect(page.locator('.nhsw-tabs__list')).toHaveAttribute('role', 'tablist');
    const visible = await page.locator('.nhsw-tabs__panel').evaluateAll((panels) => panels.map((p) => getComputedStyle(p).display !== 'none'));
    expect(visible).toEqual([true, false, false, false]);
  });
});

test.describe('Tabs that are too wide for their box wrap, they do not scroll sideways (as NHS.UK)', () => {
  test.use({ viewport: { width: 700, height: 900 } });

  test('no tab list on the Tabs docs page has a horizontal scrollbar, even where the demo column is narrow', async ({ page }) => {
    await page.goto('/content/tabs.html');

    const lists = await page.locator('.nhsw-tabs__list').evaluateAll((elements) => elements.map((el) => {
      const style = getComputedStyle(el);
      return { overflowX: style.overflowX, overflowY: style.overflowY, scrolls: el.scrollWidth > el.clientWidth };
    }));
    expect(lists.length).toBeGreaterThan(0);
    for (const list of lists) {
      expect(list).toEqual({ overflowX: 'visible', overflowY: 'visible', scrolls: false });
    }
  });

  test('a narrow demo puts its tabs on more than one row', async ({ page }) => {
    await page.goto('/content/tabs.html');

    const tops = await page.locator('.nhsw-tabs .nhsw-tabs .nhsw-tabs__list').first()
      .locator('.nhsw-tabs__tab').evaluateAll((tabs) => tabs.map((t) => Math.round(t.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBeGreaterThan(1);
  });
});
