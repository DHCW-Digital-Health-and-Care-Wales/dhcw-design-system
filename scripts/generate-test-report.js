'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'test-reports');
const unitJson = path.join(outDir, 'unit-results.json');
const browserJson = path.join(outDir, 'browser-results.json');
const reuse = process.argv.includes('--reuse');

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  return result.status;
}

function runTests() {
  fs.mkdirSync(outDir, { recursive: true });
  return {
    vitest: run('npx', ['vitest', 'run', '--reporter=json', '--outputFile=test-reports/unit-results.json']),
    'preview build': run('node', ['scripts/build-preview-site.js']),
    playwright: run('npx', ['playwright', 'test', '--reporter=json'], { PLAYWRIGHT_JSON_OUTPUT_NAME: 'test-reports/browser-results.json' }),
  };
}

// A suite can fail without a single failed test: a test file that cannot be
// loaded, a beforeAll that throws (its tests are reported as skipped), or a
// Playwright spec file whose error stops every browser test from running.
// Those only show in the runner's own exit code or its suite-level result, so
// the report must fail on them as well as on failed tests.
function runProblems(statuses, unitData, browserData) {
  const problems = [];
  for (const [name, status] of Object.entries(statuses)) {
    if (status !== 0) problems.push(`${name} exited with ${status}`);
  }
  if (!unitData) problems.push('no unit test results were written');
  else if (unitData.success === false) problems.push(`vitest reported ${unitData.numFailedTestSuites || 0} failed test file(s)`);
  if (!browserData) problems.push('no browser test results were written');
  else if ((browserData.errors || []).length) problems.push(`playwright reported ${browserData.errors.length} error(s) outside any test`);
  return problems;
}

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function readUnit(data) {
  const records = [];
  if (!data) return records;
  for (const suite of data.testResults || []) {
    const file = relative(suite.name);
    for (const t of suite.assertionResults || []) {
      records.push({
        kind: 'Unit',
        file,
        group: (t.ancestorTitles || []).join(' > '),
        title: t.title,
        status: t.status === 'passed' ? 'passed' : t.status === 'failed' ? 'failed' : 'skipped',
        message: (t.failureMessages || []).join('\n'),
      });
    }
  }
  return records;
}

function readBrowser(data) {
  const records = [];
  if (!data) return records;
  function walk(suite, titles) {
    const here = suite.title && !/\.spec\.js$/.test(suite.title) ? [...titles, suite.title] : titles;
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const status = t.status === 'expected' ? 'passed' : t.status === 'flaky' ? 'flaky' : t.status === 'skipped' ? 'skipped' : 'failed';
        const last = (t.results || [])[(t.results || []).length - 1];
        records.push({
          kind: 'Browser',
          file: relative(path.join(root, 'specs', 'e2e', path.basename(spec.file))),
          group: here.join(' > '),
          title: spec.title,
          status,
          message: last && last.error ? last.error.message || '' : '',
        });
      }
    }
    for (const child of suite.suites || []) walk(child, here);
  }
  for (const suite of data.suites || []) walk(suite, []);
  return records;
}

function componentNames() {
  const dir = path.join(root, 'preview', 'components');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, '')).sort();
}

function mentions(record, name) {
  const spaced = name.replace(/-/g, '[ -]');
  const pattern = new RegExp(`(^|[^a-z0-9])${spaced}s?([^a-z0-9]|$)`, 'i');
  const fileBase = path.basename(record.file).replace(/\.(test|spec)\.js$/, '');
  return fileBase === name || pattern.test(`${record.group} ${record.title}`) || pattern.test(fileBase);
}

function areaOf(record) {
  const parts = record.file.split('/');
  if (record.kind === 'Browser') return 'Browser checks';
  const sub = parts[2];
  const names = { css: 'Styles (CSS)', markup: 'Page markup and accessibility', njk: 'Nunjucks templates', js: 'Behaviour (JavaScript)', scripts: 'Build scripts', assets: 'Logo and image assets' };
  return names[sub] || 'Other';
}

function counts(records) {
  const c = { total: records.length, passed: 0, failed: 0, skipped: 0, flaky: 0 };
  for (const r of records) c[r.status] += 1;
  return c;
}

