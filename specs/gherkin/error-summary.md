# Error summary

**Component classes:** `.nhsw-error-summary`, `.nhsw-error-summary__title`
**Doc page:** `preview/actions/error-summary.html`
**Source:** `src/components/forms/_error-summary.scss`
**Example fixtures:** `error-summary-default.html`, `error-summary-date.html`, `error-summary-checkboxes.html`, `error-summary-timeout.html`

## Automated test coverage

```gherkin
Feature: Error summary — automated coverage

  Rule: Visual spec matches Figma Error summary component

    @automated
    # specs/tests/css/components/error-summary.test.js
    Scenario: Title spacing
      Given the compiled CSS for .nhsw-error-summary__title
      Then it has a 24px margin below it, before the error list

  Rule: Error link, error message and field label match the agreed design values

    @automated
    # specs/tests/css/components/error-summary.test.js
    Scenario: Error summary link is bold red and wins the colour regardless of stylesheet order
      Given the compiled CSS for .nhsw-error-summary__link.nhsw-link
      Then the colour is #d5281b
      And the font-weight is 700

    @automated
    # specs/tests/css/components/error-summary.test.js
    Scenario: Error summary link hover is a distinct darker red
      Given the compiled CSS for .nhsw-error-summary__link.nhsw-link:hover
      Then the colour is #951c13

    @automated
    # specs/tests/css/components/error-summary.test.js
    Scenario: Error message has no top margin
      Given the compiled CSS for .nhsw-error-message
      Then margin-top is 0

    @automated
    # specs/tests/css/components/error-summary.test.js
    Scenario: Label inside an errored field group matches the error message size
      Given the compiled CSS for .nhsw-form-group--error .nhsw-label
      Then font-weight is 400 (not bold)
      And font-size matches the error message's size

  Rule: Linked fields are properly described and marked invalid

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: aria-invalid fields sit alongside a visible error message
      Given the "<fixture>" example fixture
      When a field has aria-invalid="true"
      Then a .nhsw-error-message is present in its containing fieldset or form group

      Examples:
        | fixture                        |
        | error-summary-default.html     |
        | error-summary-date.html        |
        | error-summary-timeout.html     |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: hint and error text are connected via aria-describedby
      Given the "<fixture>" example fixture
      Then every .nhsw-hint/.nhsw-error-message with an id is referenced by some aria-describedby

      Examples:
        | fixture                        |
        | error-summary-default.html     |
        | error-summary-date.html        |
        | error-summary-checkboxes.html  |
        | error-summary-timeout.html     |

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Date input errors stay wrapped in fieldset + legend
      Given error-summary-date.html
      Then every .nhsw-date-input sits inside a <fieldset> with a <legend>

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario: Checkbox group errors stay wrapped in fieldset + legend
      Given error-summary-checkboxes.html
      Then the .nhsw-checkboxes group sits inside a <fieldset> with a <legend>

  Rule: Focus moves to the error summary and from it to the field, as in NHS.UK

    @automated
    # specs/tests/js/behaviours.test.js, specs/tests/njk/error-summary.test.js, specs/e2e/scenario-examples.spec.js
    Scenario: Keyboard focus moves to the error summary when the page loads with errors (SCEN-ERROR-003)
      Given an error summary marked data-module="nhsw-error-summary" (the macro adds it)
      When the page loads
      Then the summary takes focus
      And a summary without data-module, or with data-disable-auto-focus="true", does not

    @automated
    # specs/tests/js/behaviours.test.js, specs/e2e/scenario-examples.spec.js
    Scenario: A link in the summary focuses the field it points at
      Given an error summary link that points at a field, or the first option of a radio or checkbox group
      When the link is selected
      Then the field takes focus and its label or group legend is scrolled into view

    @automated
    # specs/e2e/scenario-examples.spec.js
    Scenario: Errors are listed in the same order as the form fields (SCEN-ERROR-010)
      Given error-summary-validation.html with several fields in error
      Then the summary links are in the same order as their fields in the form
```

> Example page for the manual checks: `preview/examples/error-summary-validation.html` (open it with `?submitted=1` to see the errors straight away).

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Error summary — manual verification

  @manual
  Scenario: Shows a clear "There is a problem" heading with a list of errors
    Given a form submitted with invalid answers
    Then an error summary appears with a heading and a list of what's wrong

  @manual
  Scenario: Error link moves focus to the relevant field (WCAG 2.2 SC 2.4.3)
    Given an error summary link
    When it is selected
    Then the page scrolls to the associated form field and keyboard focus moves to that field

  @manual
  Scenario: Keyboard focus moves to the error summary (WCAG 2.2 SC 3.3.1)
    Given a form submitted with errors
    When the page reloads
    Then keyboard focus moves to the error summary so users are immediately aware of the errors

  @manual
  Scenario: Screen reader announces the error summary
    Given a form submitted with errors
    When a screen reader user reaches the page
    Then the error summary heading and error messages are announced

  @manual
  Scenario: Error summary remains readable on mobile
    Given an error summary containing multiple errors
    When viewed on a narrow viewport
    Then all content remains readable without horizontal scrolling

  @manual
  Scenario: Error summary remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given an error summary is displayed
    When browser zoom is increased to 200% or 400%
    Then the summary remains readable, error links remain usable, and no content is lost or obscured

  @manual
  Scenario: Long error messages wrap correctly
    Given an error summary containing long validation messages
    When displayed on a small screen
    Then messages wrap without being truncated or overlapping other content

  @manual
  Scenario: Errors are not conveyed by colour alone (WCAG 2.2 SC 1.4.1)
    Given a field contains an error
    When it is displayed
    Then the error is communicated through text as well as visual styling

  @manual
  Scenario: Error text has sufficient contrast (WCAG 2.2 SC 1.4.3)
    Given an error summary and field errors
    When displayed
    Then all error text remains readable against the background

  @manual
  Scenario: Errors appear in the same order as the form fields
    Given a form with multiple errors
    When the error summary is displayed
    Then the errors are listed in the same order as the corresponding fields on the page
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Submitting an invalid form doesn't clear what you already typed** (WCAG 2.2 SC 3.3.7) — requires the service to correctly persist submitted values when it re-renders the page with errors. That's a server/form-handling concern, not something the error summary markup can guarantee on its own.
- **Error summary contains every error on the page** — the component only renders whatever `errorList` the service passes in; whether that list is actually complete (matches every invalid field on the page) is a service/validation-logic concern that can't be verified against the isolated component.
