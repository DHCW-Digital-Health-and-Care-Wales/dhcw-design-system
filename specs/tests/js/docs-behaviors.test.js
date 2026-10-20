import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runScript } from '../support/load-script.js';

// Covers only the docs-site's own authoring tooling (code samples, the
// HTML reveal toggle) — not real component behaviour. That's shipped
// separately as dist/nhsw-behaviours.js and tested in behaviours.test.js.
const SCRIPT = 'preview/assets/nhsw-docs.js';

function setBody(html) {
  document.body.innerHTML = html;
}

describe('code viewer tabs (data-module="nhsw-code-viewer")', () => {
  beforeEach(() => {
    setBody(`
      <div data-module="nhsw-code-viewer">
        <button class="nhsw-code-viewer__tab nhsw-code-viewer__tab--active" aria-selected="true" aria-controls="panel-html">HTML</button>
        <button class="nhsw-code-viewer__tab" aria-selected="false" aria-controls="panel-njk">Nunjucks</button>
        <div id="panel-html" class="nhsw-code-viewer__panel"><code>&lt;div&gt;html&lt;/div&gt;</code></div>
        <div id="panel-njk" class="nhsw-code-viewer__panel nhsw-code-viewer__panel--hidden"><code>{{ macro() }}</code></div>
        <button class="nhsw-code-viewer__copy">Copy code</button>
      </div>
    `);
    runScript(SCRIPT);
  });

  it('switches the active tab and panel on click', () => {
    const [htmlTab, njkTab] = document.querySelectorAll('.nhsw-code-viewer__tab');
    njkTab.dispatchEvent(new Event('click'));

    expect(njkTab.classList.contains('nhsw-code-viewer__tab--active')).toBe(true);
    expect(njkTab.getAttribute('aria-selected')).toBe('true');
    expect(htmlTab.classList.contains('nhsw-code-viewer__tab--active')).toBe(false);
    expect(htmlTab.getAttribute('aria-selected')).toBe('false');

    expect(document.getElementById('panel-njk').classList.contains('nhsw-code-viewer__panel--hidden')).toBe(false);
    expect(document.getElementById('panel-html').classList.contains('nhsw-code-viewer__panel--hidden')).toBe(true);
  });

  it('copies the currently visible panel\'s code, not the hidden one', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    document.querySelector('.nhsw-code-viewer__copy').dispatchEvent(new Event('click'));

    expect(writeText).toHaveBeenCalledWith('<div>html</div>');
  });

  it('shows "Copied!" feedback and reverts it after 2 seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const copyBtn = document.querySelector('.nhsw-code-viewer__copy');
    copyBtn.dispatchEvent(new Event('click'));
    await vi.waitFor(() => expect(copyBtn.textContent).toBe('Copied!'));

    vi.advanceTimersByTime(2000);
    expect(copyBtn.textContent).toBe('Copy code');
    vi.useRealTimers();
  });
});

describe('example-preview HTML toggle', () => {
  beforeEach(() => {
    setBody(`
      <button class="nhsw-example-preview__footer-button" data-toggle="code-x" aria-controls="code-x" aria-expanded="false">HTML</button>
      <div id="code-x" hidden></div>
    `);
    runScript(SCRIPT);
  });

  it('un-hides the target and flips aria-expanded on click, and re-hides on a second click', () => {
    const btn = document.querySelector('[data-toggle]');
    btn.dispatchEvent(new Event('click'));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('code-x').hidden).toBe(false);

    btn.dispatchEvent(new Event('click'));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('code-x').hidden).toBe(true);
  });
});

