# Breadcrumb

**Component classes:** `.nhsw-breadcrumb`
**Doc page:** `preview/components/breadcrumbs.html`
**Source:** `src/components/navigation/_breadcrumb.scss`
**Example fixtures:** `breadcrumb-default.html`, `breadcrumb-dark.html`

## Automated test coverage

```gherkin
Feature: Breadcrumb — automated coverage

  Rule: Documentation page stays structurally valid

    @automated
    # specs/tests/markup/documentation-gaps.test.js
    Scenario: Every live preview on the doc page has a matching code sample
      Given preview/components/breadcrumbs.html
      Then the number of example-preview includes equals the number of code-viewer includes
      And no html_sample/njk_sample capture block is empty

  Rule: Link hover/focus states and the separator match the agreed design values

    @automated
    # specs/tests/css/components/breadcrumb.test.js
    Scenario: Link hover recolours to #7c2855 and removes the underline
      Given the compiled CSS for .nhsw-breadcrumb__link:hover
      Then the colour is #7c2855
      And text-decoration is none

    @automated
    # specs/tests/css/components/breadcrumb.test.js
    Scenario: Link focus state is a tight yellow highlight with a dark underline
      Given the compiled CSS for .nhsw-breadcrumb__link:focus
      Then outline is none
      And background-color is #ffeb3b
      And there is a 4px solid #212b32 border-bottom

    @automated
    # specs/tests/css/components/breadcrumb.test.js
    Scenario: On dark backgrounds, hover and focus keep their own light-background treatment
      Given the compiled CSS for .nhsw-breadcrumb--reverse .nhsw-breadcrumb__link
      Then :hover stays white with no underline
      And :focus matches the default focus treatment

    @automated
    # specs/tests/css/components/breadcrumb.test.js
    Scenario: Separator is CSS-generated content, not real text
      Given the compiled CSS for .nhsw-breadcrumb__list-item:not(:last-child)::after
      Then content is the "›" character, generated via CSS, not a character in the markup

  Rule: This site's own pages never show the current page in their breadcrumb trail

    @automated
    # specs/e2e/navigation.spec.js
    Scenario: A Start prototyping sub-page's breadcrumb lists only its ancestors
      Given /get-started/setting-up-figma-prototypes.html, whose only ancestor is Home
      Then the breadcrumb trail has exactly 1 item ("Home")
      And it does not contain the page's own title ("Set up a Figma prototype")

    @automated
    # specs/e2e/navigation.spec.js
    Scenario: A legal page's breadcrumb lists only its ancestors
      Given /contact-us.html, whose only ancestor is Home
      Then the breadcrumb trail has exactly 1 item ("Home")
      And it does not contain the page's own title ("Contact us")
```

> Note: the `nhswBreadcrumb` macro (`src/components/breadcrumb/macro.njk`) no longer supports rendering a non-linked "current page" item — every item passed in `items` is rendered as a real link, and the mobile "Back to" link points at the last item. This matches the "you don't need to show the current page — that's what the H1 is for" guidance on the doc page's own "How to use" tab, which every example, fixture and this site's own pages now follow. The `.nhsw-breadcrumb__current` SCSS rule (`src/components/navigation/_breadcrumb.scss`) is kept for styling purposes but is no longer emitted by anything in this library.

> **Coverage gap:** `nhsw-breadcrumb` is not named in `.agent/component-registry.md` or `.agent/design-system-rules.md`, so `component-registry.test.js` does not check its classes exist, and its fixtures contain no form inputs or `<svg>`, so `accessibility.test.js` doesn't exercise it either. Link hover/focus states, the separator, and this site's own no-current-page navigation behaviour are covered by the automated scenarios above; everything below is manual-only.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Breadcrumb — manual verification

  @manual
  Scenario: Enough space around the links that you don't tap the wrong one (WCAG 2.2 SC 2.5.8)
    Given a breadcrumb trail
    Then there is enough space between links that you can't easily tap the wrong one

  @manual
  Scenario: Stays readable on a dark background (WCAG 2.2 SC 1.4.3)
    Given the dark-background variant of the breadcrumb
    Then the text remains clearly visible against the dark background

  @manual
  Scenario: Screen reader reads each link with meaningful text
    Given a breadcrumb trail
    When a screen reader reads it out
    Then each link is announced by its page name, not just "link, link, link"

  @manual
  Scenario: Current page is not a link
    Given a breadcrumb trail
    When it is displayed
    Then the current page is shown as text and is not a clickable link

  @manual
  Scenario: Keyboard focus is visible (WCAG 2.2 SC 2.4.7)
    Given a breadcrumb link
    When it receives keyboard focus
    Then a visible focus indicator appears, on both light and dark backgrounds

  @manual
  Scenario: Links can be navigated using the keyboard
    Given a breadcrumb trail
    When a keyboard user tabs through the page
    Then each breadcrumb link can receive focus and be activated

  @manual
  Scenario: Breadcrumb wraps correctly on smaller screens
    Given a breadcrumb trail with several long items
    When it doesn't fit on one line
    Then it wraps onto a second line without overlapping content

  @manual
  Scenario: Long breadcrumb labels remain readable
    Given a breadcrumb item with an unusually long, unbroken label
    Then it breaks onto multiple lines rather than overflowing the page sideways

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a page containing breadcrumbs
    When browser zoom is increased to 200%, then 400%
    Then the breadcrumbs remain readable and usable without loss of content

  @manual
  Scenario: Hover state is clear and consistent with other links
    Given a breadcrumb link
    When a user hovers over it
    Then the hover state is visually apparent and consistent with other links
    But the current-page text does not react to hover

  @manual
  Scenario: Mobile breadcrumb pattern works as intended
    Given a breadcrumb trail
    When the viewport is narrowed below the desktop breakpoint
    Then the full trail is replaced with a "Back to [parent]" link
    And it uses the same chevron as the Back link component
    And the underline only ever applies to the text, not the chevron

  @manual
  Scenario: Screen reader identifies the component as breadcrumb navigation
    Given a breadcrumb trail
    When a screen reader encounters the component
    Then it is announced as a breadcrumb navigation region

  @manual
  Scenario: Screen reader identifies the current page
    Given a breadcrumb trail
    When a screen reader reads the current page item
    Then the current page is identified as the current location

  @manual
  Scenario: Separators are not announced unnecessarily
    Given a breadcrumb trail with "›" separators
    When a screen reader reads the trail
    Then only the breadcrumb labels are announced, not the decorative separators
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Trail matches where you actually are on the site** — whether the breadcrumb accurately reflects the current page's place in the site hierarchy depends on the page data the service passes in, not the breadcrumb component itself.
- **Each link in the trail goes to the right page** — every link in the fixtures here is `href="#"`; whether it actually lands on the right page depends on the URLs the consuming app supplies, not the component itself.
