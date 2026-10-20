# DHCW design system rules

Rules for any agent (or person) building interfaces with the Digital Health and Care Wales (DHCW) design system, whether that's a page in this repository's docs site or a service that uses the package.

Where these rules come from:

- **Values** (tokens, spacing, breakpoints, class names) are taken from the code in `src/`. If this file and the code disagree, the code is right and this file needs fixing.
- **Usage guidance** (when to use what, content and accessibility rules) is taken from the published guidance on the [docs site](https://dhcw-digital-health-and-care-wales.github.io/dhcw-design-system/).
- **Class and modifier lists** live in [`component-registry.md`](component-registry.md); macro params live in each `src/components/<name>/<name>.yaml`.

## Design principles

Use these to justify design decisions:

- Start with user needs
- Design with data
- Understand context (health and care, clinical and public users)
- Design services in Welsh and English
- Make it simple and inclusive
- Design for trust and safety (digital services can cause patient harm)
- Deliver with transparency and consistency
- Iterate, learn and improve
- Minimise environmental impact

## Branding

Please note that our organisation is called Digital Health and Care Wales, so branding should reflect this. Do not use NHS branding or logos. When putting the logo in, use `preview/assets/nhsw-logo.svg` (or `nhsw-logo-dark.svg` on a light header). Logos are not covered by the code or content licences.

## Colour

Use tokens from `src/tokens/_colours.scss`. Never hard-code a hex value or invent a colour.

Core tokens (named as on the docs site's Colours page):

| Use | Token | Value |
|---|---|---|
| Text | `$nhswales-primary-text-colour` | #212b32 |
| Secondary text | `$nhswales-secondary-text-colour` | #4c6272 |
| Blue text | `$nhswales-blue-text-colour` | #1b365d |
| Text on blue interrupt pages | `$nhswales-exceptional-text-colour` | #ffffff |
| Link | `$nhswales-link-colour` | #005aa8 |
| Link hover / visited / active | `$nhswales-link-hover-colour` / `$nhswales-link-visited-colour` / `$nhswales-link-active-colour` | #7c2855 / #330072 / #002f5c |
| Focus / focus text | `$nhswales-focus-colour` / `$nhswales-focus-text-colour` | #ffeb3b / #212b32 |
| Primary button | `$nhswales-primary-button` | #1b365d |
| Primary button on interrupt pages | `$nhswales-primary-button-interrupt` | #364a73 |
| Secondary button | `$nhswales-secondary-button` | #4c6272 |
| Delete button | `$nhswales-delete-button` | #d5281b |
| Exceptional button (blue pages only) | `$nhswales-exceptional-button-light` | #f5bb6b |
| Page backgrounds | `$nhswales-page-background-grey` / `$nhswales-page-background-white` / `$nhswales-page-background-blue` | #f0f4f5 / #ffffff / #1b365d |
| Borders | `$nhswales-primary-border-colour` / `$nhswales-secondary-border-colour` / `$nhswales-grey-border-colour` / `$nhswales-gold-border-colour` | #212b32 / #4c6272 / #d8dde0 / #aa8630 |
| Button shadows | `$nhswales-primary-button-shadow` / `$nhswales-exceptional-button-shadow` | #0e1b2f / #554318 |

Interaction states (hover, active) and component-specific colours keep the `$nhsw-colour-*` prefix, for example `$nhsw-colour-button-primary-hover`, `$nhsw-colour-site-header-background` and `$nhsw-colour-warning-callout-background`. Use them only inside the component they belong to.

Usage:

- Page templates use the grey background. Use white to separate or highlight sections.
- Use the blue background only on interrupt pages that tell users they are leaving the NHS Wales App for a third-party service, and always pair it with the exceptional text colour and the exceptional button.
- Text and interactive elements need at least 4.5:1 contrast with their background (WCAG 1.4.3).
- Input borders, focus indicators and button containers need at least 3:1 against adjacent colours (WCAG 1.4.11).
- Never use colour alone to communicate information, status or actions (WCAG 1.4.1).

## Typography

- Font: `Roboto, Arial, sans-serif` (`$nhsw-font-family-base`).
- Use heading classes `nhsw-h1` to `nhsw-h5`, body classes `nhsw-body`, `nhsw-body-s`, and `nhsw-lede-text` for introductions.
- One `<h1>` per page. Follow heading levels in order and don't skip levels.
- Choose the heading *level* by page structure, not by size. Where structure and size differ, the class can differ from the element (for example `<h2 class="nhsw-h3">`).
- Keep headings concise and descriptive.
- Text must resize to 200% without loss (WCAG 1.4.4) and reflow without horizontal scrolling (WCAG 1.4.10).

| Style | Desktop and tablet | Mobile |
|---|---|---|
| Heading XL (h1) | 48px / 54px bold | 32px / 38px |
| Heading L (h2) | 36px / 42px bold | 27px / 33px |
| Heading M (h3) | 26px / 32px bold | 22px / 29px |
| Heading S (h4) | 22px / 33px bold | 19px / 27px |
| Heading XS (h5) | 19px / 28px bold | 16px / 24px |
| Body | 19px / 28px | 16px / 24px |
| Body S | 16px / 24px | |
| Body XS (metadata, timestamps) | 14px / 20px | |

## Layout

### Breakpoints

Use the breakpoint mixins in `src/utilities/_breakpoints.scss` rather than writing media queries.

- Mobile: below 40.0625em (641px)
- Tablet: 40.0625em (641px)
- Desktop: 48.0625em (769px)
- Large desktop: 61.875em (990px)

### Page structure

From `src/tokens/_spacing.scss`:

- Max page width: 960px (`$nhsw-page-width`); wide variant 1200px. The container centres automatically above 1024px.
- Container side margins: 16px on mobile, 40px from desktop.
- Main wrapper padding: 24px top and 32px bottom on mobile, 32px top and bottom from tablet. `nhsw-main-wrapper--s` and `--l` give smaller and larger padding.
- Grid gutter: 16px each side, 20px from desktop (40px between columns). Grid rows use negative margins to offset column padding. Columns stack full width below desktop.
- Aim for a reading width of about 70 to 80 characters. Use a two-thirds column for forms and reading content.

### Vertical rhythm

- H1 margin-bottom: 40px on mobile, 48px from tablet.
- H2 to H5 margin-bottom: 16px on mobile, 24px from tablet.
- Body text margin-bottom: 16px on mobile, 24px from tablet.
- Gap between back link and page heading, and between page heading and first content section: 40px.
- Gap between major sections: 40px on mobile, 48px from tablet (`$nhsw-section-gap`).

### Form spacing

- Form group margin-bottom: 16px on mobile, 24px from tablet.
- Label margin-bottom: 4px, with or without a hint after it. Hint margin-bottom: 8px.
- Hint margin-bottom: 16px.
- Error message margin-bottom: 8px.
- Form group in error: 4px left border and 16px left padding.
- Between form sections (for example after a group of fields, before a new heading): 40px.

### When not to use standard layouts

Full-screen data dashboards, canvas-based tools and embedded third-party applications can use their own layout, but must still meet the accessibility rules below.

## Page templates

Every page has: a skip link, `nhsw-site-header`, `<main class="nhsw-main-wrapper" id="maincontent">` containing `nhsw-width-container` (or `nhsw-fluid-container`), and `nhsw-site-footer`.

- **Public-facing** (patients, carers, the public): top navigation through the header's `nav` param. Optional phase banner and breadcrumbs. Choose full width, two-thirds, one-half or one-third content.
- **Staff dashboard**: the `nhswDashboard` shell with left-hand navigation, a top bar of context chips (location, user, organisation) and an Exit link.
  - Default dashboard for landing pages.
  - Transactional page for one task (searching for a patient, booking, completing a form). Starts with a back link.
  - Content page for information and guidance. Can use breadcrumbs.
- Show patient details in `nhsw-patient-header` above the content whenever a page shows or changes a patient's record.

## Use existing classes

Use the classes in [`component-registry.md`](component-registry.md). Common ones:

- Layout: `nhsw-main-wrapper` (`--s`, `--l`, `--grey`), `nhsw-width-container`, `nhsw-fluid-container`, `nhsw-grid-row`, `nhsw-grid-column-full | one-half | one-third | two-thirds | one-quarter | three-quarters`
- Type: `nhsw-h1` to `nhsw-h5`, `nhsw-body`, `nhsw-body-s`, `nhsw-lede-text` (`--small`), `nhsw-caption-s | m | l | xl`, `nhsw-link`
- Forms: `nhsw-form-group` (`--error`), `nhsw-fieldset`, `nhsw-label` (`--s`, `--m`, `--l`, `--xl`), `nhsw-hint`, `nhsw-error-message`, `nhsw-input` (`--full`, `--half`, `--width-*` and others), `nhsw-input-wrapper`, `nhsw-select`, `nhsw-textarea`, `nhsw-radios`, `nhsw-checkboxes`, `nhsw-date-input`
- Utilities: `nhsw-visually-hidden`, `nhsw-u-secondary-text-colour`

Prefer the Nunjucks macros (`{% from "<name>/macro.njk" import nhsw<Name> %}`) over hand-written markup. They wire up IDs, `aria-describedby`, error states and character counts for you.

## Component guidance

Check the component's docs page before using it. The most common rules:

**Buttons**
- One primary button per page. Left-align it to the form; it stretches full width on mobile.
- Button text is sentence case and describes the action: "Continue", "Save and continue", "Confirm and save" (staff check-answers), "Accept and send" (when users agree to legal content).
- Use buttons for actions and links for navigation.
- Secondary (`--secondary` or `--outline`) for less important or optional actions. Simplify the page before adding several.
- Warning buttons only for serious actions users can't easily undo, and only on a confirmation step after another button.
- Small buttons only where space is limited or there are several equal-priority staff actions. Don't mix sizes in a group.
- Wrap two or more buttons in `nhswButtonGroup`.
- Don't reduce a button's height or clickable area (WCAG 2.5.8).
- If research shows users submit twice, add `data-prevent-double-click="true"` (it ignores further clicks for 1 second, needs JavaScript) and also protect against duplicates on the server.

**Forms**
- Public services: one question per page. Clinical services can group questions where users need to compare or enter information quickly.
- Labels: visible, above the field, short, sentence case, no trailing colon. Use the label (`nhsw-label--xl`) or legend as the page heading only when the page asks one question.
- Hints explain format, where to find information, or how it's used.
- Text input for one line; textarea for more. Use fixed widths (`--width-*`) for known lengths like postcodes, fluid widths otherwise.
- Use `inputmode="numeric"` for whole numbers and `inputmode="decimal"` for decimals. Set `autocomplete` where the field has a known purpose (WCAG 1.3.5). Never disable copy and paste.
- Prefixes and suffixes only for well-known symbols or units, never as the only explanation; accept answers where users type them.
- Radios when users choose exactly one option; checkboxes for one or more. Order options alphabetically unless research supports another order. Don't pre-select. Inline layout only for two short options.
- Give radios a way out ("I do not know", "None of these") where appropriate. Give checkboxes a "none" option last, after an "or" divider, with `data-checkbox-exclusive`.
- Conditional reveals only for a simple related question; anything bigger goes on the next page.
- Select only for long lists, as a last resort.
- Date input: three fields (day, month, year) in a fieldset with a legend, a hint such as "For example, 15 3 1984", `inputmode="numeric"`, no automatic focus movement. Use `bday-day`, `bday-month`, `bday-year` autocomplete for date of birth.

**Errors**
- Show an error summary at the top of `main`, below any back link or breadcrumbs and above the `<h1>`, whenever there is a validation error.
- Its title is "There is a problem". Prefix the page `<title>` with "Error: ".
- Each summary link goes to the field with the error: the first field for date inputs, the first option for radios and checkboxes.
- Show the same message inline above the field, with a visually hidden "Error: " prefix.
- Focus moves to the summary on load (the macro adds `data-module="nhsw-error-summary"` for the behaviours script, `dist/nhsw-behaviours.js`).
- Never clear what the user entered.

**Status and callouts**
- Tags show status only: never links, never clickable-looking. Use adjectives ("Urgent", "New"), keep colours consistent, and keep the number of statuses small. Red for urgent.
- Inset text for important information that isn't urgent; warning text for a short inline caution; warning callout for information users must not miss.
- Notification banner for messages not directly about the page content. Panel for confirmation pages.

**Navigation**
- Breadcrumb trails stop at the current page's parent. The macro adds the mobile "Back to" link.
- Site navigation never hides items: those that don't fit move into a "More" menu.

## Do not
- Create inline styles unless explicitly asked
- Invent new component classes unless the request asks for a new component
- Use placeholder CSS
- Hard-code colours: use the tokens
- Use rem or em for spacing values — use px to match the layout spec
- Use docs-site-only classes (`nhsw-side-nav`, `nhsw-type-specimen`, `nhsw-colour-swatch`, `nhsw-code`, `nhsw-code-example`, `nhsw-code-viewer`, `nhsw-example-preview`, `nhsw-example-screenshot`, `nhsw-back-to-top`) in services
- Change the written content of existing pages (headings, descriptions, guidance text, lists, links) outside the example areas unless explicitly asked to, and never as a side effect of another task. Report wording you think is wrong instead of editing it

## Accessibility rules

Components are reviewed against WCAG 2.2 AA, but every service still needs testing with real users.

- Every input must have a visible label
- Labels must use matching for and id
- Hints and errors must be connected with aria-describedby (hint first, then error)
- Invalid fields must use aria-invalid="true"
- Date inputs, radios and checkboxes must use fieldset and legend
- Do not use placeholder text as a label
- Main must use id="maincontent", and every page has a skip link to it
- Focus styles must use the yellow (#ffeb3b) focus indicator
- Decorative SVG icons must use aria-hidden="true" and focusable="false" (action links, navigation icons, chips)
- Present content in a logical reading order (WCAG 1.3.2)

## Welsh language

Services must work equally well in Welsh and English. The components don't yet provide Welsh text or a language switch, so:

- Pass translated text through each macro's `text` / `html` params, including built-in strings such as "Back", "There is a problem" and the visually hidden "Error: " prefix.
- Set `lang="cy"` on the `<html>` element of Welsh pages, or on Welsh passages within an English page.
- Allow for Welsh text often being longer than English. Don't fix widths around English wording.
- Don't machine-translate clinical or legal content. Use professional translation.

## When working in this repository

These apply only to changes to the design system itself, not to services that use it.

- Generate static HTML preview and documentation pages under `preview/`.
- Keep this file in step with `src/tokens/` and the docs site when either changes.
- Run `npm run build:css` after changing Sass or preview pages, and `npm test` before opening a pull request.
