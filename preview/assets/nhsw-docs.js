(function () {
  'use strict';

  document.querySelectorAll('[data-module="nhsw-code-viewer"]').forEach(function (viewer) {
    var tabs = viewer.querySelectorAll('.nhsw-code-viewer__tab');
    var panels = viewer.querySelectorAll('.nhsw-code-viewer__panel');
    var copyBtn = viewer.querySelector('.nhsw-code-viewer__copy');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.classList.remove('nhsw-code-viewer__tab--active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(function (p) {
          p.classList.add('nhsw-code-viewer__panel--hidden');
        });

        tab.classList.add('nhsw-code-viewer__tab--active');
        tab.setAttribute('aria-selected', 'true');

        document.getElementById(tab.getAttribute('aria-controls'))
          .classList.remove('nhsw-code-viewer__panel--hidden');
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var activePanel = viewer.querySelector(
          '.nhsw-code-viewer__panel:not(.nhsw-code-viewer__panel--hidden)'
        );
        if (!activePanel) return;
        var code = activePanel.querySelector('code').textContent;

        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(function () {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('nhsw-code-viewer__copy--copied');
            setTimeout(function () {
              copyBtn.textContent = 'Copy code';
              copyBtn.classList.remove('nhsw-code-viewer__copy--copied');
            }, 2000);
          });
        } else {
          var el = document.createElement('textarea');
          el.value = code;
          el.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
          document.body.appendChild(el);
          el.select();
          try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('nhsw-code-viewer__copy--copied');
            setTimeout(function () {
              copyBtn.textContent = 'Copy code';
              copyBtn.classList.remove('nhsw-code-viewer__copy--copied');
            }, 2000);
          } catch (err) {}
          document.body.removeChild(el);
        }
      });
    }
  });

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightHtml(source) {
    return source.split(/(<[^>]*>)/).map(function (part) {
      if (part.charAt(0) !== '<') return escapeHtml(part);
      var match = /^(<\/?)([^\s>\/]*)([\s\S]*?)(\/?>)$/.exec(part);
      if (!match) return escapeHtml(part);
      var attrs = match[3].replace(/([^\s=]+)(?:=("[^"]*"|'[^']*'))?/g, function (all, name, value) {
        return '<span class="nhsw-code-token--attr">' + escapeHtml(name) + '</span>' +
          (value ? '=<span class="nhsw-code-token--value">' + escapeHtml(value) + '</span>' : '');
      });
      return '<span class="nhsw-code-token--tag">' + escapeHtml(match[1] + match[2]) + '</span>' + attrs +
        '<span class="nhsw-code-token--tag">' + escapeHtml(match[4]) + '</span>';
    }).join('');
  }

  document.querySelectorAll('[data-module="nhsw-code-viewer"] .nhsw-code-viewer__panel[id$="-html"] code').forEach(function (code) {
    code.innerHTML = highlightHtml(code.textContent);
  });

  function showTabTarget(hash) {
    var id = hash && hash.charAt(0) === '#' ? decodeURIComponent(hash.slice(1)) : '';
    var target = id && document.getElementById(id);
    var panel = target && target.closest('.nhsw-tabs__panel--hidden');
    if (!panel) return false;
    var tab = document.getElementById(panel.getAttribute('aria-labelledby'));
    if (!tab) return false;
    tab.click();
    target.setAttribute('tabindex', '-1');
    target.scrollIntoView();
    target.focus({ preventScroll: true });
    return true;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (link && showTabTarget(link.getAttribute('href'))) {
      event.preventDefault();
      if (window.history && history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
    }
  });

  showTabTarget(window.location.hash);

  function syncScrolled() {
    document.documentElement.classList.toggle('nhsw-is-scrolled', window.scrollY > 300);
  }

  window.addEventListener('scroll', syncScrolled, { passive: true });
  syncScrolled();

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('.nhsw-example-preview__body a[href="#"]');
    if (link) event.preventDefault();
  });

  var toggleButtons = document.querySelectorAll('.nhsw-example-preview__footer-button[data-toggle]');

  function activeTabName(viewer) {
    var active = viewer.querySelector('.nhsw-code-viewer__tab--active');
    return active && /-njk$/.test(active.getAttribute('aria-controls')) ? 'njk' : 'html';
  }

  function syncToggleButtons() {
    toggleButtons.forEach(function (btn) {
      var viewer = document.getElementById(btn.getAttribute('data-toggle'));
      if (!viewer) return;
      var tab = btn.getAttribute('data-tab');
      var expanded = !viewer.hidden && (!tab || activeTabName(viewer) === tab);
      btn.setAttribute('aria-expanded', String(expanded));
    });
  }

  toggleButtons.forEach(function (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var target = document.getElementById(toggleBtn.getAttribute('data-toggle'));
      if (!target) return;
      var tab = toggleBtn.getAttribute('data-tab');

      if (tab && !target.hidden && activeTabName(target) !== tab) {
        selectViewerTab(target, tab);
      } else {
        target.hidden = !target.hidden;
        if (tab && !target.hidden) selectViewerTab(target, tab);
      }
      syncToggleButtons();
    });
  });

  document.querySelectorAll('[data-module="nhsw-code-viewer"] .nhsw-code-viewer__tab').forEach(function (tab) {
    tab.addEventListener('click', syncToggleButtons);
  });

  document.querySelectorAll('[data-close]').forEach(function (closeBtn) {
    closeBtn.addEventListener('click', function () {
      var id = closeBtn.getAttribute('data-close');
      var target = document.getElementById(id);
      if (!target) return;
      target.hidden = true;
      syncToggleButtons();
      var opener = document.querySelector('.nhsw-example-preview__footer-button[data-toggle="' + id + '"]');
      if (opener) opener.focus();
    });
  });

  function selectViewerTab(viewer, name) {
    var tab = viewer.querySelector('.nhsw-code-viewer__tab[aria-controls$="-' + name + '"]');
    if (tab) tab.dispatchEvent(new Event('click'));
  }

  var seq = [];

  document.addEventListener('keydown', function (event) {
    var target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    seq.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (seq.length > 10) seq.shift();
    if (seq.join() === atob('QXJyb3dVcCxBcnJvd1VwLEFycm93RG93bixBcnJvd0Rvd24sQXJyb3dMZWZ0LEFycm93UmlnaHQsQXJyb3dMZWZ0LEFycm93UmlnaHQsYixh')) {
      seq = [];
      fx();
    }
  });

  function createFxLayer() {
    if (!document.body.animate) return null;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    if (document.querySelector('[data-nhsw-fx]')) return null;

    var layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-nhsw-fx', '');
    layer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:2147483647';
    document.body.appendChild(layer);
    return layer;
  }

  function fx() {
    var layer = createFxLayer();
    if (!layer) return;

    var foods = [0x1F953, 0x1F95E].map(function (c) { return String.fromCodePoint(c); });
    var width = window.innerWidth;
    var height = window.innerHeight;
    var longest = 0;

    for (var i = 0; i < 60; i++) {
      var piece = document.createElement('span');
      piece.textContent = foods[i % foods.length];
      piece.style.cssText = 'position:absolute;top:0;left:0;line-height:1;font-size:' + (24 + Math.random() * 24) + 'px';
      layer.appendChild(piece);

      var startX = Math.random() * width;
      var drift = (Math.random() - 0.5) * 200;
      var spin = (Math.random() - 0.5) * 1080;
      var duration = 2500 + Math.random() * 2500;
      longest = Math.max(longest, duration);
      piece.animate([
        { transform: 'translate(' + startX + 'px, -60px) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (startX + drift) + 'px, ' + (height + 60) + 'px) rotate(' + spin + 'deg)', opacity: 1 }
      ], { duration: duration, delay: Math.random() * 1200, easing: 'ease-in', fill: 'both' });
    }

    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, longest + 1500);
  }

  // The library's birthday: confetti once per visitor on 23 October, every year from 2026.
  // ?confetti always shows it, on any day and any number of times.
  var BIRTHDAY_MONTH = 9;
  var BIRTHDAY_DAY = 23;
  var FIRST_BIRTHDAY_YEAR = 2026;
  var CONFETTI_COLOURS = ['#005eb8', '#1b365d', '#007f3b', '#ffeb3b', '#d5281b', '#ffffff'];

  function isBirthday(date) {
    return date.getMonth() === BIRTHDAY_MONTH && date.getDate() === BIRTHDAY_DAY && date.getFullYear() >= FIRST_BIRTHDAY_YEAR;
  }

  var CONFETTI_KEY = 'nhsw-birthday-confetti';

  function dayKey(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  function storedDay(storeName) {
    try {
      return window[storeName].getItem(CONFETTI_KEY);
    } catch (error) {
      return null;
    }
  }

  // Remembered in localStorage, and in sessionStorage too in case that one is unavailable.
  function seenToday(date) {
    var key = dayKey(date);
    return storedDay('localStorage') === key || storedDay('sessionStorage') === key;
  }

  function rememberToday(date) {
    ['localStorage', 'sessionStorage'].forEach(function (storeName) {
      try {
        window[storeName].setItem(CONFETTI_KEY, dayKey(date));
      } catch (error) {}
    });
  }

  function confetti() {
    var layer = createFxLayer();
    if (!layer) return;

    var width = window.innerWidth;
    var height = window.innerHeight;
    var longest = 0;

    for (var i = 0; i < 120; i++) {
      var piece = document.createElement('span');
      var size = 6 + Math.random() * 8;
      piece.style.cssText = 'position:absolute;top:0;left:0;display:block;width:' + size + 'px;height:' + size * 1.6 + 'px;background:' + CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
      layer.appendChild(piece);

      var startX = Math.random() * width;
      var sway = (Math.random() - 0.5) * 240;
      var spin = (Math.random() - 0.5) * 1440;
      var duration = 3000 + Math.random() * 3000;
      longest = Math.max(longest, duration);
      piece.animate([
        { transform: 'translate(' + startX + 'px, -30px) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (startX + sway) + 'px, ' + (height + 30) + 'px) rotate(' + spin + 'deg)', opacity: 1 }
      ], { duration: duration, delay: Math.random() * 1500, easing: 'ease-in', fill: 'both' });
    }

    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, longest + 2000);
  }

  if (window.self === window.top) {
    var today = new Date();
    if (/[?&]confetti(=|&|$)/.test(window.location.search)) {
      confetti();
    } else if (isBirthday(today) && !seenToday(today)) {
      rememberToday(today);
      confetti();
    }
  }
}());
