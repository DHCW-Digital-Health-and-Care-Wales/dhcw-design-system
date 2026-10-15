# NHSW Nunjucks components

A Nunjucks macro for every NHSW component, in the style of the GOV.UK/NHS.UK
frontend libraries: one macro per component, fully configurable via a single
`params` object, built on top of the existing `nhsw-*` Sass classes in
`../` (never inventing new ones).

## Using a component

```njk
{% from "input/macro.njk" import nhswInput %}

{{ nhswInput({
  id: "full-name",
  label: { text: "What is your full name?" },
  hint: { text: "As it appears on your passport" },
  maxlength: 100
}) }}
```

Or pull every macro in at once:

```njk
{% import "all-components.njk" as nhsw %}

{{ nhsw.nhswButton({ text: "Continue", classes: "nhsw-button--primary" }) }}
```

Import paths are resolved relative to this directory (`src/components`), which
is the Nunjucks loader root configured in `../nunjucks.config.js` — so
`"button/macro.njk"`, not `"./button/macro.njk"` or `"components/button/macro.njk"`.

## Layout

Each component is a flat directory:

```
src/components/<name>/
  macro.njk    - {% macro nhswXxx(params) %}...{% endmacro %}
  <name>.yaml  - param docs + example fixtures
```

`label/`, `hint/`, `error-message/` and `fieldset/` are shared building
blocks used internally by every form field macro (input, textarea, select,
checkboxes, radios, date-input, date-picker, file-upload) — import and reuse
them rather than duplicating their markup.

## Conventions

- `text` / `html` pairs: `html` always wins when both are set, and is passed
  through `| safe` since Nunjucks autoescaping is on.
- `classes` (string) adds extra classes to the component's root element;
  `attributes` (object) adds extra HTML attributes.
- Form fields wire up `nhsw-form-group`/`nhsw-form-group--error`,
  `aria-describedby` (hint id then error id), `aria-invalid="true"`, and
  `nhsw-is-invalid` (inputs/selects/textareas only, not checkboxes/radios)
  automatically from `hint`/`errorMessage` params.
- `nhswInput` and `nhswTextarea` accept a `maxlength` param that adds the
  `maxlength` attribute and — unless `characterCount: false` — wires up the
  existing `data-max-length`/`data-max-length-target` character-count JS hook
  with a generated "You have N characters remaining" hint.

## JavaScript

These macros only render markup — some of it is inert without JS. Character
count, conditionally revealed content (checkboxes/radios), tabs, the
expander, file upload status, and the session-timeout countdown all need
`dist/nhsw-behaviours.js` (or `.min.js`) included on the page; the date
picker needs `dist/nhsw-date-picker.js` separately. Both are plain,
dependency-free scripts — see the main project README's "Scripts" section
for details:
https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-design-system#scripts

## Verifying changes

```
npm run render:njk   # renders every yaml example through its macro, writes
                      # output to njk-preview/<name>/<example>.html, and
                      # fails if any example throws
npm test              # includes specs/tests/njk/components.test.js, which
                      # renders every example via vitest and checks the
                      # all-components.njk index re-exports every macro
```
