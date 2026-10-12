# Inset text

**Component classes:** `.nhsw-inset-text`
**Doc page:** `preview/content/inset-text.html`
**Source:** `src/components/content/_inset-text.scss`
**Example fixtures:** `inset-text-default.html`, `inset-text-heading.html`

## Automated test coverage

```gherkin
Feature: Inset text — automated coverage

  Rule: Visual spec matches Figma Inset text component

    @automated
    # specs/tests/css/components/inset-text.test.js
    Scenario: Padding
      Given the compiled CSS for .nhsw-inset-text
      Then padding is 24px top/right/bottom, 32px left

    @automated
    # specs/tests/css/components/inset-text.test.js
    Scenario: Left border
      Given the compiled CSS for .nhsw-inset-text
      Then it has an 8px solid gold (#aa8630) border-left

  Rule: Inset text is announced as set apart, as in NHS.UK

    @automated
    # specs/tests/njk/inset-text.test.js, specs/tests/markup/inset-text-hidden-text.test.js
    Scenario: Every inset text starts with visually hidden "Information: "
      Given the nhswInsetText macro, and every inset text in the preview pages and code samples
      Then the first thing inside it is a visually hidden "Information: "
      And it does not rely on role="note", which screen readers do not reliably announce

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: nhsw-inset-text (referenced in design-system-rules.md) exists in the compiled CSS
      Given .agent/design-system-rules.md documents nhsw-inset-text
      Then the .nhsw-inset-text selector is present in the compiled output
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Inset text — manual verification

  @manual
  Scenario: Visually stands out clearly from surrounding body text
    Given inset text on a page
    Then its border and indent make it clearly distinct from ordinary paragraphs

  @manual
  Scenario: Screen reader users are told it's set apart, not just shown visually (WCAG 2.2 SC 1.3.1)
    Given inset text that relies on its border and indent to stand out
    When a screen reader reads it
    Then the user is told this content is set apart from the main body copy, e.g. it is read as "Information: ..."
    And a sentence that wraps onto a second line is read as two lines by NVDA in browse mode, which is expected, not a split in the markup

  @manual
  Scenario: "With heading" variant renders the heading clearly
    Given inset text with a heading
    Then the heading is visually distinct from the body text inside the block

  @manual
  Scenario: Border is easy to distinguish from the page (WCAG 2.2 SC 1.4.11)
    Given inset text on a page
    Then the inset border remains clearly visible against the surrounding background

  @manual
  Scenario: Long content wraps correctly
    Given inset text containing a long message
    When viewed on a small screen or at high zoom levels
    Then the content wraps correctly without clipping or horizontal scrolling

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given inset text
    When browser zoom is increased to 200% or 400%
    Then the content and border remain visible and readable without loss of information

  @manual
  Scenario: Inset text remains readable on small screens
    Given inset text on a mobile device
    When viewed on a narrow viewport
    Then the content remains readable and the inset border remains visible

  @manual
  Scenario: Border remains aligned with multi-line content
    Given inset text containing multiple paragraphs or long content
    When the content wraps across multiple lines
    Then the inset border remains visually aligned and clearly associated with the enclosed content
```
