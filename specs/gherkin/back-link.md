# Back link

**Component classes:** `.nhsw-back-link`
**Doc page:** `preview/components/back-link.html`
**Source:** `src/components/actions/_back-link.scss`
**Example fixtures:** `back-link-default.html`, `back-link-dark.html`

## Automated test coverage

```gherkin
Feature: Back link — automated coverage

  Rule: Documentation page stays structurally valid

    @automated
    # specs/tests/markup/documentation-gaps.test.js
    Scenario: Every live preview on the doc page has a matching code sample
      Given preview/components/back-link.html
      Then the number of example-preview includes equals the number of code-viewer includes
      And no html_sample/njk_sample capture block is empty

  Rule: Hover and focus states match the agreed design values

    @automated
    # specs/tests/css/components/back-link.test.js
    Scenario: Hover recolours to #7c2855 and removes the underline
      Given the compiled CSS for .nhsw-back-link:hover
      Then the colour is #7c2855
      And text-decoration is none

    @automated
    # specs/tests/css/components/back-link.test.js
    Scenario: Focus state is a tight yellow highlight with a dark underline
      Given the compiled CSS for .nhsw-back-link:focus
      Then outline is none
      And background-color is #ffeb3b
      And the text colour is #212b32
      And there is a 4px solid #212b32 border-bottom

    @automated
    # specs/tests/css/components/back-link.test.js
    Scenario: On dark backgrounds, hover and focus keep their own light-background colours
      Given the compiled CSS for .nhsw-back-link--reverse
      Then :hover stays white with no underline
      And :focus text stays #212b32, even though :hover is later in the stylesheet
```

> **Coverage gap:** unlike most components, `nhsw-back-link` is not named in `.agent/component-registry.md` or `.agent/design-system-rules.md`, so it is not checked by `component-registry.test.js`'s class-existence sweep, and its example fixtures contain no form inputs or `<svg>`, so none of the `accessibility.test.js` checks exercise it either. Hover/focus states are covered by `components/back-link.test.js` (above); everything else below is manual-only.

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Back link — manual verification

  @manual
  Scenario: Shows a "<" arrow before the text
    Given a back link
    Then a "<" arrow appears immediately before the word "Back"

  @manual
  Scenario: Stays readable on a dark background (WCAG 2.2 SC 1.4.3)
    Given the dark-background variant of the back link
    Then the text remains clearly visible against the dark background

  @manual
  Scenario: Enough space around it that you don't tap the wrong thing (WCAG 2.2 SC 2.5.8)
    Given a back link placed near other links or buttons
    Then there is enough space that you can't easily tap the wrong one

  @manual
  Scenario: "Back link as a button" performs an action, not a navigation
    Given the "back link as a button" variant
    When it's activated
    Then it performs an action (e.g. clears something) rather than loading a new page

  @manual
  Scenario: Keyboard focus is clearly visible around the entire link (WCAG 2.2 SC 2.4.7)
    Given a back link
    When it receives keyboard focus
    Then a solid focus highlight appears tightly around the arrow and text
    And a dark underline appears beneath both

  @manual
  Scenario: Entire back link is one interactive target
    Given a back link containing an arrow and text
    When a user clicks either the arrow or the text
    Then the same navigation action is triggered

  @manual
  Scenario: Arrow and text remain aligned
    Given a back link
    Then the arrow and text are vertically aligned and read as a single action

  @manual
  Scenario: Hover state is clear and consistent with other links
    Given a back link
    When a user hovers over it
    Then both the arrow and the text change to a consistent colour
    And the underline disappears

  @manual
  Scenario: Back link remains readable on small screens
    Given a back link on a narrow viewport
    Then the link remains fully visible and usable

  @manual
  Scenario: Screen reader announces only the link text
    Given a back link with a decorative arrow
    When a screen reader announces the link
    Then only the link text is announced, with no extra description of the arrow

  @manual
  Scenario: Remains usable at 200% and 400% browser zoom (WCAG 2.2 SC 1.4.10)
    Given a back link
    When the browser is zoomed to 200%, then 400%
    Then the link stays fully readable and clickable without overlapping neighbouring content
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Takes you back to the previous page** — the component only ships a styled `<a>` (or `<button>` for the "as a button" variant); there's no built-in "go back" behaviour. Whether it actually lands on the previous page depends entirely on the `href` (or JS) the consuming app wires up. In every fixture here it's `href="#"`, so this genuinely can't be demonstrated in isolation — check it in the real service instead.
- **Previously entered answers are still there when you go back** (WCAG 2.2 SC 3.3.7) — when a user goes back to a previous page, the service must pre-populate fields with what they already entered (unless the data's no longer valid, or restoring it would be unsafe). This depends on how the surrounding page/service manages form state — it can't be verified against the back link component alone.
