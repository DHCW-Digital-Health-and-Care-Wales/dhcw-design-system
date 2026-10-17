const { test, expect } = require('@playwright/test');

test.describe('Site search', () => {
  test('pressing Enter in the header search lists matching pages', async ({ page }) => {
    await page.goto('/components/index.html');
    await page.fill('#site-search', 'buttons');
    await page.press('#site-search', 'Enter');
    await expect(page).toHaveURL(/\/search\.html\?q=buttons/);
    await expect(page.locator('h1')).toHaveText('Search results for buttons');
    await expect(page.locator('.nhsw-search-results__title a').first()).toHaveText('Buttons');
    await expect(page.locator('.nhsw-search-results__summary')).toContainText('results for "buttons"');
  });

  test('clicking the search icon searches too', async ({ page }) => {
    await page.goto('/index.html');
    await page.fill('#site-search', 'radios');
    await page.click('.nhsw-site-header__search-button');
    await expect(page.locator('h1')).toHaveText('Search results for radios');
  });

  test('nothing is searched while typing', async ({ page }) => {
    await page.goto('/index.html');
    await page.fill('#site-search', 'radios');
    await expect(page).not.toHaveURL(/search\.html/);
  });

  test('shows No results with suggestions when nothing matches', async ({ page }) => {
    await page.goto('/search.html?q=qqqqzzzz');
    await expect(page.locator('h1')).toHaveText('No results');
    await expect(page.getByText('You could try:')).toBeVisible();
    await expect(page.locator('#search-query')).toHaveAttribute('placeholder', 'Search');
  });

  test('more than 10 results are paged, with a Next link that works', async ({ page }) => {
    await page.goto('/search.html?q=b');
    await expect(page.locator('.nhsw-search-results__item')).toHaveCount(10);
    await page.click('.nhsw-pagination-item--next a');
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator('.nhsw-search-results__summary')).toContainText('11 – 20 of');
    await expect(page.locator('.nhsw-pagination-item--previous')).toBeVisible();
  });

  test('the clear button empties the search box', async ({ page }) => {
    await page.goto('/search.html?q=buttons');
    await page.click('#search-clear');
    await expect(page.locator('#search-query')).toHaveValue('');
    await expect(page.locator('#search-query')).toBeFocused();
  });

  test('the results page has no second search box in the header', async ({ page }) => {
    await page.goto('/search.html?q=buttons');
    await expect(page.locator('#site-search')).toHaveCount(0);
  });
});
