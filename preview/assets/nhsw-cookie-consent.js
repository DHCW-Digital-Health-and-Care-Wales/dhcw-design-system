(function () {
  'use strict';

  var STORAGE_KEY = 'nhsw_cookie_consent';
  var POLICY_VERSION = '1';
  var CLARITY_COOKIES = ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'];

  var banner = document.querySelector('[data-module="nhsw-cookie-consent"]');
  if (!banner) return;

  var clarityId = banner.getAttribute('data-clarity-id');
  var prompt = banner.querySelector('[data-cookie-prompt]');
  var confirmation = banner.querySelector('[data-cookie-confirmation]');
  var message = banner.querySelector('[data-cookie-message]');

  function readConsent() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && stored.version === POLICY_VERSION) return stored.choice;
    } catch (e) {}
    return null;
  }

  function writeConsent(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: choice, version: POLICY_VERSION }));
    } catch (e) {}
  }

  function loadClarity() {
    if (!clarityId || window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);
  }

  function removeClarity() {
    if (typeof window.clarity === 'function') window.clarity('consent', false);
    var hosts = [location.hostname, '.' + location.hostname, '.' + location.hostname.split('.').slice(-2).join('.')];
    CLARITY_COOKIES.forEach(function (name) {
      hosts.forEach(function (host) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + host;
      });
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  function showPrompt() {
    confirmation.hidden = true;
    prompt.hidden = false;
    banner.hidden = false;
  }

  function showConfirmation(choice) {
    message.textContent = choice === 'accepted'
      ? 'You have accepted analytics cookies. You can change your cookie settings at any time.'
      : 'You have rejected analytics cookies. You can change your cookie settings at any time.';
    prompt.hidden = true;
    confirmation.hidden = false;
    banner.hidden = false;
    message.focus();
  }

  banner.querySelectorAll('[data-cookie-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      var choice = button.getAttribute('data-cookie-choice');
      var previous = readConsent();
      writeConsent(choice);
      if (choice === 'accepted') {
        loadClarity();
      } else if (previous === 'accepted') {
        removeClarity();
      }
      showConfirmation(choice);
    });
  });

  banner.querySelector('[data-cookie-hide]').addEventListener('click', function () {
    banner.hidden = true;
  });

  document.querySelectorAll('[data-cookie-settings]').forEach(function (link) {
    link.addEventListener('click', function () {
      showPrompt();
      banner.querySelector('[data-cookie-choice]').focus();
      banner.scrollIntoView();
    });
  });

  var existing = readConsent();
  if (existing === 'accepted') {
    loadClarity();
  } else if (existing === null) {
    showPrompt();
  }
})();
