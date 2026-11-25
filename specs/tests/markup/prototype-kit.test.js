import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

const root = path.resolve(import.meta.dirname, '../../..');
const preview = path.join(root, 'preview');
const kit = path.join(preview, 'prototype-kit');

function collect(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? collect(full) : [full];
  });
}

const pages = collect(kit).map((file) => {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const [, front, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return { url: '/' + path.relative(preview, file).split(path.sep).join('/'), data: loadYaml(front), body };
});
const byUrl = Object.fromEntries(pages.map((p) => [p.url, p]));
const nav = loadYaml(fs.readFileSync(path.join(preview, '_data/prototype_kit_nav.yml'), 'utf8'));
const guides = pages.filter((p) => p.data.layout === 'prototype-kit-guide');

function targets(page) {
  const fromBody = [...page.body.matchAll(/\{\{ '([^']+)' \| relative_url \}\}/g)].map((m) => m[1]);
  const fromFront = [...(page.data.breadcrumbs || []), page.data.prev_step, page.data.next_step]
    .filter(Boolean)
    .map((link) => link.url);
  return [...fromBody, ...fromFront];
}

describe('prototype kit pages', () => {
  it('has all 25 screens', () => {
    expect(pages).toHaveLength(25);
  });

  it.each(pages.map((p) => [p.url, p]))('%s is kept out of the design system search', (_url, page) => {
    expect(page.data.search_exclude).toBe(true);
  });

  it.each(pages.map((p) => [p.url, p]))('%s links only to pages and files that exist', (_url, page) => {
    const missing = targets(page).filter((target) => !fs.existsSync(path.join(preview, target.split('#')[0])));
    expect(missing).toEqual([]);
  });

  it.each(guides.map((p) => [p.url, p]))('%s belongs to a section and a side navigation', (_url, page) => {
    expect(['set-up', 'guides', 'support']).toContain(page.data.section);
    expect(nav[page.data.side_nav]).toBeTruthy();
    expect(page.data.breadcrumbs.length).toBeGreaterThan(0);
  });

  it('only links the side navigation to pages and headings that exist', () => {
    for (const { items } of Object.values(nav)) {
      for (const { url } of items) {
        const [target, anchor] = url.split('#');
        expect(byUrl[target], url).toBeTruthy();
        if (anchor) expect(byUrl[target].body).toContain(`id="${anchor}"`);
      }
    }
  });

  it('labels every previous and next link with the title of the page it opens', () => {
    const exceptions = ['Step 6: Save your changes to GitHub'];
    for (const page of guides) {
      for (const link of [page.data.prev_step, page.data.next_step].filter(Boolean)) {
        if (exceptions.includes(link.label)) continue;
        const target = byUrl[link.url].data.title;
        if (page.url.endsWith('/your-computer-is-ready.html')) continue;
        expect(link.label.toLowerCase(), `${page.url} to ${link.url}`).toBe(target.toLowerCase());
      }
    }
  });

  it.each([
    'confirm with Joel',
    'check this with Joel',
    'speak to Joel',
    '[?]',
    '[CONFIRM',
    '[Confirm',
    '[folder name]',
    '[<b>folder</b>]',
    '<b>filename</b>',
    '(TEMPLATE LINK)',
    '(DHCW org?)',
    'DESKSTOP',
    'Command Promp</b>t',
    '[insert',
    '?????',
  ])('no longer shows "%s"', (text) => {
    expect(pages.filter((page) => page.body.includes(text)).map((page) => page.url)).toEqual([]);
  });

  it('links the Service Desk wherever the text tells someone about it', () => {
    const unlinked = pages.filter((page) => {
      const text = [...page.body.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((match) => match[2]);
      return text.some((html) => html.replace(/<a [^>]*>Service Desk<\/a>/g, '').includes('Service Desk'));
    });

    expect(unlinked.map((page) => page.url)).toEqual([]);
  });

  it('only has text in place of a screenshot where one still needs a signed-in account', () => {
    const waiting = pages.filter((page) => /SCREENSHOT[^<]*[\])]/.test(page.body)).map((page) => page.url);

    expect(waiting.sort()).toEqual([
      '/prototype-kit/create-a-new-prototype/create-the-prototype.html',
      '/prototype-kit/set-up-your-computer/get-a-github-account.html',
    ]);
  });

  it('uses every screenshot in the assets folder', () => {
    const bodies = pages.map((page) => page.body).join('\n');
    const unused = fs.readdirSync(path.join(preview, 'assets/prototype-kit')).filter((file) => !bodies.includes(file));

    expect(unused).toEqual([]);
  });

  it('gives every screenshot image a text alternative', () => {
    for (const page of pages) {
      for (const [img] of page.body.matchAll(/<img [^>]*>/g)) {
        expect(img, page.url).toMatch(/ alt="[^"]{20,}"/);
      }
    }
  });
});
