(function () {
  'use strict';

  var COUNT_POLL_MS = 1000;
  var COUNT_IDLE_MS = 500;

  document.querySelectorAll('[data-max-length]').forEach(function (field) {
    var maxLength = parseInt(field.getAttribute('data-max-length'), 10);
    var description = document.getElementById(field.getAttribute('data-max-length-target'));
    if (!description) return;

    var screenReaderStatus = document.createElement('div');
    screenReaderStatus.setAttribute('aria-live', 'polite');
    screenReaderStatus.className = 'nhsw-visually-hidden nhsw-character-count__sr-status';

    var visibleStatus = document.createElement('div');
    visibleStatus.setAttribute('aria-hidden', 'true');
    visibleStatus.className = description.className + ' nhsw-character-count__status';

    description.insertAdjacentElement('afterend', screenReaderStatus);
    description.insertAdjacentElement('afterend', visibleStatus);
    description.classList.add('nhsw-visually-hidden');
    field.removeAttribute('maxlength');

    var lastInputTimestamp = null;
    var lastInputValue = '';
    var valueChecker = null;

    function getCountMessage() {
      var remaining = maxLength - field.value.length;
      var count = Math.abs(remaining);
      var noun = 'character' + (count === 1 ? '' : 's');
      return 'You have ' + count + ' ' + noun + (remaining < 0 ? ' too many' : ' remaining');
    }

    function updateVisibleStatus() {
      var message = getCountMessage();
      visibleStatus.classList.toggle('nhsw-textarea__count--error', maxLength - field.value.length < 0);
      visibleStatus.textContent = message;
      description.textContent = message;
    }

    function updateScreenReaderStatus() {
      screenReaderStatus.textContent = getCountMessage();
    }

    function updateIfValueChanged() {
      if (field.value !== lastInputValue) {
        lastInputValue = field.value;
        updateVisibleStatus();
        updateScreenReaderStatus();
      }
    }

    field.addEventListener('input', function () {
      updateVisibleStatus();
      lastInputTimestamp = Date.now();
    });

    field.addEventListener('focus', function () {
      clearInterval(valueChecker);
      valueChecker = setInterval(function () {
        if (!lastInputTimestamp || Date.now() - COUNT_IDLE_MS >= lastInputTimestamp) {
          updateIfValueChanged();
        }
      }, COUNT_POLL_MS);
    });

    field.addEventListener('blur', function () {
      clearInterval(valueChecker);
    });

    window.addEventListener('pageshow', function () {
      if (field.value !== field.textContent) {
        updateVisibleStatus();
        updateScreenReaderStatus();
      }
    });

    updateVisibleStatus();
    updateScreenReaderStatus();
  });

  document.querySelectorAll('[data-aria-controls]').forEach(function (input) {
    var target = document.getElementById(input.getAttribute('data-aria-controls'));
    if (!target) return;
    // aria-expanded is deliberately not set here: it isn't a valid ARIA
    // attribute on the checkbox/radio role, and axe-core flags it as a
    // critical violation. aria-controls (a global attribute) is enough.
    input.setAttribute('aria-controls', input.getAttribute('data-aria-controls'));

    var conditionalClass = Array.prototype.find.call(target.classList, function (cls) {
      return /__conditional$/.test(cls);
    });
    var hiddenClass = conditionalClass ? conditionalClass + '--hidden' : 'nhsw-checkboxes__conditional--hidden';

    function sync() {
      target.classList.toggle(hiddenClass, !input.checked);
    }
    sync();

    if (input.type === 'radio') {
      document.querySelectorAll('input[type="radio"][name="' + input.name + '"]').forEach(function (radio) {
        radio.addEventListener('change', sync);
      });
    } else {
      input.addEventListener('change', sync);
    }
  });

  document.querySelectorAll('[data-checkbox-exclusive]').forEach(function (exclusive) {
    var group = document.querySelectorAll('input[name="' + exclusive.name + '"]');
    exclusive.addEventListener('change', function () {
      if (exclusive.checked) {
        group.forEach(function (input) {
          if (input !== exclusive) input.checked = false;
        });
      }
    });
    group.forEach(function (input) {
      if (input === exclusive) return;
      input.addEventListener('change', function () {
        if (input.checked) exclusive.checked = false;
      });
    });
  });

  function formatRemaining(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var minutePart = minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') : '';
    var secondPart = seconds + ' second' + (seconds === 1 ? '' : 's');
    return minutePart ? minutePart + ' and ' + secondPart : secondPart;
  }

  document.querySelectorAll('[data-nhsw-timeout-countdown]').forEach(function (countdown) {
    var modal = countdown.closest('.nhsw-timeout-modal');
    var liveRegion = modal ? modal.querySelector('[data-nhsw-timeout-live]') : null;
    var remaining = parseInt(countdown.getAttribute('data-seconds'), 10);
    var tick = 0;

    var interval = setInterval(function () {
      remaining -= 1;
      tick += 1;
      if (remaining <= 0) {
        clearInterval(interval);
        return;
      }
      countdown.textContent = formatRemaining(remaining);
      if (liveRegion && tick % 15 === 0) {
        liveRegion.textContent = formatRemaining(remaining) + ' remaining';
      }
    }, 1000);

    var dismissButton = modal ? modal.querySelector('[data-nhsw-timeout-dismiss]') : null;
    if (dismissButton) {
      dismissButton.addEventListener('click', function () {
        clearInterval(interval);
        if (typeof modal.close === 'function') {
          modal.close();
        } else {
          modal.removeAttribute('open');
        }
      });
    }
  });

  document.querySelectorAll('.nhsw-expander__button').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.getAttribute('aria-controls'));
      if (!target) return;
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      target.hidden = expanded;
    });
  });

  document.querySelectorAll('.nhsw-file-upload__input').forEach(function (input) {
    var container = input.closest('.nhsw-file-upload');
    var status = container && container.querySelector('.nhsw-file-upload__status');
    if (!container || !status) return;
    var emptyText = status.textContent;

    input.addEventListener('change', function () {
      var hasFile = input.files && input.files.length > 0;
      status.textContent = hasFile ? input.files[0].name : emptyText;
      status.classList.toggle('nhsw-file-upload__status--filled', hasFile);
      container.classList.toggle('nhsw-file-upload--has-file', hasFile);
    });
  });

  // Tabs behave as in the NHS.UK frontend: from the tablet breakpoint up they are
  // a tablist (Left/Right arrows switch tab, only the selected tab is a tab
  // stop). Below it the roles are removed, every panel is shown, and the tabs
  // become a list of controls that jump to their section.
  var TABS_MEDIA_QUERY = '(min-width: 40.0625em)';

  document.querySelectorAll('.nhsw-tabs').forEach(function (tabGroup) {
    // Scoped to direct children so a demo `.nhsw-tabs` nested inside a panel
    // (e.g. on the Tabs component doc page) doesn't get wired up twice.
    var list = tabGroup.querySelector(':scope > .nhsw-tabs__list');
    var tabs = tabGroup.querySelectorAll(':scope > .nhsw-tabs__list .nhsw-tabs__tab');
    var mediaQuery = window.matchMedia ? window.matchMedia(TABS_MEDIA_QUERY) : null;
    var tabsMode = null;

    // Remembered up front, because aria-controls is removed on small screens.
    var panelIds = Array.prototype.map.call(tabs, function (tab) {
      return tab.getAttribute('aria-controls');
    });
    var tabListeners = [];

    function panelAt(index) {
      return panelIds[index] ? tabGroup.querySelector('#' + panelIds[index]) : null;
    }

    function selectedIndex() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains('nhsw-tabs__tab--selected')) return i;
      }
      return 0;
    }

    function activate(index) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.classList.toggle('nhsw-tabs__tab--selected', selected);
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        var panel = panelAt(i);
        if (panel) panel.classList.toggle('nhsw-tabs__panel--hidden', !selected);
      });
    }

    function moveTo(index) {
      if (index < 0 || index >= tabs.length) return;
      activate(index);
      tabs[index].focus();
    }

    function addTabListener(tab, index, type, handler) {
      tab.addEventListener(type, handler);
      tabListeners.push({ tab: tab, type: type, handler: handler });
    }

    function removeTabListeners() {
      tabListeners.forEach(function (l) {
        l.tab.removeEventListener(l.type, l.handler);
      });
      tabListeners = [];
    }

    function setup() {
      removeTabListeners();
      if (list) {
        list.setAttribute('role', 'tablist');
        Array.prototype.forEach.call(list.children, function (item) {
          item.setAttribute('role', 'presentation');
        });
      }

      tabs.forEach(function (tab, index) {
        tab.setAttribute('role', 'tab');
        if (panelIds[index]) tab.setAttribute('aria-controls', panelIds[index]);
        var panel = panelAt(index);
        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          panel.removeAttribute('tabindex');
          if (tab.id) panel.setAttribute('aria-labelledby', tab.id);
        }

        addTabListener(tab, index, 'click', function (event) {
          event.preventDefault();
          activate(index);
        });

        addTabListener(tab, index, 'keydown', function (event) {
          if (event.key === 'ArrowLeft' || event.key === 'Left') {
            event.preventDefault();
            moveTo(index - 1);
          } else if (event.key === 'ArrowRight' || event.key === 'Right') {
            event.preventDefault();
            moveTo(index + 1);
          }
        });
      });

      activate(selectedIndex());
    }

    function teardown() {
      removeTabListeners();
      if (list) {
        list.removeAttribute('role');
        Array.prototype.forEach.call(list.children, function (item) {
          item.removeAttribute('role');
        });
      }

      tabs.forEach(function (tab, index) {
        tab.removeAttribute('role');
        tab.removeAttribute('aria-selected');
        tab.removeAttribute('aria-controls');
        tab.removeAttribute('tabindex');
        var panel = panelAt(index);
        if (panel) {
          panel.removeAttribute('role');
          panel.removeAttribute('aria-labelledby');
          panel.classList.remove('nhsw-tabs__panel--hidden');
        }

        addTabListener(tab, index, 'click', function (event) {
          var target = panelAt(index);
          if (!target) return;
          event.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus();
        });
      });
    }

    function checkMode() {
      var wide = !mediaQuery || mediaQuery.matches;
      if (wide === tabsMode) return;
      tabsMode = wide;
      if (wide) {
        setup();
      } else {
        teardown();
      }
    }

    if (mediaQuery) {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', checkMode);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(checkMode);
      }
    }

    checkMode();
  });

  // Site navigation: items that do not fit the available width move into a "More"
  // menu, as in the NHS.UK header, so the navigation never disappears on a small
  // screen or at high zoom. The menu button stays hidden while everything fits.
  document.querySelectorAll('.nhsw-site-header__nav').forEach(function (nav) {
    var list = nav.querySelector('.nhsw-site-header__nav-list');
    var menu = nav.querySelector('.nhsw-site-header__menu');
    var toggle = menu && menu.querySelector('.nhsw-site-header__menu-toggle');
    if (!list || !menu || !toggle) return;

    var items = Array.prototype.filter.call(list.children, function (item) {
      return item !== menu;
    });
    if (!items.length) return;

    var menuList = document.createElement('ul');
    menuList.className = 'nhsw-site-header__menu-list';
    menuList.setAttribute('hidden', '');

    var rights = [];
    var listWidth = 0;
    var menuEnabled = false;
    var menuOpen = false;
    var updateTimer = null;

    nav.classList.add('nhsw-site-header__nav--enhanced');

    // Put every item back in the list and record where each one ends
    function resetNavigation() {
      items.forEach(function (item, index) {
        list.insertBefore(item, menu);
        rights[index] = item.offsetLeft + item.offsetWidth;
      });
      listWidth = list.offsetWidth;
    }

    function columnGap() {
      var gap = parseFloat(window.getComputedStyle(list).columnGap);
      return isNaN(gap) ? 0 : gap;
    }

    function closeMenu() {
      if (!menuOpen) return;
      menuOpen = false;
      menuList.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      nav.style.removeProperty('border-bottom-width');
      document.removeEventListener('click', onDocumentClick, true);
      document.removeEventListener('keydown', onDocumentKeydown, true);
    }

    function openMenu() {
      if (!menuEnabled || menuOpen) return;
      menuOpen = true;
      menuList.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      // The menu is absolutely positioned, so make room for it below the nav
      nav.style.setProperty('border-bottom-width', menuList.offsetHeight + 'px');
      document.addEventListener('click', onDocumentClick, true);
      document.addEventListener('keydown', onDocumentKeydown, true);
    }

    function onToggleClick(event) {
      event.preventDefault();
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Close when clicking outside the navigation, or on a link inside it
    function onDocumentClick(event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (!nav.contains(target) || (target.closest('a, button') && !toggle.contains(target))) {
        closeMenu();
      }
    }

    function onDocumentKeydown(event) {
      if (event.key !== 'Escape' || !menuOpen) return;
      var focusWasInMenu = menuList.contains(document.activeElement);
      closeMenu();
      if (focusWasInMenu) toggle.focus();
    }

    function enableMenu() {
      if (menuEnabled) return;
      menuEnabled = true;
      menu.removeAttribute('hidden');
      toggle.addEventListener('click', onToggleClick);
    }

    function disableMenu() {
      if (!menuEnabled) return;
      closeMenu();
      menuEnabled = false;
      menu.setAttribute('hidden', '');
      toggle.removeEventListener('click', onToggleClick);
    }

    function updateNavigation() {
      resetNavigation();

      var overflowing = items.filter(function (item, index) {
        return rights[index] > listWidth;
      });
      if (!overflowing.length) {
        disableMenu();
        return;
      }

      if (!menuList.parentNode) menu.appendChild(menuList);
      enableMenu();

      // Leave room for the menu button, and the gap before it
      var available = listWidth - menu.offsetWidth - columnGap();
      items.forEach(function (item, index) {
        if (rights[index] > available) menuList.appendChild(item);
      });

      if (menuOpen) {
        nav.style.setProperty('border-bottom-width', menuList.offsetHeight + 'px');
      }
    }

    function updateSoon() {
      if (updateTimer && window.cancelAnimationFrame) window.cancelAnimationFrame(updateTimer);
      if (window.requestAnimationFrame) {
        updateTimer = window.requestAnimationFrame(updateNavigation);
      } else {
        updateNavigation();
      }
    }

    window.addEventListener('resize', updateSoon);
    // Text-only zoom and web fonts change the width of the items, not the list
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(updateSoon).observe(list);
    }
    window.addEventListener('load', updateNavigation);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateNavigation);
    }
    window.addEventListener('pageshow', function (event) {
      if (menuOpen && event.persisted) closeMenu();
    });

    updateNavigation();
  });

  // Error summary, as in the NHS.UK frontend. A summary marked data-module="nhsw-error-summary"
  // takes focus when the page loads with errors, so keyboard and screen reader users are told
  // straight away (add data-disable-auto-focus="true" to switch that off). A link in any summary
  // focuses the field it points at, scrolling the field's label or legend into view.
  function legendOrLabelFor(input) {
    var fieldset = input.closest('fieldset');
    var legend = fieldset && fieldset.getElementsByTagName('legend')[0];
    if (legend) {
      if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
        return legend;
      }
      var rect = input.getBoundingClientRect();
      if (rect.height && window.innerHeight) {
        var inputBottom = rect.top + rect.height;
        if (inputBottom - legend.getBoundingClientRect().top < window.innerHeight / 2) return legend;
      }
    }
    var id = input.getAttribute('id');
    return (id && document.querySelector('label[for="' + id + '"]')) || input.closest('label');
  }

  document.querySelectorAll('.nhsw-error-summary').forEach(function (summary) {
    if (
      summary.getAttribute('data-module') === 'nhsw-error-summary' &&
      summary.getAttribute('data-disable-auto-focus') !== 'true'
    ) {
      if (!summary.hasAttribute('tabindex')) summary.setAttribute('tabindex', '-1');
      summary.focus();
    }

    summary.addEventListener('click', function (event) {
      var link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || !summary.contains(link) || !link.hash) return;
      var input = document.getElementById(link.hash.replace('#', ''));
      var anchor = input && legendOrLabelFor(input);
      if (!anchor) return;
      anchor.scrollIntoView();
      input.focus({ preventScroll: true });
      event.preventDefault();
    });
  });
}());
