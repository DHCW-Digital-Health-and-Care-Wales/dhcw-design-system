(function () {
  'use strict';

  var PAGE_SIZE = 10;
  var app = document.getElementById('search-app');
  var index = window.NHSW_SEARCH_INDEX;
  if (!app || !index) return;

  var base = app.getAttribute('data-base') || '/';
  var heading = document.getElementById('search-heading');
  var input = document.getElementById('search-query');
  var clear = document.getElementById('search-clear');
  var output = document.getElementById('search-output');

  var ARROW_PREVIOUS = 'M0.292893 6.65666C-0.0976314 7.04719 -0.0976315 7.68035 0.292892 8.07087L6.65685 14.4348C7.04738 14.8254 7.68054 14.8254 8.07107 14.4348C8.46159 14.0443 8.46159 13.4111 8.07107 13.0206L2.41421 7.36377L8.07107 1.70691C8.46159 1.31639 8.46159 0.683225 8.07107 0.292701C7.68054 -0.0978235 7.04738 -0.0978235 6.65686 0.292701L0.292893 6.65666ZM17 7.36377L17 6.36377L1 6.36377L1 7.36377L1 8.36377L17 8.36377L17 7.36377Z';
  var ARROW_NEXT = 'M16.7071 8.07088C17.0976 7.68035 17.0976 7.04719 16.7071 6.65666L10.3431 0.292703C9.95262 -0.0978218 9.31946 -0.0978219 8.92893 0.292703C8.53841 0.683227 8.53841 1.31639 8.92893 1.70692L14.5858 7.36377L8.92893 13.0206C8.53841 13.4111 8.53841 14.0443 8.92893 14.4348C9.31946 14.8254 9.95262 14.8254 10.3431 14.4348L16.7071 8.07088ZM0 7.36377L-8.74224e-08 8.36377L16 8.36377L16 7.36377L16 6.36377L8.74224e-08 6.36377L0 7.36377Z';

  function params() {
    var result = {};
    var query = window.location.search.replace(/^\?/, '');
    if (!query) return result;
    query.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      var key = decodeURIComponent(parts[0].replace(/\+/g, ' '));
      result[key] = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
    });
    return result;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  var CATEGORIES = ['components', 'styles', 'patterns', 'get started', 'content guide'];

  function words(text) {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }

  // Buttons and button count as the same word.
  function stem(word) {
    return word.length > 3 ? word.replace(/s$/, '') : word;
  }

  function hasWord(text, term) {
    var target = stem(term);
    return words(text).some(function (word) { return stem(word) === target; });
  }

  // How close a page is to one search word, from 0 (not at all) to 100 (the page is called exactly that).
  function termScore(entry, term) {
    var title = entry.t.toLowerCase();
    var titleWords = words(title);
    if (hasWord(title, term)) return titleWords.length === 1 ? 100 : 85;
    if (title.indexOf(term) === 0) return 75;
    if (title.indexOf(term) !== -1) return 60;
    var headings = entry.h.join(' ').toLowerCase();
    var description = entry.d.toLowerCase();
    var body = entry.b.toLowerCase();
    if (hasWord(headings, term)) return 50;
    if (hasWord(description, term)) return 45;
    if (headings.indexOf(term) !== -1) return 35;
    if (description.indexOf(term) !== -1) return 30;
    if (hasWord(body, term)) return 20;
    if (body.indexOf(term) !== -1) return 10;
    return 0;
  }

  // A whole category name in the search, such as "components", limits the results to that section.
  function splitCategory(query) {
    var text = ' ' + query.toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
    for (var i = 0; i < CATEGORIES.length; i += 1) {
      var name = ' ' + CATEGORIES[i] + ' ';
      var at = text.indexOf(name);
      if (at !== -1) {
        return {
          category: CATEGORIES[i],
          rest: (text.slice(0, at) + ' ' + text.slice(at + name.length)).replace(/\s+/g, ' ').trim()
        };
      }
    }
    return { category: '', rest: text.trim() };
  }

  function search(query) {
    var parts = splitCategory(query);
    var terms = parts.rest.split(' ').filter(Boolean);
    if (!terms.length && !parts.category) return [];
    var matches = [];
    index.forEach(function (entry) {
      if (parts.category && (entry.c || '').toLowerCase() !== parts.category) return;
      var total = 0;
      for (var i = 0; i < terms.length; i += 1) {
        var termResult = termScore(entry, terms[i]);
        if (!termResult) return;
        total += termResult;
      }
      matches.push({ entry: entry, percent: terms.length ? Math.round(total / terms.length) : (hasWord(entry.t, parts.category) ? 100 : 90) });
    });
    matches.sort(function (x, y) {
      return y.percent - x.percent || x.entry.t.localeCompare(y.entry.t);
    });
    return matches.map(function (m) { return m.entry; });
  }

  function arrow(path, className) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 17 15');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }

  function pageHref(query, page) {
    return window.location.pathname + '?q=' + encodeURIComponent(query) + (page > 1 ? '&page=' + page : '');
  }

  function paginationItem(kind, query, target, page, pages) {
    var li = el('li', 'nhsw-pagination-item--' + kind);
    var a = el('a', 'nhsw-pagination__link');
    a.href = pageHref(query, target);
    a.setAttribute('rel', kind === 'next' ? 'next' : 'prev');
    a.appendChild(arrow(kind === 'next' ? ARROW_NEXT : ARROW_PREVIOUS, 'nhsw-icon'));
    a.appendChild(el('span', 'nhsw-pagination__title', kind === 'next' ? 'Next' : 'Previous'));
    a.appendChild(el('span', 'nhsw-pagination__page', page + ' of ' + pages));
    li.appendChild(a);
    return li;
  }

  function renderPagination(query, page, pages) {
    if (pages < 2) return null;
    var wrapper = el('div', 'nhsw-search-results__pagination');
    var nav = el('nav', 'nhsw-pagination');
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Pagination');
    var list = el('ul', 'nhsw-pagination__list');
    if (page > 1) list.appendChild(paginationItem('previous', query, page - 1, page, pages));
    if (page < pages) list.appendChild(paginationItem('next', query, page + 1, page, pages));
    nav.appendChild(list);
    wrapper.appendChild(nav);
    return wrapper;
  }

  function renderResults(query, matches, requestedPage) {
    var pages = Math.ceil(matches.length / PAGE_SIZE);
    var page = Math.min(Math.max(requestedPage, 1), pages);
    var first = (page - 1) * PAGE_SIZE;
    var shown = matches.slice(first, first + PAGE_SIZE);

    heading.textContent = 'Search results for ' + query;
    output.appendChild(el('p', 'nhsw-body nhsw-search-results__summary',
      (first + 1) + ' – ' + (first + shown.length) + ' of ' + matches.length + ' results for "' + query + '"'));

    var list = el('ol', 'nhsw-search-results');
    shown.forEach(function (entry) {
      var item = el('li', 'nhsw-search-results__item');
      var title = el('h2', 'nhsw-search-results__title');
      var link = el('a', 'nhsw-link', entry.t);
      link.href = base + entry.u;
      title.appendChild(link);
      item.appendChild(title);
      if (entry.d) item.appendChild(el('p', 'nhsw-body nhsw-search-results__description', entry.d));
      list.appendChild(item);
    });
    output.appendChild(list);

    var pagination = renderPagination(query, page, pages);
    if (pagination) output.appendChild(pagination);
  }

  function renderNoResults() {
    heading.textContent = 'No results';
    output.appendChild(el('p', 'nhsw-body', 'You could try:'));
    var list = el('ul', 'nhsw-body');
    ['check your spelling', 'use fewer keywords', 'search for something less specific'].forEach(function (text) {
      list.appendChild(el('li', '', text));
    });
    output.appendChild(list);
  }

  function updateClear() {
    clear.hidden = !input.value;
  }

  input.addEventListener('input', updateClear);
  clear.addEventListener('click', function () {
    input.value = '';
    updateClear();
    input.focus();
  });

  var values = params();
  var hasQuery = Object.prototype.hasOwnProperty.call(values, 'q');
  var query = (values.q || '').replace(/\s+/g, ' ').trim();
  input.value = query;
  updateClear();

  if (hasQuery) {
    var matches = search(query);
    if (matches.length) {
      renderResults(query, matches, parseInt(values.page, 10) || 1);
      document.title = 'Search results for ' + query + ' – DHCW Design System';
    } else {
      renderNoResults();
      document.title = 'No results – DHCW Design System';
    }
  }
})();
