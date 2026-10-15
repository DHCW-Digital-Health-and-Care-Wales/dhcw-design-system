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

- **38 components** — actions, forms, navigation, content, cards and
  layout — see [`src/components/`](src/components/) for the full list, or
  browse them with live examples on the docs site below.
- **Accessible by default** — components are built and tested against
  WCAG 2.2 AA (colour contrast, focus visibility, keyboard behaviour).
- **Styles and markup, decoupled** — use the Sass alone against your own
  markup, use the Nunjucks macros alone against your own CSS, or use both
  together.

## Quick start

### Styles

This isn't published to a package registry, so pick whichever fits your app:

- **No Sass toolchain needed** — copy the compiled CSS straight into your
  project: `preview/dist/nhsw.css` for local development (readable, with a
  source map), or `preview/dist/nhsw.min.css` for production. Both are built
  by `npm run build:css` and attached to every
  [release](.github/workflows/release.yml).
- **Building with Dart Sass** — vendor or clone this repo alongside your
  app and `@use` its `src/` directly:

  ```scss
  // your-app.scss
  @use "../path/to/dhcw-design-system/src" as nhsw;
  ```

### Scripts

Some components need JavaScript to be interactive — character counts,
conditionally revealed content, tabs, the expander, file upload status, and
the session-timeout countdown. That behaviour ships as a plain script, `dist/nhsw-behaviours.js` for local
development or `dist/nhsw-behaviours.min.js` for production, attached to
every [release](.github/workflows/release.yml) alongside the CSS. Include it
once, after your page content:

```html
<script src="/path/to/nhsw-behaviours.min.js"></script>
```

It's a self-contained IIFE with no dependencies — it wires itself up against
whatever matching markup is already on the page. The date picker ships
separately as `dist/nhsw-date-picker.js` / `.min.js` for the same reason
(not every app that uses this library needs a date picker).

### Markup (Nunjucks macros)

Every component has a matching macro under `src/components/<name>/macro.njk`.
Point your own `FileSystemLoader` at `src/components`, or grab a
self-contained copy via `npm run package:njk`, which produces
`dist/nhsw-nunjucks-components.zip` — a drop-in `components/` directory with
no dependency on the rest of this repo. See
[`src/components/README.md`](src/components/README.md) for the loader setup,
macro conventions, and a worked example.

```njk
{% from "button/macro.njk" import nhswButton %}
{{ nhswButton({ text: "Continue", classes: "nhsw-button--primary" }) }}
```

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

- Reuse existing tokens and utilities rather than one-off values — see
  [`.agent/design-system-rules.md`](.agent/design-system-rules.md) for
  spacing, breakpoint and colour rules.
- Add or extend automated tests for any styling or behavioural change.
- Run `npm test` and `npm run test:e2e` before opening a PR.

## Licence

- **Code** (Sass, JavaScript, Nunjucks macros and build scripts) is available under the [MIT licence](LICENSE).
- **Documentation and written content**, such as the text of the guidance pages and examples, is available under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), unless otherwise stated. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Logos, crests and other branding** (including the Digital Health and Care Wales and NHS Wales logos in `preview/assets`) are not covered by either licence. You must not use them without permission from the owner.

© Digital Health and Care Wales
