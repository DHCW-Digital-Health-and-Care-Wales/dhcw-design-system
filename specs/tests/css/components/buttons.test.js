import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('buttons: new warning-outline variant, link variant fixes, group layout, outline shadow fix', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/actions/button"; @use "components/actions/button-group";`);
  });

  it('warning-outline is a small, red-bordered button reusing the existing delete-red tokens', () => {
    const base = block(css, '\\.nhsw-button--warning-outline');
    expect(base).toMatch(/color:\s*#d5281b/);
    expect(base).toMatch(/border-color:\s*#d5281b/);
    const hover = block(css, '\\.nhsw-button--warning-outline:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/color:\s*#902419/);
  });

  it('outline button box-shadow uses the secondary border colour, not the exceptional-button brown', () => {
    const outline = block(css, '\\.nhsw-button--outline');
    expect(outline).toMatch(/box-shadow:\s*0 2px 0 #4c6272/);
  });

  it('link variant is regular weight, square-cornered, and drops its underline on hover on a dark background', () => {
    const base = block(css, '\\.nhsw-button--link');
    expect(base).toMatch(/border-radius:\s*0/);
    expect(base).toMatch(/font-weight:\s*400/);
    const reverseHover = block(css, '\\.nhsw-button--link\\.nhsw-button--reverse:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(reverseHover).toMatch(/text-decoration:\s*none/);
  });

  it('link variant underline is thin, and focus drops the underline and corner radius (even while pressed, so it applies on mousedown not just mouseup)', () => {
    const base = block(css, '\\.nhsw-button--link');
    expect(base).toMatch(/text-decoration-thickness:\s*1px/);
    expect(base).toMatch(/text-underline-offset:\s*0\.12em/);

    const focus = block(css, '\\.nhsw-button--link:focus');
    expect(focus).toMatch(/border-radius:\s*0/);
    expect(focus).toMatch(/text-decoration:\s*none/);
  });

  it('button group stays in a row and wraps at any screen size, and its buttons are not forced full-width', () => {
    const group = block(css, '\\.nhsw-button-group');
    expect(group).toMatch(/flex-direction:\s*row/);
    expect(group).toMatch(/flex-wrap:\s*wrap/);
    const groupButton = block(css, '\\.nhsw-button-group \\.nhsw-button');
    expect(groupButton).toMatch(/width:\s*auto/);
  });
});

describe('button spacing matches Figma Button/Default > Primary/Default', () => {
  // Read directly out of the Figma source of truth for this design system:
  // https://www.figma.com/design/RplwUuFizhzeH1ng7M0SMO/DHCW-Design-System-V2
  // Selected the Button/Default > Primary/Default node and read its Layout
  // panel (padding, radius). Checked 2026-08-11.
  let buttonCss = '';

  beforeAll(() => {
    buttonCss = compileProbe(`
      @use "foundations/button-base" as b;
      .probe { @include b.nhsw-button-base; }
    `);
  });

  it('has 12px vertical / 16px horizontal padding', () => {
    expect(buttonCss).toMatch(/padding:\s*12px 16px/);
  });

  it('has a 4px corner radius', () => {
    expect(buttonCss).toMatch(/border-radius:\s*4px/);
  });

  it('has a 12px gap between icon and label (Button/Icon > Icon - Discard or cancel > Default)', () => {
    // No icon+text button is wired up anywhere in the docs yet, so this gap
    // is currently dormant, but it must be correct for whenever one is built.
    expect(buttonCss).toMatch(/gap:\s*12px/);
  });

  it('focus state suppresses the default browser outline in favour of the custom yellow/box-shadow treatment', () => {
    // Without this, the browser's default UA focus ring shows up alongside
    // the custom focus style — most visible as a stray pale ring around
    // background-less variants like --link sitting on a dark background.
    const focusBlock = buttonCss.match(/:focus:not\(:active\)\s*\{([^}]*)\}/);
    expect(focusBlock && focusBlock[1]).toMatch(/outline:\s*none/);
  });
});

describe('button colour coverage (Figma tokens)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/actions/button"; @use "components/actions/button-group";`);
  });

  it('focus state is the yellow ring with near-black text (via the shared button-base mixin)', () => {
    const focus = block(css, '\\.nhsw-button:focus:not\\(:active\\)');
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/color:\s*#212b32/);
  });

  it('primary variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--primary');
    expect(base).toMatch(/background-color:\s*#1b365d/);
    expect(base).toMatch(/color:\s*#ffffff/);
    expect(base).toMatch(/border-color:\s*#1b365d/);
    expect(base).toMatch(/box-shadow:\s*0 2px 0 #0e1b2f/);

    const hover = block(css, '\\.nhsw-button--primary:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/background-color:\s*#1B2A49/);
    expect(hover).toMatch(/box-shadow:\s*0 2px 0 #1B2A49/);

    const active = block(css, '\\.nhsw-button--primary:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#21355C/);
  });

  it('secondary variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--secondary');
    expect(base).toMatch(/background-color:\s*#ffffff/);

    const hover = block(css, '\\.nhsw-button--secondary:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/background-color:\s*#F2F2F2/);
    expect(hover).toMatch(/box-shadow:\s*0 2px 0 #1B2A49/);

    const active = block(css, '\\.nhsw-button--secondary:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#ffffff/);
  });

  it('exceptional variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--exceptional');
    expect(base).toMatch(/background-color:\s*#f5bb6b/);
    expect(base).toMatch(/border-color:\s*#f5bb6b/);
    expect(base).toMatch(/box-shadow:\s*0 2px 0 #554318/);

    const hover = block(css, '\\.nhsw-button--exceptional:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/background-color:\s*#E3B36A/);

    const active = block(css, '\\.nhsw-button--exceptional:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#EFBD70/);
  });

  it('warning variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--warning');
    expect(base).toMatch(/color:\s*#ffffff/);
    expect(base).toMatch(/box-shadow:\s*0 2px 0 #0e1b2f/);

    const hover = block(css, '\\.nhsw-button--warning:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/box-shadow:\s*0 2px 0 #760000/);

    const active = block(css, '\\.nhsw-button--warning:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#651911/);
  });

  it('outline variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--outline');
    expect(base).toMatch(/background-color:\s*#FFFFFF/);
    expect(base).toMatch(/border-color:\s*#FFFFFF/);

    const hover = block(css, '\\.nhsw-button--outline:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/background-color:\s*#F2F2F2/);

    const active = block(css, '\\.nhsw-button--outline:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#FFFFFF/);
  });

  it('warning-outline variant colours and hover/active states', () => {
    const base = block(css, '\\.nhsw-button--warning-outline');
    expect(base).toMatch(/background-color:\s*#ffffff/);

    const hover = block(css, '\\.nhsw-button--warning-outline:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/background-color:\s*#f0f4f5/);

    const active = block(css, '\\.nhsw-button--warning-outline:not\\(:disabled\\):active');
    expect(active).toMatch(/background-color:\s*#ffffff/);
  });

  it('link variant colours, including the reverse (dark background) sub-variant', () => {
    const base = block(css, '\\.nhsw-button--link');
    expect(base).toMatch(/color:\s*#005aa8/);

    const hover = block(css, '\\.nhsw-button--link:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(hover).toMatch(/color:\s*#003087/);

    const reverse = block(css, '\\.nhsw-button--link\\.nhsw-button--reverse');
    expect(reverse).toMatch(/color:\s*#ffffff/);

    const reverseHover = block(css, '\\.nhsw-button--link\\.nhsw-button--reverse:not\\(:disabled\\):not\\(:focus\\):hover');
    expect(reverseHover).toMatch(/color:\s*#ffffff/);
  });

  it('active box-shadow is restored per-variant so it survives the shared active-state reset', () => {
    const primaryActive = block(css, '\\.nhsw-button--primary:active:not\\(:disabled\\):not\\(\\[disabled\\]\\):not\\(\\.nhsw-button--disabled\\)');
    expect(primaryActive).toMatch(/box-shadow:\s*0 2px 0 #0e1b2f/);

    const exceptionalActive = block(css, '\\.nhsw-button--exceptional:active:not\\(:disabled\\):not\\(\\[disabled\\]\\):not\\(\\.nhsw-button--disabled\\)');
    expect(exceptionalActive).toMatch(/box-shadow:\s*0 2px 0 #554318/);

    const warningActive = block(css, '\\.nhsw-button--warning:active:not\\(:disabled\\):not\\(\\[disabled\\]\\):not\\(\\.nhsw-button--disabled\\)');
    expect(warningActive).toMatch(/box-shadow:\s*0 2px 0 #0e1b2f/);
  });
});
