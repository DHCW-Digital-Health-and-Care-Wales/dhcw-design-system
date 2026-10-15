# Warning text

**Component classes:** `.nhsw-warning-text`
**Doc page:** `preview/components/warning-text.html`
**Source:** `src/components/content/_warning-text.scss`
**Example fixtures:** `warning-text-default.html`, `warning-text-dark.html`

## Automated test coverage

```gherkin
Feature: Warning text — automated coverage

  Rule: Visual spec matches Figma Warning text component

    @automated
    # specs/tests/css/components/warning-text.test.js
    Scenario: Icon-to-text gap
      Given the compiled CSS for .nhsw-warning-text
      Then there is a 12px gap between the icon and the text

    @automated
    # specs/tests/css/components/warning-text.test.js
    Scenario: Icon remains aligned with the warning text
      Given warning text spans multiple lines
      When the message wraps onto additional lines
      Then the warning icon remains aligned with the first line of text
      And does not become vertically centred or misaligned
```

> Note: like warning callout, warning text's icon is rendered via CSS, not an inline `<svg>`, so `accessibility.test.js`'s decorative-SVG-must-be-aria-hidden check does not exercise this component's fixtures.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Warning text — manual verification

  @manual
  Scenario: Doesn't rely on colour alone to signal a warning (WCAG 2.2 SC 1.4.1)
    Given warning text on a page
    Then it combines an icon and text, not just colour
    And hidden "Warning" text is present for screen reader users

  @manual
  Scenario: Icon is easy to see against its background (WCAG 2.2 SC 1.4.11)
    Given the warning icon
    Then it has clear contrast against its surrounding colours

  @manual
  Scenario: Stays readable on a dark background
    Given the dark-background variant of warning text
    Then both the icon and text remain clearly visible

  @manual
  Scenario: Remains readable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given warning text
    When browser zoom is increased to 200% or 400%
    Then the icon and text remain visible and readable without loss of information

  @manual
  Scenario: Warning text remains readable on small screens
    Given warning text containing a long message
    When viewed on a narrow viewport
    Then the text wraps correctly and does not overlap the warning icon
```