function percent(part, whole) {
  if (whole === 0) return '0%';
  const value = Math.floor((part / whole) * 1000) / 10;
  return `${value}%`;
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sentence(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function build(records) {
  const overall = counts(records);
  const unit = counts(records.filter((r) => r.kind === 'Unit'));
  const browser = counts(records.filter((r) => r.kind === 'Browser'));
  const files = [...new Set(records.map((r) => r.file))].sort();

  const areas = {};
  for (const r of records) (areas[areaOf(r)] = areas[areaOf(r)] || []).push(r);

  const components = componentNames().map((name) => {
    const matching = records.filter((r) => mentions(r, name));
    return { name, ...counts(matching), unit: matching.filter((r) => r.kind === 'Unit').length, browser: matching.filter((r) => r.kind === 'Browser').length };
  });
  const uncovered = components.filter((c) => c.total === 0);

  return { overall, unit, browser, files, areas, components, uncovered };
}

function markdown(records, report, generated) {
  const { overall, unit, browser, areas, components, uncovered } = report;
  const failed = records.filter((r) => r.status === 'failed');
  const lines = [];
  lines.push('# Test results report', '', `Generated ${generated}`, '');
  lines.push(`**${overall.passed} of ${overall.total} tests passed (${percent(overall.passed, overall.total)}).** ${overall.failed} failed, ${overall.flaky} flaky, ${overall.skipped} skipped.`, '');
  lines.push('| Type | Tests | Passed | Failed | Skipped |', '|---|---|---|---|---|');
  lines.push(`| Unit (styles, markup, templates, scripts) | ${unit.total} | ${unit.passed} | ${unit.failed} | ${unit.skipped} |`);
  lines.push(`| Browser (real Chromium) | ${browser.total} | ${browser.passed} | ${browser.failed} | ${browser.skipped} |`, '');
  if (failed.length) {
    lines.push('## Failing tests', '');
    for (const r of failed) lines.push(`- ${sentence(r.title)} (${r.file})`);
    lines.push('');
  }
  lines.push('## What is tested', '', '| Area | Tests | Passed |', '|---|---|---|');
  for (const [name, list] of Object.entries(areas)) lines.push(`| ${name} | ${list.length} | ${list.filter((r) => r.status === 'passed').length} |`);
  lines.push('', '## Component coverage', '', 'Counts tests that name the component in their file, group or description.', '', '| Component | Unit | Browser | Passed | Failed |', '|---|---|---|---|---|');
  for (const c of components) lines.push(`| ${c.name} | ${c.unit} | ${c.browser} | ${c.passed} | ${c.failed} |`);
  lines.push('', uncovered.length ? `Components with no tests that name them: ${uncovered.map((c) => c.name).join(', ')}.` : 'Every component page has at least one test that names it.', '');
  return lines.join('\n');
}

function html(records, report, generated) {
  const { overall, unit, browser, areas, components, uncovered } = report;
  const failed = records.filter((r) => r.status === 'failed');
  const statusLabel = { passed: 'Passed', failed: 'Failed', skipped: 'Skipped', flaky: 'Passed on retry' };
  const card = (label, value, tone) => `<div class="card ${tone || ''}"><div class="value">${value}</div><div class="label">${label}</div></div>`;

  const byFile = {};
  for (const r of records) (byFile[r.file] = byFile[r.file] || []).push(r);

  const fileSections = Object.entries(byFile).sort(([a], [b]) => a.localeCompare(b)).map(([file, list]) => {
    const c = counts(list);
    const rows = list.map((r) => `<tr class="${r.status}"><td>${statusLabel[r.status]}</td><td>${escapeHtml(r.group)}</td><td>${escapeHtml(sentence(r.title))}</td></tr>`).join('');
    return `<details${c.failed ? ' open' : ''}><summary>${escapeHtml(file)} <span class="muted">${c.passed} of ${c.total} passed</span></summary><table><thead><tr><th>Result</th><th>Group</th><th>What is checked</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  }).join('\n');

  const areaRows = Object.entries(areas).map(([name, list]) => `<tr><td>${escapeHtml(name)}</td><td>${list.length}</td><td>${list.filter((r) => r.status === 'passed').length}</td><td>${list.filter((r) => r.status === 'failed').length}</td></tr>`).join('');
  const componentRows = components.map((c) => `<tr class="${c.total === 0 ? 'failed' : ''}"><td>${escapeHtml(c.name)}</td><td>${c.unit}</td><td>${c.browser}</td><td>${c.passed}</td><td>${c.failed}</td></tr>`).join('');
  const failureBlock = failed.length
    ? `<section><h2>Failing tests</h2><ul>${failed.map((r) => `<li><strong>${escapeHtml(sentence(r.title))}</strong><br><span class="muted">${escapeHtml(r.file)}</span>${r.message ? `<pre>${escapeHtml(r.message.replace(/\u001b\[[0-9;]*m/g, '').slice(0, 800))}</pre>` : ''}</li>`).join('')}</ul></section>`
    : '<section><h2>Failing tests</h2><p>None. Every test passed.</p></section>';

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test results report</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#212b32;margin:0;padding:24px;max-width:1100px;margin-inline:auto;line-height:1.5}
h1{margin-top:0}
.cards{display:flex;flex-wrap:wrap;gap:16px;margin:24px 0}
.card{border:1px solid #d8dde0;padding:16px;min-width:140px;background:#fff}
.card .value{font-size:32px;font-weight:700}
.card.good .value{color:#007f3b}.card.bad .value{color:#d5281b}
.muted{color:#4c6272;font-weight:400}
table{border-collapse:collapse;width:100%;margin:8px 0 24px}
th,td{border:1px solid #d8dde0;padding:6px 10px;text-align:left;vertical-align:top}
th{background:#f0f4f5}
tr.failed td{background:#fdecea}
tr.flaky td{background:#fff8e1}
details{border:1px solid #d8dde0;margin:8px 0;padding:8px 12px}
summary{cursor:pointer;font-weight:700}
pre{background:#f0f4f5;padding:8px;overflow:auto;white-space:pre-wrap}
</style>
</head>
<body>
<h1>Test results report</h1>
<p class="muted">Generated ${escapeHtml(generated)}</p>
<p><strong>${overall.passed} of ${overall.total} tests passed (${percent(overall.passed, overall.total)}).</strong></p>
<div class="cards">
${card('Tests run', overall.total)}
${card('Passed', overall.passed, 'good')}
${card('Failed', overall.failed, overall.failed ? 'bad' : '')}
${card('Skipped', overall.skipped)}
${card('Unit tests', unit.total)}
${card('Browser tests', browser.total)}
${card('Test files', report.files.length)}
${card('Components with tests', `${components.length - uncovered.length} of ${components.length}`)}
</div>
${failureBlock}
<section><h2>What is tested</h2>
<table><thead><tr><th>Area</th><th>Tests</th><th>Passed</th><th>Failed</th></tr></thead><tbody>${areaRows}</tbody></table></section>
<section><h2>Component coverage</h2>
<p class="muted">Counts the tests that name the component in their file, group or description. Rows in red have no test naming that component.</p>
<table><thead><tr><th>Component</th><th>Unit</th><th>Browser</th><th>Passed</th><th>Failed</th></tr></thead><tbody>${componentRows}</tbody></table></section>
<section><h2>Every test</h2>
${fileSections}
</section>
</body>
</html>
`;
}

function main() {
  const statuses = reuse ? {} : runTests();
  const unitData = readJson(unitJson);
  const browserData = readJson(browserJson);
  const problems = runProblems(statuses, unitData, browserData);
  const records = [...readUnit(unitData), ...readBrowser(browserData)];
  if (records.length === 0) {
    console.error('No test results found. Run without --reuse to run the tests first.');
    process.exit(1);
  }
  const report = build(records);
  const generated = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'test-report.html'), html(records, report, generated));
  const problemBlock = problems.length ? `## The test run itself failed\n\n${problems.map((p) => `- ${p}`).join('\n')}\n\n` : '';
  fs.writeFileSync(path.join(outDir, 'test-report.md'), problemBlock + markdown(records, report, generated));
  console.log(`\nTest report written to ${relative(path.join(outDir, 'test-report.html'))} (${report.overall.passed} of ${report.overall.total} passed).`);
  for (const p of problems) console.error(`Test run failed: ${p}`);
  process.exitCode = report.overall.failed || problems.length ? 1 : 0;
}

if (require.main === module) main();

module.exports = { readUnit, readBrowser, build, mentions, percent, runProblems };
