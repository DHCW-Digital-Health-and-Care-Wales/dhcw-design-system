# Table

**Component classes:** `.nhsw-table`, `__caption` (`--s`/`--m`/`--l`/`--xl`), `__header--numeric`, `__cell--numeric`, `.nhsw-table-responsive`, `__heading`
**Doc page:** `preview/content/table.html`
**Source:** `src/components/content/_table.scss`, `src/components/content/_session-row.scss`
**Example fixtures:** `table-basic.html`, `table-caption.html`, `table-numeric.html`, `table-missing-data.html`, `table-session-row.html`, `table-session-row-location.html`, `table-responsive.html`

## Automated test coverage

```gherkin
Feature: Table — automated coverage

  Rule: Visual spec matches Figma Table component (Desktop/Tablet cell)

    @automated
    # specs/tests/css/components/table.test.js
    Scenario: Header row bottom border
      Given the compiled CSS for .nhsw-table__head th
      Then it has a 2px solid #d8dde0 border-bottom

    @automated
    # specs/tests/css/components/table.test.js
    Scenario: Cell/header vertical padding from tablet up
      Given the compiled CSS for the table component
      Then padding-top and padding-bottom are both 12px

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-table, __caption, __header--numeric, __cell--numeric, nhsw-table-responsive, __heading
      Then each of those selectors is present in the compiled output

  Rule: Icons are hidden from assistive technology

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Decorative SVG icons in session-row tables are aria-hidden
      Given the "<fixture>" example fixture
      When an <svg> is not labelled with aria-label, a <title>, or role="img"
      Then it must carry aria-hidden="true"

      Examples:
        | fixture                            |
        | table-session-row.html             |
        | table-session-row-location.html    |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Table — manual verification

  @manual
  Scenario: Every table has a visible caption
    Given any table variant
    Then it has a caption describing what the table is for

  @manual
  Scenario: Column/row headers are correctly linked to their data
    Given a table with row and/or column headers
    When a screen reader reads a data cell
    Then the correct header is announced alongside it

  @manual
  Scenario: Missing data is shown explicitly, not left blank
    Given a table with some missing data
    Then empty cells show something explicit like "No data" rather than being silently empty

  @manual
  Scenario: Numeric columns are right-aligned and easy to scan
    Given a table with numeric columns
    Then the numbers are right-aligned, making them easy to compare down the column

  @manual
  Scenario: Responsive variant stays usable on a narrow screen
    Given the responsive table variant
    When viewed on a narrow screen
    Then each row's data is still clearly labelled and readable, not just a wall of numbers

  @manual
  Scenario: Keyboard focus is visible on interactive table content
    Given a table containing interactive elements (links, buttons, or actions)
    When a keyboard user tabs through them
    Then each interactive element displays a clear visible focus indicator

  @manual
  Scenario: Tables remain usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a table
    When browser zoom is increased to 200% or 400%
    Then the table remains readable and usable without loss of information

  @manual
  Scenario: Long cell content wraps correctly
    Given a table containing long cell values
    When viewed on a narrow screen or at high zoom levels
    Then cell content wraps correctly without overlapping, clipping or becoming unreadable

  @manual
  Scenario: Long column headings remain readable
    Given a table with long column headers
    When viewed on a small screen
    Then the headers remain readable and continue to identify the associated data correctly

  @manual
  Scenario: Data remains associated after responsive transformation
    Given the responsive table variant
    When viewed on a narrow screen
    Then each value remains clearly associated with its row or column heading
```
