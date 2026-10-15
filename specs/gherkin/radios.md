# Radios

**Component classes:** `.nhsw-radios`, `--inline`, `__hint`, `__divider`, `__conditional`, `__conditional--hidden`, `__input`, `__label`
**Doc page:** `preview/components/radios.html`
**Source:** `src/components/forms/_radios.scss`, behaviour in `preview/assets/nhsw-docs.js`
**Example fixtures:** `radios-default.html`, `radios-error.html`, `radios-inline.html`, `radios-hints.html`, `radios-divider.html`, `radios-conditional.html`, `radios-small.html`

## Automated test coverage

```gherkin
Feature: Radios — automated coverage

  Rule: Visual spec matches Figma Radios component (40x40px circle)

    @automated
    # specs/tests/css/components/radios.test.js
    Scenario: Input hit target size
      Given the compiled CSS for .nhsw-radios__input
      Then it is 40px by 40px

    @automated
    # specs/tests/css/components/radios.test.js
    Scenario: Visible circle size, border and shape
      Given the compiled CSS for .nhsw-radios__label::before
      Then it is 40px by 40px
      And it has a 2px solid #4c6272 border
      And border-radius is 50% (a full circle)

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-radios, --inline, __hint, __divider, __conditional, __conditional--hidden
      Then each of those selectors is present in the compiled output

  Rule: Every radio has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible inputs have an associated label
      Given the "<fixture>" example fixture
      Then every radio input has a <label for> pointing at its id

      Examples:
        | fixture                  |
        | radios-default.html      |
        | radios-error.html        |
        | radios-inline.html       |
        | radios-hints.html        |
        | radios-divider.html      |
        | radios-conditional.html  |
        | radios-small.html        |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture               |
        | radios-default.html   |
        | radios-error.html     |
        | radios-divider.html   |
        | radios-hints.html     |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: aria-invalid radios sit alongside a visible error message
      Given radios-error.html
      Then every [aria-invalid="true"] field has a .nhsw-error-message nearby

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Radio groups are wrapped in fieldset + legend
      Given the "<fixture>" example fixture
      Then the .nhsw-radios group's containing <fieldset> has a <legend>

      Examples:
        | fixture                  |
        | radios-default.html      |
        | radios-error.html        |
        | radios-hints.html        |
        | radios-divider.html      |
        | radios-conditional.html  |

  Rule: Conditionally revealed content

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Conditional content is wired up and toggles with the radio's checked state
      Given a radio with data-aria-controls pointing at a hidden conditional block
      Then on load aria-controls is wired from the checked state (aria-expanded is not used here - it isn't a valid ARIA attribute on the radio role)
      When the radio is checked
      Then the target is revealed
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Radios — manual verification

  @manual
  Scenario: Selecting one radio deselects any other in the group
    Given a group of radios
    When one is selected, then another
    Then only the most recently selected one stays selected

  @manual
  Scenario: Conditional follow-up question appears/disappears correctly
    Given a radio that reveals a follow-up question when selected
    When it's selected
    Then the follow-up question appears
    And selecting a different radio in the group hides it again

  @manual
  Scenario: Divider option ("or") isn't mistaken for a selectable option
    Given a radio group with a text divider, e.g. "or"
    Then the divider is clearly not one of the selectable options

  @manual
  Scenario: Smaller variant is still easy to select accurately
    Given the smaller radios variant
    Then the circle and its hit area are still comfortable to select

  @manual
  Scenario: Hint text makes clear only one option can be chosen, where needed (WCAG 2.2 SC 3.3.2)
    Given a radio group where it isn't obvious only one option can be picked
    Then hint text such as "Select one option" is present

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a radio button receives keyboard focus
    When a keyboard user navigates through the group
    Then a clear visible focus indicator is shown

  @manual
  Scenario: Arrow keys move between radio options
    Given a radio group has focus
    When the user presses the Up, Down, Left or Right Arrow keys
    Then focus moves between the radio options and the newly focused option becomes selected

  @manual
  Scenario: Clicking the label selects the radio
    Given a radio option and its label
    When the user selects either the radio control or the label text
    Then that radio option is selected

  @manual
  Scenario: Radio groups remain usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a radio group
    When browser zoom is increased to 200% or 400%
    Then labels, hint text and radio controls remain readable and operable without loss of information

  @manual
  Scenario: Long option labels wrap correctly
    Given a radio option with a long label
    When viewed on a small screen or at high zoom levels
    Then the label wraps correctly without overlapping other options or becoming detached from its radio button

  @manual
  Scenario: Screen readers announce the group question
    Given a screen reader user encounters a radio group
    When they enter the group
    Then the question and any supporting hint text are announced before the radio options

  @manual
  Scenario: Conditional content remains clearly associated
    Given a radio option reveals additional content
    When the content appears
    Then the revealed content is clearly associated with the selected radio option

  @manual
  Scenario: Selected radio option is distinguishable without relying on colour alone (WCAG 2.2 SC 1.4.1)
    Given a selected radio option
    Then its selected state is communicated through the radio indicator and not through colour alone
```
