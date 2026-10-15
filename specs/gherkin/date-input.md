# Date input

**Component classes:** `.nhsw-date-input`, `__label`
**Doc page:** `preview/components/date-input.html`
**Source:** `src/components/forms/_date-input.scss`
**Example fixtures:** `date-input-default.html`, `date-input-error-1.html`, `date-input-error-2.html`

## Automated test coverage

```gherkin
Feature: Date input — automated coverage

  Rule: Visual spec matches Figma Date input component

    @automated
    # specs/tests/css/components/date-input.test.js
    Scenario: Gap between day/month/year fields
      Given the compiled CSS for .nhsw-date-input
      Then the gap is 0 vertical / 24px horizontal

    @automated
    # specs/tests/css/components/date-input.test.js
    Scenario: Label sits close above its input
      Given the compiled CSS for .nhsw-date-input__label
      Then margin-bottom is 4px

  Rule: Every day/month/year field has a real, correctly-associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible inputs have an associated label
      Given the "<fixture>" example fixture
      Then every day/month/year input has a <label for> pointing at its id

      Examples:
        | fixture                    |
        | date-input-default.html    |
        | date-input-error-1.html    |
        | date-input-error-2.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture                    |
        | date-input-default.html    |
        | date-input-error-1.html    |
        | date-input-error-2.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: aria-invalid fields sit alongside a visible error message
      Given the "<fixture>" example fixture
      Then every [aria-invalid="true"] field has a .nhsw-error-message nearby

      Examples:
        | fixture                    |
        | date-input-error-1.html    |
        | date-input-error-2.html    |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Date inputs are wrapped in fieldset + legend
      Given the "<fixture>" example fixture
      Then every .nhsw-date-input sits inside a <fieldset> with a <legend>

      Examples:
        | fixture                    |
        | date-input-default.html    |
        | date-input-error-1.html    |
        | date-input-error-2.html    |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Date input — manual verification

  @manual
  Scenario: Fields identify their purpose so browsers can offer autofill (WCAG 2.2 SC 1.3.5)
    Given a production date-of-birth date input
    Then day/month/year fields are set up so browsers can offer to autofill them

  @manual
  Scenario: Tabbing moves day, then month, then year
    Given a date input with all three fields
    When a user tabs through it
    Then focus moves day, then month, then year, in that order

  @manual
  Scenario: On multi-question pages, it's clear which question each date belongs to
    Given a page asking more than one question, each with its own date input
    Then each date input's heading clearly says which question it's answering

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a day, month or year field
    When it receives keyboard focus
    Then a clear visible focus indicator is shown

  @manual
  Scenario: Date fields remain aligned and readable on small screens
    Given a date input
    When viewed on a narrow viewport
    Then the day, month and year fields remain readable and usable without overlapping or clipping

  @manual
  Scenario: Date input remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a date input
    When browser zoom is increased to 200% or 400%
    Then all date fields, labels and hint text remain readable and operable without loss of information

  @manual
  Scenario: Error messages identify which part of the date is wrong
    Given an invalid date has been entered
    When validation occurs
    Then the error message clearly explains what needs to be corrected

  @manual
  Scenario: Error links move focus to the date input
    Given a date field error appears in an error summary
    When the user selects the error link
    Then focus moves to the date input group

  @manual
  Scenario: Long question text doesn't break the layout
    Given a date input with a long question or hint text
    When viewed on a small screen or at high zoom levels
    Then the heading, hint text and fields remain clearly associated and readable

  @manual
  Scenario: Labels remain associated with the correct field
    Given a date input containing Day, Month and Year fields
    When a screen reader announces the fields
    Then each field is announced with its correct label
```
