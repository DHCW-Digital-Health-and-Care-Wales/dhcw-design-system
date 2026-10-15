import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { configure } from '../../../src/nunjucks.config.js';

describe('nhswSiteNavigation: the "More" overflow menu is the default, and can be opted out of', () => {
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
    it('renders the links and a hidden menu item, with no extra modifier class', () => {
      const doc = render();
      expect(doc.querySelector('nav').className).toBe('nhsw-site-header__nav');
      expect(doc.querySelector('.nhsw-site-header__menu').hasAttribute('hidden')).toBe(true);
      expect(doc.querySelector('.nhsw-site-header__menu-toggle')).not.toBeNull();
      expect(doc.querySelectorAll('.nhsw-site-header__nav-list > li')).toHaveLength(3);
    });

    it('keeps the current page marking and the reverse variant', () => {
      const doc = render({ classes: 'nhsw-site-header__nav--reverse' });
      expect(doc.querySelector('nav').className).toBe('nhsw-site-header__nav nhsw-site-header__nav--reverse');
      const links = [...doc.querySelectorAll('.nhsw-site-header__nav-list > li:not(.nhsw-site-header__menu) a')];
      expect(links[0].getAttribute('aria-current')).toBe('page');
      expect(links[1].hasAttribute('aria-current')).toBe(false);
    });

    it('the menu item is the last one in the list, after the real links', () => {
      const list = render().querySelector('.nhsw-site-header__nav-list');
      expect(list.lastElementChild.classList.contains('nhsw-site-header__menu')).toBe(true);
    });

    it('the menu button is a real button that starts collapsed, styled as a nav link', () => {
      const button = render().querySelector('.nhsw-site-header__menu-toggle');
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.classList.contains('nhsw-site-header__nav-link')).toBe(true);
    });

    it('announces "Browse More" and shows "More", as the NHS.UK header does', () => {
      const button = render().querySelector('.nhsw-site-header__menu-toggle');
      expect(button.querySelector('.nhsw-visually-hidden').textContent).toBe('Browse ');
      expect(button.textContent).toBe('Browse More');
    });

    it('toggleMenuText and toggleMenuVisuallyHiddenText change the wording', () => {
      const button = render({ toggleMenuText: 'Menu', toggleMenuVisuallyHiddenText: 'Open' }).querySelector('.nhsw-site-header__menu-toggle');
      expect(button.textContent).toBe('Open Menu');
    });
  });

  describe('with overflowMenu: false', () => {
    it('adds the no-menu class, ahead of any other classes, and no menu item', () => {
      const doc = render({ overflowMenu: false, classes: 'nhsw-site-header__nav--reverse' });
      expect(doc.querySelector('nav').className).toBe('nhsw-site-header__nav nhsw-site-header__nav--no-menu nhsw-site-header__nav--reverse');
      expect(doc.querySelector('.nhsw-site-header__menu')).toBeNull();
      expect(doc.querySelectorAll('.nhsw-site-header__nav-list > li')).toHaveLength(2);
    });
  });
});
