# NHSW Components

Every component below has a Nunjucks macro under `src/components/<name>/macro.njk` (the authoritative param docs for each one), except `nhsw-input-wrapper`, which has no macro of its own — it's rendered internally by `nhswInput` when `prefix`/`suffix` params are used.

### Actions

## nhsw-action-link
Prominent link with a blue circle arrow icon, used for signposting to services.

Supports:
- nhsw-action-link__icon
- nhsw-action-link__text
- nhsw-action-link--navy
- nhsw-action-link--red
- nhsw-action-link--reverse

## nhsw-back-link
Link back to the previous page. Defaults to text "Back" and href "#".

Supports:
- nhsw-back-link--reverse
- nhsw-back-link--button (styled to look like a button)

## nhsw-button
Button or button-styled link (`nhswButton`), plus `nhswButtonGroup` for laying out a row of buttons — both macros live in `button/macro.njk`.

Supports:
- nhsw-button--primary
- nhsw-button--secondary
- nhsw-button--exceptional
- nhsw-button--warning
- nhsw-button--outline
- nhsw-button--warning-outline
- nhsw-button--link (text-style, no background/border)
- nhsw-button--small
- nhsw-button--inline (width: auto instead of full-width on mobile)
- nhsw-button--full (stays full-width from tablet up)
- nhsw-button--reverse (pairs with --link, for use on a dark background)
- nhsw-button--disabled
- nhsw-button-group (lays out a row of buttons; children automatically get width: auto)

### Forms

## nhsw-checkboxes
A group of checkboxes, wrapped in a fieldset.

Supports:
- nhsw-checkboxes--small
- nhsw-checkboxes--inline
- nhsw-checkboxes__hint
- nhsw-checkboxes__divider
- nhsw-checkboxes__conditional
- nhsw-checkboxes__conditional--hidden

Requires:
- nhsw-fieldset
- nhsw-form-group
- nhsw-label

## nhsw-date-input
Three-field (day/month/year) date input, wrapped in a fieldset.

Supports:
- nhsw-date-input__item
- nhsw-date-input__label
- nhsw-date-input__input--day / --month / --year
- errorFields param (marks only a subset of the three fields invalid)

Requires:
- nhsw-fieldset
- nhsw-form-group
- nhsw-label

## nhsw-date-picker
Renders only the hook markup for the `nhsw-date-picker` progressive-enhancement JS module (`dist/nhsw-date-picker.js`) — not a full generated calendar. The JS renders the calendar dialog itself, using these classes:

Supports:
- nhsw-date-picker__input-group, __input, __toggle
- nhsw-date-picker__dialog, __dialog-header, __dialog-footer
- nhsw-date-picker__calendar, __month-year, __nav-button
- nhsw-date-picker__day (+ --today, --other-month, --pending)
- nhsw-date-picker__shortcuts, __shortcut

Requires:
- nhsw-form-group
- nhsw-label

## nhsw-error-message
Inline field-level error message, referenced by a field's `aria-describedby`.

No modifier classes — `visuallyHiddenText` controls the screen-reader-only "Error:" prefix (pass `""` to omit it).

## nhsw-error-summary
Summary of validation errors at the top of a form, linking to each field. `tabindex="-1"` lets JS focus it programmatically on submit.

Supports:
- nhsw-error-summary__title
- nhsw-error-summary__list
- nhsw-error-summary__link

Requires:
- nhsw-link

## nhsw-fieldset
Wraps related fields with a `<legend>`. Used internally by checkboxes, radios and date-input; also usable standalone via `{% call %}...{% endcall %}`.

Supports:
- nhsw-fieldset__legend (defaults to heading-styled, `nhsw-h2`)

## nhsw-file-upload
File input styled as a status line + "Choose file" button.

Supports:
- nhsw-file-upload--reverse (button before the status text)
- nhsw-file-upload__status (+ --filled, added by JS once a file is chosen)
- nhsw-file-upload__hint ("or drop file")

Requires:
- nhsw-form-group
- nhsw-label
- nhsw-button (the "Choose file" control is a `nhsw-button nhsw-button--secondary`)

## nhsw-hint
Supporting hint text under a label, referenced by a field's `aria-describedby`.

No modifier classes — `classes` is used by callers for context-specific hints, e.g. `nhsw-checkboxes__hint` for a per-item hint.

## nhsw-input
Single-line text input, with optional prefix/suffix and character-count support.

Supports:
- nhsw-input--full / --three-quarters / --two-thirds / --half / --third / --quarter
- nhsw-input--width-2 / -3 / -4 / -5 / -10 / -20
- nhsw-is-invalid
- Character count: set `maxlength` to add the attribute and an auto-generated "You have N characters remaining" hint (unless `characterCount: false`)
- `prefix` / `suffix` params render the input inside nhsw-input-wrapper

