const { test, expect } = require('@playwright/test');

// One test per scenario the manual testers could not check on the test site.
// Each example page is the page they are linked to, and each test asserts the
// scenario's "Then" statement from the master testing workbook.

const rect = (el) => {
  const r = el.getBoundingClientRect();
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
};

test.describe('Back link as a button (SCEN-BACK-003, SCEN-BACK-004)', () => {
  test('SCEN-BACK-004: performs an action rather than loading a new page', async ({ page }) => {
    await page.goto('/examples/back-link-button.html');
    const addressBefore = page.url();

    await expect(page.locator('#bl-notes')).not.toHaveValue('');
    await page.locator('#bl-back').click();

    await expect(page.locator('#bl-notes')).toHaveValue('');
    await expect(page.locator('#bl-status')).toContainText('The page did not change');
    expect(page.url()).toBe(addressBefore);
  });

  test('SCEN-BACK-003: has enough space around it that you cannot easily tap the wrong thing (WCAG 2.2 SC 2.5.8)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/examples/back-link-button.html');

    const result = await page.evaluate(() => {
      const r = (el) => el.getBoundingClientRect();
      const back = r(document.getElementById('bl-back'));
      const others = [...document.querySelectorAll('a[href^="#bl-"], #bl-save')].map(r);
      const gap = (a, b) => {
        const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
        const dy = Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
        return Math.hypot(dx, dy);
      };
      return { width: back.width, height: back.height, nearest: Math.min(...others.map((o) => gap(back, o))) };
    });
    // WCAG 2.5.8: a target is at least 24 x 24 CSS pixels, or has 24px of clear space around it
    const bigEnough = result.width >= 24 && result.height >= 24;
    expect(bigEnough || result.nearest >= 24, `back button is ${result.width}x${result.height}px, nearest target ${result.nearest}px away`).toBe(true);
  });
});

