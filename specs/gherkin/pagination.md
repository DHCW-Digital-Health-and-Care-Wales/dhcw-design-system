# Pagination

**Component classes:** `.nhsw-pagination`, `--numbered`, `__previous`, `__next`, `__list`, `__item--current`, `__item--ellipsis`
**Doc page:** `preview/components/pagination.html`
**Source:** `src/components/content/_pagination.scss`
**Example fixtures:** `pagination-numbered.html`, `pagination-content.html`, `pagination-first.html`, `pagination-last.html`, `pagination-next-only.html`, `pagination-sessions.html`

## Automated test coverage

```gherkin
Feature: Pagination — automated coverage

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-pagination, __previous, __next, __list, __item--current, __item--ellipsis
      Then each of those selectors is present in the compiled output

  Rule: Icons are hidden from assistive technology

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Decorative SVG icons (previous/next chevrons) are aria-hidden
      Given the "<fixture>" example fixture
      When an <svg> is not labelled with aria-label, a <title>, or role="img"
      Then it must carry aria-hidden="true"

      Examples:
        | fixture                        |
        | pagination-content.html        |
        | pagination-first.html          |
        | pagination-last.html           |
        | pagination-next-only.html      |
        | pagination-numbered.html       |
        | pagination-sessions.html       |
```

> There is no dedicated Figma spacing/colour spec for pagination. `components/pagination.test.js` covers the underline/hover behaviour only.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Pagination — manual verification

  @manual
  Scenario: Current page is clearly marked, visually and for screen readers (WCAG 2.2 SC 1.3.1)
    Given the numbered pagination variant
    Then the current page is visually distinct
    And a screen reader announces it as the current page, not just another link

  @manual
  Scenario: Ellipsis isn't clickable and isn't announced as a link
    Given a numbered pagination with an ellipsis
    When a screen reader reads it
    Then the ellipsis isn't announced as a clickable link

  @manual
  Scenario: Reads as a labelled navigation region to a screen reader (WCAG 2.2 SC 1.3.1)
    Given a pagination component
    When a screen reader user navigates by landmarks or headings
    Then they can identify it as the page navigation

  @manual
  Scenario: "Next only" variant works without a numbered list present
    Given the next-only pagination variant
    Then a user can move forward through content without any numbered list showing

  @manual
  Scenario: Previous and Next links are clearly identifiable
    Given a pagination component
    When a user views the Previous and Next controls
    Then their purpose is clear without relying on arrow icons alone

  @manual
  Scenario: Pagination remains usable at 200% and 400% zoom
    Given a pagination component
    When browser zoom is increased to 200% or 400%
    Then all pagination controls remain readable and operable without loss of information

  @manual
  Scenario: Pagination adapts to small screens
    Given a pagination component with many pages
    When viewed on a narrow viewport
    Then the pagination remains usable and does not cause horizontal scrolling

  @manual
  Scenario: Long page ranges display sensibly
    Given a pagination component with a large number of pages
    When it is displayed
    Then the current page, nearby pages and truncation indicators are presented clearly

  @manual
  Scenario: Current page is not presented as a normal link
    Given the current page in a numbered pagination component
    When a screen reader announces it
    Then it is identified as the current page rather than a standard navigable link
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Previous/Next and page-number links all take you to the right page** — every link in the fixtures here is `href="#"`; whether it actually lands on the right page depends on the URLs the consuming app supplies, not the component itself.
