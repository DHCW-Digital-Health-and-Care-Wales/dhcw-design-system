const { test, expect } = require('@playwright/test');

test.describe('Small variant tap targets', () => {
  test('checkboxes --small input renders at the documented 24x24px', async ({ page }) => {
    await page.goto('/examples/checkboxes-small.html');
    const box = await page.locator('.nhsw-checkboxes__input').first().boundingBox();
    expect(box.width).toBe(24);
    expect(box.height).toBe(24);
  });

  test('radios --small input renders at the documented 24x24px', async ({ page }) => {
    await page.goto('/examples/radios-small.html');
    const box = await page.locator('.nhsw-radios__input').first().boundingBox();
    expect(box.width).toBe(24);
    expect(box.height).toBe(24);
  });
});

test.describe('Fieldset legend spacing', () => {
  test('legend sits flush against a following hint (0px gap)', async ({ page }) => {
    await page.goto('/examples/checkboxes-hints.html');
    const gap = await page.evaluate(() => {
      const legend = document.querySelector('.nhsw-fieldset__legend');
      const hint = document.querySelector('.nhsw-hint');
      return hint.getBoundingClientRect().top - legend.getBoundingClientRect().bottom;
    });
    expect(gap).toBe(0);
  });

  test('legend gets a 16px gap before the checkboxes when there is no hint', async ({ page }) => {
    await page.goto('/examples/checkboxes-hints.html');
    await page.evaluate(() => document.querySelector('#conditions-hint').remove());

    const gap = await page.evaluate(() => {
      const legend = document.querySelector('.nhsw-fieldset__legend');
      const checkboxes = document.querySelector('.nhsw-checkboxes');
      return checkboxes.getBoundingClientRect().top - legend.getBoundingClientRect().bottom;
    });
    expect(gap).toBe(16);
  });
});

test.describe('Item spacing stays 6px regardless of the shared label spacing rule', () => {
  test('checkboxes items are spaced 6px apart, not inflated by the label’s own margin', async ({ page }) => {
    await page.goto('/examples/checkboxes-hints.html');
    const items = page.locator('.nhsw-checkboxes__item');
    const [box1, box2] = await Promise.all([items.nth(0).boundingBox(), items.nth(1).boundingBox()]);
    expect(box2.y - (box1.y + box1.height)).toBe(6);
  });

  test('radios items are spaced 6px apart, not inflated by the label’s own margin', async ({ page }) => {
    await page.goto('/examples/radios-hints.html');
    const items = page.locator('.nhsw-radios__item');
    const [box1, box2] = await Promise.all([items.nth(0).boundingBox(), items.nth(1).boundingBox()]);
    expect(box2.y - (box1.y + box1.height)).toBe(6);
  });
});

test.describe('Radio circle hover/focus rings', () => {
  test('hover shows a 4px grey ring around the circle, no row background change', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    const item = page.locator('.nhsw-radios__item').first();

    const bgBefore = await item.evaluate((el) => getComputedStyle(el).backgroundColor);
    await item.hover();
    const [bgAfter, boxShadow] = await Promise.all([
      item.evaluate((el) => getComputedStyle(el).backgroundColor),
      item.locator('.nhsw-radios__label').evaluate((el) => getComputedStyle(el, '::before').boxShadow),
    ]);

    expect(bgAfter).toBe(bgBefore);
    expect(boxShadow).toBe('rgb(175, 184, 191) 0px 0px 0px 4px');
  });

  test('focus alone keeps the plain 4px yellow ring', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    const item = page.locator('.nhsw-radios__item').first();
    await item.locator('.nhsw-radios__input').focus();

    const boxShadow = await item.locator('.nhsw-radios__label').evaluate((el) => getComputedStyle(el, '::before').boxShadow);
    expect(boxShadow).toBe('rgb(255, 235, 59) 0px 0px 0px 4px');
  });

  test('hover + focus together layer a 4px grey ring around the outside of the 4px yellow ring', async ({ page }) => {
    await page.goto('/examples/radios-default.html');
    const item = page.locator('.nhsw-radios__item').first();
    await item.locator('.nhsw-radios__input').focus();
    await item.hover();

    const boxShadow = await item.locator('.nhsw-radios__label').evaluate((el) => getComputedStyle(el, '::before').boxShadow);
    expect(boxShadow).toBe('rgb(255, 235, 59) 0px 0px 0px 4px, rgb(175, 184, 191) 0px 0px 0px 8px');
  });
});

test.describe('Conditional reveal alignment', () => {
  test('checkboxes conditional content left-aligns with the item label, not the checkbox square', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await page.locator('#cb-contact2-1').check({ force: true });

    const label = page.locator('.nhsw-checkboxes__item').first().locator('.nhsw-checkboxes__label');
    const conditionalLabel = page.locator('.nhsw-checkboxes__conditional').first().locator('.nhsw-label');

    const [labelBox, conditionalLabelBox] = await Promise.all([label.boundingBox(), conditionalLabel.boundingBox()]);
    expect(conditionalLabelBox.x).toBe(labelBox.x);
  });

  test('conditional field label is the same font weight as the checkbox label', async ({ page }) => {
    await page.goto('/examples/checkboxes-conditional.html');
    await page.locator('#cb-contact2-1').check({ force: true });

    const label = page.locator('.nhsw-checkboxes__item').first().locator('.nhsw-checkboxes__label');
    const conditionalLabel = page.locator('.nhsw-checkboxes__conditional').first().locator('.nhsw-label');

    const [labelWeight, conditionalLabelWeight] = await Promise.all([
      label.evaluate((el) => getComputedStyle(el).fontWeight),
      conditionalLabel.evaluate((el) => getComputedStyle(el).fontWeight),
    ]);
    expect(conditionalLabelWeight).toBe(labelWeight);
  });

  test('radios conditional content left-aligns with the item label, not the circle', async ({ page }) => {
    await page.goto('/examples/radios-conditional.html');
    await page.locator('#hpv-ready-no').check({ force: true });

    const label = page.locator('.nhsw-radios__item').nth(1).locator('.nhsw-radios__label');
    const conditionalLabel = page.locator('.nhsw-radios__conditional').locator('.nhsw-label');

    const [labelBox, conditionalLabelBox] = await Promise.all([label.boundingBox(), conditionalLabel.boundingBox()]);
    expect(conditionalLabelBox.x).toBe(labelBox.x);
  });

  test('radios conditional field label is the same font weight as the radio label', async ({ page }) => {
    await page.goto('/examples/radios-conditional.html');
    await page.locator('#hpv-ready-no').check({ force: true });

    const label = page.locator('.nhsw-radios__item').nth(1).locator('.nhsw-radios__label');
    const conditionalLabel = page.locator('.nhsw-radios__conditional').locator('.nhsw-label');

    const [labelWeight, conditionalLabelWeight] = await Promise.all([
      label.evaluate((el) => getComputedStyle(el).fontWeight),
      conditionalLabel.evaluate((el) => getComputedStyle(el).fontWeight),
    ]);
    expect(conditionalLabelWeight).toBe(labelWeight);
  });

  test('radios conditional textarea has a live character count, matching every other textarea on the site', async ({ page }) => {
    await page.goto('/examples/radios-conditional.html');
    await page.locator('#hpv-ready-no').check({ force: true });

    const textarea = page.locator('#hpv-ready-reason');
    const count = page.locator('#hpv-ready-reason-count');
    await expect(count).toHaveText('You have 150 characters remaining');

    await textarea.fill('12345');
    await expect(count).toHaveText('You have 145 characters remaining');
  });
});
