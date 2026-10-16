'use strict';

// Regenerates the preview images used on the All components page
// (preview/assets/component-previews/*.png). Each image shows the component,
// built from the design system's own classes, centred on a canvas with the same
// proportions as the card's preview area.
//
// Usage: start the preview site (node scripts/serve-preview-site.js 4173), then
//   node scripts/generate-component-previews.js [baseUrl] [name ...]

const path = require('path');
const { chromium } = require('@playwright/test');

const BASE_URL = process.argv[2] || 'http://localhost:4173';
const ONLY = process.argv.slice(3);
const OUT_DIR = path.join(__dirname, '..', 'preview', 'assets', 'component-previews');

const RATIO = 234 / 320;
const SCALE = 3;
const GREY = '#dbe0e3';

const field = (id, label, hint, control) => `
  <div class="nhsw-form-group">
    <label class="nhsw-label" for="${id}">${label}</label>
    ${hint ? `<div class="nhsw-hint">${hint}</div>` : ''}
    ${control}
  </div>`;

const dateItem = (id, label, cls, value) => `
  <div class="nhsw-date-input__item">
    <label class="nhsw-label nhsw-date-input__label" for="${id}">${label}</label>
    <input id="${id}" class="nhsw-input nhsw-date-input__input nhsw-date-input__input--${cls}" type="text" value="${value}">
  </div>`;

