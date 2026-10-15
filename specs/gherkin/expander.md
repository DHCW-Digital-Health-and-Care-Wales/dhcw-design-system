# Expander

**Component classes:** `.nhsw-expander`, `.nhsw-expander__button`, `.nhsw-expander__icon`, `.nhsw-expander__content`
**Doc page:** `preview/components/expander.html`
**Source:** `src/components/content/_expander.scss`, behaviour in `preview/assets/nhsw-docs.js`
**Example fixtures:** `expander-default.html`

## Automated test coverage

```gherkin
Feature: Expander — automated coverage

  Rule: Visual spec matches Figma Expander component

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Button padding
      Given the compiled CSS for .nhsw-expander__button
      Then it has 24px padding on all sides

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Icon size and gap
      Given the compiled CSS for .nhsw-expander__icon
      Then it is 28px by 28px
      And it has a 12px margin-right before the label

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Expanded content is flush with the button, not indented
      Given the compiled CSS for .nhsw-expander__content
      Then padding is 0 top, 24px right, 24px bottom, 24px left

  Rule: Hover/focus states and default appearance match the agreed design values

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Default state is a white box with a thicker bottom edge, hinting at more content below
      Given the compiled CSS for .nhsw-expander
      Then background-color is #ffffff
      And border is 1px solid #d8dde0 on all sides
      And the bottom edge is 4px thick instead of 1px

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Hover recolours the link text, icon and border together, and removes the underline
      Given the compiled CSS for .nhsw-expander:hover
      Then border-color becomes #7c2855
      And .nhsw-expander__link-text colour becomes #7c2855 with no underline
      And .nhsw-expander__icon background-color becomes #7c2855

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Focus highlights the icon+text heading with a yellow background, not the whole button
      Given the compiled CSS for .nhsw-expander__button:focus
      Then outline is none
      And .nhsw-expander__heading gets a #ffeb3b background with a solid black border-bottom, matching the focus style used elsewhere
      And .nhsw-expander__link-text and .nhsw-expander__icon both turn near-black (#0b0c0c), like the action link focus style
      And the link text loses its underline

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Icon stays top-aligned with wrapped text instead of centring
      Given the compiled CSS for .nhsw-expander__heading
      Then align-items is flex-start

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Link text can break within an unbreakable long word
      Given the compiled CSS for .nhsw-expander__link-text
      Then overflow-wrap is anywhere

    @automated
    # specs/tests/css/components/expander.test.js
    Scenario: Reverse variant swaps to a transparent box with white border, icon and text for use on dark backgrounds
      Given the compiled CSS for .nhsw-expander--reverse
      Then background-color is transparent and border-color is #ffffff
      And .nhsw-expander__link-text colour is #ffffff
      And .nhsw-expander__icon becomes a white circle with navy (#1b365d) glyph
      And hovering keeps everything white instead of switching to the purple hover colour

  Rule: Toggle behaviour

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Clicking the button toggles aria-expanded and the hidden content
      Given an .nhsw-expander__button with aria-expanded="false" controlling a hidden region
      When the button is clicked
      Then aria-expanded becomes "true" and the region's hidden attribute is removed
      When the button is clicked again
      Then aria-expanded becomes "false" and the region is hidden again
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Expander — manual verification

  @manual
  Scenario: Clicking the button opens and closes the section, with the icon flipping
    Given a closed expander
    When the button is clicked
    Then the section opens and the icon switches to its "open" state
    And clicking again closes it and switches the icon back

  @manual
  Scenario: Border and icon are easy to see against the background (WCAG 2.2 SC 1.4.11)
    Given an expander
    Then its border and toggle icon are clearly visible against the surrounding page

  @manual
  Scenario: Works the same with keyboard only as with a mouse (WCAG 2.2 SC 2.1.1)
    Given an expander button is focused via keyboard
    When Enter or Space is pressed
    Then it opens or closes exactly as a mouse click would

  @manual
  Scenario: Screen reader announces whether it's open or closed (WCAG 2.2 SC 4.1.2)
    Given a screen reader user activates an expander
    Then the announced state (expanded/collapsed) matches what's actually shown on screen

  @manual
  Scenario: Keyboard users can clearly see when the expander has focus (WCAG 2.2 SC 2.4.7)
    Given an expander header
    When it receives keyboard focus
    Then a clear visible focus indicator is shown, tightly around the icon and text
    And it looks the same whether focus was reached by keyboard or by clicking

  @manual
  Scenario: Accessible name matches visible label
    Given an expander labelled "Digital consent"
    When a screen reader announces the control
    Then the accessible name matches the visible heading text

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given an expander
    When browser zoom is increased to 200% or 400%
    Then the control and its content remain readable and operable without loss of information

  @manual
  Scenario: Multiple expanders work independently
    Given multiple expanders on a page
    When one expander is opened
    Then the other expanders remain unchanged unless configured otherwise

  @manual
  Scenario: Decorative icon is not announced by screen readers
    Given an expander with a decorative plus/minus icon
    When a screen reader announces the control
    Then only the expander label and expanded/collapsed state are announced

  @manual
  Scenario: Entire header acts as the toggle
    Given an expander
    When the user selects anywhere within the header area
    Then the section opens or closes

  @manual
  Scenario: Expanded content is hidden when collapsed
    Given a collapsed expander
    When the page is viewed or navigated with assistive technology
    Then the hidden content is not presented until the expander is opened

  @manual
  Scenario: Content remains readable on small screens
    Given an expander containing content
    When viewed on a narrow viewport
    Then the content remains readable without horizontal scrolling

  @manual
  Scenario: Long titles wrap correctly
    Given an expander with a long heading
    When displayed on a small screen
    Then the heading wraps without overlapping the icon or breaking the layout

  @manual
  Scenario: Stays readable on a dark background (WCAG 2.2 SC 1.4.3)
    Given the dark-background (reverse) variant of the expander
    Then the border, icon and text remain clearly visible against the dark background
    And focus still shows a solid yellow highlight with black text and icon
```
