# Text input

**Component classes:** `.nhsw-input`, `--full`, `--half`, `--width-10` (etc.), `.nhsw-is-invalid`, `.nhsw-input-wrapper`, `__prefix`, `__suffix`
**Doc page:** `preview/components/input.html`
**Source:** `src/components/forms/_input.scss`, `src/components/forms/_input-wrapper.scss`
**Example fixtures:** `input-page-question.html`, `input-multi-question.html`, `input-fixed-widths.html`, `input-fluid-widths.html`, `input-hint.html`, `input-account-number.html`, `input-prefix-suffix.html`

## Automated test coverage

```gherkin
Feature: Text input — automated coverage

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the registry/rules docs exists in the compiled CSS
      Given .agent/component-registry.md and design-system-rules.md document nhsw-input, --full, --half, --width-10, nhsw-is-invalid, nhsw-input-wrapper, __prefix, __suffix
      Then each of those selectors is present in the compiled output

  Rule: Every text input has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible inputs have an associated label
      Given the "<fixture>" example fixture
      Then every input has a <label for> pointing at its id

      Examples:
        | fixture                        |
        | input-page-question.html       |
        | input-multi-question.html      |
        | input-fixed-widths.html        |
        | input-fluid-widths.html        |
        | input-hint.html                |
        | input-account-number.html      |
        | input-prefix-suffix.html       |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: label for= matches a real id= in the fixture
      Given the input example fixtures
      Then every label[for] resolves to an element with a matching id

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Inputs never rely on placeholder text as their only label
      Given the input example fixtures
      Then every input[placeholder] also has a real associated <label>

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint text is connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint with an id is referenced by some aria-describedby

      Examples:
        | fixture                    |
        | input-account-number.html  |
        | input-hint.html            |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Text input — manual verification

  @manual
  Scenario: You can click into the field and type
    Given a text input
    When a user clicks into it and types
    Then the text appears in the field as expected

  @manual
  Scenario: Typed text stays fully visible as you type
    Given a text input
    When a user types past the visible width
    Then the field scrolls sensibly and the text doesn't get cut off or hidden

  @manual
  Scenario: Pasting into the field works
    Given a text input
    When a user pastes text into it
    Then the pasted text appears correctly — paste is never blocked

  @manual
  Scenario: Fixed-width variants are roughly the right size for their expected content
    Given the fixed-width variants, e.g. "10 characters" and "20 characters"
    Then each is roughly wide enough to show that many characters comfortably, not noticeably bigger or smaller

  @manual
  Scenario: Format is explained in words, not just via the prefix/suffix symbol
    Given the prefix/suffix variant, e.g. a "£" prefix on a "Cost per item, in pounds" field
    Then the label or hint text also explains the expected format in words
    And this isn't left to the prefix/suffix alone, since aria-hidden="true" means screen readers never announce it

  @manual
  Scenario: Numeric fields show a numeric keyboard on mobile
    Given a numeric-only field, e.g. an account number
    When opened on a mobile device
    Then the numeric keyboard is shown rather than the full keyboard

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a text input
    When it receives keyboard focus
    Then a clear visible focus indicator is shown around the field

  @manual
  Scenario: Clicking the label focuses the input
    Given a text input and its label
    When the user selects the label
    Then focus moves to the associated input field

  @manual
  Scenario: Screen readers announce the label and hint text
    Given a screen reader user encounters a text input
    When the field is announced
    Then the label and any associated hint text are announced with the input

  @manual
  Scenario: Text input remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a text input
    When browser zoom is increased to 200% or 400%
    Then the label, hint text and input remain readable and operable without loss of information

  @manual
  Scenario: Long labels and hint text wrap correctly
    Given a text input with a long label or hint
    When viewed on a small screen or at high zoom levels
    Then the text wraps correctly without overlapping the input or other content

  @manual
  Scenario: Error state remains clear
    Given a text input with a validation error
    When the field is displayed
    Then the error is clearly communicated using text and visual styling, not colour alone

  @manual
  Scenario: Error message is associated with the field
    Given a text input with an error message
    When a screen reader announces the field
    Then the error message is available alongside the field information
```