const PREVIEWS = {
  'action-link': { example: 'action-link-default' },

  'back-link': { html: '<a class="nhsw-back-link" href="#">Back</a>' },

  'breadcrumb': {
    width: 420,
    css: '.nhsw-breadcrumb__mobile-back { display: none !important; } .nhsw-breadcrumb__list { display: flex !important; }',
    html: `<nav class="nhsw-breadcrumb" aria-label="breadcrumb"><ol class="nhsw-breadcrumb__list">
      <li class="nhsw-breadcrumb__list-item"><a class="nhsw-breadcrumb__link" href="#">Level</a></li>
      <li class="nhsw-breadcrumb__list-item"><a class="nhsw-breadcrumb__link" href="#">Level</a></li>
      <li class="nhsw-breadcrumb__list-item"><a class="nhsw-breadcrumb__link" href="#">Level</a></li>
    </ol></nav>`,
  },

  'buttons': { html: '<button class="nhsw-button nhsw-button--primary" type="button">Continue</button>' },

  'cards': {
    html: `<div class="nhsw-card" style="width: 220px"><h3 class="nhsw-card__title"><a class="nhsw-card__title-link" href="#">Card heading</a></h3><p class="nhsw-card__description">A short description of the card content.</p></div>`,
  },

  'checkboxes': {
    html: `<div class="nhsw-checkboxes">
      <div class="nhsw-checkboxes__item"><input class="nhsw-checkboxes__input" id="p-cb-1" type="checkbox"><label class="nhsw-label nhsw-checkboxes__label" for="p-cb-1">Flu</label></div>
      <div class="nhsw-checkboxes__item"><input class="nhsw-checkboxes__input" id="p-cb-2" type="checkbox" checked><label class="nhsw-label nhsw-checkboxes__label" for="p-cb-2">HPV</label></div>
    </div>`,
  },

  'date-input': {
    html: `<div class="nhsw-date-input">${dateItem('p-d', 'Day', 'day', '1')}${dateItem('p-m', 'Month', 'month', '12')}${dateItem('p-y', 'Year', 'year', '2000')}</div>`,
  },

  'details': {
    html: `<details class="nhsw-details"><summary class="nhsw-details__summary"><span class="nhsw-details__summary-text">How to find your NHS number</span></summary></details>`,
  },

  'error-summary': {
    html: `<div class="nhsw-error-summary" style="width: 240px"><h2 class="nhsw-h3 nhsw-error-summary__title">There is a problem</h2><ul class="nhsw-error-summary__list"><li><a class="nhsw-link nhsw-error-summary__link" href="#">Enter your full name</a></li></ul></div>`,
  },

  'expander': {
    bg: GREY,
    html: `<div class="nhsw-expander" style="width: 260px"><button type="button" class="nhsw-expander__button" aria-expanded="false"><span class="nhsw-expander__heading"><span class="nhsw-expander__icon" aria-hidden="true"></span><span class="nhsw-expander__link-text">Digital consent</span></span></button></div>`,
  },

  'file-upload': {
    html: `<div class="nhsw-file-upload" style="width: 270px; box-sizing: border-box"><span class="nhsw-file-upload__status">No file chosen</span><div class="nhsw-file-upload__actions"><label class="nhsw-button nhsw-button--secondary nhsw-button--inline nhsw-file-upload__button">Choose file</label><span class="nhsw-file-upload__hint">or drop file</span></div></div>`,
  },

  'footer': {
    html: `<footer class="nhsw-site-footer" style="width: 100%"><div class="nhsw-site-footer__container"><ul class="nhsw-site-footer__links"><li><a class="nhsw-link" href="#">Accessibility statement</a></li><li><a class="nhsw-link" href="#">Privacy policy</a></li></ul><p class="nhsw-body-s nhsw-site-footer__copyright">&copy; Digital Health and Care Wales</p></div></footer>`,
  },

  'header': {
    css: '.nhsw-fluid-container { padding: 0 !important; } .nhsw-fluid-container > header { width: 100%; }',
    html: `<header class="nhsw-site-header"><div class="nhsw-site-header__container"><div class="nhsw-site-header__top"><a class="nhsw-site-header__brand" href="#"><span class="nhsw-site-header__logo"><img src="/assets/nhsw-logo.svg" alt=""></span><span class="nhsw-site-header__title">Service name</span></a></div></div></header>`,
  },

  'inset-text': {
    html: `<div class="nhsw-inset-text" style="width: 260px"><p class="nhsw-body">It can take up to 8 weeks to register a lasting power of attorney.</p></div>`,
  },

  'notification-banner': {
    html: `<div class="nhsw-notification-banner nhsw-notification-banner--success" style="width: 270px"><div class="nhsw-notification-banner__header"><h2 class="nhsw-notification-banner__title">Success</h2></div><div class="nhsw-notification-banner__content"><h3 class="nhsw-notification-banner__heading">Vaccination outcome recorded for HPV</h3></div></div>`,
  },

  'pagination': {
    width: 700,
    css: '.nhsw-pagination { margin: 0 !important; padding-top: 0 !important; border: 0 !important; }',
    html: `<nav class="nhsw-pagination nhsw-pagination--numbered" aria-label="Pagination">
      <a href="#" class="nhsw-pagination__previous"><svg class="nhsw-pagination__icon" viewBox="0 0 17 15" aria-hidden="true"><path d="M0.292893 6.65666C-0.0976314 7.04719 -0.0976315 7.68035 0.292892 8.07087L6.65685 14.4348C7.04738 14.8254 7.68054 14.8254 8.07107 14.4348C8.46159 14.0443 8.46159 13.4111 8.07107 13.0206L2.41421 7.36377L8.07107 1.70691C8.46159 1.31639 8.46159 0.683225 8.07107 0.292701C7.68054 -0.0978235 7.04738 -0.0978235 6.65686 0.292701L0.292893 6.65666ZM17 7.36377L17 6.36377L1 6.36377L1 7.36377L1 8.36377L17 8.36377L17 7.36377Z"/></svg><span class="nhsw-pagination__title">Previous</span></a>
      <ul class="nhsw-pagination__list">
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">1</a></li>
        <li class="nhsw-pagination__item nhsw-pagination__item--ellipsis">&ctdot;</li>
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">8</a></li>
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">9</a></li>
        <li class="nhsw-pagination__item nhsw-pagination__item--current"><a class="nhsw-pagination__number-link" href="#" aria-current="page">10</a></li>
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">11</a></li>
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">12</a></li>
        <li class="nhsw-pagination__item nhsw-pagination__item--ellipsis">&ctdot;</li>
        <li class="nhsw-pagination__item"><a class="nhsw-pagination__number-link" href="#">42</a></li>
      </ul>
      <a href="#" class="nhsw-pagination__next"><span class="nhsw-pagination__title">Next</span><svg class="nhsw-pagination__icon" viewBox="0 0 17 15" aria-hidden="true"><path d="M16.7071 8.07088C17.0976 7.68035 17.0976 7.04719 16.7071 6.65666L10.3431 0.292703C9.95262 -0.0978218 9.31946 -0.0978219 8.92893 0.292703C8.53841 0.683227 8.53841 1.31639 8.92893 1.70692L14.5858 7.36377L8.92893 13.0206C8.53841 13.4111 8.53841 14.0443 8.92893 14.4348C9.31946 14.8254 9.95262 14.8254 10.3431 14.4348L16.7071 8.07088ZM0 7.36377L-8.74224e-08 8.36377L16 8.36377L16 7.36377L16 6.36377L8.74224e-08 6.36377L0 7.36377Z"/></svg></a>
    </nav>`,
  },

  'panel': {
    html: `<div class="nhsw-panel" style="width: 100%"><h1 class="nhsw-panel__title nhsw-panel__title--m">Application complete</h1><div class="nhsw-panel__body">We have sent you a confirmation email</div></div>`,
  },

  'radios': {
    html: `<div class="nhsw-radios">
      <div class="nhsw-radios__item"><input class="nhsw-radios__input" id="p-r-1" name="p-r" type="radio" checked><label class="nhsw-label nhsw-radios__label" for="p-r-1">Yes</label></div>
      <div class="nhsw-radios__item"><input class="nhsw-radios__input" id="p-r-2" name="p-r" type="radio"><label class="nhsw-label nhsw-radios__label" for="p-r-2">No</label></div>
    </div>`,
  },

  'select': {
    html: field('p-select', 'Sort by', '', `<select id="p-select" class="nhsw-select"><option>Choose region</option></select>`),
  },

  'site-navigation': {
    width: 700,
    bg: GREY,
    css: '.nhsw-fluid-container { padding: 0 !important; } .nhsw-fluid-container > nav { width: 100%; }',
    html: `<nav class="nhsw-site-header__nav"><div class="nhsw-site-header__nav-container"><ul class="nhsw-site-header__nav-list">
      <li><a class="nhsw-site-header__nav-link nhsw-site-header__nav-link--current" href="#" aria-current="page"><span>Navigation Item</span></a></li>
      <li><a class="nhsw-site-header__nav-link" href="#"><span>Navigation Item</span></a></li>
      <li><a class="nhsw-site-header__nav-link" href="#"><span>Navigation Item</span></a></li>
    </ul></div></nav>`,
  },

  'skip-link': {
    css: '.nhsw-skip-link { position: static !important; transform: none !important; clip-path: none !important; }',
    html: '<a class="nhsw-skip-link" href="#">Skip to main content</a>',
  },

  'summary-list': {
    width: 560,
    bg: GREY,
    html: `<div class="nhsw-summary-card" style="width: 100%"><div class="nhsw-summary-card__header"><h3 class="nhsw-h3 nhsw-summary-card__title">Carys Gale</h3></div><div class="nhsw-summary-card__body"><dl class="nhsw-summary-list">
      <div class="nhsw-summary-list__row"><dt class="nhsw-summary-list__key">Name</dt><dd class="nhsw-summary-list__value">Carys Gale</dd></div>
      <div class="nhsw-summary-list__row"><dt class="nhsw-summary-list__key">Date of birth</dt><dd class="nhsw-summary-list__value">1 May 1984</dd></div>
      <div class="nhsw-summary-list__row"><dt class="nhsw-summary-list__key">Contact information</dt><dd class="nhsw-summary-list__value">Flat A<br>2 Heol Ysgol Newydd</dd></div>
    </dl></div></div>`,
  },

  'table': {
    width: 520,
    css: '.nhsw-table { margin: 0 !important; width: 100%; }',
    html: `<table class="nhsw-table"><caption class="nhsw-table__caption nhsw-table__caption--m nhsw-caption-m">Skin symptoms and possible causes</caption>
      <thead class="nhsw-table__head"><tr class="nhsw-table__row"><th scope="col" class="nhsw-table__header">Skin symptoms</th><th scope="col" class="nhsw-table__header">Possible cause</th></tr></thead>
      <tbody class="nhsw-table__body">
        <tr class="nhsw-table__row"><td class="nhsw-table__cell">Blisters on lips or around the mouth</td><td class="nhsw-table__cell">Cold sores</td></tr>
        <tr class="nhsw-table__row"><td class="nhsw-table__cell">Itchy, dry, cracked, sore</td><td class="nhsw-table__cell">Eczema</td></tr>
        <tr class="nhsw-table__row"><td class="nhsw-table__cell">Itchy blisters</td><td class="nhsw-table__cell">Shingles, chickenpox</td></tr>
      </tbody></table>`,
  },

  'tabs': {
    bg: GREY,
    renderWidth: 700,
    html: `<div class="nhsw-tabs"><ul class="nhsw-tabs__list" role="tablist" style="border: 0">
      <li role="presentation"><button class="nhsw-tabs__tab nhsw-tabs__tab--selected" role="tab" aria-selected="true"><span class="nhsw-tabs__tab-text">Tab</span></button></li>
      <li role="presentation"><button class="nhsw-tabs__tab" role="tab" aria-selected="false"><span class="nhsw-tabs__tab-text">Tab</span><span class="nhsw-tag nhsw-tag--blue nhsw-tabs__tab-count">112</span></button></li>
    </ul></div>`,
  },

  'tag': {
    html: `<div style="display: flex; flex-direction: column; align-items: center; gap: 12px">
      <strong class="nhsw-tag nhsw-tag--grey">Inactive</strong>
      <strong class="nhsw-tag nhsw-tag--green">New</strong>
      <strong class="nhsw-tag nhsw-tag--yellow">Declined</strong>
    </div>`,
  },

  'text-input': {
    html: field('p-name', 'What is your full name?', '', `<input id="p-name" class="nhsw-input" type="text" style="width: 260px">`).replace('nhsw-label"', 'nhsw-label nhsw-label--l"'),
  },

  'textarea': {
    html: field('p-reason', 'Provide a reason for continuing', 'Explain why you need to continue despite a recent transfusion', `<textarea id="p-reason" class="nhsw-textarea" style="width: 260px" rows="3"></textarea>`),
  },

  'warning-callout': {
    width: 480,
    html: `<div class="nhsw-warning-callout" style="width: 380px"><h3 class="nhsw-warning-callout__heading"><span class="nhsw-warning-callout__icon" aria-hidden="true">!</span><span class="nhsw-warning-callout__heading-text">School, nursery or work</span></h3><div class="nhsw-warning-callout__content"><p class="nhsw-body">Stay away from school, nursery or work until all the spots have crusted over. This is usually 5 days after the spots first appeared.</p></div></div>`,
  },
};

