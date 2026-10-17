import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';

const projectRoot = path.resolve(import.meta.dirname, '../../..');

let compiledCss = '';

beforeAll(() => {
  const result = sass.compile(path.join(projectRoot, 'src/index.scss'));
  compiledCss = result.css;
});

it('compiles src/index.scss without errors and produces non-empty CSS', () => {
  expect(compiledCss.length).toBeGreaterThan(0);
});

/**
 * Every class name (and BEM element/modifier) mentioned in the component
 * registry and design-system rules docs must actually exist as a selector
 * in the compiled CSS. This is what keeps .agent/component-registry.md
 * honest as new components/modifiers are added or renamed.
 */
// Not CSS classes — referenced in prose as asset and script filenames
// (assets/nhsw-logo.svg, assets/nhsw-logo-dark.svg, dist/nhsw-behaviours.js).
const NOT_CLASSES = new Set(['nhsw-logo', 'nhsw-logo-dark', 'nhsw-behaviours']);

const SCSS_VARIABLE = /\$nhsw(?:ales)?-[a-z0-9-]+/g;

function extractClassNames(text) {
  const matches = text.replace(SCSS_VARIABLE, '').match(/nhsw-[a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?/g) || [];
  return [...new Set(matches)].filter((name) => !name.endsWith('-') && !NOT_CLASSES.has(name));
}

const registryPath = path.join(projectRoot, '.agent/component-registry.md');
const rulesPath = path.join(projectRoot, '.agent/design-system-rules.md');

const registryClasses = fs.existsSync(registryPath) ? extractClassNames(fs.readFileSync(registryPath, 'utf8')) : [];
const rulesClasses = fs.existsSync(rulesPath) ? extractClassNames(fs.readFileSync(rulesPath, 'utf8')) : [];
const allDocumentedClasses = [...new Set([...registryClasses, ...rulesClasses])].sort();

describe('every class documented in .agent/component-registry.md and design-system-rules.md exists in the compiled CSS', () => {
  it.each(allDocumentedClasses)('%s', (className) => {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selectorPattern = new RegExp('\\.' + escaped + '(?:[^a-zA-Z0-9_-]|$)');
    expect(compiledCss).toMatch(selectorPattern);
  });
});

describe('grid column classes referenced by design-system-rules.md', () => {
  const columns = ['full', 'one-half', 'one-third', 'two-thirds', 'one-quarter', 'three-quarters'];
  it.each(columns)('.nhsw-grid-column-%s exists', (name) => {
    expect(compiledCss).toContain('.nhsw-grid-column-' + name);
  });
});

describe('tag colour modifiers listed in the registry all resolve to distinct rules', () => {
  const colours = ['white', 'grey', 'green', 'aqua-green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow'];
  it.each(colours)('.nhsw-tag--%s exists', (colour) => {
    expect(compiledCss).toContain('.nhsw-tag--' + colour);
  });
});

const tokenSource = ['colours', 'spacing', 'typography']
  .map((name) => fs.readFileSync(path.join(projectRoot, `src/tokens/_${name}.scss`), 'utf8').replace(/^﻿/, ''))
  .join('\n');
const tokenValues = new Map([...tokenSource.matchAll(/^\$([a-z0-9-]+)\s*:\s*([^;]+);/gim)].map((m) => [m[1], m[2].trim().toLowerCase()]));
const rulesText = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf8') : '';

function extractTokens(text) {
  const matches = text.match(SCSS_VARIABLE) || [];
  return [...new Set(matches.map((token) => token.slice(1)))].filter((name) => !name.endsWith('-')).sort();
}

describe('every SCSS token named in .agent/design-system-rules.md is defined in src/tokens', () => {
  it.each(extractTokens(rulesText))('%s', (token) => {
    expect(tokenValues.has(token)).toBe(true);
  });
});

describe('colour values in the rules colour table match src/tokens/_colours.scss', () => {
  const rows = rulesText
    .split('\n')
    .filter((line) => line.startsWith('|') && line.includes('$nhswales-'))
    .map((line) => ({
      tokens: [...line.matchAll(/\$(nhswales-[a-z0-9-]+)/g)].map((m) => m[1]),
      hexes: line.match(/#[0-9a-f]{6}/gi) || [],
    }));

  it('lists the colour tokens in a table', () => {
    expect(rows.length).toBeGreaterThan(8);
  });

  it.each(rows.map((row) => [row.tokens.join(' / '), row]))('%s', (_label, row) => {
    expect(row.hexes).toHaveLength(row.tokens.length);
    row.tokens.forEach((token, index) => {
      expect(tokenValues.get(token), token).toBe(row.hexes[index].toLowerCase());
    });
  });
});

describe('spacing values stated in .agent/design-system-rules.md match src/tokens/_spacing.scss', () => {
  const stated = [
    ['Error message margin-bottom', 'nhsw-error-margin-bottom'],
    ['Hint margin-bottom', 'nhsw-hint-margin-bottom'],
  ];

  it.each(stated)('%s', (label, token) => {
    expect(rulesText).toContain(`${label}: ${tokenValues.get(token)}`);
  });

  it('states the maximum page width', () => {
    expect(rulesText).toContain(`${tokenValues.get('nhsw-page-width')} (\`$nhsw-page-width\`)`);
  });

  it('states the container margins on mobile and desktop', () => {
    expect(rulesText).toContain(`Container side margins: ${tokenValues.get('nhsw-container-margin-mobile')} on mobile, ${tokenValues.get('nhsw-container-margin-desktop')} from desktop`);
  });
});

describe('the rules file keeps the sections the agent config relies on, in order', () => {
  it('lists "Do not" before the accessibility rules', () => {
    expect(rulesText.indexOf('## Do not')).toBeGreaterThan(-1);
    expect(rulesText.indexOf('## Do not')).toBeLessThan(rulesText.indexOf('## Accessibility rules'));
  });

  it('keeps repository-only instructions in their own section', () => {
    expect(rulesText).toContain('## When working in this repository');
  });
});
