# Select

**Component classes:** `.nhsw-select`, `--s`, `--m`, `--l`
**Doc page:** `preview/components/select.html`
**Source:** `src/components/forms/_select.scss`
**Example fixtures:** `select-hint.html`, `select-error.html`, `select-service.html`, `select-widths.html`

## Automated test coverage

```gherkin
Feature: Select — automated coverage

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the design-system-rules exists in the compiled CSS
      Given design-system-rules.md documents nhsw-select
      Then the .nhsw-select selector is present in the compiled output

  Rule: Every select has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible selects have an associated label
      Given the "<fixture>" example fixture
      Then the select has a <label for> pointing at its id

      Examples:
        | fixture                |
        | select-hint.html       |
        | select-error.html      |
        | select-service.html    |
        | select-widths.html     |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture             |
        | select-hint.html    |
        | select-error.html   |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: aria-invalid select sits alongside a visible error message
      Given select-error.html
      Then the [aria-invalid="true"] select has a .nhsw-error-message nearby
```

> There is no dedicated Figma spacing/colour spec for select. Its focus-border treatment is covered by `input-base.test.js` (shared with input and textarea); its --s/--m/--l size modifiers are only checked for existence, not for exact width.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Select — manual verification

  @manual
  Scenario: Opening and choosing an option works with keyboard alone (WCAG 2.2 SC 2.5.7)
    Given a select field
    When a user opens it and chooses an option using only the keyboard
    Then it works without needing a mouse

  @manual
  Scenario: Long option lists are easy to scroll and choose from
    Given a select with many options, e.g. "Choose Pharmacy"
    Then a user can find and pick the right option without excessive difficulty

  @manual
  Scenario: Size variants are visibly different, sensible widths
    Given the s/m/l select size variants
    Then each is a clearly different, sensible width for its content

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a select field
    When it receives keyboard focus
    Then a clear visible focus indicator is shown around the control

  @manual
  Scenario: Selected option is clearly visible
    Given a select field with a chosen option
    When the field is displayed
    Then users can clearly identify the currently selected option

  @manual
  Scenario: Label remains associated with the select
    Given a select field
    When a screen reader announces it
    Then the field label is announced alongside the control

  @manual
  Scenario: Placeholder option isn't mistaken for a valid choice
    Given a select field with a default option such as "Please select"
    When the field is first displayed
    Then it is clear that a valid option has not yet been chosen

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a select field
    When browser zoom is increased to 200% or 400%
    Then the control remains readable and operable without loss of information

  @manual
  Scenario: Long selected values remain readable
    Given a select field containing long options
    When a long option is selected
    Then the selected value remains readable and is not unexpectedly truncated or clipped

  @manual
  Scenario: Select remains usable on small screens
    Given a select field
    When viewed on a narrow viewport
    Then the label, control and selected value remain readable without horizontal scrolling

  @manual
  Scenario: Clicking the label focuses the select
    Given a select field and its label
    When the user selects the label
    Then focus moves to the select field
```
