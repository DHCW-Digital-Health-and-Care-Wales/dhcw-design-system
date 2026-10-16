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

  function selectViewerTab(viewer, name) {
    var tab = viewer.querySelector('.nhsw-code-viewer__tab[aria-controls$="-' + name + '"]');
    if (tab) tab.dispatchEvent(new Event('click'));
  }
}());