test.describe('Breadcrumb with long labels (SCEN-BREAD-008)', () => {
  for (const width of [1100, 375, 320]) {
    test(`SCEN-BREAD-008: long labels break onto several lines instead of overflowing sideways, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/examples/breadcrumb-long-label.html');

      const scrollsSideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(scrollsSideways).toBe(false);

      const fits = await page.evaluate(() => {
        const visible = [...document.querySelectorAll('.nhsw-breadcrumb a')].filter((a) => a.getBoundingClientRect().width > 0);
        return visible.every((a) => a.getBoundingClientRect().right <= window.innerWidth + 0.5);
      });
      expect(fits).toBe(true);
    });
  }

  test('SCEN-BREAD-008: the long label really does wrap onto more than one line', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/examples/breadcrumb-long-label.html');

    const lines = await page.evaluate(() => {
      const links = [...document.querySelectorAll('.nhsw-breadcrumb a')].filter((a) => a.getBoundingClientRect().width > 0);
      const longest = links.reduce((a, b) => (a.textContent.length >= b.textContent.length ? a : b));
      const lineHeight = parseFloat(getComputedStyle(longest).lineHeight) || 24;
      return Math.round(longest.getBoundingClientRect().height / lineHeight);
    });
    expect(lines).toBeGreaterThan(1);
  });
});

test.describe('Cards (SCEN-CARD-006, SCEN-CARD-008)', () => {
  test('SCEN-CARD-006: the rendered heading tag matches the level specified, keeping the page outline correct', async ({ page }) => {
    await page.goto('/examples/card-heading-level.html');

    await expect(page.locator('#hl-default .nhsw-card__title')).toHaveJSProperty('tagName', 'H3');
    await expect(page.locator('#hl-four .nhsw-card__title')).toHaveJSProperty('tagName', 'H4');
    await expect(page.locator('#hl-two .nhsw-card__title')).toHaveJSProperty('tagName', 'H2');

    const levels = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `heading ${i} (h${levels[i]}) skips a level after h${levels[i - 1]}`).toBeLessThanOrEqual(1);
    }
  });

  test('SCEN-CARD-006: the macro renders the heading level it is given', async ({ page }) => {
    // the example above is written to match the macro: confirm the macro agrees
    await page.goto('/examples/card-heading-level.html');
    const outline = await page.locator('#hl-outline li').allTextContents();
    expect(outline).toEqual([
      'h1: Your health services',
      'h2: Appointments',
      'h3: Default heading level (h3)',
      'h2: Records',
      'h3: Vaccinations',
      'h4: Overridden heading level (h4)',
      'h2: Overridden heading level (h2)',
    ]);
  });

  test('SCEN-CARD-008: selecting the card body or the title opens the same destination', async ({ page }) => {
    await page.goto('/examples/card-clickable.html');
    const card = page.locator('#cc-one');
    const box = await card.boundingBox();

    // the card body: an empty corner of the card, away from the title text
    await page.mouse.click(box.x + box.width - 20, box.y + box.height - 12);
    await expect(page).toHaveURL(/#opened-immunisation-records$/);
    await expect(page.locator('#cc-destination')).toHaveText('Destination opened: immunisation-records');

    await page.evaluate(() => { window.location.hash = ''; });
    await page.locator('#cc-one .nhsw-card__title-link').click();
    await expect(page).toHaveURL(/#opened-immunisation-records$/);
  });

  test('SCEN-CARD-008: each card opens its own destination', async ({ page }) => {
    await page.goto('/examples/card-clickable.html');
    const box = await page.locator('#cc-two').boundingBox();
    await page.mouse.click(box.x + box.width - 20, box.y + box.height - 12);
    await expect(page).toHaveURL(/#opened-test-results$/);
  });
});

test.describe('Error summary (SCEN-ERROR-003, SCEN-ERROR-010)', () => {
  test('SCEN-ERROR-003: keyboard focus moves to the error summary when the page reloads with errors', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html?submitted=1');

    const summary = page.locator('.nhsw-error-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.nhsw-error-summary__link').first()).toBeFocused();
  });

  test('SCEN-ERROR-003: submitting the form with errors reloads the page with focus on the summary', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html');
    await expect(page.locator('.nhsw-error-summary')).toHaveCount(0);

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('.nhsw-error-summary')).toBeFocused();
  });

  test('SCEN-ERROR-003: a page without errors does not take focus', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html');
    const focusedTag = await page.evaluate(() => document.activeElement.tagName);
    expect(focusedTag).toBe('BODY');
  });

  test('SCEN-ERROR-010: errors are listed in the same order as the form fields', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html?submitted=1');

    const order = await page.evaluate(() => {
      const hrefs = [...document.querySelectorAll('.nhsw-error-summary__link')].map((a) => a.getAttribute('href').slice(1));
      const fields = hrefs.map((id) => document.getElementById(id));
      const inFormOrder = fields.every((field, i) => i === 0 || (fields[i - 1].compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
      return { hrefs, inFormOrder };
    });
    expect(order.hrefs).toEqual(['ev-name', 'ev-nhs', 'ev-contact', 'ev-message']);
    expect(order.inFormOrder).toBe(true);
  });

  test('SCEN-ERROR-010: only the fields with errors are listed, still in form order', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html?submitted=1&name=Ada&nhs=1234567890');
    const hrefs = await page.locator('.nhsw-error-summary__link').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(['#ev-contact', '#ev-message']);
  });

  test('a link in the summary moves focus to the field it points at, and a group to its first option', async ({ page }) => {
    await page.goto('/examples/error-summary-validation.html?submitted=1');

    await page.getByRole('link', { name: 'Enter your full name' }).click();
    await expect(page.locator('#ev-name')).toBeFocused();

    await page.getByRole('link', { name: 'Select how you want to be contacted' }).click();
    await expect(page.locator('#ev-contact')).toBeFocused();
  });
});

test.describe('File upload error (SCEN-FILE-010)', () => {
  test('SCEN-FILE-010: the error state shows a red border and an error message above the box, not colour alone (WCAG 2.2 SC 1.4.1)', async ({ page }) => {
    await page.goto('/examples/file-upload-validation.html?submitted=1');

    const message = page.locator('#fu-error');
    const box = page.locator('.nhsw-file-upload');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Select a file to upload');
    await expect(message.locator('.nhsw-visually-hidden')).toHaveText('Error: ');

    const borderColour = await box.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(borderColour).toBe('rgb(213, 40, 27)');

    const messageBox = await message.boundingBox();
    const uploadBox = await box.boundingBox();
    expect(messageBox.y + messageBox.height).toBeLessThanOrEqual(uploadBox.y + 0.5);

    const input = page.locator('#fu-file');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', 'fu-error');
  });

  test('SCEN-FILE-010: the error can be recreated by submitting without choosing a file', async ({ page }) => {
    await page.goto('/examples/file-upload-validation.html');
    await expect(page.locator('#fu-error')).toBeHidden();
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(page.locator('#fu-error')).toBeVisible();
  });
});

test.describe('Radios, smaller variant (SCEN-RADIO-004)', () => {
  test('SCEN-RADIO-004: the circle and its hit area are still comfortable to select (WCAG 2.2 SC 2.5.8)', async ({ page }) => {
    await page.goto('/examples/radios-small.html');

    const sizes = await page.evaluate(() => [...document.querySelectorAll('.nhsw-radios--small .nhsw-radios__item')].map((item) => {
      const label = item.querySelector('label').getBoundingClientRect();
      const input = item.querySelector('input').getBoundingClientRect();
      const circle = getComputedStyle(item.querySelector('label'), '::before');
      return {
        labelHeight: label.height, labelWidth: label.width,
        inputWidth: input.width, inputHeight: input.height,
        circleWidth: parseFloat(circle.width), circleHeight: parseFloat(circle.height),
      };
    }));
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(Math.min(size.labelHeight, size.inputHeight), JSON.stringify(size)).toBeGreaterThanOrEqual(24);
      expect(size.circleWidth, JSON.stringify(size)).toBeGreaterThanOrEqual(24);
    }
  });
});

test.describe('Select with long options (SCEN-SELECT-009)', () => {
  test('SCEN-SELECT-009: a wide select shows the long selected value in full', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/examples/select-long-option.html');

    const fit = await page.locator('#sl-wide').evaluate((el) => {
      const style = getComputedStyle(el);
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const text = el.options[el.selectedIndex].text;
      const room = el.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      return { textWidth: context.measureText(text).width, room };
    });
    expect(fit.room).toBeGreaterThanOrEqual(fit.textWidth);
  });

  for (const width of [1100, 700, 320]) {
    test(`SCEN-SELECT-009: a narrow column never makes a select spill out of it, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/examples/select-long-option.html');

      const result = await page.evaluate(() => {
        const select = document.getElementById('sl-narrow');
        const column = select.closest('.nhsw-grid-column-one-third');
        const s = select.getBoundingClientRect();
        const c = column.getBoundingClientRect();
        return { selectRight: s.right, columnInnerRight: c.right - parseFloat(getComputedStyle(column).paddingRight), sideways: document.documentElement.scrollWidth > window.innerWidth };
      });
      expect(result.selectRight).toBeLessThanOrEqual(result.columnInnerRight + 0.5);
      expect(result.sideways).toBe(false);
    });
  }
});

