# Skip link

**Component classes:** `.nhsw-skip-link`
**Doc page:** `preview/components/skip-link.html`
**Source:** `src/components/navigation/_skip-link.scss`
**Example fixtures:** `skip-link-default.html`

## Automated test coverage

```gherkin
Feature: Skip link — automated coverage

  Rule: Documentation page stays structurally valid

    @automated
    # specs/tests/markup/documentation-gaps.test.js
    Scenario: Every live preview on the doc page has a matching code sample
      Given preview/components/skip-link.html
      Then the number of example-preview includes equals the number of code-viewer includes
      And no html_sample/njk_sample capture block is empty
```

> **Coverage gap:** `nhsw-skip-link` is not named in `.agent/component-registry.md` or `.agent/design-system-rules.md`, so `component-registry.test.js` doesn't check its class exists. There's no Figma spacing/colour spec for it, and its fixture has no form input or `<svg>`, so `accessibility.test.js` doesn't run against it. `main` using `id="maincontent"` (the rule.md requirement that makes the skip link's target resolvable) is likewise not asserted anywhere automated. Everything below is manual-only.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Skip link — manual verification

  @manual
  Scenario: Is the first thing focused on a fresh page load
    Given a page has just loaded
    And you have not clicked anywhere on the page content — clicking content first moves the browser's "next Tab" starting point past the skip link, making it look skipped when it isn't
    When you press Tab (the very first press may land in the browser's own address bar instead of the page — that's normal browser behaviour, not a site bug; press Tab again if so)
    Then the skip link is the first thing focused within the page, before the header navigation

  @manual
  Scenario: Activating it jumps straight to the main content (WCAG 2.2 SC 2.4.1)
    Given the skip link is focused
    When Enter is pressed
    Then focus moves straight to the main content, skipping the header and navigation

  @manual
  Scenario: Is visible on screen once focused
    Given a keyboard user tabs to the skip link
    Then it becomes visible on screen with a clear focus outline, rather than staying hidden

  @manual
  Scenario: Screen reader users can identify the skip link
    Given a screen reader user navigates the page
    When the skip link is encountered
    Then the purpose of the link is announced clearly

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a page containing a skip link
    When browser zoom is increased to 200% or 400%
    Then the skip link remains visible and usable when it receives focus
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Link text accurately describes where it goes** — only relevant if a service adds more than one skip link (e.g. "Skip to navigation"); wording accuracy for those extra links is a content decision made by whoever builds the page.
