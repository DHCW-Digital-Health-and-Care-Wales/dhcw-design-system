'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Liquid } = require('liquidjs');

const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'preview');
const OUT = path.join(PREVIEW, '_site_test');
const INCLUDES_DIR = path.join(PREVIEW, '_includes');
const LAYOUTS_DIR = path.join(PREVIEW, '_layouts');
const DATA_DIR = path.join(PREVIEW, '_data');

const SKIP_DIR_NAMES = new Set(['_includes', '_layouts', '_data', '_site_test', 'dist', 'node_modules']);
const STATIC_DIR_NAMES = ['dist', 'assets'];

function loadSiteData() {
  const data = {};
  if (!fs.existsSync(DATA_DIR)) return data;
  for (const file of fs.readdirSync(DATA_DIR)) {
    if (!/\.ya?ml$/.test(file)) continue;
    const key = file.replace(/\.ya?ml$/, '');
    data[key] = yaml.load(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  }
  return data;
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw };
  const data = yaml.load(match[1]) || {};
  return { data, content: raw.slice(match[0].length) };
}

function findPageFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      findPageFiles(path.join(dir, entry.name), results);
    } else if (entry.name.endsWith('.html')) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

function urlFor(absFilePath) {
  const rel = path.relative(PREVIEW, absFilePath).split(path.sep).join('/');
  return '/' + rel;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function buildEngine(siteData) {
  const engine = new Liquid();

  engine.registerFilter('relative_url', (v) => v);

  engine.registerTag('include', {
    parse(tagToken) {
      const raw = tagToken.args.trim();
      const spaceIdx = raw.search(/\s/);
      this.filename = spaceIdx === -1 ? raw : raw.slice(0, spaceIdx);
      this.paramsStr = spaceIdx === -1 ? '' : raw.slice(spaceIdx + 1);
    },
    *render(ctx) {
      const params = {};
      const paramRe = /([a-zA-Z_][a-zA-Z0-9_]*)=("(?:[^"\\]|\\.)*"|\S+)/g;
      let m;
      while ((m = paramRe.exec(this.paramsStr))) {
        const key = m[1];
        const tok = m[2];
        let value;
        if (tok.startsWith('"')) {
          value = tok.slice(1, -1);
        } else if (tok === 'true') {
          value = true;
        } else if (tok === 'false') {
          value = false;
        } else {
          value = yield ctx.get(tok.split('.'));
        }
        params[key] = value;
      }
      const includePath = path.join(INCLUDES_DIR, this.filename);
      const src = fs.readFileSync(includePath, 'utf8');
      ctx.push({ include: params });
      const html = yield this.liquid.parseAndRender(src, ctx.getAll());
      ctx.pop();
      return html;
    },
  });

  return engine;
}

async function renderPage(engine, siteData, absFilePath) {
  const raw = fs.readFileSync(absFilePath, 'utf8');
  const { data: pageData, content } = parseFrontMatter(raw);
  pageData.url = urlFor(absFilePath);

  const baseScope = { page: pageData, site: { data: siteData } };

  let rendered = await engine.parseAndRender(content, baseScope);
  let layoutName = pageData.layout;
  const seen = new Set();

  while (layoutName) {
    if (seen.has(layoutName)) throw new Error(`Layout cycle detected at "${layoutName}" for ${absFilePath}`);
    seen.add(layoutName);

    const layoutPath = path.join(LAYOUTS_DIR, `${layoutName}.html`);
    const layoutRaw = fs.readFileSync(layoutPath, 'utf8');
    const { data: layoutData, content: layoutContent } = parseFrontMatter(layoutRaw);

    rendered = await engine.parseAndRender(layoutContent, { ...baseScope, content: rendered });
    layoutName = layoutData.layout;
  }

  return rendered;
}

async function build() {
  require('./build-search-index').writeIndex();
  const siteData = loadSiteData();
  const engine = buildEngine(siteData);

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const pages = findPageFiles(PREVIEW);
  let count = 0;
  const errors = [];

  for (const absFilePath of pages) {
    const rel = path.relative(PREVIEW, absFilePath);
    try {
      const html = await renderPage(engine, siteData, absFilePath);
      const outPath = path.join(OUT, rel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf8');
      count += 1;
    } catch (e) {
      errors.push(`${rel}: ${e.message}`);
    }
  }

  for (const dirName of STATIC_DIR_NAMES) {
    const src = path.join(PREVIEW, dirName);
    if (fs.existsSync(src)) copyDir(src, path.join(OUT, dirName));
  }

  if (errors.length) {
    console.error(`Rendered ${count} pages, ${errors.length} failed:`);
    for (const e of errors) console.error('  ' + e);
    process.exitCode = 1;
  } else {
    console.log(`Rendered ${count} pages to ${path.relative(ROOT, OUT)}`);
  }
}

if (require.main === module) {
  build();
}

module.exports = { build, OUT };
