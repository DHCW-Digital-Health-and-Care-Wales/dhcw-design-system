# Buttons

**Component classes:** `.nhsw-button`, `--secondary`, `--outline`, `--exceptional`, `--warning`, `--warning-outline`, `--link`, `--small`, `.nhsw-button-group`
**Doc page:** `preview/components/buttons.html`
**Source:** `src/foundations/_button-base.scss`, `src/components/actions/_button.scss`, `src/components/actions/_button-group.scss`
**Example fixtures:** `button-primary.html`, `button-secondary.html`, `button-exceptional.html`, `button-warning.html`, `button-small.html`, `button-link.html`, `button-grouping.html`

## Automated test coverage

```gherkin
Feature: Buttons — automated coverage

  Rule: Base spacing matches Figma Button/Default > Primary/Default

    @automated
    # specs/tests/css/components/buttons.test.js
    Scenario: Padding and corner radius
      Given the compiled CSS for the shared button-base mixin
      Then padding is 12px vertical / 16px horizontal
      And the corner radius is 4px

    @automated
    # specs/tests/css/components/buttons.test.js
    Scenario: Icon-to-label gap is ready for icon buttons
      Given the compiled CSS for the shared button-base mixin
      Then there is a 12px gap between an icon and its label
      # No icon+text button is wired up in the docs yet, so this rule is currently
      # dormant in the live site, but the underlying CSS is already verified correct.

  Rule: Colour tokens match Figma STYLES > Colours

    @automated
    # specs/tests/css/figma-tokens.test.js
    Scenario Outline: Button colour tokens resolve to the values read from Figma
      Given the compiled tokens/colours module
      Then <token> resolves to <hex>

      Examples:
        | token                            | hex     |
        | $nhswales-primary-button      | #1b365d |
        | $nhswales-secondary-button    | #4c6272 |
        | $nhswales-delete-button       | #d5281b |
        | $nhswales-exceptional-button-light | #f5bb6b |
        | $nhswales-primary-button-shadow    | #0e1b2f |
        | $nhswales-exceptional-button-shadow | #554318 |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Buttons — manual verification

  @manual
  Scenario: Every variant is clearly clickable, not shrunk down (WCAG 2.2 SC 2.5.8)
    Given a primary, secondary, exceptional or warning button
    Then its clickable area is comfortably large, matching its visible size

  @manual
  Scenario: Each variant makes sense from its text alone, not just its colour (WCAG 2.2 SC 1.4.1)
    Given the warning (red) and exceptional (amber) buttons sitting near a primary button
    Then each has a clear text label so its purpose doesn't depend on the colour

  @manual
  Scenario: Button colour is easy to see against the page (WCAG 2.2 SC 1.4.11)
    Given any button variant
    Then it's clearly visible against a white page background

  @manual
  Scenario: Smaller button variant stays legible and tappable
    Given the smaller button variant
    Then the text stays legible and it's still comfortable to tap on mobile

  @manual
  Scenario: A group of buttons wraps sensibly on a narrow screen
    Given a group of buttons
    When viewed on a mobile-width screen
    Then they stack or wrap without overlapping or getting cut off

  @manual
  Scenario: Tabbing between buttons shows a visible focus outline
    Given a group of buttons
    When a user tabs through them
    Then each one shows a clear yellow focus outline as it's reached

  @manual
  Scenario: Buttons remain usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given any button variant
    When browser zoom is increased to 200% or 400%
    Then the button remains readable, operable and fully visible

  @manual
  Scenario: Hover state is clearly visible
    Given a pointer user hovers over a button
    When the pointer is positioned over the button
    Then a visible hover state is shown

  @manual
  Scenario: Button text remains readable and wraps correctly
    Given a button with a long label
    When viewed on a small screen or at high zoom levels
    Then the text remains readable and is not clipped, truncated unexpectedly or overlapped
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Double-clicking submit (or a slow connection) doesn't send the form twice** — needs debounce/disable-on-submit logic in the consuming form's own JS. The button component itself doesn't ship this behaviour.
