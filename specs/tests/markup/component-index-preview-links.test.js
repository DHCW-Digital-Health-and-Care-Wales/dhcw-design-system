import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const html = fs.readFileSync(path.join(root, 'preview/components/index.html'), 'utf8');
const cards = html.split('<li class="nhsw-grid-column-one-third nhsw-card-group__item">').slice(1);

describe('components index: each card is one link to the component page', () => {
  it('finds the component cards', () => {
    expect(cards.length).toBeGreaterThan(20);
  });

  it.each(cards.map((c, i) => [c.match(/nhsw-card__title-link" href="[^"]*">([^<]*)</)?.[1] ?? `card ${i}`, c]))('%s', (_name, card) => {
    expect(card).toContain('class="nhsw-card nhsw-card--preview"');
    expect(card).toMatch(/<div class="nhsw-card__preview">\s*<img class="nhsw-card__preview-image"[^>]*alt="">\s*<\/div>/);
    expect(card).toMatch(/<h3 class="nhsw-card__title"><a class="nhsw-card__title-link" href="[^"]+">[^<]+<\/a><\/h3>/);
    expect(card).toContain('class="nhsw-card__description"');
    expect(card.match(/<a /g), 'only the title is a link, so the stretched link covers the image').toHaveLength(1);
    expect(card).not.toContain('documentation</a>');
  });
});
