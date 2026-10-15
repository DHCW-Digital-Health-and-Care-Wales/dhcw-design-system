# Header

**Component classes:** `.nhsw-site-header`, `__nav`, `__nav-container`, `__nav-list`, `__nav-link`, `.nhsw-bottom-nav`
**Doc page:** `preview/components/header.html`
**Source:** `src/components/site/_header.scss`, `src/components/site/_bottom-nav.scss`
**Example fixtures:** `header-default.html`, `header-no-search.html`

## Automated test coverage

```gherkin
Feature: Header — automated coverage

  Rule: Visual spec matches Figma Service navigation component

    @automated
    # specs/tests/css/components/header.test.js
    Scenario: Nav link padding
      Given the compiled CSS for .nhsw-site-header__nav-link
      Then padding is 16px vertical / 4px horizontal

    @automated
    # specs/tests/css/components/header.test.js
    Scenario: Nav list item gap
      Given the compiled CSS for .nhsw-site-header__nav-list
      Then the gap between items is 2rem

    @automated
    # specs/tests/css/components/header.test.js
    Scenario: Current-page indicator overlaps the nav bar's own border, doesn't double it up
      Given the compiled CSS for .nhsw-site-header__nav-link--current
      Then it is drawn with an inset box-shadow (#212b32), not a border-bottom

    @automated
    # specs/tests/css/components/header.test.js
    Scenario: Top bar has no gold border, a 5rem logo, and a regular-weight title
      Given the compiled CSS for .nhsw-site-header, __logo img/svg, __top and __title
      Then there is no border-bottom, the logo is 5rem tall with vertical padding around it, and the title has no divider border and is 400 weight

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: nhsw-site-header (referenced in design-system-rules.md) exists in the compiled CSS
      Given design-system-rules.md documents nhsw-site-header
      Then the .nhsw-site-header selector is present in the compiled output

  Rule: The search field has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Search input is labelled, not just placeholder text
      Given header-default.html
      Then the search <input> has a visually-hidden <label for> ("Search"), not just a placeholder attribute
```

> `figma-tokens.test.js`'s comment notes that the Header's Figma page models a different sub-pattern to this masthead, so header itself has no Figma-sourced structural test beyond the nav link/list spacing above.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Header — manual verification

  @manual
  Scenario: Search box has a real label, not just placeholder text (WCAG 2.2 SC 3.3.2)
    Given the header's search field
    Then it has a visible or properly linked label, not just placeholder text

  @manual
  Scenario: "No search bar" variant still lays out cleanly
    Given the header variant without a search bar
    Then the remaining elements are positioned without an awkward gap

  @manual
  Scenario: Mobile bottom navigation stays visible and doesn't cover content
    Given the mobile bottom navigation variant
    When viewed on a small screen
    Then it stays visible and tappable without overlapping page content

  @manual
  Scenario: Navigation toggle works with keyboard and doesn't trap focus
    Given the header on a mobile-width screen
    When any nav toggle is used via keyboard
    Then it opens/closes correctly and focus is never trapped inside it

  @manual
  Scenario: Header links have a visible focus state (WCAG 2.2 SC 2.4.7)
    Given a header containing links or buttons
    When a keyboard user tabs through them
    Then each interactive element displays a clear visible focus indicator

  @manual
  Scenario: Header landmark can be identified by assistive technologies
    Given a screen reader user encounters the page header
    When navigating page landmarks
    Then the header region can be identified and reached

  @manual
  Scenario: Logo and service name remain readable on smaller screens
    Given a header containing a logo and service name
    When viewed on a narrow viewport
    Then both remain readable and do not overlap or become truncated

  @manual
  Scenario: Long service names wrap or truncate appropriately
    Given a service with a long name
    When displayed in the header
    Then the service name remains readable and does not break the layout

  @manual
  Scenario: Header remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a page containing the header
    When browser zoom is increased to 200% or 400%
    Then all header content and navigation controls remain readable and operable without loss of information
```
