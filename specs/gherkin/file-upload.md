# File upload

**Component classes:** `.nhsw-file-upload`, `.nhsw-file-upload__status`, `.nhsw-file-upload__actions`
**Doc page:** `preview/components/file-upload.html`
**Source:** `src/components/forms/_file-upload.scss`
**Example fixtures:** `file-upload-default.html`, `file-upload-reverse.html`

## Automated test coverage

```gherkin
Feature: File upload — automated coverage

  Rule: Visual spec matches Figma "Upload a file" component

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: Dashed drop-zone box
      Given the compiled CSS for .nhsw-file-upload
      Then the border is a 1px dashed line in the secondary colour (#4c6272)
      And padding is 28px on all sides
      And the internal gap is 20px

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: Status readout padding
      Given the compiled CSS for .nhsw-file-upload__status
      Then padding is 10px on all sides

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: Actions row gap
      Given the compiled CSS for .nhsw-file-upload__actions
      Then the gap between actions is 20px

  Rule: Hover, uploaded and focus states match the agreed design values

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: Hover turns the whole box white and the Choose file button turns blue with it
      Given the compiled CSS for .nhsw-file-upload:hover
      Then background-color is #ffffff
      And .nhsw-file-upload__button gets a light blue background (#d2e2f1) with blue border and text (#005eb8)

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: An error state shows a red border around the box
      Given the compiled CSS for .nhsw-form-group--error .nhsw-file-upload
      Then border-color is #d5281b

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: The uploaded-file state has a white background and a solid border
      Given the compiled CSS for .nhsw-file-upload--has-file
      Then background-color is #ffffff
      And border-style is solid

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: The filled status readout uses the dark secondary colour with white text
      Given the compiled CSS for .nhsw-file-upload__status--filled
      Then background-color is #4c6272
      And colour is #ffffff

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: "No file chosen" and "or drop file" use the standard dark text colour
      Given the compiled CSS for .nhsw-file-upload__status and .nhsw-file-upload__hint
      Then both use colour #212b32, not a greyed-out secondary colour

    @automated
    # specs/tests/css/components/file-upload.test.js
    Scenario: Focusing the hidden file input highlights the button with a background colour
      Given the compiled CSS for .nhsw-file-upload__input:focus + .nhsw-file-upload__button
      Then background-color is #ffeb3b and border is none

    @automated
    # specs/tests/js/docs-behaviors.test.js
    Scenario: Selecting a file updates the status text and adds the filled/has-file classes
      Given a .nhsw-file-upload__input
      When a file is selected and a change event fires
      Then the status text becomes the file name, and both the status and container get their "filled"/"has-file" classes
      When the selection is cleared
      Then the status text and classes revert to their empty state

  Rule: The file input itself always has a real, associated label

    @automated
    # specs/tests/markup/accessibility.test.js
    Scenario Outline: Visible inputs have an associated label
      Given the "<fixture>" example fixture
      Then every visible input (including the file input) has a <label for> pointing at its id

      Examples:
        | fixture                    |
        | file-upload-default.html   |
        | file-upload-reverse.html   |
```

## Manual test scenarios

Practical checks — look at the component and try it, no special tools needed unless noted. Where a check comes from an accessibility guideline, the WCAG reference is included in the scenario name so it's clear why it's there, without needing the full guideline spelled out.

```gherkin
Feature: File upload — manual verification

  @manual
  Scenario: Choosing a file opens the OS file picker and shows the file name after
    Given an empty file upload
    When a file is chosen via the OS file picker
    Then the selected file's name appears in the status area

  @manual
  Scenario: Mobile version stays usable on a small screen
    Given the mobile version of the file upload
    Then all its controls remain reachable and readable without odd wrapping or overlap

  @manual
  Scenario: Works for speech-recognition (Dragon) users after one extra interaction
    Given a user operating with Dragon NaturallySpeaking
    When they land on the page containing the file upload for the first time
    Then they may need to first click/tap elsewhere on the page once before the upload control responds — check this doesn't block them entirely

  @manual
  Scenario: Remains usable at 200% and 400% zoom (WCAG 2.2 SC 1.4.10)
    Given a file upload control
    When browser zoom is increased to 200% or 400%
    Then the control remains readable and operable without loss of information or functionality

  @manual
  Scenario: Screen reader announces the selected file
    Given a file has been selected
    When assistive technology reads the component
    Then the selected file name is available to the user

  @manual
  Scenario: Screen reader users can understand what file is being requested
    Given a screen reader user encounters a file upload
    When the control is announced
    Then the label is announced alongside the file upload control

  @manual
  Scenario: Keyboard users can upload a file (WCAG 2.2 SC 2.1.1)
    Given a file upload control
    When it receives keyboard focus and Enter or Space is pressed
    Then the file picker opens and a file can be selected without using a mouse

  @manual
  Scenario: Focus state is clearly visible (WCAG 2.2 SC 2.4.7)
    Given a file upload control
    When it receives keyboard focus
    Then the "Choose file" button shows a solid yellow highlight, not just a thin border

  @manual
  Scenario: Long file names do not break the layout
    Given a file with a long name has been selected
    When the file name is displayed
    Then the layout remains usable and the file name does not overlap other content

  @manual
  Scenario: Error state is clearly indicated (WCAG 2.2 SC 1.4.1)
    Given a file upload with an error
    Then the box shows a red border and an error message is displayed above it, so the error isn't conveyed by colour alone
```

## Additional implementation advice

These aren't testable against the isolated component in this library — they depend on how the page or service around it is actually built (form re-submission, cross-page consistency, backend session timing, and so on). The component library can describe and support the pattern, but only the real integration can prove it's correct. Worth checking whenever a service uses this component.

- **Reusing a previously uploaded file works, without re-uploading from disk** — requires the service to track and offer previously uploaded files. That's a feature of the surrounding application, not the file upload component itself.
