# NHSW Component Library

[![CI](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Sass and Nunjucks component library for building consistent, accessible web
applications across Digital Health and Care Wales (DHCW). It provides a
single compiled stylesheet (`nhsw.css`) plus a matching set of Nunjucks
macros, so applications get the same look, markup and accessibility
behaviour without re-implementing it each time — in the spirit of
[GOV.UK Frontend](https://github.com/alphagov/govuk-frontend) and
[NHS.UK Frontend](https://github.com/nhsuk/nhsuk-frontend).

- **40 components** — actions, forms, navigation, content, cards and
  layout — see [`src/components/`](src/components/) for the full list, or
  browse them with live examples on the docs site below.
- **Accessible by default** — components are built and tested against
  WCAG 2.2 AA (colour contrast, focus visibility, keyboard behaviour).
- **Styles and markup, decoupled** — use the Sass alone against your own
  markup, use the Nunjucks macros alone against your own CSS, or use both
  together.

## Installation

Every merge to `main` creates a new release. Check the
[latest release](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/releases/latest)
for the current version number and use it in place of `vX.Y.Z` below.

### Requirements

- [Node.js](https://nodejs.org/) 22 or later (what CI and releases use)
- [Dart Sass](https://sass-lang.com/dart-sass/) 1.93 or later, only if you
  compile the Sass yourself
- [Nunjucks](https://mozilla.github.io/nunjucks/) 3.2 or later, only if you
  use the macros

### Option 1: install with npm from GitHub (recommended)

Pin a release tag so your service only changes when you choose to upgrade:

```bash
npm install github:DHCW-Digital-Health-and-Care-Wales/dhcw-design-system#vX.Y.Z
```

This adds `dhcw-design-system` to your `dependencies` and installs the Sass
source, the compiled CSS and the JavaScript into
`node_modules/dhcw-design-system/`. To upgrade, run the same command with the
newer tag.

If a version has also been published to the npm registry, you can install it
by name instead:

```bash
npm install dhcw-design-system@X.Y.Z
```

### Option 2: download the release files

If your project doesn't use npm, download these files from the
[latest release](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/releases/latest):

| File | What it is |
|---|---|
| `nhsw.min.css` | Compiled styles for production (`nhsw.css` and `nhsw.css.map` for development) |
| `nhsw-behaviours.min.js` | Behaviours for interactive components (`nhsw-behaviours.js` for development) |
| `nhsw-date-picker.min.js` | Date picker, only if you use it (`nhsw-date-picker.js` for development) |
| `nhsw-nunjucks-components.zip` | A drop-in `components/` folder of Nunjucks macros |

## Quick start

### 1. Add the styles

**Without a Sass toolchain**, link the compiled stylesheet. From an npm
install, serve `node_modules/dhcw-design-system/dist/nhsw.min.css` (or
`nhsw.css` while developing); from a download, serve `nhsw.min.css`.
Releases up to v0.1.69 contain an out-of-date `dist/nhsw.css`, so with those,
use the release download or compile from source instead.

```html
<link rel="stylesheet" href="/assets/nhsw.min.css">
```

**With Dart Sass**, compile from source so you can use the design tokens in
your own styles. Add `node_modules` to Sass's load paths:

```scss
// your-app.scss
@use "dhcw-design-system/src" as nhsw;

.my-panel {
  color: nhsw.$nhswales-primary-text-colour;
}
```

```bash
npx sass --load-path=node_modules your-app.scss public/app.css
```

### 2. Add the scripts

Some components need JavaScript to be interactive — character counts,
conditionally revealed content, tabs, the expander, file upload status, error
summary focus, double-click prevention and the session-timeout countdown.
Include the behaviours script once, after your page content:

```html
<script src="/assets/nhsw-behaviours.min.js"></script>
```

It's a self-contained script with no dependencies — it wires itself up
against whatever matching markup is already on the page. The date picker
ships separately as `nhsw-date-picker.js` / `.min.js` for the same reason
(not every app that uses this library needs a date picker). From an npm
install, both are in `node_modules/dhcw-design-system/dist/`.

### 3. Use the Nunjucks macros

Every component has a matching macro under `src/components/<name>/macro.njk`,
with its parameters documented in `src/components/<name>/<name>.yaml`. Install
Nunjucks, then point a loader at the components folder:

```bash
npm install nunjucks
```

```js
const nunjucks = require("nunjucks");

const env = nunjucks.configure(
  ["views", "node_modules/dhcw-design-system/src/components"],
  { autoescape: true }
);
```

```njk
{% from "button/macro.njk" import nhswButton %}
{{ nhswButton({ text: "Continue", classes: "nhsw-button--primary" }) }}
```

If you downloaded the release files instead, unzip
`nhsw-nunjucks-components.zip` into your project and point the loader at the
`components` folder inside it. See
[`src/components/README.md`](src/components/README.md) for macro conventions
and a worked example.

### 4. Check your page shell

Each page needs a skip link, the site header, `<main class="nhsw-main-wrapper"
id="maincontent">` with a width container inside, and the site footer. The
[page templates](https://dhcw-digital-health-and-care-wales.github.io/dhcw-design-system/patterns/page-templates.html)
show complete public-facing and staff dashboard examples.

### Using AI coding agents

[`.agent/design-system-rules.md`](.agent/design-system-rules.md) and
[`.agent/component-registry.md`](.agent/component-registry.md) give coding
agents the design system's tokens, spacing, classes and usage rules. They
aren't part of the installed package, so take them from the release tag you
installed (for example
`https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system/tree/vX.Y.Z/.agent`)
to keep your agents' rules matched to your version.

## Documentation site

Every component, pattern and design token is documented with live,
interactive examples on the docs site, built with Jekyll from
[`preview/`](preview/). To run it locally you'll need Ruby 3+ and Bundler:

```bash
bundle install
npm run build:css   # regenerates preview/dist/nhsw.css — Jekyll treats it as a static asset
npm run build:js    # regenerates preview/dist/nhsw-behaviours.js and nhsw-date-picker.js
bundle exec jekyll serve
```

Every push to `main` also builds and deploys this site to GitHub Pages
automatically ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)).
That workflow needs the repo's **Settings → Pages → Build and deployment →
Source** set to "GitHub Actions" (a one-time, manual setting — not something
a workflow file can change).

## Development

```bash
npm install
npm run build:css   # compile src/index.scss once, expanded + minified
npm run watch:css   # rebuild on every change
npm test             # Vitest: component styling, accessibility and token checks
npm run test:e2e     # Playwright: renders preview/ and exercises it in a real browser
npm run render:njk   # renders every component's yaml examples through its macro, for visual review
```

`npm run build:preview` and `npm run test:e2e` render the docs site through a
small Liquid renderer (`scripts/build-preview-site.js`) rather than real
Jekyll, so the full test suite runs without a Ruby install — including in
CI. It covers the same Liquid feature set the site actually uses; it's a
test fixture, not a substitute for the real Jekyll build above.

### Project layout

```
src/
├─ tokens/        design tokens — colour, spacing, type
├─ utilities/      shared mixins (focus states, hidden-control pattern, ...)
├─ foundations/     shared styling recipes used by several components
├─ layouts/        page-shell partials (header, footer, width containers)
└─ components/     one folder per component: _*.scss + macro.njk + *.yaml

preview/    Jekyll docs/preview site — every component's live examples,
            plus manual QA checklists under preview/testing/
specs/      Vitest specs (CSS + accessibility) and Playwright e2e specs
scripts/    build/render/package tooling used by npm scripts and CI
```

## Testing and quality gates

- **Vitest** (`specs/tests/`) compiles each component's SCSS in isolation
  and asserts on the output — colours, focus states, spacing, WCAG contrast
  ratios, and shared-mixin usage.
- **Playwright** (`specs/e2e/`) renders the full docs site and drives real
  browser behaviour — tab order, focus trapping, keyboard interaction.
- Manual accessibility scenarios that can't be automated (screen reader
  behaviour, visual QA) are tracked as checklists under `preview/testing/`.
- Both suites run in CI on every push and pull request to `main`
  ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) and must pass
  before a release is cut.

## Releasing

Every merge to `main` that passes CI is automatically tagged and released
with a patch version bump. For a deliberate minor or major release, run the
[Release workflow](.github/workflows/release.yml) manually from the Actions
tab and choose the bump level.

## Contributing

Issues and pull requests are welcome. Before adding or changing a component:

- Reuse existing tokens and utilities rather than one-off values. See
  [`.agent/design-system-rules.md`](.agent/design-system-rules.md) for
  colour, typography, spacing and usage rules, and keep it in step with any
  token or guidance change.
- Add or extend automated tests for any styling or behavioural change.
- Run `npm test` and `npm run test:e2e` before opening a PR.

## Licence

- **Code** (Sass, JavaScript, Nunjucks macros and build scripts) is available under the [MIT licence](LICENSE).
- **Documentation and written content**, such as the text of the guidance pages and examples, is available under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), unless otherwise stated. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Logos, crests and other branding** (including the Digital Health and Care Wales and NHS Wales logos in `preview/assets`) are not covered by either licence. You must not use them without permission from the owner.

© Digital Health and Care Wales
