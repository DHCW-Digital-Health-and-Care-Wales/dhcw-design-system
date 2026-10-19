import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const include = fs.readFileSync(path.join(root, 'preview/_includes/code-viewer.html'), 'utf8');

describe('code viewer Figma tab', () => {
  it('is only rendered when a figma url is passed, opening in a new tab', () => {
    expect(include).toMatch(/\{% if include\.figma %\}[\s\S]*href="\{\{ include\.figma \}\}"[\s\S]*target="_blank"[\s\S]*\{% endif %\}/);
    expect(include).toContain('rel="noopener"');
  });

  it('tells screen reader users the link opens in a new tab', () => {
    expect(include).toContain('nhsw-visually-hidden');
    expect(include).toContain('(opens in a new tab)');
  });
});

describe('checkboxes guidance', () => {
  it('links "radio" in the "only choose one option" guidance to the radios page', () => {
    const page = fs.readFileSync(path.join(root, 'preview/components/checkboxes.html'), 'utf8');
    expect(page).toContain(`In this case, use a <a class="nhsw-link" href="{{ '/components/radios.html' | relative_url }}">radio</a>.`);
  });
});

describe('error summary page examples', () => {
  const page = fs.readFileSync(path.join(root, 'preview/components/error-summary.html'), 'utf8');
  const rendered = page.split('\n').filter((line) => !line.includes('&lt;') && !line.includes('{% include'));

  it('no id is used by more than one example on the page, so each summary link goes to its own example', () => {
    const ids = rendered.join('\n').match(/\sid="[^"]+"/g) || [];
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('the timeout summary link points at the field in its own example, and has no separate Timeout heading', () => {
    expect(page).toContain('href="#full-name-timeout">Your login attempt timed out');
    expect(page).toContain('id="full-name-timeout"');
    expect(page).not.toContain('<h3 class="nhsw-h3">Timeout</h3>');
  });
});