const CENTRE_STYLES = `
  body > header, body > footer { display: none !important; }
  html, body { margin: 0; }
  body { min-height: 100vh; display: flex; }
  .nhsw-main-wrapper { flex: 1; display: flex; padding: 0 !important; background: transparent !important; }
  .nhsw-fluid-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 12px !important; box-sizing: border-box; }
  .nhsw-fluid-container > * { margin-top: 0 !important; margin-bottom: 0 !important; max-width: 100%; }
`;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: SCALE });
  const page = await context.newPage();

  for (const [name, spec] of Object.entries(PREVIEWS)) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    // renderWidth: lay the page out at a wider screen (so the component is not in its
    // narrow form), then crop the middle of it to the card's proportions.
    const width = spec.renderWidth || spec.width || 320;
    const height = Math.round(width * RATIO);
    await page.setViewportSize({ width, height });
    await page.goto(`${BASE_URL}/examples/${spec.example || 'action-link-default'}.html`);
    await page.addStyleTag({ content: `${CENTRE_STYLES} html, body { background: ${spec.bg || '#fff'} !important; } ${spec.css || ''}` });
    if (spec.html) {
      await page.evaluate((html) => { document.querySelector('.nhsw-fluid-container').innerHTML = html; }, spec.html);
    }
    const clip = spec.renderWidth
      ? { x: (width - 320) / 2, y: (height - 234) / 2, width: 320, height: 234 }
      : undefined;
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), clip });
    console.log(`${name}.png`);
  }

  await browser.close();
})();
