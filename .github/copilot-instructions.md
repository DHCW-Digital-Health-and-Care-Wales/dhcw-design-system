# CommunityApplications Copilot Instructions

## Commit messages

Every commit message MUST follow the Conventional Commits specification and MUST start with a type. A subject without a type prefix is wrong.

Format:

```text
type(scope): description

optional body

optional footer
```

Rules:

- Choose the type from the actual changes, not the branch name: `feat`, `fix`, `refactor`, `test`, `docs`, `ci`, `build`, `perf`, `chore`.
- Scope is optional. Use a stable domain-level scope such as `scheduling` or `demographics`. Omit it if the change spans several domains.
- Use imperative wording, lower case after the colon, no full stop, subject about 72 characters or fewer.
- Describe only what the changes show. Do not invent functionality.
- Make the subject specific: name what was added or changed, not just a category. Avoid vague words such as "defaults", "updates", "improvements" or "guidance" on their own.
- Add a body whenever the commit touches more than one file or more than one concern. Use one short bullet per distinct change, saying what changed and, where useful, why. A one-line message is only acceptable for a trivial single change.
- Prefer `docs` for documentation-only changes and `chore` only when no other type fits.
- If the branch is `feature/us/{number}` or `fix/bug/{number}`, add the footer `Refs AB#{number}`. Never guess an ID for descriptive branch names.
- Only mark a breaking change with `!` after the type or scope (for example `feat(api)!:`) and a `BREAKING CHANGE:` footer when the change clearly demonstrates it.
- When Azure DevOps MCP tools are available and the branch is `feature/us/{number}` or `fix/bug/{number}`, you MUST fetch work item {number} before drafting the message. Use its title and type only to inform wording. The subject and body must still describe the actual diff. Do not modify the work item.
- If the work item cannot be fetched, or no MCP tools are available, do not stop or ask. Draft the message from the diff alone and still add `Refs AB#{number}`.
- Return only the commit message, with no tool names, commentary or code fences.

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

To generate a branch-aware message with optional Azure DevOps context, run the `/generate-commit` prompt from Copilot Chat.