test.describe('Site navigation (SCEN-NAV-008)', () => {
  test('SCEN-NAV-008: the current page is distinguishable without colour alone (WCAG 2.2 SC 1.4.1)', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/examples/site-navigation-current-page.html');

    const styles = await page.evaluate(() => {
      const read = (a) => {
        const s = getComputedStyle(a);
        return { underline: s.textDecorationLine, shadow: s.boxShadow, ariaCurrent: a.getAttribute('aria-current') };
      };
      const links = [...document.querySelectorAll('nav[aria-label="Primary navigation"] .nhsw-site-header__nav-link')];
      return { current: read(links[0]), other: read(links[1]) };
    });
    // shape cues, not just colour: a bar under the current item, no underline on it, an underline on the others
    expect(styles.current.shadow).not.toBe('none');
    expect(styles.current.underline).toBe('none');
    expect(styles.other.underline).toBe('underline');
    expect(styles.current.ariaCurrent).toBe('page');
    expect(styles.other.ariaCurrent).toBeNull();
  });

  test('SCEN-NAV-008: in greyscale the current page still stands out from the others', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/examples/site-navigation-current-page.html');
    await page.getByRole('button', { name: /Greyscale view/ }).click();
    await expect(page.getByRole('button', { name: 'Greyscale view: on' })).toHaveAttribute('aria-pressed', 'true');

    // compare the current item's bar with the list's own underline: strong contrast, by lightness alone
    const contrast = await page.evaluate(() => {
      const luminance = ([r, g, b]) => {
        const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
      const link = document.querySelector('.nhsw-site-header__nav-link--current');
      const barColour = rgb(getComputedStyle(link).boxShadow);
      const list = rgb(getComputedStyle(document.querySelector('.nhsw-site-header__nav-list')).boxShadow);
      const a = luminance(barColour);
      const b = luminance(list);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Textarea error (SCEN-TEXTAREA-013)', () => {
  test('SCEN-TEXTAREA-013: the error message is clearly associated with the textarea and does not rely on colour alone', async ({ page }) => {
    await page.goto('/examples/textarea-validation.html?submitted=1');

    const message = page.locator('#tv-error');
    const textarea = page.locator('#tv-reason');
    await expect(message).toBeVisible();
    await expect(message.locator('.nhsw-visually-hidden')).toHaveText('Error: ');
    await expect(message).toContainText('Enter a reason for continuing');

    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    const describedBy = (await textarea.getAttribute('aria-describedby')).split(' ');
    expect(describedBy).toContain('tv-error');

    const label = await page.locator('label[for="tv-reason"]').boundingBox();
    const msg = await message.boundingBox();
    const field = await textarea.boundingBox();
    expect(msg.y).toBeGreaterThanOrEqual(label.y + label.height - 1);
    expect(msg.y + msg.height).toBeLessThanOrEqual(field.y + 1);
  });

  test('SCEN-TEXTAREA-013: the error can be recreated by submitting with the box empty', async ({ page }) => {
    await page.goto('/examples/textarea-validation.html');
    await expect(page.locator('#tv-error')).toBeHidden();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#tv-error')).toBeVisible();
    await expect(page.locator('#tv-reason')).toHaveAttribute('aria-invalid', 'true');
  });
});
