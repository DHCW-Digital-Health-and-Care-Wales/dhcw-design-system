# Tabs

**Component classes:** `.nhsw-tabs`, `__list`, `__tab`, `--selected`, `__panel`, `--hidden`
**Doc page:** `preview/content/tabs.html`
**Source:** `src/components/content/_tabs.scss`, behaviour in `preview/assets/nhsw-docs.js`
**Example fixtures:** `tabs-default.html`

## Automated test coverage

```gherkin
Feature: Tabs — automated coverage

  Rule: Visual spec matches Figma Tabs component

    @automated
    # specs/tests/css/components/tabs.test.js
    Scenario: Unselected tab padding
      Given the compiled CSS for .nhsw-tabs__tab
      Then padding is 8px vertical / 16px horizontal

    @automated
    # specs/tests/css/components/tabs.test.js
    Scenario: Selected tab padding
      Given the compiled CSS for .nhsw-tabs__tab--selected
      Then padding is 12px vertical / 16px horizontal

  Rule: Click behaviour

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Clicking a tab activates it and shows only its panel
      Given a tabs component with "One" selected
      When a user clicks the "Two" tab
      Then "Two" gains --selected and aria-selected="true"
      And "One" loses --selected and aria-selected becomes "false"
      And only panel-2 is shown (panel-1 gains --hidden)

  Rule: Keyboard behaviour

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: ArrowRight moves focus to the next tab and stops at the last tab (no wrapping, as in NHS.UK)
      Given a tab other than the last is focused
      When ArrowRight is pressed
      Then focus and selection move to the next tab
      And pressing it again on the last tab leaves focus and selection where they are

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: ArrowLeft moves focus to the previous tab and stops at the first tab (no wrapping, as in NHS.UK)
      Given a tab other than the first is focused
      When ArrowLeft is pressed
      Then focus and selection move to the previous tab
      And pressing it again on the first tab leaves focus and selection where they are

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Unrelated keys do not change the selected tab
      Given a tab is focused
      When an unrelated key (e.g. Tab) is pressed
      Then the currently selected tab does not change

  Rule: Keyboard and focus behaviour matches the NHS.UK tabs

    @automated
    # specs/tests/js/behaviours.test.js, specs/e2e/tabs.spec.js
    Scenario: Only the selected tab is a tab stop (roving tabindex)
      Given a tabs component with "One" selected
      Then "One" has tabindex="0" and every other tab has tabindex="-1"
      When another tab is selected
      Then the tab stop moves to that tab

    @automated
    # specs/tests/js/behaviours.test.js, specs/e2e/tabs.spec.js
    Scenario: Up and Down arrows are not intercepted
      Given a tab is focused
      When ArrowUp or ArrowDown is pressed
      Then the selection and focus do not change
      And the key is not prevented, so a screen reader can read down into the panel

  Rule: Small screens show all content, as in NHS.UK

    @automated
    # specs/tests/js/behaviours.test.js, specs/e2e/tabs.spec.js, specs/tests/css/components/tabs.test.js
    Scenario: Below the tablet breakpoint the tabs are switched off
      Given a viewport narrower than 40.0625em
      Then the tablist, tab and tabpanel roles, aria-selected, aria-controls and tabindex are removed
      And every panel is shown
      And the tabs are laid out as a plain list of links
      When a tab is pressed
      Then focus moves to its section and every panel stays visible

    @automated
    # specs/tests/js/behaviours.test.js, specs/e2e/tabs.spec.js
    Scenario: Resizing across the breakpoint switches the tabs on and off
      Given tabs switched off on a small screen
      When the window is widened past the breakpoint
      Then the tab roles and a single visible panel return, with the previously selected tab selected
      And no duplicate event listeners build up as the window is resized back and forth

  Rule: Tabs that do not fit wrap instead of scrolling, as in NHS.UK

    @automated
    # specs/tests/css/components/tabs.test.js, specs/e2e/tabs.spec.js
    Scenario: A tab strip that is too wide for its box wraps onto more rows
      Given tabs shown as tabs (at or above the tablet breakpoint) in a narrow column
      Then the tabs wrap onto further rows
      And the tab list never has a horizontal or vertical scrollbar

  Rule: Nested tabs are scoped correctly

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: A tabs instance nested inside another tabs panel is not double-bound
      Given an outer .nhsw-tabs containing an inner .nhsw-tabs within one of its panels
      When the inner tab is clicked
      Then its click handler fires exactly once, not twice
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Tabs — manual verification

  @manual
  Scenario: Clicking a tab shows only that tab's content
    Given a set of tabs
    When a different tab is clicked
    Then only that tab's panel is shown, and the others are hidden

  @manual
  Scenario: Arrow keys move between tabs and wrap around at the ends
    Given a tab is focused via keyboard
    When the right or left arrow key is pressed repeatedly
    Then focus moves to each tab in turn and wraps back around at the start/end

  @manual
  Scenario: Screen reader announces which tab is selected, and how many there are (WCAG 2.2 SC 4.1.2)
    Given a set of tabs
    When a screen reader user focuses one
    Then they hear its name, its position (e.g. "2 of 4"), and whether it's selected

  @manual
  Scenario: Long tab labels remain readable
    Given tabs with realistic long labels
    When viewed at different viewport sizes
    Then labels remain readable and the tab layout remains usable

  @manual
  Scenario: No tab is ever shown disabled
    Given a set of tabs
    Then none of them are greyed out or disabled

  @manual
  Scenario: Keyboard focus is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a tab receives keyboard focus
    When a keyboard user navigates between tabs
    Then a clear visible focus indicator is shown on the focused tab

  @manual
  Scenario: Active tab is visually distinct from inactive tabs
    Given a set of tabs
    When one tab is selected
    Then the active tab is clearly distinguishable without relying on colour alone (checks like different background, border treatment, position and font weight)

  @manual
  Scenario: Selected tab can be identified without colour alone (WCAG 2.2 SC 1.4.1)
    Given a selected tab
    When viewed by a user who cannot perceive colour differences
    Then its selected state is still clear

  @manual
  Scenario: Tabs remain usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a set of tabs
    When browser zoom is increased to 200% or 400%
    Then all tabs remain readable and operable without loss of information

  @manual
  Scenario: Tabs remain usable on small screens
    Given a set of tabs
    When viewed on a narrow viewport
    Then users can still access every tab without content being clipped or obscured

  @manual
  Scenario: Tab panel follows immediately after the tab list
    Given a tab is selected
    When a screen reader or keyboard user accesses the tab panel
    Then the associated content is presented immediately after the tabs
```
