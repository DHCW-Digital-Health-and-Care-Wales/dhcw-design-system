import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../../..');
const previewDir = path.join(projectRoot, 'preview');

// Scenarios the manual testers marked "Could not check" in the master testing
// workbook because there was no example to check them on. Each must now link
// from its testing page to an example page that exists.
const SCENARIOS = [
  ['SCEN-BACK-003', 'back-link', 'Enough space around it', 'back-link-button.html'],
  ['SCEN-BACK-004', 'back-link', '"Back link as a button" performs an action', 'back-link-button.html'],
  ['SCEN-BREAD-008', 'breadcrumb', 'Long breadcrumb labels remain readable', 'breadcrumb-long-label.html'],
  ['SCEN-CARD-006', 'cards', 'Heading level matches the surrounding page structure', 'card-heading-level.html'],
  ['SCEN-CARD-008', 'cards', 'Clicking the card and link behave consistently', 'card-clickable.html'],
  ['SCEN-ERROR-003', 'error-summary', 'Keyboard focus moves to the error summary', 'error-summary-validation.html'],
  ['SCEN-ERROR-010', 'error-summary', 'Errors appear in the same order as the form fields', 'error-summary-validation.html'],
  ['SCEN-FILE-010', 'file-upload', 'Error state is clearly indicated', 'file-upload-validation.html'],
  ['SCEN-RADIO-004', 'radios', 'Smaller variant is still easy to select accurately', 'radios-small.html'],
  ['SCEN-SELECT-009', 'select', 'Long selected values remain readable', 'select-long-option.html'],
  ['SCEN-NAV-008', 'site-navigation', 'Current page remains distinguishable', 'site-navigation-current-page.html'],
  ['SCEN-TEXTAREA-013', 'textarea', 'Error messages are clearly associated', 'textarea-validation.html'],
];

// Not in the list above: SCEN-NAV-002 and SCEN-NAV-012 are about a navigation item that opens a
// submenu. The site navigation has no submenus (the "More" menu of the overflow variant is a
// different feature), so there is no example for them yet. The testing page says so.
const NO_EXAMPLE_YET = [
  ['SCEN-NAV-002', 'site-navigation', 'Expanded menus never cover'],
  ['SCEN-NAV-012', 'site-navigation', 'Expanded submenu remains associated'],
];

describe('every scenario that could not be checked now links to an example page', () => {
  it.each(SCENARIOS)('%s (%s): "%s" links to /examples/%s', (_id, page, label, example) => {
    const html = fs.readFileSync(path.join(previewDir, 'testing', `${page}.html`), 'utf8');
    const start = html.indexOf(label);
    expect(start, `"${label}" not found on the ${page} testing page`).toBeGreaterThan(-1);

    // the link sits in the same checklist item, before the next one starts
    const nextItem = html.indexOf('nhsw-checkboxes__item', start);
    const item = html.slice(start, nextItem === -1 ? undefined : nextItem);
    expect(item, `${page}: no link to ${example} in the item for "${label}"`).toContain(`/examples/${example}`);
  });

  it.each([...new Set(SCENARIOS.map((s) => s[3]))])('/examples/%s exists, uses the example layout, and has a title', (example) => {
    const file = path.join(previewDir, 'examples', example);
    expect(fs.existsSync(file), `${example} is missing`).toBe(true);
    const text = fs.readFileSync(file, 'utf8');
    expect(text).toMatch(/^---\r?\nlayout: example\r?\ntitle: .+\r?\n---/);
  });

  it.each(NO_EXAMPLE_YET)('%s (%s): "%s" says there is no example yet, rather than linking to the overflow menu variant', (_id, page, label) => {
    const html = fs.readFileSync(path.join(previewDir, 'testing', `${page}.html`), 'utf8');
    const start = html.indexOf(label);
    expect(start).toBeGreaterThan(-1);
    const nextItem = html.indexOf('nhsw-checkboxes__item', start);
    const item = html.slice(start, nextItem === -1 ? undefined : nextItem);
    expect(item).toContain('No example yet');
    expect(item).not.toContain('site-navigation-overflow.html');
  });
});
