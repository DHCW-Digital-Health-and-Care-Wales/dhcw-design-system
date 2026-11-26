import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compileProbe } from '../support/compile-scss.js';
import { configure } from '../../../src/nunjucks.config.js';

const root = path.resolve(import.meta.dirname, '../../..');
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]));
const markup = ['preview/prototype-kit', 'preview/_layouts', 'preview/_includes'].flatMap(walk);

describe('the prototype kit website uses the shared design system styles', () => {
  it('the library has no styles that apply only to the prototype kit', () => {
    expect(compileProbe('@use "layouts" as *;')).not.toContain('.nhsw-prototype-kit');
  });

  it.each(markup)('%s uses no prototype kit class', (file) => {
    expect(fs.readFileSync(path.join(root, file), 'utf8')).not.toMatch(/class="[^"]*nhsw-prototype-kit/);
  });
});

describe('the large hero is part of the header component', () => {
  const env = configure({ noCache: true });
  const render = (hero) => env.renderString('{% from "header/macro.njk" import nhswHeader %}{{ nhswHeader({ serviceName: "Service", hero: hero }) }}', { hero });

  it('adds the large modifier only when asked', () => {
    expect(render({ title: 'Title', large: true })).toContain('class="nhsw-site-header__hero nhsw-site-header__hero--large"');
    expect(render({ title: 'Title' })).toContain('class="nhsw-site-header__hero"');
  });
});
