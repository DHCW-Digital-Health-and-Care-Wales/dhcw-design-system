import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswSiteNavigation: the overflow menu is an opt-in variant, and the default is unchanged', () => {
  let env;
  beforeAll(() => {
    env = configure({ noCache: true });
  });

  const items = [
    { text: 'One', href: '/1', current: true },
    { text: 'Two', href: '/2' },
  ];

  function render(params = {}) {
    const html = env.renderString(
      '{% from "site-navigation/macro.njk" import nhswSiteNavigation %}{{ nhswSiteNavigation(params) }}',
      { params: { items, ...params } },
    );
    return new JSDOM(`<body>${html}</body>`).window.document;
  }

  describe('by default', () => {
    it('renders only the links: no overflow class and no menu item', () => {
      const doc = render();
      const nav = doc.querySelector('nav');
      expect(nav.className).toBe('nhsw-site-header__nav');
      expect(doc.querySelector('.nhsw-site-header__menu')).toBeNull();
      expect(doc.querySelector('.nhsw-site-header__menu-toggle')).toBeNull();
      expect(doc.querySelectorAll('.nhsw-site-header__nav-list > li')).toHaveLength(2);
    });

    it('keeps the current page marking and the reverse variant exactly as before', () => {
      const doc = render({ classes: 'nhsw-site-header__nav--reverse' });
      expect(doc.querySelector('nav').className).toBe('nhsw-site-header__nav nhsw-site-header__nav--reverse');
      const links = [...doc.querySelectorAll('.nhsw-site-header__nav-list a')];
      expect(links[0].getAttribute('aria-current')).toBe('page');
      expect(links[1].hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('with overflowMenu: true', () => {
    it('adds the overflow class to the nav, ahead of any other classes', () => {
      const nav = render({ overflowMenu: true, classes: 'nhsw-site-header__nav--reverse' }).querySelector('nav');
      expect(nav.className).toBe('nhsw-site-header__nav nhsw-site-header__nav--overflow nhsw-site-header__nav--reverse');
    });

    it('adds a hidden menu item as the last item in the list, after the real links', () => {
      const list = render({ overflowMenu: true }).querySelector('.nhsw-site-header__nav-list');
      const last = list.lastElementChild;
      expect(last.classList.contains('nhsw-site-header__menu')).toBe(true);
      expect(last.hasAttribute('hidden')).toBe(true);
      expect(list.children).toHaveLength(3);
    });

    it('the menu button is a real button that starts collapsed, styled as a nav link', () => {
      const button = render({ overflowMenu: true }).querySelector('.nhsw-site-header__menu-toggle');
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.classList.contains('nhsw-site-header__nav-link')).toBe(true);
    });

    it('announces "Browse More" and shows "More", as the NHS.UK header does', () => {
      const button = render({ overflowMenu: true }).querySelector('.nhsw-site-header__menu-toggle');
      const hidden = button.querySelector('.nhsw-visually-hidden');
      expect(hidden.textContent).toBe('Browse ');
      expect(button.textContent).toBe('Browse More');
    });

    it('toggleMenuText and toggleMenuVisuallyHiddenText change the wording', () => {
      const button = render({ overflowMenu: true, toggleMenuText: 'Menu', toggleMenuVisuallyHiddenText: 'Open' })
        .querySelector('.nhsw-site-header__menu-toggle');
      expect(button.textContent).toBe('Open Menu');
    });

    it('keeps the real links and current page marking', () => {
      const doc = render({ overflowMenu: true });
      const links = [...doc.querySelectorAll('.nhsw-site-header__nav-list > li:not(.nhsw-site-header__menu) a')];
      expect(links.map((a) => a.textContent)).toEqual(['One', 'Two']);
      expect(links[0].getAttribute('aria-current')).toBe('page');
    });
  });
});
