import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('summary card header, body and subheader structure', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/summary-card";`);
  });

  it('card has a grey 1px border and 24px bottom margin', () => {
    const card = block(css, '\\.nhsw-summary-card');
    expect(card).toMatch(/border:\s*1px solid #d8dde0/);
    expect(card).toMatch(/margin:\s*0 0 24px/);
  });

  it('header pads 16px/24px with a white background and no bottom border', () => {
    const header = block(css, '\\.nhsw-summary-card__header');
    expect(header).toMatch(/padding:\s*16px 24px/);
    expect(header).not.toMatch(/border-bottom/);
    expect(header).toMatch(/background-color:\s*#ffffff/);
  });

  it('subheader has a grey background between top/bottom borders', () => {
    const subheader = block(css, '\\.nhsw-summary-card__subheader');
    expect(subheader).toMatch(/background-color:\s*#f0f4f5/);
    expect(subheader).toMatch(/border-top:\s*1px solid #d8dde0/);
    expect(subheader).toMatch(/border-bottom:\s*1px solid #d8dde0/);
  });

  it('action links are bold and recolour to maroon on hover', () => {
    const actionsLink = block(css, '\\.nhsw-summary-card__actions a');
    const actionsLinkHover = block(css, '\\.nhsw-summary-card__actions a:hover');
    expect(actionsLink).toMatch(/font-weight:\s*700/);
    expect(actionsLinkHover).toMatch(/color:\s*#7c2855/);
  });
});

describe('summary card action links hover to the maroon used elsewhere, not the near-identical default link-hover blue', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/summary-card";`);
  });

  it('summary card header actions (Cancel/Reschedule) hover to #7c2855', () => {
    const hover = block(css, '\\.nhsw-summary-card__actions a:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);
  });
});
