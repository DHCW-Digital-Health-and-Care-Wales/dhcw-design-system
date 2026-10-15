# Notification banner

**Component classes:** `.nhsw-notification-banner`, `--success`, `__header`, `__title`, `__content`, `__heading`, `__link`
**Doc page:** `preview/components/notification-banner.html`
**Source:** `src/components/callouts/_notification-banner.scss`
**Example fixtures:** `notification-banner-default.html`, `notification-banner-service.html`, `notification-banner-success.html`

## Automated test coverage

```gherkin
Feature: Notification banner — automated coverage

  Rule: Visual spec matches Figma Attention banner (Important variant)

    @automated
    # specs/tests/css/components/notification-banner.test.js
    Scenario: Header background uses the correct dark-blue token
      Given the compiled CSS for .nhsw-notification-banner__header
      Then the background colour is #004281 (Extended/blue-dark), not the generic link-blue token

  Rule: Documented classes stay honest against the compiled stylesheet

    @automated
    # specs/tests/css/component-registry.test.js
    Scenario: Every class named in the component registry exists in the compiled CSS
      Given .agent/component-registry.md documents nhsw-notification-banner, --success, __header, __title, __content, __heading, __link
      Then each of those selectors is present in the compiled output
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: Notification banner — manual verification

  @manual
  Scenario: Heading plus colour, not colour alone, shows what kind of banner it is (WCAG 2.2 SC 1.4.1)
    Given a notification banner (default or success)
    Then it has a text heading ("Important"/"Success") as well as its colour treatment

  @manual
  Scenario: Notification heading is announced
    Given a screen reader user encounters a notification banner
    When it is announced
    Then the banner heading and message are announced together

  @manual
  Scenario: Link inside the banner is visually distinguishable from surrounding text
    Given a notification banner containing a link
    Then it's clearly distinguishable from the surrounding text — not relying on colour alone

  @manual
  Scenario: Keyboard focus is clearly visible on links (WCAG 2.2 SC 2.4.7)
    Given a notification banner contains one or more links
    When a keyboard user tabs to a link
    Then a clear visible focus indicator is shown
    This applies to any interactive content inside the banner.

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a notification banner
    When browser zoom is increased to 200% or 400%
    Then the banner remains readable and all links remain usable without horizontal scrolling

  @manual
  Scenario: Long banner content wraps correctly
    Given a notification banner containing a long title or message
    When viewed on a small screen or high zoom level
    Then the content wraps correctly without overlapping or being cut off

  @manual
  Scenario: Banner remains readable on small screens
    Given a notification banner
    When viewed on a narrow viewport
    Then all banner content remains readable and usable
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Same heading text reused consistently across a service** (WCAG 2.2 SC 3.2.4) — consistency across pages depends on how the service uses the banner over time, not a single rendered instance.
- **Success banner appears after the relevant action** — the fact that the banner correctly communicates the outcome of an action (e.g. a form submission) depends on how and when the service around it renders it, not something the isolated component can prove on its own.
