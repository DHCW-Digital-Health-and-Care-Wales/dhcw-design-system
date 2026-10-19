import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('error summary matches Figma Error summary component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/error-summary";`);
  });

  it('heading sits 24px above the error list', () => {
    const title = block(css, '\\.nhsw-error-summary__title');
    expect(title).toMatch(/margin:\s*0 0 24px/);
  });
});

describe('error summary link and field error styling', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/error-summary"; @use "components/forms/error-message"; @use "components/forms/form-group";`);
  });

  it('error summary link is bold red, compound with .nhsw-link so it wins the colour regardless of stylesheet order', () => {
    const link = block(css, '\\.nhsw-error-summary__link\\.nhsw-link');
    expect(link).toMatch(/color:\s*#d5281b/);
    expect(link).toMatch(/font-weight:\s*700/);
  });

  it('error summary link hover is a distinct darker red', () => {
    const hover = block(css, '\\.nhsw-error-summary__link\\.nhsw-link:hover');
    expect(hover).toMatch(/color:\s*#951c13/);
  });

  it('error message has no top margin', () => {
    const message = block(css, '\\.nhsw-error-message');
    expect(message).toMatch(/margin-top:\s*0/);
  });

  it('label inside an errored field group matches the error message size and drops the bold', () => {
    const label = block(css, '\\.nhsw-form-group--error \\.nhsw-label');
    expect(label).toMatch(/font-weight:\s*400/);
    expect(label).toMatch(/font-size:\s*1rem/);
  });
});
