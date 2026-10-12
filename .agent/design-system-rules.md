# NHSW design system rules

Generate static HTML preview/documentation pages only.

Please note that our organisation is called Digital Health and Care Wales, so branding should reflect this. Do not use NHS branding or logos. When putting the logo in, under the docs folder, there's an assets/nhsw-logo file that should be used for the logo.

## Layout guidelines

### Responsive breakpoints
- mobile: up to 40.0625em (641px)
- tablet: 40.0625em (641px)
- desktop: 48.0625em (769px)
- large desktop: 61.875em (990px)

### Page structure spacing
- Main wrapper padding: 32px top/bottom (mobile), 48px (tablet+)
- Container side margins: 16px (mobile), 32px (desktop), auto-centred above 1024px
- Max page width: 960px
- Grid gutter: 16px

### Vertical rhythm
- H1 margin-bottom: 40px (mobile), 48px (tablet+)
- H2–H5 margin-bottom: 16px (mobile), 24px (tablet+)
- Body text margin-bottom: 16px (mobile), 24px (tablet+)
- Gap between back link and page heading: 40px
- Gap between page heading and first content section: 40px

### Form spacing
- Form group margin-bottom: 16px (mobile), 24px (tablet+)
- Label margin-bottom: 0 if immediately followed by a hint (the hint's own margin-bottom provides the gap), 16px otherwise
- Hint margin-bottom: 16px
- Error message margin-bottom: 16px
- Between form sections (e.g. after a group of fields before a new heading): 40px

### Grid columns
- Columns stack full-width below desktop (48.0625em)
- Grid columns use 16px left/right padding (gutter)
- Grid row uses negative 16px margins to offset column padding

## Use existing classes
- nhsw-site-header
- nhsw-main-wrapper (--s, --l variants)
- nhsw-width-container
- nhsw-fluid-container
- nhsw-grid-row, nhsw-grid-column-* (full, one-half, one-third, two-thirds, one-quarter, three-quarters)
- nhsw-site-footer
- nhsw-body, nhsw-body-s
- nhsw-h1 to nhsw-h5
- nhsw-form-group (--error)
- nhsw-label (--s, --m, --l, --xl)
- nhsw-hint
- nhsw-error-message
- nhsw-input (--full, --half, --width-* etc.)
- nhsw-input-wrapper (__prefix, __suffix)
- nhsw-select
- nhsw-textarea
- nhsw-link
- nhsw-inset-text
- nhsw-warning-callout
- nhsw-radios (--inline, __hint, __divider, __conditional)
- nhsw-checkboxes (__hint, __divider, __conditional)
- nhsw-summary-list (--no-border, __actions)
- nhsw-tag (--white, --grey, --green, --aqua-green, --blue, --purple, --pink, --red, --orange, --yellow)
- nhsw-action-link (--navy, --red)
- nhsw-details
- nhsw-pagination, nhsw-pagination--numbered
- nhsw-table, nhsw-table-responsive, nhsw-table__panel-with-heading-tab
- nhsw-notification-banner (--success)

## Do not
- Create inline styles unless explicitly asked
- Invent new component classes unless the request asks for a new component
- Use placeholder CSS
- Use rem or em for spacing values — use px to match the layout spec

## Accessibility rules
- Every input must have a visible label
- Labels must use matching for and id
- Hints and errors must be connected with aria-describedby
- Invalid fields must use aria-invalid="true"
- Date inputs must use fieldset and legend
- Do not use placeholder text as a label
- Main must use id="maincontent"
- Focus styles must use the yellow (#ffeb3b) focus indicator
- Action links must use aria-hidden="true" on decorative SVG icons