Requires:
- nhsw-label
- nhsw-form-group

## nhsw-input-wrapper
Prefix/suffix wrapper around a text input. Not a standalone macro — rendered by `nhswInput` when `prefix`/`suffix` params are set.

Supports:
- nhsw-input-wrapper__prefix
- nhsw-input-wrapper__suffix

Requires:
- nhsw-input
- nhsw-form-group
- nhsw-label

## nhsw-label
Field label.

Supports:
- nhsw-label--s / --m / --l / --xl (--xl for page-question labels standing in for an `<h1>`)

## nhsw-radios
A group of radio buttons, wrapped in a fieldset.

Supports:
- nhsw-radios--small
- nhsw-radios--inline
- nhsw-radios__hint
- nhsw-radios__divider
- nhsw-radios__conditional
- nhsw-radios__conditional--hidden

Requires:
- nhsw-fieldset
- nhsw-form-group
- nhsw-label

## nhsw-select
Dropdown select component.

Supports:
- nhsw-select--xs / -s / -m / -l / -xl
- nhsw-select--full
- nhsw-is-invalid

Requires:
- nhsw-label
- nhsw-form-group

## nhsw-textarea
Multi-line text input, with the same label/hint/error/character-count composition as nhsw-input.

Supports:
- nhsw-textarea--small / --large / --xlarge (min-height presets)
- nhsw-textarea--fixed (disables resize)
- nhsw-textarea--full
- nhsw-textarea__count (character-count hint; + --count--error once over the limit)
- nhsw-is-invalid

Requires:
- nhsw-label
- nhsw-form-group

### Content

## nhsw-details
Native HTML details/summary disclosure component.

Supports:
- nhsw-details__summary
- nhsw-details__summary-text
- nhsw-details__text
- `open` attribute (via the `open` param)

## nhsw-example-screenshot
Bordered frame for a real product screenshot used on component "Examples" tabs, with a caption below (replaces `nhsw-screenshot-placeholder` once a real image is available). Rendered via the `example-screenshot.html` include (`src`, `text` params) rather than a macro.

Supports:
- nhsw-example-screenshot__image
- nhsw-example-screenshot__caption

## nhsw-expander
Collapsible content block toggled by a button. Renders correct static/initial markup only — the click-to-toggle behaviour (aria-expanded/hidden) is provided by existing JS keyed off `.nhsw-expander__button`'s `aria-controls`.

Supports:
- nhsw-expander__button
- nhsw-expander__heading
- nhsw-expander__icon
- nhsw-expander__link-text
- nhsw-expander__content
- nhsw-expander--reverse

## nhsw-inset-text
Text set apart in a coloured left-bordered box.

Supports:
- nhsw-inset-text--navy
- nhsw-inset-text--blue
- nhsw-inset-text--grey
- nhsw-inset-text--red
- nhsw-inset-text--yellow

## nhsw-pagination
Two variants, both from the same macro:

