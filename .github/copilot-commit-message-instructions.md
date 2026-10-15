# CommunityApplications Commit Message Instructions

These instructions apply when generating a commit message, including from the Visual Studio Git Changes "generate commit message" button. They must work using only the Git changes and any supplied context, with no Azure DevOps connection.

Every commit message MUST follow the Conventional Commits specification and MUST start with a type, such as `feat:`, `fix:` or `docs:`. A subject without a type prefix is wrong.

Format:

```text
type(scope): description

body

footer
```

The scope, body and footer are optional. The type and description are required.

Examples:

```text
docs: add Copilot commit-message instructions and setup guide
```

```text
feat(scheduling): allow appointments to be rescheduled

- add reschedule action to the appointment service
- validate the new slot against clinician availability

Refs AB#12345
```

```text
fix(demographics): handle missing date of birth in patient search
```

```text
ci(pipeline): add database build stage
```

### General rules

- Describe the actual changes being committed.
- Do not invent functionality that is not visible in the commits.
- Prefer the outcome of the changes made, over low-level implementation details.
- Use imperative wording.
- Keep the subject concise.
- Start the description after the colon with lower case unless a proper noun requires otherwise.
- Do not end the subject with a full stop.
- Do not add unnecessary prose such as "this commit".
- Do not state that acceptance criteria have been met unless the changes provide evidence for that claim.

### Conventional Commit types

Choose the type from the actual change, and don't simply infer from the branch name.

Use:

- `feat` - new application behaviour or capability
- `fix` - defect correction
- `refactor` - implementation change without intended behaviour change
- `test` - test-only change
- `docs` - documentation-only change
- `ci` - CI/CD pipeline behaviour
- `build` - build, packaging, dependency or database build tooling
- `perf` - performance improvement
- `chore` - maintenance that does not fit another type.

A `feature/us/*` branch does not mean that every commit must be a `feat`. For example, a test-only commit on a feature branch should still be: `test(scope):...`

### Branch conventions

CommunityApplications uses:

- `feature/us/{USER_STORY_NUMBER}`
- `feature/us/{DescriptiveBranchName}`
- `fix/bug/{BUG_NUMBER}`
- `fix/bug/{DescriptiveBranchName}`
- `release/{RELEASE_NUMBER}`
- `develop`
- `main`

Interpret the branches as follows.

#### `feature/us/{number}`

The numeric component is an Azure DevOps User Story ID.

Use Azure DevOps work-item information as context for **why** the change exists.

Use the local Git changes to determine **what** this commit actually changes.

#### `feature/us/{descriptive-name}`

There is no reliable Azure DevOps ID available from the branch name.

Do not invent or guess a work-item ID.

Generate the commit message from the actual Git changes and branch description.

#### `fix/bug/{number}`

The numeric component is an Azure DevOps Bug ID.

Use the bug context to understand the defect being addressed.

Use the local Git changes to determine what the commit actually changes.

#### `fix/bug/{descriptive-name}`

There is no reliable Azure DevOps ID available from the branch name.

Do not invent or guess a work-item ID.

#### `release/{release-number}`

This is a frozen release candidate or hotfix release branch.

Do not assume that work on a release branch is a `feat`.

Infer the commit type from the actual change.

#### `develop`

`develop` is the long-lived day-to-day integration branch.

Ordinary development should normally arrive through PRs from `feature/us/*` or `fix/bug/*`.

#### `main`

`main` represents software that has been released to Production.

Ordinary feature development should not be performed directly on `main`.

### Scope

Infer the scope from the primary domain, application or component changed.

Prefer stable domain-level scopes over individual classes, method names or filenames.

Good examples:

- `feat(scheduling):`
- `fix(demographics):`
- `refactor(cohort):`
- `test(locations):`
- `feat(stock):`
- `ci(pipeline):`
- `build(database):`
- `docs(branching):`

Avoid unnecessarily specific scopes such as:

`feat(appointment-cancellation-service):`

when:

`feat(scheduling):`

is an accurate and stable domain.

If the changes genuinely span several domains and no single scope is appropriate, omit the scope rather than inventing one.

### Commit body

Add a body when it provides useful context beyond the subject.

The body should describe important behaviour, decisions or groups of changes.

For a substantial change, short bullets are acceptable.

Do not create a long summary of every changed line.

### Azure DevOps references

When a numeric work-item ID has been confidently identified from the branch name or supplied context, add:

`Refs AB#{id}`

Example:

`Refs AB#12345`

Do not invent a work-item ID.

Do not add an Azure DevOps reference for a descriptive branch unless an ID has been explicitly established.

### Azure DevOps MCP usage

The Azure DevOps MCP connection is optional. A good commit message must be possible without it. The full branch-aware workflow is in `prompts/generate-commit.prompt.md`.

When Azure DevOps MCP tools are available and the branch contains a numeric User Story or Bug ID:

1. retrieve the work item;
2. use its title, description and acceptance criteria only as context;
3. use the Git changes as the source of truth for what was implemented;
4. do not modify the work item;
5. do not change work-item state;
6. do not create comments;
7. do not create or complete pull requests while generating a commit message (the `/create-pr` prompt handles that separately);
8. do not claim that all acceptance criteria are complete solely because they exist on the work item.

The work item explains intent. The code changes explain implementation.

When the MCP tools are unavailable, or a call fails:

- do not stop or ask the user to connect;
- generate the message from the Git changes and branch name alone;
- still add `Refs AB#{id}` if the numeric ID is in the branch name, because it does not depend on MCP;
- do not guess the intent, title or acceptance criteria of the work item;
- do not mention the missing connection inside the commit message.

If the user pastes the work-item title or description into the chat, treat it as supplied context in place of MCP retrieval.

### Breaking changes

If the changes clearly introduce a breaking change, use Conventional Commit breaking-change notation.

For example:

`feat(api)!: change appointment cancellation contract`

and include a `BREAKING CHANGE:` footer explaining the compatibility impact.

Do not mark a change as breaking unless the change demonstrates that it is.

### Output

Return only the commit message.

Do not include tool names, file names read, explanations or Markdown code fences.

Keep the subject to about 72 characters or fewer.

When the body covers more than one change, use short bullets, one per group of changes, rather than a single paragraph.

### Generated message quality

A good generated message should answer:

- What changed?
- Which domain was affected?
- Why was the change necessary, when useful?
- Which Azure DevOps work item does it relate to, when confidently known?

The final message must remain readable by a human and useful in Git history.