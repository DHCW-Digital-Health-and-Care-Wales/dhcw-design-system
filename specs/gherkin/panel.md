# Panel

**Component classes:** `.nhsw-panel`, `--navy`
**Doc page:** `preview/components/panel.html`
**Source:** `src/components/content/_panel.scss`
**Example fixtures:** `panel-default.html`, `panel-navy.html`, `panel-no-icon.html`

## Automated test coverage

```gherkin
Feature: Panel — automated coverage

  Rule: Visual spec matches Figma Panel component (Small, Green variant)

    @automated
    # specs/tests/css/components/panel.test.js
    Scenario: Padding
      Given the compiled CSS for .nhsw-panel
      Then padding is 32px vertical / 40px horizontal

    @automated
    # specs/tests/css/components/panel.test.js
    Scenario: Background colour
      Given the compiled CSS for .nhsw-panel
      Then the background colour is #007f3b

  Rule: Icons are hidden from assistive technology

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Decorative SVG icon is aria-hidden
      Given panel-default.html
      When an <svg> is not labelled with aria-label, a <title>, or role="img"
      Then it must carry aria-hidden="true"
```

> `documentation-gaps.test.js` explicitly exempts panel.html from the 1:1 example-preview/code-viewer check: the white/navy pairs after "Blue background" reuse the --navy modifier code shown earlier on the page, so only the white variant repeats a code sample — that exemption is itself asserted (a code-viewer must still exist somewhere on the page).

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Panel — manual verification

  @manual
  Scenario: Long headings wrap correctly
    Given a panel with a long heading
    When viewed on a narrow viewport or at high zoom levels
    Then the heading wraps correctly without clipping or overlapping other content

  @manual
  Scenario: Heading, not just colour, says what the panel means (WCAG 2.2 SC 1.4.1)
    Given the green (default) and navy panel variants
    Then each has a clear heading so its purpose doesn't depend on the colour

  @manual
  Scenario: "No icon" variant still makes sense on its own
    Given the no-icon panel variant, large and small
    Then the heading and body text alone are enough to understand the message

  @manual
  Scenario: Smaller panel variant stays legible
    Given the smaller panel variant
    Then the icon and text stay proportionate and easy to read

  @manual
  Scenario: Text has sufficient contrast against the panel background (WCAG 2.2 SC 1.4.3)
    Given any panel variant
    Then all text remains readable against the panel background

  @manual
  Scenario: Icon is easy to see against the panel background (WCAG 2.2 SC 1.4.11)
    Given a panel containing an icon
    Then the icon remains clearly visible against the panel background

  @manual
  Scenario: Reference numbers and identifiers remain readable
    Given a panel containing a reference number or identifier
    When viewed on different screen sizes or zoom levels
    Then the identifier remains clearly visible and readable

  @manual
  Scenario: Panel remains readable on small screens
    Given a panel
    When viewed on a mobile-width screen
    Then the heading, body content and icon remain readable without horizontal scrolling

  @manual
  Scenario: Icon remains aligned with wrapped content
    Given a panel with an icon and a long heading or body
    When the content wraps
    Then the icon remains visually aligned with the content
```
