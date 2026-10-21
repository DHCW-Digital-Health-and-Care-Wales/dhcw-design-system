import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runScript } from '../support/load-script.js';

const root = path.resolve(import.meta.dirname, '../../..');
const headScript = fs.readFileSync(path.join(root, 'preview/_includes/cookie-banner-head.html'), 'utf8')
  .replace(/^\s*<script>/, '')
  .replace(/<\/script>\s*$/, '');

const PENDING = 'nhsw-cookie-banner-pending';
const BANNER = `
  <div class="nhsw-cookie-banner" data-module="nhsw-cookie-consent" data-clarity-id="" hidden>
    <div data-cookie-prompt><button data-cookie-choice="accepted">Yes</button><button data-cookie-choice="rejected">No</button></div>
    <div data-cookie-confirmation hidden><p data-cookie-message tabindex="-1"></p><button data-cookie-hide>Hide</button></div>
  </div>`;

const runHead = () => new Function(headScript)();
const banner = () => document.querySelector('.nhsw-cookie-banner');

describe('cookie banner is in place before the page first paints', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(PENDING);
    document.body.innerHTML = BANNER;
  });

  it('marks the page as pending for a visitor who has not chosen yet', () => {
    runHead();
    expect(document.documentElement.classList.contains(PENDING)).toBe(true);
  });

  it.each(['accepted', 'rejected'])('does not mark the page for a visitor who already chose %s', (choice) => {
    localStorage.setItem('nhsw_cookie_consent', JSON.stringify({ choice, version: '1' }));
    runHead();
    expect(document.documentElement.classList.contains(PENDING)).toBe(false);
  });

  it('marks the page again when the saved choice is for an older policy version', () => {
    localStorage.setItem('nhsw_cookie_consent', JSON.stringify({ choice: 'accepted', version: '0' }));
    runHead();
    expect(document.documentElement.classList.contains(PENDING)).toBe(true);
  });

  it('marks the page when the saved value is unreadable', () => {
    localStorage.setItem('nhsw_cookie_consent', '{not json');
    runHead();
    expect(document.documentElement.classList.contains(PENDING)).toBe(true);
  });

  it('the consent script shows the banner, clears the marker, and Hide still works afterwards', () => {
    runHead();
    runScript('preview/assets/nhsw-cookie-consent.js');
    expect(banner().hidden).toBe(false);
    expect(document.documentElement.classList.contains(PENDING)).toBe(false);

    document.querySelector('[data-cookie-choice="rejected"]').click();
    document.querySelector('[data-cookie-hide]').click();
    expect(banner().hidden).toBe(true);
  });

  it('the consent script leaves the banner hidden for a returning visitor', () => {
    localStorage.setItem('nhsw_cookie_consent', JSON.stringify({ choice: 'rejected', version: '1' }));
    runHead();
    runScript('preview/assets/nhsw-cookie-consent.js');
    expect(banner().hidden).toBe(true);
  });
});

describe('cookie banner wiring', () => {
  it('the head script uses the same storage key and policy version as the consent script', () => {
    const consent = fs.readFileSync(path.join(root, 'preview/assets/nhsw-cookie-consent.js'), 'utf8');
    expect(consent).toContain("STORAGE_KEY = 'nhsw_cookie_consent'");
    expect(consent).toContain("POLICY_VERSION = '1'");
    expect(headScript).toContain("'nhsw_cookie_consent'");
    expect(headScript).toContain("version === '1'");
  });

  it('the default layout includes the head script in the head, only when analytics is on', () => {
    const layout = fs.readFileSync(path.join(root, 'preview/_layouts/default.html'), 'utf8');
    const head = layout.slice(0, layout.indexOf('</head>'));
    expect(head).toContain("{% if site.clarity_enabled %}{% include cookie-banner-head.html %}{% endif %}");
  });

  it('shows a hidden banner when the page is pending, so it appears at the top without a script delay', () => {
    const scss = fs.readFileSync(path.join(root, 'src/components/site/_cookie-banner.scss'), 'utf8');
    expect(scss).toMatch(/\.nhsw-cookie-banner-pending \.nhsw-cookie-banner\[hidden\]\s*\{\s*display:\s*block;/);
  });
});
