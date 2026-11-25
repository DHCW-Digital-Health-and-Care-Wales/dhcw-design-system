// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { readUnit, readBrowser, build, mentions, percent, runProblems } = require('../../../scripts/generate-test-report.js');

const ROOT = path.resolve(import.meta.dirname, '../../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const unitData = {
  testResults: [{
    name: path.join(ROOT, 'specs/tests/css/components/radios.test.js'),
    assertionResults: [
      { ancestorTitles: ['radios'], title: 'works', status: 'passed', failureMessages: [] },
      { ancestorTitles: ['radios'], title: 'breaks', status: 'failed', failureMessages: ['nope'] },
      { ancestorTitles: ['radios'], title: 'later', status: 'pending', failureMessages: [] },
    ],
  }],
};

const browserData = {
  suites: [{
    title: 'checkboxes-spacing.spec.js',
    file: 'checkboxes-spacing.spec.js',
    suites: [{
      title: 'Checkboxes spacing',
      specs: [{ title: 'line is spaced', file: 'checkboxes-spacing.spec.js', tests: [{ status: 'expected', results: [{ status: 'passed' }] }] }],
    }],
  }],
};

describe('test results report', () => {
  it('reads unit results and maps pending to skipped', () => {
    const records = readUnit(unitData);
    expect(records.map((r) => r.status)).toEqual(['passed', 'failed', 'skipped']);
    expect(records[0].file).toBe('specs/tests/css/components/radios.test.js');
  });

  it('reads browser results, nested groups included', () => {
    const [record] = readBrowser(browserData);
    expect(record).toMatchObject({ kind: 'Browser', status: 'passed', group: 'Checkboxes spacing', title: 'line is spaced' });
  });

  it('totals the tests and works out which components have tests naming them', () => {
    const records = [...readUnit(unitData), ...readBrowser(browserData)];
    const report = build(records);
    expect(report.overall).toMatchObject({ total: 4, passed: 2, failed: 1, skipped: 1 });
    expect(report.unit.total).toBe(3);
    expect(report.browser.total).toBe(1);
    const radios = report.components.find((c) => c.name === 'radios');
    expect(radios.unit).toBe(3);
    expect(report.components.find((c) => c.name === 'checkboxes').browser).toBe(1);
  });

  it('matches multi-word component names written with a space or hyphen', () => {
    const record = { file: 'x.test.js', group: 'the date input works', title: 'fine' };
    expect(mentions(record, 'date-input')).toBe(true);
    expect(mentions(record, 'tabs')).toBe(false);
  });

  it('never rounds a run with a failure up to 100%', () => {
    expect(percent(3941, 3942)).toBe('99.9%');
    expect(percent(4, 4)).toBe('100%');
    expect(percent(0, 0)).toBe('0%');
  });

  it('fails the run when a runner fails without any failed test', () => {
    const ok = { vitest: 0, 'preview build': 0, playwright: 0 };
    const green = { success: true, numFailedTestSuites: 0 };
    expect(runProblems(ok, green, { errors: [] })).toEqual([]);
    expect(runProblems({ ...ok, playwright: 1 }, green, { errors: [] })).toEqual(['playwright exited with 1']);
    expect(runProblems(ok, green, { errors: [{ message: 'Cannot find module' }] })).toHaveLength(1);
    expect(runProblems(ok, { success: false, numFailedTestSuites: 1 }, { errors: [] })).toHaveLength(1);
    expect(runProblems(ok, green, null)).toEqual(['no browser test results were written']);
  });

  it('has npm scripts to run it and to rebuild the report from the last run', () => {
    expect(pkg.scripts['report:tests']).toContain('generate-test-report.js');
    expect(pkg.scripts['report:tests:reuse']).toContain('--reuse');
  });

  it('keeps the generated reports out of git', () => {
    expect(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8')).toMatch(/^test-reports\/\r?$/m);
  });
});
