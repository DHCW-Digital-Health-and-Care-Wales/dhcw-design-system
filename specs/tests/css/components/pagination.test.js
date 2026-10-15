import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('numbered pagination: underline is default, hover removes it (not the other way round)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/pagination";`);
  });

  it('page number links are underlined by default and lose the underline on hover', () => {
    const base = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__number-link');
    expect(base).toMatch(/text-decoration:\s*underline/);
    const hover = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__number-link:hover');
    expect(hover).toMatch(/text-decoration:\s*none/);
  });

  it('previous/next links are underlined by default and lose the underline on hover', () => {
    const base = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__previous,\\n\\.nhsw-pagination--numbered \\.nhsw-pagination__next');
    expect(base).toMatch(/text-decoration:\s*underline/);
    const hover = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__previous:hover,\\n\\.nhsw-pagination--numbered \\.nhsw-pagination__next:hover');
    expect(hover).toMatch(/text-decoration:\s*none/);
  });
});

describe('pagination colour coverage (Figma tokens)', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/pagination";`);
  });

  it('block has a light-grey top divider', () => {
    const base = block(css, '\\.nhsw-pagination');
    expect(base).toMatch(/border-top:\s*1px solid #d8dde0/);
  });

  it('legacy prev/next link is link-blue and recolours on hover, but its arrow icon stays a fixed black fill regardless of link state', () => {
    const base = block(css, '\\.nhsw-pagination__link');
    expect(base).toMatch(/color:\s*#005aa8/);

    const icon = block(css, '\\.nhsw-pagination__link \\.nhsw-icon');
    expect(icon).toMatch(/fill:\s*#212b32/);

    const hover = block(css, '\\.nhsw-pagination__link:hover');
    expect(hover).toMatch(/color:\s*#7c2855/);

    const focus = block(css, '\\.nhsw-pagination__link:focus');
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/box-shadow:\s*0 -2px #ffeb3b, 0 4px #212b32/);

    expect(block(css, '\\.nhsw-pagination__link:hover \\.nhsw-icon')).toBe('');
    expect(block(css, '\\.nhsw-pagination__link:visited \\.nhsw-icon')).toBe('');
  });

  it('numbered previous/next colour, hover and focus states', () => {
    const base = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__previous,\\n\\.nhsw-pagination--numbered \\.nhsw-pagination__next');
    expect(base).toMatch(/color:\s*#005aa8/);

    const hover = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__previous:hover,\\n\\.nhsw-pagination--numbered \\.nhsw-pagination__next:hover');
    expect(hover).toMatch(/background-color:\s*#d8dde0/);
    expect(hover).toMatch(/color:\s*#7c2855/);

    const focus = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__previous:focus,\\n\\.nhsw-pagination--numbered \\.nhsw-pagination__next:focus');
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/box-shadow:\s*0 -2px #ffeb3b, 0 4px #212b32/);
  });

  it('ellipsis item is muted grey text', () => {
    const ellipsis = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__item--ellipsis');
    expect(ellipsis).toMatch(/color:\s*#4c6272/);
  });

  it('numbered page link colour, hover and focus states', () => {
    const base = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__number-link');
    expect(base).toMatch(/color:\s*#005aa8/);

    const hover = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__number-link:hover');
    expect(hover).toMatch(/background-color:\s*#d8dde0/);
    expect(hover).toMatch(/color:\s*#7c2855/);

    const focus = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__number-link:focus');
    expect(focus).toMatch(/background-color:\s*#ffeb3b/);
    expect(focus).toMatch(/box-shadow:\s*0 -2px #ffeb3b, 0 4px #212b32/);
  });

  it('current page number is filled link-blue with white text, including on hover', () => {
    const current = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__item--current \\.nhsw-pagination__number-link');
    expect(current).toMatch(/background-color:\s*#005aa8/);
    expect(current).toMatch(/color:\s*#ffffff/);

    const currentHover = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__item--current \\.nhsw-pagination__number-link:hover');
    expect(currentHover).toMatch(/background-color:\s*#005aa8/);
    expect(currentHover).toMatch(/color:\s*#ffffff/);
  });

  it('numbered previous/next arrow icon is a fixed black fill, not a stroke', () => {
    const icon = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__icon');
    expect(icon).toMatch(/fill:\s*#212b32/);
    expect(icon).not.toMatch(/stroke/);
  });
});

describe('numbered pagination: on mobile, previous/next sit at the top with the number list wrapping below', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/content/pagination";`);
  });

  it('mobile: previous is pinned to the start and next to the end of the top row', () => {
    const base = block(css, '\\.nhsw-pagination--numbered');
    expect(base).toMatch(/justify-content:\s*space-between/);

    // .nhsw-pagination__previous/__next share an earlier combined-selector
    // block for hover/focus styles, so block() (which returns the first
    // match) can't isolate the later, dedicated `order` rule - check the
    // compiled output directly instead.
    expect(css).toContain('.nhsw-pagination--numbered .nhsw-pagination__previous {\n  order: 1;\n}');
    expect(css).toContain('.nhsw-pagination--numbered .nhsw-pagination__next {\n  order: 2;\n}');
  });

  it('mobile: the number list is forced onto its own full-width row below previous/next', () => {
    const list = block(css, '\\.nhsw-pagination--numbered \\.nhsw-pagination__list');
    expect(list).toMatch(/order:\s*3/);
    expect(list).toMatch(/flex-basis:\s*100%/);
  });

  it('desktop (from-tablet): reverts to a single centred row in natural source order', () => {
    const fromTablet = css.match(/@media \(min-width: 40\.0625em\)[\s\S]*/)[0];
    expect(fromTablet).toMatch(/\.nhsw-pagination--numbered\s*\{\s*justify-content:\s*center/);
    expect(fromTablet).toMatch(/\.nhsw-pagination--numbered \.nhsw-pagination__previous\s*\{\s*order:\s*initial/);
    expect(fromTablet).toMatch(/\.nhsw-pagination--numbered \.nhsw-pagination__next\s*\{\s*order:\s*initial/);
    expect(fromTablet).toMatch(/\.nhsw-pagination--numbered \.nhsw-pagination__list\s*\{\s*order:\s*initial;\s*flex-basis:\s*auto/);
  });
});
