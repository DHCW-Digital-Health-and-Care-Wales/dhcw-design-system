---
description: Generate a CommunityApplications Conventional Commit message from the current Git changes and, where available, Azure DevOps work-item context.
---

Generate a commit message for the current changes.

Follow the repository's CommunityApplications commit-message instructions.

## Process

1. Get the current branch: `git branch --show-current`.
2. Get the changes to describe:
   - if there are staged changes, use `git diff --staged`;
   - otherwise use `git diff` and `git status`, and say the changes are unstaged.
3. Determine the Conventional Commit type from the actual changes, not the branch name.
4. Infer a stable domain-level scope where appropriate.
5. Extract the work-item ID from the branch name (see below).
6. Optionally enrich with Azure DevOps context (see below).

## Work-item ID

If the branch matches `feature/us/{number}` the number is an Azure DevOps User Story ID.

If the branch matches `fix/bug/{number}` the number is an Azure DevOps Bug ID.

If the branch uses a descriptive name rather than a number, or is `develop`, `main` or `release/*`, do not guess a work-item ID and omit the footer.

The ID comes from the branch name alone. Add `Refs AB#{id}` to the footer whenever a numeric ID is present, whether or not Azure DevOps is reachable.

## Azure DevOps enrichment (optional)

Enrichment only adds context about why the change exists. It is never required.

If Azure DevOps MCP tools are available and a numeric ID is present:

1. retrieve the work item (the `wit_work_item` tool with action `get`);
2. use the title, description and acceptance criteria to understand intent;
3. do not modify the work item;
4. do not assume all acceptance criteria have been implemented;
5. use the Git changes as the source of truth for the implementation.

If the MCP tools are unavailable, or the call fails or times out:

1. continue without them and do not retry repeatedly;
2. write the message from the Git changes alone;
3. keep the `Refs AB#{id}` footer;
4. do not mention the failure in the commit message;
5. after the message, add one line outside it: `Note: Azure DevOps context unavailable; message based on Git changes only.`

## Output

Return only the proposed commit message, plus the optional note above when Azure DevOps context was unavailable.

Use:

```text
type(scope): description

optional useful body

optional Azure DevOps footer
```

The type is required (`feat`, `fix`, `docs` and so on). The block above only shows the shape. Do not wrap your actual output in a Markdown code block.

If there are no changes to describe, say so instead of inventing a message.
