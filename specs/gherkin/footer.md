# Footer

**Component classes:** `.nhsw-site-footer`, `__container`
**Doc page:** `preview/components/footer.html`
**Source:** `src/components/site/_footer.scss`
**Example fixtures:** `footer-default.html`, `footer-no-links.html`, `footer-navigation.html`

## Automated test coverage

```gherkin
Feature: Footer — automated coverage

  Rule: Visual spec matches Figma Footer component

    @automated
    # specs/tests/css/components/footer.test.js
    Scenario: Container padding
      Given the compiled CSS for .nhsw-site-footer__container
      Then padding is 30px vertical / 40px horizontal

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: nhsw-site-footer (referenced in design-system-rules.md) exists in the compiled CSS
      Given design-system-rules.md documents nhsw-site-footer
      Then the .nhsw-site-footer selector is present in the compiled output
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Footer — manual verification

  @manual
  Scenario: "No links" variant still looks tidy
    Given the footer variant with no navigation links
    Then the copyright/branding content is well-spaced, with no leftover empty gaps

  @manual
  Scenario: Every footer link is reachable by keyboard
    Given the footer navigation variant
    When a user tabs through it
    Then every link receives visible focus in a sensible order

  @manual
  Scenario: Footer links have a visible focus state (WCAG 2.2 SC 2.4.7)
    Given a footer containing links
    When a keyboard user tabs through them
    Then each link displays a clear visible focus indicator

  @manual
  Scenario: Footer is identifiable as a footer landmark
    Given a screen reader user navigates page landmarks
    When the footer is encountered
    Then it is identified as the page footer or content information region

  @manual
  Scenario: Footer remains readable on small screens
    Given a footer containing multiple link groups
    When viewed on a narrow viewport
    Then all links remain readable and usable without overlapping or horizontal scrolling

  @manual
  Scenario: Footer remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a footer
    When browser zoom is increased to 200% or 400%
    Then links, headings and supporting content remain readable and operable without loss of information

  @manual
  Scenario: Long link text wraps correctly
    Given a footer containing long link labels
    When viewed on a small screen or at high zoom levels
    Then link text wraps correctly without overlapping or becoming truncated

  @manual
  Scenario: Link groups remain visually distinct
    Given a footer with multiple navigation sections
    When it is displayed
    Then users can easily distinguish between the different groups of links

  @manual
  Scenario: Links are understandable out of context (WCAG 2.2 SC 2.4.4)
    Given a footer containing navigation links
    When assistive technology presents a list of links
    Then each link clearly describes its destination or purpose
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Help links sit in the same place and behave the same on every page** (WCAG 2.2 SC 3.2.6) — a cross-page consistency concern for the service as a whole, not verifiable from a single footer instance.
