# Summary list

**Component classes:** `.nhsw-summary-list`, `--no-border`, `__row--no-border`, `__actions`, plus `.nhsw-summary-card`
**Doc page:** `preview/components/summary-list.html`
**Source:** `src/components/content/_summary-list.scss`, `src/components/content/_summary-card.scss`
**Example fixtures:** `summary-card-actions.html`, `summary-card-no-actions.html`, `summary-list-no-border.html`, `summary-cards-grouped.html`, `summary-list-immunisations.html`

## Automated test coverage

```gherkin
Feature: Summary list — automated coverage

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-summary-list, --no-border, __row--no-border, __actions
      Then each of those selectors is present in the compiled output

  Rule: Documentation page stays structurally valid

    @automated
    # specs/tests/markup/documentation-gaps.test.js
    Scenario: Every live preview on the doc page has a matching code sample
      Given preview/components/summary-list.html
      Then the number of example-preview includes equals the number of code-viewer includes
```

> There is no dedicated Figma spacing/colour spec for summary list. `components/summary-list.test.js` and `components/summary-card.test.js` cover row/hover structure only. Its fixtures contain no form inputs or `<svg>`, so `accessibility.test.js` doesn't exercise it.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Summary list — manual verification

  @manual
  Scenario: "Change" links are easy to tap accurately (WCAG 2.2 SC 2.5.8)
    Given a summary list row with a Change link
    Then it's large enough, or has enough space around it, to tap without missing

  @manual
  Scenario: Screen reader reads each row's label and value as a pair
    Given a summary list row, e.g. "Name: Karen Francis"
    When a screen reader reads it
    Then the label and value are announced together, clearly associated

  @manual
  Scenario: Grouped summary cards are easy to tell apart
    Given several summary cards grouped on one page
    Then a user can clearly tell them apart and move between them

  @manual
  Scenario: "Change" links make sense out of context (WCAG 2.2 SC 2.4.4)
    Given a summary list containing Change links
    When a screen reader presents a list of links
    Then each Change link identifies the item it relates to, e.g. "Change name", "Change appointment date", rather than just "Change, Change"

  @manual
  Scenario: Keyboard focus is visible on action links (WCAG 2.2 SC 2.4.7)
    Given a summary list containing Change, Cancel or Reschedule links
    When a keyboard user tabs through them
    Then each link displays a clear visible focus indicator

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a summary list
    When browser zoom is increased to 200% or 400%
    Then labels, values and actions remain readable and usable without loss of information

  @manual
  Scenario: Long values wrap correctly
    Given a summary list containing long answers, e.g. a long email address, address or medication name
    When viewed on a small screen or at high zoom levels
    Then values wrap correctly without overlapping labels or action links

  @manual
  Scenario: Long labels wrap correctly
    Given a summary list containing lengthy labels
    When displayed on a narrow viewport
    Then the labels wrap correctly and remain associated with their values

  @manual
  Scenario: Summary list adapts to small screens
    Given a summary list
    When viewed on a mobile-width screen
    Then labels, values and actions reflow without clipping, overlap or horizontal scrolling

  @manual
  Scenario: Multiple action links remain distinct
    Given a summary card header containing multiple actions
    When viewed by keyboard or screen-reader users
    Then each action is clearly distinguishable and independently operable
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Selecting "Change" pre-fills your previous answer** (WCAG 2.2 SC 3.3.7) — depends on the service's own form-state handling when a user returns to change an answer. The summary list only provides the link.
