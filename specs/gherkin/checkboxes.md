# Checkboxes

**Component classes:** `.nhsw-checkboxes`, `__hint`, `__divider`, `__conditional`, `__conditional--hidden`, `__input`, `__label`
**Doc page:** `preview/components/checkboxes.html`
**Source:** `src/components/forms/_checkboxes.scss`, behaviour in `preview/assets/nhsw-docs.js`
**Example fixtures:** `checkboxes-default.html`, `checkboxes-error.html`, `checkboxes-inline.html`, `checkboxes-hints.html`, `checkboxes-none.html`, `checkboxes-conditional.html`, `checkboxes-small.html`

## Automated test coverage

```gherkin
Feature: Checkboxes — automated coverage

  Rule: Visual spec matches Figma Checkboxes component (40x40px input square)

    @automated
    # specs/tests/css/components/checkboxes.test.js
    Scenario: Input hit target size
      Given the compiled CSS for .nhsw-checkboxes__input
      Then it is 40px by 40px

    @automated
    # specs/tests/css/components/checkboxes.test.js
    Scenario: Visible box size, border and shape
      Given the compiled CSS for .nhsw-checkboxes__label::before
      Then it is 40px by 40px
      And it has a 2px solid #4c6272 border
      And border-radius is 0 (square, not rounded)

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-checkboxes, __hint, __divider, __conditional, __conditional--hidden
      Then each of those selectors is present in the compiled output

  Rule: Every checkbox has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible inputs have an associated label
      Given the "<fixture>" example fixture
      Then every checkbox input has a <label for> pointing at its id

      Examples:
        | fixture                        |
        | checkboxes-default.html        |
        | checkboxes-error.html          |
        | checkboxes-inline.html         |
        | checkboxes-hints.html          |
        | checkboxes-none.html           |
        | checkboxes-conditional.html    |
        | checkboxes-small.html          |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture                        |
        | checkboxes-default.html        |
        | checkboxes-error.html          |
        | checkboxes-hints.html          |
        | checkboxes-none.html           |
        | checkboxes-conditional.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: aria-invalid checkboxes sit alongside a visible error message
      Given checkboxes-error.html
      Then every [aria-invalid="true"] field has a .nhsw-error-message nearby

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Checkbox groups are wrapped in fieldset + legend
      Given the "<fixture>" example fixture
      Then the .nhsw-checkboxes group's containing <fieldset> has a <legend>

      Examples:
        | fixture                        |
        | checkboxes-default.html        |
        | checkboxes-error.html          |
        | checkboxes-hints.html          |
        | checkboxes-none.html           |
        | checkboxes-conditional.html    |

  Rule: Conditionally revealed content and the "None of these" exclusive option

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Conditional content is wired up and toggles with the checkbox
      Given a checkbox with data-aria-controls pointing at a hidden conditional block
      Then on load aria-controls is wired from the checked state (aria-expanded is not used here - it isn't a valid ARIA attribute on the checkbox role)
      When the checkbox is checked
      Then the target is revealed
      When it is unchecked again
      Then the target is hidden again

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: The exclusive "None of these" option clears other selections and vice versa
      Given a group of checkboxes with one marked data-checkbox-exclusive
      When the exclusive option is checked
      Then all other checked options in the group are unchecked
      When any other option is subsequently checked
      Then the exclusive option is unchecked
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Checkboxes — manual verification

  @manual
  Scenario: Ticking a checkbox reveals its conditional follow-up question correctly
    Given a checkbox that reveals a follow-up question when ticked
    When it's ticked
    Then the follow-up question appears
    And unticking it hides the question again

  @manual
  Scenario: "None of these" clears other ticked boxes, and vice versa
    Given a group of checkboxes with a "None of these" option
    When "None of these" is ticked
    Then any other ticked boxes in the group are cleared
    And ticking any other option afterwards clears "None of these"

  @manual
  Scenario: Smaller variant is still easy to tick accurately
    Given the smaller checkboxes variant
    Then the box and its hit area are still comfortable to tick

  @manual
  Scenario: Inline layout wraps sensibly on a narrow screen
    Given the inline checkboxes variant
    When viewed on a mobile-width screen
    Then the options wrap onto new lines without overlapping

  @manual
  Scenario: Screen reader users are made aware when a conditional question appears (WCAG 2.2 SC 4.1.2)
    Given a checkbox that reveals a conditional follow-up question
    When it's ticked while using a screen reader
    Then the user is made aware new content has appeared
    And this is a known limitation — only expect it to work well for simple, easy-to-understand questions

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a checkbox receives keyboard focus
    When a keyboard user tabs through the options
    Then a clear visible focus indicator is shown on the focused checkbox

  @manual
  Scenario: Keyboard users can tick and untick options
    Given a checkbox has keyboard focus
    When Space is pressed
    Then the checkbox is selected or deselected

  @manual
  Scenario: Clicking the label ticks the checkbox
    Given a checkbox and its label
    When the user selects either the checkbox or its text label
    Then the checkbox state changes

  @manual
  Scenario: Checked state is clear without relying on colour alone (WCAG 2.2 SC 1.4.1)
    Given a selected checkbox
    When viewed by a user who cannot perceive colour differences
    Then the selected state is communicated through a visible tick as well as any colour change

  @manual
  Scenario: Checkboxes remain usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a checkbox group
    When browser zoom is increased to 200% or 400%
    Then labels and controls remain readable and operable without loss of information

  @manual
  Scenario: Long labels wrap correctly
    Given a checkbox option with a long label
    When viewed on a small screen or at high zoom levels
    Then the label wraps correctly without overlapping other options or detaching from its checkbox

  @manual
  Scenario: Conditional content remains visually associated
    Given a checkbox reveals additional content
    When the content is displayed
    Then it is clearly associated with the checkbox that revealed it
    And this applies to the conditional reveal pattern

  @manual
  Scenario: Checkbox group purpose is announced
    Given a screen reader user encounters a checkbox group
    When the group is announced
    Then the group label and instructions are announced before the options
```
