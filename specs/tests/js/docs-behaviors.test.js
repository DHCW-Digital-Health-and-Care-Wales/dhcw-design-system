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