describe('example-preview HTML and Nunjucks buttons', () => {
  beforeEach(() => {
    setBody(`
      <button class="nhsw-example-preview__footer-button" data-toggle="code-x" data-tab="html" aria-controls="code-x" aria-expanded="false">HTML</button>
      <button class="nhsw-example-preview__footer-button" data-toggle="code-x" data-tab="njk" aria-controls="code-x" aria-expanded="false">Nunjucks</button>
      <div id="code-x" data-module="nhsw-code-viewer" hidden>
        <button class="nhsw-code-viewer__tab nhsw-code-viewer__tab--active" aria-selected="true" aria-controls="cv-x-html">HTML</button>
        <button class="nhsw-code-viewer__tab" aria-selected="false" aria-controls="cv-x-njk">Nunjucks</button>
        <div id="cv-x-html" class="nhsw-code-viewer__panel"></div>
        <div id="cv-x-njk" class="nhsw-code-viewer__panel nhsw-code-viewer__panel--hidden"></div>
      </div>
    `);
    runScript(SCRIPT);
  });

  const buttons = () => [...document.querySelectorAll('[data-tab]')];
  const click = (el) => el.dispatchEvent(new Event('click'));

  it('Nunjucks opens the code viewer on the Nunjucks tab', () => {
    click(buttons()[1]);
    expect(document.getElementById('code-x').hidden).toBe(false);
    expect(document.getElementById('cv-x-njk').classList.contains('nhsw-code-viewer__panel--hidden')).toBe(false);
    expect(document.getElementById('cv-x-html').classList.contains('nhsw-code-viewer__panel--hidden')).toBe(true);
    expect(buttons()[1].getAttribute('aria-expanded')).toBe('true');
    expect(buttons()[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('switches tab when the other button is clicked, and closes when the active one is clicked again', () => {
    click(buttons()[1]);
    click(buttons()[0]);
    expect(document.getElementById('code-x').hidden).toBe(false);
    expect(document.getElementById('cv-x-html').classList.contains('nhsw-code-viewer__panel--hidden')).toBe(false);
    expect(buttons()[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons()[1].getAttribute('aria-expanded')).toBe('false');

    click(buttons()[0]);
    expect(document.getElementById('code-x').hidden).toBe(true);
    expect(buttons()[0].getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Hidden docs-site easter egg', () => {
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  const press = (keys, target = document.body) => keys.forEach((key) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
  const layer = () => document.querySelector('[data-nhsw-fx]');

  beforeEach(() => {
    vi.useFakeTimers();
    setBody('<input id="field"><p>page</p>');
    Element.prototype.animate = vi.fn(() => ({}));
    window.matchMedia = vi.fn(() => ({ matches: false }));
    runScript(SCRIPT);
  });

  afterEach(() => {
    vi.useRealTimers();
    delete Element.prototype.animate;
  });

  it('rains bacon and pancakes once the full code is entered', () => {
    press(CODE);
    expect(layer()).not.toBeNull();
    expect(layer().getAttribute('aria-hidden')).toBe('true');
    const text = [...layer().children].map((piece) => piece.textContent);
    expect(text).toContain('🥓');
    expect(text).toContain('🥞');
    expect(Element.prototype.animate).toHaveBeenCalledTimes(layer().children.length);
  });

  it('does nothing for a partial or wrong sequence', () => {
    press(CODE.slice(0, 9));
    press(['x', 'a']);
    expect(layer()).toBeNull();
  });

  it('is ignored while typing in a form field', () => {
    press(CODE, document.getElementById('field'));
    expect(layer()).toBeNull();
  });

  it('stays off for people who prefer reduced motion', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    press(CODE);
    expect(layer()).toBeNull();
  });

  it('tidies itself away afterwards and does not stack a second layer', () => {
    press(CODE);
    press(CODE);
    expect(document.querySelectorAll('[data-nhsw-fx]')).toHaveLength(1);
    vi.advanceTimersByTime(10000);
    expect(layer()).toBeNull();
  });
});

describe('code viewer Close button and HTML syntax colouring', () => {
  beforeEach(() => {
    setBody(`
      <button class="nhsw-example-preview__footer-button" data-toggle="code-y" data-tab="html" aria-controls="code-y" aria-expanded="true">HTML</button>
      <div id="code-y" data-module="nhsw-code-viewer">
        <button class="nhsw-code-viewer__tab nhsw-code-viewer__tab--active" aria-selected="true" aria-controls="cv-y-html">HTML</button>
        <div id="cv-y-html" class="nhsw-code-viewer__panel"><pre><code>&lt;button class="nhsw-button" disabled&gt;Save &amp; go&lt;/button&gt;</code></pre></div>
        <button type="button" data-close="code-y">Close</button>
      </div>
    `);
    runScript(SCRIPT);
  });

  it('Close hides the viewer, collapses the HTML button and returns focus to it', () => {
    document.querySelector('[data-close]').dispatchEvent(new Event('click'));
    expect(document.getElementById('code-y').hidden).toBe(true);
    const opener = document.querySelector('[data-toggle]');
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(opener);
  });

  it('colours tag names, attribute names and attribute values, without changing the copied text', () => {
    const code = document.querySelector('#cv-y-html code');
    expect(code.querySelector('.nhsw-code-token--attr').textContent).toBe('class');
    expect(code.querySelector('.nhsw-code-token--value').textContent).toBe('"nhsw-button"');
    expect(code.querySelector('.nhsw-code-token--tag').textContent).toBe('<button');
    expect(code.textContent).toBe('<button class="nhsw-button" disabled>Save & go</button>');
  });
});

describe('placeholder links inside embedded examples', () => {
  beforeEach(() => {
    setBody(`
      <div class="nhsw-example-preview__body"><a id="demo" href="#"><span id="inner">Action link</span></a><a id="real" href="/somewhere">Real</a></div>
      <a id="outside" href="#">Back to top</a>
    `);
    runScript(SCRIPT);
  });

  const click = (el) => {
    const event = new Event('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  };

  it('does not follow a "#" link in an example, even when the click lands on a child element', () => {
    expect(click(document.getElementById('demo'))).toBe(true);
    expect(click(document.getElementById('inner'))).toBe(true);
  });

  it('leaves real links and links outside examples alone', () => {
    expect(click(document.getElementById('real'))).toBe(false);
    expect(click(document.getElementById('outside'))).toBe(false);
  });
});

describe('floating Back to top', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('nhsw-is-scrolled');
    setBody('<p class="nhsw-back-to-top"><a href="#maincontent">Back to top</a></p>');
  });

  it('is only marked as scrolled once the page has been scrolled past 300px', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    runScript(SCRIPT);
    expect(document.documentElement.classList.contains('nhsw-is-scrolled')).toBe(false);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(document.documentElement.classList.contains('nhsw-is-scrolled')).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(document.documentElement.classList.contains('nhsw-is-scrolled')).toBe(false);
  });
});

describe('links into a hidden tab', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    setBody(`
      <a id="go" href="#success-banner">the success banner</a>
      <a id="plain" href="#visible">visible</a>
      <div class="nhsw-tabs">
        <button id="tab-how" aria-controls="panel-how">How</button>
        <button id="tab-variants" aria-controls="panel-variants">Variants</button>
        <div id="panel-how" aria-labelledby="tab-how"><h3 id="visible">Visible</h3></div>
        <div id="panel-variants" class="nhsw-tabs__panel--hidden" aria-labelledby="tab-variants"><h3 id="success-banner">Success banner</h3></div>
      </div>
    `);
    document.getElementById('tab-variants').addEventListener('click', () => {
      document.getElementById('panel-variants').classList.remove('nhsw-tabs__panel--hidden');
    });
    Element.prototype.scrollIntoView = vi.fn();
    runScript(SCRIPT);
  });

  const click = (el) => {
    const event = new Event('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  };

  it('opens the tab holding the target, then moves focus to the heading', () => {
    expect(click(document.getElementById('go'))).toBe(true);
    expect(document.getElementById('panel-variants').classList.contains('nhsw-tabs__panel--hidden')).toBe(false);
    expect(document.activeElement).toBe(document.getElementById('success-banner'));
  });

  it('leaves links to something already visible to the browser', () => {
    expect(click(document.getElementById('plain'))).toBe(false);
  });
});

describe('birthday confetti', () => {
  const layer = () => document.querySelector('[data-nhsw-fx]');
  const run = (date, search = '') => {
    vi.setSystemTime(date);
    window.history.replaceState(null, '', '/' + search);
    runScript(SCRIPT);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    setBody('<p>page</p>');
    Element.prototype.animate = vi.fn(() => ({}));
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  afterEach(() => {
    vi.useRealTimers();
    delete Element.prototype.animate;
    window.history.replaceState(null, '', '/');
  });

  it('rains coloured confetti on 23 October, hidden from screen readers and never blocking clicks', () => {
    run(new Date(2026, 9, 23, 10, 0));
    expect(layer()).not.toBeNull();
    expect(layer().getAttribute('aria-hidden')).toBe('true');
    expect(layer().style.pointerEvents).toBe('none');
    expect(layer().children.length).toBeGreaterThan(50);
    expect(Element.prototype.animate).toHaveBeenCalledTimes(layer().children.length);
  });

  it('comes back every following year on 23 October', () => {
    run(new Date(2027, 9, 23));
    expect(layer()).not.toBeNull();
  });

  it('removes itself once it has finished', () => {
    run(new Date(2026, 9, 23));
    vi.advanceTimersByTime(10000);
    expect(layer()).toBeNull();
  });

  it('does nothing on any other day, or before the first birthday', () => {
    run(new Date(2026, 9, 22));
    expect(layer()).toBeNull();
    run(new Date(2026, 9, 24));
    expect(layer()).toBeNull();
    run(new Date(2025, 9, 23));
    expect(layer()).toBeNull();
    run(new Date(2026, 8, 23));
    expect(layer()).toBeNull();
  });

  it('shows only once per visitor per year', () => {
    run(new Date(2026, 9, 23));
    vi.advanceTimersByTime(10000);
    expect(layer()).toBeNull();
    run(new Date(2026, 9, 23, 15, 0));
    expect(layer()).toBeNull();
    run(new Date(2027, 9, 23));
    expect(layer()).not.toBeNull();
  });

  it('stays still for visitors who prefer reduced motion', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    run(new Date(2026, 9, 23));
    expect(layer()).toBeNull();
  });

  it('can be previewed on any day with ?confetti, without using up the yearly one', () => {
    run(new Date(2026, 5, 1), '?confetti');
    expect(layer()).not.toBeNull();
    expect(window.localStorage.getItem('nhsw-birthday-confetti')).toBeNull();
  });
});

describe('birthday confetti only shows once on the day', () => {
  const layer = () => document.querySelector('[data-nhsw-fx]');
  const run = (date, search = '') => {
    vi.setSystemTime(date);
    window.history.replaceState(null, '', '/' + search);
    runScript(SCRIPT);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    window.sessionStorage.clear();
    setBody('<p>page</p>');
    Element.prototype.animate = vi.fn(() => ({}));
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete Element.prototype.animate;
    window.history.replaceState(null, '', '/');
  });

  it('does not come back on later pages or reloads the same day', () => {
    run(new Date(2026, 9, 23, 9, 0));
    expect(layer()).not.toBeNull();
    vi.advanceTimersByTime(10000);
    for (const hour of [9, 12, 18]) {
      setBody('<p>another page</p>');
      run(new Date(2026, 9, 23, hour, 30));
      expect(layer()).toBeNull();
    }
  });

  it('still only shows once if localStorage is blocked, using sessionStorage instead', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });
    run(new Date(2026, 9, 23, 9, 0));
    expect(layer()).not.toBeNull();
    vi.advanceTimersByTime(10000);
    expect(window.sessionStorage.getItem('nhsw-birthday-confetti')).toBe('2026-10-23');
    run(new Date(2026, 9, 23, 10, 0));
    expect(layer()).toBeNull();
  });

  it('?confetti always shows it, even on the day it has already been seen, and does not change what is remembered', () => {
    run(new Date(2026, 9, 23));
    vi.advanceTimersByTime(10000);
    const remembered = window.localStorage.getItem('nhsw-birthday-confetti');
    expect(remembered).toBe('2026-10-23');
    run(new Date(2026, 9, 23, 16, 0), '?confetti');
    expect(layer()).not.toBeNull();
    vi.advanceTimersByTime(10000);
    run(new Date(2026, 9, 23, 17, 0), '?confetti');
    expect(layer()).not.toBeNull();
    expect(window.localStorage.getItem('nhsw-birthday-confetti')).toBe(remembered);
  });
});
