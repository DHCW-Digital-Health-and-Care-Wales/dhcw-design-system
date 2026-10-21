import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runScript } from '../support/load-script.js';

const root = path.resolve(import.meta.dirname, '../../..');
const nodeRequire = createRequire(import.meta.url);
const { buildIndex, toText } = nodeRequire('../../../scripts/build-search-index.js');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('search index', () => {
  const index = buildIndex();
  const byUrl = Object.fromEntries(index.map((e) => [e.u, e]));

  it('holds every documentation page, but not examples, testing pages or the search page itself', () => {
    expect(byUrl['components/buttons.html']).toBeTruthy();
    expect(byUrl['styles/colours.html']).toBeTruthy();
    expect(byUrl['get-started/index.html']).toBeTruthy();
    expect(index.some((e) => e.u.startsWith('examples/') || e.u.startsWith('testing/') || e.u === 'search.html')).toBe(false);
  });

  it('uses the page intro as the description, the first paragraph otherwise, and skips "Updated in" lines', () => {
    expect(byUrl['components/buttons.html'].d).toBe('Use buttons to help users to complete an action, like starting an application or saving their progress.');
    expect(byUrl['contact-us.html'].d).toMatch(/^If you have a question, feedback or idea/);
    expect(byUrl['styles/colours.html'].d).not.toMatch(/^Updated in/);
  });

  it('puts every page in the section it belongs to', () => {
    expect(byUrl['components/buttons.html'].c).toBe('Components');
    expect(byUrl['styles/colours.html'].c).toBe('Styles');
    expect(byUrl['styles.html'].c).toBe('Styles');
    expect(byUrl['get-started/setting-up-figma-prototypes.html'].c).toBe('Get started');
    expect(byUrl['patterns/page-templates.html'].c).toBe('Patterns');
    expect(byUrl['content-guide.html'].c).toBe('Content guide');
    expect(byUrl['contact-us.html'].c).toBe('');
  });

  it('gives every page a title and a description', () => {
    for (const entry of index) {
      expect(entry.t, entry.u).toBeTruthy();
      expect(entry.d, entry.u).toBeTruthy();
    }
  });

  it('turns markup and entities into plain text', () => {
    expect(toText('<p>Use <a href="#">links</a> &amp; &quot;buttons&quot;</p>')).toBe('Use links & "buttons"');
  });

  it('is committed as a script that sets window.NHSW_SEARCH_INDEX with an entry for every indexed page', () => {
    const file = read('preview/assets/search-index.js');
    expect(file).toContain('window.NHSW_SEARCH_INDEX = [');
    const committed = new Function('window', file + '; return window.NHSW_SEARCH_INDEX;')({});
    expect(committed.map((e) => e.u).sort()).toEqual(index.map((e) => e.u).sort());
  });
});

describe('search page', () => {
  const page = read('preview/search.html');
  const header = read('preview/_includes/site-header.html');

  it('searches only when the form is sent, by Enter or the search button, to /search.html?q=', () => {
    expect(page).toContain('method="get"');
    expect(page).toContain('name="q"');
    expect(page).toContain('type="submit"');
    expect(header).toContain("action=\"{{ '/search.html' | relative_url }}\" method=\"get\"");
    expect(header).toContain('name="q"');
  });

  it('is grey, has no header search or phase banner, and does not load the index with the page', () => {
    expect(page).toContain('main_modifier: grey');
    expect(page).toContain('hide_header_search: true');
    expect(page).toContain('hide_phase_banner: true');
    expect(page).not.toContain('search-index.js');
    expect(page).toContain('/assets/nhsw-search.js');
  });
});

