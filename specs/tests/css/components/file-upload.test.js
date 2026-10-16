import { describe, it, expect, beforeAll } from 'vitest';
import { compileProbe, block } from '../../support/compile-scss.js';

describe('file upload matches Figma Upload a file component', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/file-upload";`);
  });

  it('dashed box has a 1px secondary-coloured border, 28px padding, 20px gap', () => {
    const base = block(css, '\\.nhsw-file-upload');
    expect(base).toMatch(/border:\s*1px dashed #4c6272/);
    expect(base).toMatch(/padding:\s*28px/);
    expect(base).toMatch(/gap:\s*20px/);
  });

  it('status readout has uniform 10px padding and a #dbe0e3 grey background', () => {
    const status = block(css, '\\.nhsw-file-upload__status');
    expect(status).toMatch(/padding:\s*10px/);
    expect(status).toMatch(/background-color:\s*#dbe0e3/);
  });

  it('actions row has a 20px gap', () => {
    const actions = block(css, '\\.nhsw-file-upload__actions');
    expect(actions).toMatch(/gap:\s*20px/);
  });
});

describe('file upload hover/uploaded/focus states', () => {
  let css = '';

  beforeAll(() => {
    css = compileProbe(`@use "components/forms/file-upload";`);
  });

  it('hover turns the whole box white and keeps the "No file chosen" area #dbe0e3', () => {
    expect(block(css, '\\.nhsw-file-upload:hover')).toMatch(/background-color:\s*#ffffff/);
    expect(block(css, '\\.nhsw-file-upload__status')).toMatch(/background-color:\s*#dbe0e3/);
    expect(css).not.toMatch(/\.nhsw-file-upload:hover \.nhsw-file-upload__status/);
  });

  it('hovering anywhere in the box gives the Choose file button its hover look, unless it is focused', () => {
    const hoverButton = block(css, '\\.nhsw-file-upload:hover \\.nhsw-file-upload__input:not\\(:focus\\) \\+ \\.nhsw-file-upload__button');
    expect(hoverButton).toMatch(/background-color:\s*#f2f2f2/i);
    expect(hoverButton).toMatch(/box-shadow:\s*0 2px 0 #212b32/i);
  });

  it('an error state does not recolour the box: the outline stays as it is', () => {
    expect(css).not.toMatch(/nhsw-form-group--error/);
  });

  it('the uploaded-file state has a white background and a solid (not dashed) border', () => {
    const hasFile = block(css, '\\.nhsw-file-upload--has-file');
    expect(hasFile).toMatch(/background-color:\s*#ffffff/);
    expect(hasFile).toMatch(/border-style:\s*solid/);
  });

  it('the filled status readout uses the dark secondary colour with white text', () => {
    const filled = block(css, '\\.nhsw-file-upload__status--filled');
    expect(filled).toMatch(/background-color:\s*#4c6272/);
    expect(filled).toMatch(/color:\s*#ffffff/);
  });

  it('"No file chosen" and "or drop file" use the standard dark text colour, not a greyed-out one', () => {
    const status = block(css, '\\.nhsw-file-upload__status');
    const hint = block(css, '\\.nhsw-file-upload__hint');
    expect(status).toMatch(/color:\s*#212b32/);
    expect(hint).toMatch(/color:\s*#212b32/);
  });

  it('focusing the hidden file input highlights the Choose file button with a background colour, not just a border', () => {
    const focusButton = block(css, '\\.nhsw-file-upload__input:focus \\+ \\.nhsw-file-upload__button');
    expect(focusButton).toMatch(/background-color:\s*#ffeb3b/);
    expect(focusButton).toMatch(/border:\s*none/);
  });

  it('a long selected file name can break instead of overflowing the status box', () => {
    const status = block(css, '\\.nhsw-file-upload__status');
    expect(status).toMatch(/overflow-wrap:\s*break-word/);
  });
});
