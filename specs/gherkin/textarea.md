# Textarea

**Component classes:** `.nhsw-textarea`
**Doc page:** `preview/forms/textarea.html`
**Source:** `src/components/forms/_textarea.scss`, character-counter behaviour in `preview/assets/nhsw-docs.js`
**Example fixtures:** `textarea-default.html`, `textarea-sized.html`, `textarea-error.html`, `textarea-consent.html`

## Automated test coverage

```gherkin
Feature: Textarea — automated coverage

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the design-system-rules exists in the compiled CSS
      Given design-system-rules.md documents nhsw-textarea
      Then the .nhsw-textarea selector is present in the compiled output

  Rule: Every textarea has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible textareas have an associated label
      Given the "<fixture>" example fixture
      Then the textarea has a <label for> pointing at its id

      Examples:
        | fixture                  |
        | textarea-default.html    |
        | textarea-sized.html      |
        | textarea-error.html      |
        | textarea-consent.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Textarea never relies on placeholder text as its only label
      Given the textarea example fixtures
      Then every textarea[placeholder] also has a real associated <label>

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture                  |
        | textarea-default.html    |
        | textarea-error.html      |
        | textarea-consent.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: aria-invalid textarea sits alongside a visible error message
      Given textarea-error.html
      Then the [aria-invalid="true"] textarea has a .nhsw-error-message nearby

  Rule: Character counter behaviour (data-max-length)

    @automated
    # specs/tests/js/behaviours.test.js
    Scenario: The live region is created by script, not written into the page
      Given a textarea with data-max-length="10" and a count element with no aria-live
      When nhsw-behaviours.js runs
      Then exactly one visually hidden aria-live="polite" region exists
      And the visible count is aria-hidden="true"
      And the original count element stays as the textarea's aria-describedby description, visually hidden
      And the hard maxlength attribute is removed

    @automated
    # specs/tests/js/behaviours.test.js
    Scenario: The live region only announces once typing has paused
      Given a focused textarea with data-max-length="10"
      When the user types
      Then the live region is not written to on each keystroke
      And once typing has paused for 500ms it is updated, checked every 1000ms (as in NHS.UK)
      And it stops checking when the field loses focus

    @automated
    # specs/tests/js/behaviours.test.js
    Scenario: Full count shown with no input
      Given a textarea with data-max-length="10"
      Then the visible counter reads "You have 10 characters remaining"

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Counter counts down as the user types
      When the user types "hello" (5 characters)
      Then the counter reads "You have 5 characters remaining"

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Singular "character" is used when exactly 1 remains
      When 9 of 10 characters are used
      Then the counter reads "You have 1 character remaining"

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Counter switches to "too many" wording once the limit is exceeded, without throwing
      When the user types 14 characters into a 10-character limit
      Then the counter reads "You have 4 characters too many"

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Singular "character" is used when exactly 1 too many
      When the user types 11 characters into a 10-character limit
      Then the counter reads "You have 1 character too many"
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Textarea — manual verification

  @manual
  Scenario: You can click in and type across multiple lines
    Given a textarea
    When a user clicks into it and types multiple lines
    Then the text wraps and appears as expected

  @manual
  Scenario: Pasting into the field works
    Given a textarea
    When a user pastes text into it
    Then the pasted text appears correctly — paste is never blocked

  @manual
  Scenario: Character counter counts down correctly, and doesn't break when you go over
    Given a textarea with a character limit and live counter
    When a user types past the limit
    Then the counter keeps counting (going negative) without breaking or freezing

  @manual
  Scenario: Field height suits the amount of content someone is likely to write
    Given the sized textarea variant
    Then its visible height roughly matches how much someone is expected to write

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a textarea
    When it receives keyboard focus
    Then a clear visible focus indicator is shown around the field

  @manual
  Scenario: Clicking the label focuses the textarea
    Given a textarea and its label
    When the user selects the label
    Then focus moves to the textarea

  @manual
  Scenario: Labels and hint text are announced by screen readers
    Given a screen reader user encounters a textarea
    When the field is announced
    Then the label and any associated hint text are announced alongside the textarea

  @manual
  Scenario: Textarea remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a textarea
    When browser zoom is increased to 200% or 400%
    Then the label, hint text, character counter and textarea remain readable and operable without loss of information

  @manual
  Scenario: Character counter is available to screen reader users
    Given a textarea with a character counter
    When a screen reader user enters text
    Then the remaining or exceeded character count is announced once typing pauses, not on every keystroke
    And reading the whole page does not jump to or announce the count
    And moving back into the field reads the current count as part of its description

  @manual
  Scenario: Character counter remains readable at longer lengths
    Given a textarea with a character counter
    When the character count changes to large values or goes past the limit
    Then the counter remains readable and does not overlap surrounding content

  @manual
  Scenario: Long text remains editable and readable
    Given a textarea containing multiple paragraphs
    When a user scrolls through the content
    Then the current editing position and surrounding text remain visible

  @manual
  Scenario: Long labels and hint text wrap correctly
    Given a textarea with a long question or hint text
    When viewed on a small screen or at high zoom levels
    Then the content wraps correctly without overlapping the textarea

  @manual
  Scenario: Error messages are clearly associated with the textarea
    Given a textarea contains a validation error
    When the error is displayed
    Then the error message is clearly associated with the textarea and does not rely on colour alone

  @manual
  Scenario: Users can still enter text when they exceed the character limit
    Given a textarea with a character counter
    When a user types beyond the recommended limit
    Then text entry continues without being blocked and the counter switches to "You have xx characters too many"
```
