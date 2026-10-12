# Tag

**Component classes:** `.nhsw-tag`, `--white`, `--grey`, `--green`, `--aqua-green`, `--blue`, `--purple`, `--pink`, `--red`, `--orange`, `--yellow`
**Doc page:** `preview/content/tag.html`
**Source:** `src/components/content/_tag.scss`
**Example fixtures:** `tag-status.html`, `tag-two-status.html`, `tag-all-colours.html`, `tag-colour-solid.html`, `tag-colour-tint.html`, `tag-summary-list.html`

## Automated test coverage

```gherkin
Feature: Tag — automated coverage

  Rule: Visual spec matches Figma Tag component

    @automated
    # specs/tests/css/components/tag.test.js
    Scenario: Base padding and border
      Given the compiled CSS for .nhsw-tag
      Then padding is 4px vertical / 8px horizontal
      And it has a 1px solid border

    @automated
    # specs/tests/css/components/tag.test.js
    Scenario Outline: Colour variant background/border/text match the Figma swatch
      Given the compiled CSS for .nhsw-tag--<colour>
      Then background, border and text colours match the values read from Figma

      Examples:
        | colour |
        | blue   |
        | grey   |
        | green  |

  Rule: All 10 colour modifiers exist and are distinct

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario Outline: Tag colour modifier resolves to a distinct rule
      Given the compiled CSS
      Then .nhsw-tag--<colour> exists as a selector

      Examples:
        | colour     |
        | white      |
        | grey       |
        | green      |
        | aqua-green |
        | blue       |
        | purple     |
        | pink       |
        | red        |
        | orange     |
        | yellow     |

  Rule: A two-part tag is announced as one phrase

    @automated
    # specs/tests/njk/tag-group.test.js, specs/tests/markup/tag-groups.test.js
    Scenario: Every two-part tag carries its hidden announcement text
      Given the nhswTagGroup macro, and every tag group in the preview pages and code samples
      Then each group has visually hidden "Tag: " first and ": " between its two tags
      And its text reads "Tag: <category>: <status>"

    @automated
    # specs/tests/css/components/tag.test.js
    Scenario: The hidden text does not break the flush join between the two parts
      Given a tag group whose first child is visually hidden text
      Then the border between the two tags is still removed, using :first-of-type
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Tag — manual verification

  @manual
  Scenario: All 10 colour variants are easy to read (WCAG 2.2 SC 1.4.3)
    Given each of the 10 tag colours
    Then the text is clearly readable against its background

  @manual
  Scenario: Status is understandable from the text alone, not just the colour (WCAG 2.2 SC 1.4.1)
    Given a status tag, e.g. "Complete" in green or "Overdue" in red
    Then the text label alone tells you the status, without needing to know what the colour means

  @manual
  Scenario: Two-part tag reads sensibly together
    Given a two-part tag, e.g. "Flu" and "Due vaccination"
    When a screen reader reads it
    Then it is announced as one phrase, "Tag: Flu: Due vaccination"
    And it is clear from the announcement that it is a tag and that both parts belong together

  @manual
  Scenario: Tags inside a summary list stay aligned
    Given a tag placed inside a summary list row
    Then it stays aligned correctly and doesn't break the row's layout

  @manual
  Scenario: Remains readable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a tag
    When browser zoom is increased to 200% or 400%
    Then the text remains readable and the tag remains visually intact without clipping

  @manual
  Scenario: Long tag labels remain readable
    Given a tag with a longer-than-expected label
    When it is displayed on a small screen or at high zoom levels
    Then the text remains readable and does not overflow or become clipped

  @manual
  Scenario: Tags remain readable on small screens
    Given one or more tags
    When viewed on a narrow viewport
    Then the tags remain readable and do not overlap surrounding content

  @manual
  Scenario: Multiple tags wrap sensibly
    Given multiple tags displayed together
    When the available width decreases
    Then the tags wrap or reflow without overlapping or becoming unreadable

  @manual
  Scenario: Two-part tag remains visually associated
    Given a two-part tag
    When it is displayed
    Then both parts appear visually related and are easily understood as a single status
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Reordering tags doesn't require drag-and-drop** (WCAG 2.2 SC 2.5.7) — only applies if a service builds a tag-reordering feature; the tag component itself has no reordering behaviour to test.