Supports:
- nhsw-pagination--numbered (page-number links + prev/next arrows): __list, __item, __item--current, __item--ellipsis, __number-link, __previous, __next, __icon, __title
- nhsw-pagination (default, unset variant — previous/next content links showing the adjacent page's title): __list, __link, __title, __page, plus li classes `nhsw-pagination-item--previous` / `nhsw-pagination-item--next`

## nhsw-panel
Confirmation panel, typically for a "your request has been submitted" style page.

Supports:
- nhsw-panel--navy
- nhsw-panel__title--l (Heading L title; pairs with `titleSize: "l"`, which also omits the tick icon unless `icon` is explicitly set)
- nhsw-panel__title--m (Heading M title; pairs with `titleSize: "m"`). Without a modifier the title is Heading XL, as in the NHS.UK panel
- nhsw-panel__icon

## nhsw-session-row
A clickable row summarising a clinic session.

Supports:
- nhsw-session-row__main, __title, __meta
- nhsw-session-row__detail
- nhsw-session-row__badges, __badge
- nhsw-session-row__chevron

Requires:
- nhsw-link (the optional location link inside __detail)

## nhsw-summary-card
Wraps one or more summary lists with a header (title + actions), or repeats a subheading + summary list per section when `sections` is given.

Supports:
- nhsw-summary-card__header, __title, __actions
- nhsw-summary-card__subheader
- nhsw-summary-card__body

Requires:
- nhsw-summary-list
- nhsw-link (header actions)

## nhsw-summary-list
Key-value summary using a definition list.

Supports:
- nhsw-summary-list__row
- nhsw-summary-list__key
- nhsw-summary-list__value
- nhsw-summary-list__actions
- nhsw-summary-list--no-border
- nhsw-summary-list__row--no-border

Requires:
- nhsw-link (row actions)

## nhsw-table
Data table with caption, row headers and numeric alignment.

Supports:
- nhsw-table__caption (--s, --m, --l, --xl)
- nhsw-table__head / __body / __row
- nhsw-table__header / __cell
- nhsw-table__header--numeric / __cell--numeric
- nhsw-table-responsive (implies `firstCellIsHeader`; adds ARIA table roles and a hidden `nhsw-table-responsive__heading` mobile label in each data cell)

## nhsw-tabs__list
A set of tabs (macro: `nhswTabs`, `src/components/tabs/`). The outer wrapper div carries no styling of its own — `nhsw-tabs__list` is the first styled element. Renders correct static initial markup only — the shipped JS handles click/arrow-key switching.

Supports:
- nhsw-tabs__list
- nhsw-tabs__tab (+ --selected)
- nhsw-tabs__panel (+ --hidden)
- nhsw-tabs__pagination, __pagination-link
- count badge: pass `count` on an item to render an `nhsw-tag nhsw-tag--blue` badge after the tab label (reuses the Tag component, not a tabs-specific class)

## nhsw-tag
Status indicator tag.

Supports:
- nhsw-tag--white
- nhsw-tag--grey
- nhsw-tag--green
- nhsw-tag--aqua-green
- nhsw-tag--blue
- nhsw-tag--purple
- nhsw-tag--pink
- nhsw-tag--red
- nhsw-tag--orange
- nhsw-tag--yellow
- nhsw-tag--dhcw-blue
- nhsw-tag--no-colour (transparent background, grey border, inherited text colour)
- nhsw-tag--no-border (transparent border)
- nhsw-tag-group (wraps multiple tags with consistent spacing)

## nhsw-timeout-modal
Session-timeout warning dialog (macro: `nhswTimeout`, `src/components/timeout/`). Renders correct static initial markup only — the shipped JS drives the countdown, live region and dismiss button.

Supports:
- nhsw-timeout-modal__title
- nhsw-timeout-modal__text

Requires:
- nhsw-button (the "Stay logged in" dismiss button)

## nhsw-warning-text
Inline warning message with an icon, for use within page content (lighter-weight than nhsw-warning-callout).

Supports:
- nhsw-warning-text__icon
- nhsw-warning-text__text
- nhsw-warning-text--reverse (white icon/text on a dark background)

### Navigation

## nhsw-breadcrumb
Breadcrumb trail. When there is 1 or more items, an automatic mobile-only "Back to &lt;parent&gt;" link is rendered above the full list, pointing at the last item. Every item, including the last, renders as a real link — the trail should stop at the current page's parent, not include the current page itself.

Supports:
- nhsw-breadcrumb__list
- nhsw-breadcrumb__list-item
- nhsw-breadcrumb__link
- nhsw-breadcrumb__current (styling kept in the stylesheet, no longer emitted by the macro)
- nhsw-breadcrumb__mobile-back
- nhsw-breadcrumb--reverse

Requires:
- nhsw-back-link (renders the mobile back link)

## nhsw-skip-link
"Skip to main content" link.

No modifier classes — it's off-screen (`position: absolute; top:0; left:0`) until `:focus`, entirely state-driven.

### Callouts

## nhsw-notification-banner
Notification banner with default (blue, `role="region"`) and success (green, `role="alert"`) variants.

Supports:
- nhsw-notification-banner--success
- nhsw-notification-banner__header
- nhsw-notification-banner__title
- nhsw-notification-banner__content
- nhsw-notification-banner__heading
- nhsw-notification-banner__link

## nhsw-warning-callout
Callout with a warning icon and heading tab, for cautionary information.

Supports:
- nhsw-warning-callout__heading
- nhsw-warning-callout__icon
- nhsw-warning-callout__content
- nhsw-warning-callout--important (navy heading + grey-bordered content, for non-warning "important information" callouts)

### Cards

## nhsw-card
A single flexible shell composed from params rather than a fixed set of variants: plain, clickable (via a title link), or a stat card.

Supports:
- nhsw-card__title / __title-link
- nhsw-card__description
- nhsw-card__header (title + actions row)
- nhsw-card__actions
- nhsw-card__icon
- nhsw-card__image
- nhsw-card__preview / __preview-image (bordered image frame; set `previewSrc`/`previewAlt` instead of `imageSrc`/`imageAlt` to use it)
- nhsw-card__stat
- nhsw-card--flat (no border/shadow/padding)
- nhsw-card--chevron (adds a trailing chevron; clickable cards only)

Requires:
- nhsw-link (card actions)

### Site

## nhsw-bottom-nav
Fixed mobile bottom navigation bar, hidden from tablet up (the header nav takes over there).

Supports:
- nhsw-bottom-nav__list, __item
- nhsw-bottom-nav__link (+ --current)
- nhsw-bottom-nav__icon, __label

Add `nhsw-has-bottom-nav` to `<body>` separately to give page content the bottom padding needed so it's never obscured by the fixed bar.

## nhsw-site-footer
Site footer (macro: `nhswFooter`, `src/components/footer/`) with three mutually-exclusive modes: links/copyright (default, optionally with nav columns), org/version, or open-licence.

Supports:
- nhsw-site-footer__container (+ --stacked, licence mode)
- nhsw-site-footer__links, __copyright
- nhsw-site-footer__nav, __nav-column, __nav-heading, __nav-list (when `navigation` is given)
- nhsw-site-footer__meta (wraps nav + links together when `navigation` is given)
- nhsw-site-footer__org, __version (org/version mode)
- nhsw-site-footer__licence, __licence-badge, __licence-text (licence mode)

Requires:
- nhsw-link

## nhsw-site-header
Site header (macro: `nhswHeader`, `src/components/header/`): logo/service name, optional search form, an optional nav row, and an optional full-width hero band.

Supports:
- nhsw-site-header__container (+ --centered)
- nhsw-site-header__brand, __logo, __title
- nhsw-site-header__search, __search-input, __search-button
- nhsw-site-header__hero-band, __hero, __hero-title, __hero-text

Requires:
- nhsw-button (optional hero `action` link)

Pass a `nav` param (`{ items, ariaLabel, classes, attributes }`) and `nhswHeader` renders `nhswSiteNavigation` for you immediately after the header, rather than needing a separate call.

Pass `phaseBanner` (`{ tag, text, html }`) to show an Alpha/Beta `nhsw-phase-banner--reverse` inside the dark header, and `user` (`{ name, logoutText, logoutHref }`) to show the signed-in user and a log out link on the right:
- nhsw-site-header__account, __user, __user-icon, __user-name, __logout

## nhsw-site-header__nav
Primary navigation row (macro: `nhswSiteNavigation`, `src/components/site-navigation/`) — never hidden: items that do not fit move into a "More" menu, as in the NHS.UK header. Pass `overflowMenu: false` to hide it below the tablet breakpoint instead. Callable standalone, or via `nhswHeader`'s `nav` param.

Supports:
- nhsw-site-header__nav-container
- nhsw-site-header__nav-list
- nhsw-site-header__nav-link (+ --current)
- nhsw-site-header__nav-badge
- nhsw-site-header__nav--reverse
- nhsw-site-header__nav--no-menu (opt-out: hides the navigation on small screens instead of moving items that do not fit into the "More" menu, which is the default)
- nhsw-site-header__nav--enhanced (added by the behaviour script: the bar stops wrapping and overflow goes to the menu)
- nhsw-site-header__menu (hidden list item holding the "More" button, shown by the script when items overflow)
- nhsw-site-header__menu-toggle
- nhsw-site-header__menu-list (the drop-down of items that did not fit)

Requires:
- nhsw-site-header

## nhsw-phase-banner
Phase banner (macro: `nhswPhaseBanner`, `src/components/phase-banner/`): a phase tag such as Beta or Alpha followed by a sentence and a feedback link. The docs site includes it under the primary navigation on every page via `preview/_includes/phase-banner.html`.

Supports:
- nhsw-phase-banner__container, __content, __tag, __text
- nhsw-phase-banner--reverse (inside the dark header, white text and a solid blue tag)

## nhsw-dashboard
Dashboard page shell (macro: `nhswDashboard`, `src/components/dashboard/`, used with `{% call %}`): left-hand navigation with icons, a top bar with location/user chips and an Exit link, the page content and the footer. Used by the dashboard page templates.

Supports:
- nhsw-dashboard__sidebar, __brand, __nav-group, __nav-link (+ --current), __nav-icon
- nhsw-dashboard__main, __topbar, __chip, __chip-icon, __exit, __content

Requires:
- nhsw-site-footer (rendered through `nhswFooter`)

## nhsw-side-nav (nested items)
The docs side navigation accepts `children` on an item in its data file. When the item is the current page, its children are listed beneath it behind an em dash and the active group gets a single left bar.

Supports:
- nhsw-side-nav__item (+ --active), __sublist, __link--group, __link--child

## nhsw-type-specimen
Fixed-size heading specimens for the Typography page (`nhsw-type-specimen--desktop-h1` to `--mobile-h5`): they show a heading size regardless of the viewport.

## nhsw-colour-swatch
Colour swatches for the Colours page (`nhsw-colour-swatches` wrapper, `nhsw-colour-swatch` with `__name`, `__hex` and one modifier per colour).

## nhsw-code
Inline code in the destructive red colour, used for code and variable names in documentation text.

## nhsw-patient-header
Patient summary area shown above the page content: a white bordered box with 16px internal padding and 32px of space below it. Hold a summary list (`nhsw-summary-list--no-border`) with the patient's name, date of birth and NHS number.