describe('search script', () => {
  const INDEX = [
    { t: 'Buttons', u: 'components/buttons.html', d: 'Use buttons to help users to complete an action.', h: [], b: 'buttons everywhere' },
    { t: 'Back link', u: 'components/back-link.html', d: 'Use back links to go back.', h: [], b: 'about buttons too' },
    { t: 'Radios', u: 'components/radios.html', d: 'Use radios to choose one option.', h: [], b: 'nothing relevant' },
  ];
  INDEX.forEach((e) => { e.c = e.u.indexOf('components/') === 0 ? 'Components' : ''; });
  INDEX.push({ t: 'Colours', u: 'styles/colours.html', c: 'Styles', d: 'Use colour palettes.', h: [], b: 'buttons use these colours' });
  INDEX.push({ t: 'Styles', u: 'styles.html', c: 'Styles', d: 'Visual identity.', h: [], b: '' });
  for (let i = 0; i < 12; i += 1) INDEX.push({ t: 'Page ' + i, u: 'p' + i + '.html', d: 'Filler ' + i, h: [], b: 'zebra' });

  function load(queryString) {
    document.body.innerHTML = `
      <div id="search-app" data-base="/site/">
        <h1 id="search-heading">Search</h1>
        <input id="search-query" type="search">
        <button id="search-clear" type="button" hidden></button>
        <div id="search-output"></div>
      </div>`;
    window.history.pushState({}, '', '/search.html' + queryString);
    window.NHSW_SEARCH_INDEX = INDEX;
    runScript('preview/assets/nhsw-search.js');
  }

  beforeEach(() => { document.body.innerHTML = ''; });

  it('lists matching pages, best match first, linking under the site base address', () => {
    load('?q=buttons');
    expect(document.getElementById('search-heading').textContent).toBe('Search results for buttons');
    const titles = [...document.querySelectorAll('.nhsw-search-results__title a')];
    expect(titles.map((a) => a.textContent)).toEqual(['Buttons', 'Back link', 'Colours']);
    expect(titles[0].getAttribute('href')).toBe('/site/components/buttons.html');
    expect(document.querySelector('.nhsw-search-results__summary').textContent).toBe('1 – 3 of 3 results for "buttons"');
    expect(document.querySelector('.nhsw-search-results__description').textContent).toBe('Use buttons to help users to complete an action.');
    expect(document.getElementById('search-query').value).toBe('buttons');
    expect(document.getElementById('search-clear').hidden).toBe(false);
  });

  it('orders results by how close they are: the page called that, then mentions in the description, then in the text', () => {
    load('?q=button');
    expect([...document.querySelectorAll('.nhsw-search-results__title a')].map((a) => a.textContent)).toEqual(['Buttons', 'Back link', 'Colours']);
  });

  it('treats a whole category name as a section to list, or to search within', () => {
    load('?q=styles');
    expect([...document.querySelectorAll('.nhsw-search-results__title a')].map((a) => a.textContent)).toEqual(['Styles', 'Colours']);
    load('?q=styles+buttons');
    expect([...document.querySelectorAll('.nhsw-search-results__title a')].map((a) => a.textContent)).toEqual(['Colours']);
    load('?q=components');
    expect(document.querySelectorAll('.nhsw-search-results__item').length).toBe(3);
  });

  it('shows "No results" with suggestions when nothing matches', () => {
    load('?q=qqqq');
    expect(document.getElementById('search-heading').textContent).toBe('No results');
    expect(document.getElementById('search-output').textContent).toContain('You could try:');
    expect([...document.querySelectorAll('#search-output li')].map((li) => li.textContent)).toEqual(['check your spelling', 'use fewer keywords', 'search for something less specific']);
  });

  it('shows 10 results a page with Next, and Previous on later pages', () => {
    load('?q=e');
    expect(document.querySelectorAll('.nhsw-search-results__item')).toHaveLength(10);
    expect(document.querySelector('.nhsw-search-results__summary').textContent).toMatch(/^1 – 10 of \d+ results for "e"$/);
    expect(document.querySelector('.nhsw-pagination-item--next .nhsw-pagination__page').textContent).toMatch(/^1 of \d+$/);
    expect(document.querySelector('.nhsw-pagination-item--previous')).toBeNull();
    load('?q=e&page=2');
    expect(document.querySelector('.nhsw-pagination-item--previous')).not.toBeNull();
  });

  it('shows what was typed as text, not markup', () => {
    load('?q=%3Cb%3E');
    expect(document.querySelector('#search-heading b')).toBeNull();
    expect(document.getElementById('search-heading').textContent).toBe('No results');
  });

  it('the clear button empties the box and hides itself', () => {
    load('?q=buttons');
    document.getElementById('search-clear').click();
    expect(document.getElementById('search-query').value).toBe('');
    expect(document.getElementById('search-clear').hidden).toBe(true);
  });

  describe('fetching the list of pages', () => {
    const pageScripts = () => [...document.head.querySelectorAll('script[src]')].map((script) => script.getAttribute('src'));

    function loadWithoutIndex(queryString) {
      document.head.querySelectorAll('script[src]').forEach((script) => script.remove());
      delete window.NHSW_SEARCH_INDEX;
      document.body.innerHTML = `
        <div id="search-app" data-base="/site/">
          <h1 id="search-heading">Search</h1>
          <input id="search-query" type="search">
          <button id="search-clear" type="button" hidden></button>
          <div id="search-output"></div>
        </div>`;
      window.history.pushState({}, '', '/search.html' + queryString);
      runScript('preview/assets/nhsw-search.js');
    }

    it('does not fetch it when the page is opened without a search', () => {
      loadWithoutIndex('');
      expect(pageScripts()).toEqual([]);
      expect(document.getElementById('search-output').children.length).toBe(0);
    });

    it('fetches it from under the site base address when there is a search, and shows the results once it has arrived', () => {
      loadWithoutIndex('?q=buttons');
      expect(pageScripts()).toEqual(['/site/assets/search-index.js']);
      expect(document.querySelector('.nhsw-search-results')).toBeNull();

      window.NHSW_SEARCH_INDEX = INDEX;
      document.head.querySelector('script[src]').onload();
      expect([...document.querySelectorAll('.nhsw-search-results__title a')].map((a) => a.textContent)).toEqual(['Buttons', 'Back link', 'Colours']);
    });

    it('says search is not available when the list cannot be fetched', () => {
      loadWithoutIndex('?q=buttons');
      document.head.querySelector('script[src]').onerror();
      expect(document.getElementById('search-output').textContent).toBe('Search is not available at the moment.');
    });

    it('does not fetch it again when it is already there', () => {
      load('?q=buttons');
      expect(pageScripts()).not.toContain('/site/assets/search-index.js');
    });
  });
});
