# Action link

**Component classes:** `.nhsw-action-link`, `.nhsw-action-link__icon`, `.nhsw-action-link__text`, `.nhsw-action-link--navy`, `.nhsw-action-link--red`
**Doc page:** `preview/components/action-link.html`
**Source:** `src/components/actions/_action-link.scss`
**Example fixtures:** `action-link-default.html`, `action-link-dark.html`, `action-link-group.html`

## Automated test coverage

These scenarios are already verified by `npm test`. They are listed here for traceability only — do not re-run them by hand.

```gherkin
Feature: Action link — automated coverage

  Rule: Visual spec matches Figma Action link component (icon+text row)

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Icon sizing and gap
      Given the compiled CSS for .nhsw-action-link__icon
      Then it is 32px by 32px
      And it has an 8px margin-right before the label

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Default colour is link-blue throughout
      Given the compiled CSS for .nhsw-action-link
      Then the icon fill is #005aa8
      And the text colour is #005aa8

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Hover only recolours the text
      Given the compiled CSS for .nhsw-action-link
      When the component is hovered
      Then the text colour becomes #7c2855, with a 2px underline
      But no hover rule exists for .nhsw-action-link__icon, so the icon stays link-blue

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Link shrinks to fit its content instead of stretching full width
      Given the compiled CSS for .nhsw-action-link
      Then width is fit-content

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Focus state is a tight yellow highlight with a dark underline
      Given the compiled CSS for .nhsw-action-link:focus
      Then outline is none
      And background-color is #ffeb3b
      And there is a 4px solid #212b32 border-bottom
      And the text and icon both turn #0b0c0c

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Visited state recolours the link itself, not a descendant
      Given the compiled CSS for .nhsw-action-link:visited
      Then the colour is #212b32 set directly on the link (required for :visited to apply at all)

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: Active state underlines the text
      Given the compiled CSS for .nhsw-action-link:active .nhsw-action-link__text
      Then text-decoration is underline

    @automated
    # specs/tests/css/components/action-link.test.js
    Scenario: On dark backgrounds, hover and focus keep their own light-background colours
      Given the compiled CSS for .nhsw-action-link--reverse
      Then :hover text stays white, not the light-background hover colour
      And :focus text and icon stay #0b0c0c, even though :hover is later in the stylesheet

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-action-link, __icon, __text, --navy, --red
      Then each of those selectors is present in the compiled output

  Rule: Icons are hidden from assistive technology

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Decorative SVG icons are aria-hidden
      Given the "<fixture>" example fixture
      When an <svg> is not labelled with aria-label, a <title>, or role="img"
      Then it must carry aria-hidden="true"

      Examples:
        | fixture                     |
        | action-link-default.html    |
        | action-link-dark.html       |
        | action-link-group.html      |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Action link — manual verification

  @manual
  Scenario: Icon and label read as one action, with a clear gap between them
    Given an action link
    Then a blue circular arrow icon sits immediately before the text
    And there is a clear gap between the icon and the text, not crammed together

  @manual
  Scenario: Default colour is consistent — icon and text match
    Given an action link in its default state
    Then the icon and the text are the same link-blue colour

  @manual
  Scenario: Hover only recolours the text, not the icon
    Given an action link
    When you hover over it with a mouse
    Then the text changes colour
    And the icon stays link-blue

  @manual
  Scenario: Text is easy to read against its background (WCAG 2.2 SC 1.4.3)
    Given an action link in its default state
    Then the text is clearly readable against the white page background

  @manual
  Scenario: Stays readable on a dark background (WCAG 2.2 SC 1.4.3)
    Given an action link placed on a dark/navy background
    Then both the icon and the text remain clearly visible

  @manual
  Scenario: Screen reader only announces the link text, not the icon (WCAG 2.2 SC 4.1.2)
    Given an action link with a decorative icon
    When a screen reader reads it out
    Then only the link text is announced, with no extra description of the icon

  @manual
  Scenario: Text wraps correctly on smaller screens
    Given an action link with a long label
    When it is viewed on a narrow viewport
    Then the text wraps onto multiple lines instead of overflowing sideways

  @manual
  Scenario: Icon stays aligned with the first line when the label wraps
    Given an action link with a label that wraps onto multiple lines
    Then the icon lines up with the top of the first line of text
    And it does not float in the vertical centre of the whole wrapped block

  @manual
  Scenario: Action link does not overflow its container
    Given an action link whose label is a single very long word with no spaces
    Then it breaks within the word rather than forcing horizontal scroll

  @manual
  Scenario: Touch target remains usable on mobile
    Given an action link on a touch device or narrow viewport
    Then the whole icon-plus-text area is easy to tap without hitting a neighbouring link

  @manual
  Scenario: Keyboard focus is clearly visible around the whole link (WCAG 2.2 SC 2.4.7)
    Given an action link
    When it receives keyboard focus
    Then a solid focus highlight covers the full icon-plus-text area
    And the text gets an underline in the same colour as the icon

  @manual
  Scenario: Visited links are visually distinguishable
    Given an action link that has already been visited
    Then its text colour is visually distinct from an unvisited action link

  @manual
  Scenario: A pressed/active state is visible
    Given an action link
    When it is pressed with a mouse or activated on a touch device
    Then the text underlines immediately, before navigation happens

  @manual
  Scenario: Icon and text act as a single interactive target
    Given an action link containing an icon and text
    When a user clicks or taps either the icon or the text
    Then the same link action is triggered

  @manual
  Scenario: Remains usable at 200% and 400% browser zoom (WCAG 2.2 SC 1.4.10)
    Given an action link
    When the browser is zoomed to 200%, then 400%
    Then the link stays fully readable and clickable without overlapping neighbouring content

  @manual
  Scenario: Link length stress test
    Given action links with short, medium and very long labels shown together
    Then all of them keep the same icon-to-text gap and alignment rules
```
