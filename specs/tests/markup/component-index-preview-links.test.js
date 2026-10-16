import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const html = fs.readFileSync(path.join(root, 'preview/components/index.html'), 'utf8');
const cards = html.split('<li class="nhsw-grid-column-one-third nhsw-card-group__item">').slice(1);

describe('components index: preview images link to the component page', () => {
  it('finds the component cards', () => {
    expect(cards.length).toBeGreaterThan(20);
  });

  it.each(cards.map((c, i) => [c.match(/nhsw-card__title">([^<]*)</)?.[1] ?? `card ${i}`, c]))('%s', (_name, card) => {
    const preview = card.match(/<a class="nhsw-card__preview nhsw-card__preview--link" href="([^"]+)"([^>]*)>/);
    expect(preview, 'preview is a link').not.toBeNull();
    const docHref = card.match(/<a class="nhsw-link" href="([^"]+)"/)?.[1];
    expect(preview[1]).toBe(docHref);
    expect(preview[2]).toContain('tabindex="-1"');
    expect(preview[2]).toContain('aria-hidden="true"');
  });
});
