---
description: Draft a CommunityApplications pull request title and description from the current branch, and optionally create it in Azure DevOps.
---

Draft a pull request for the current branch.

Follow the repository's CommunityApplications Copilot instructions.

## Process

1. Get the current branch: `git branch --show-current`.
2. Work out the target branch:
   - `feature/us/*` and `fix/bug/*` target `develop`;
   - `release/*` branches target `main`, unless told otherwise;
   - if the target is unclear, ask which branch to target.
3. Inspect what the PR contains, relative to the target branch:
   - `git log --oneline origin/{target}..HEAD`;
   - `git diff --stat origin/{target}...HEAD`;
   - `git diff origin/{target}...HEAD` for the detail.
4. If there are uncommitted changes, say so, because they will not be in the PR.
5. Extract the work-item ID from the branch name (see below).
6. Optionally enrich with Azure DevOps context (see below).
7. Draft the title and description.

If the branch has no commits ahead of the target, say so and stop.

## Work-item ID

If the branch matches `feature/us/{number}` the number is an Azure DevOps User Story ID.

If the branch matches `fix/bug/{number}` the number is an Azure DevOps Bug ID.

If the branch uses a descriptive name rather than a number, do not guess a work-item ID and omit the work-item line.

The ID comes from the branch name alone. Include it whether or not Azure DevOps is reachable.

## Azure DevOps enrichment

Always try to enrich the PR from Azure DevOps. Do this before drafting, every time a numeric ID is present, without waiting to be asked.

1. Use the Azure DevOps MCP tools to retrieve the work item (the `wit_work_item` tool with action `get`).
2. Use the title, description and acceptance criteria to understand why the change exists.
3. Do not modify the work item or change its state.
4. Do not claim acceptance criteria are met unless the changes show it.
5. The diff remains the source of truth for what the PR changes.

If no Azure DevOps MCP tools are available, try anyway by checking for them, and if none can be found or the call fails or times out:

1. do not retry repeatedly or stop;
2. draft the PR from the Git changes alone;
3. say clearly in one line at the top of your reply that Azure DevOps context could not be retrieved, so the user can connect and re-run if they want;
4. keep the `AB#{id}` work-item line, because it comes from the branch name.

If the branch has no numeric ID there is nothing to retrieve, so skip enrichment and say the branch has no work-item ID.

## Title

Use the Conventional Commits shape for the whole change:

```text
type(scope): description
```

Choose the type from the actual changes, not the branch name. Keep it specific, imperative, lower case after the colon, with no full stop and about 72 characters or fewer.

## Description

Use these sections:

```text
## Summary
One to three sentences on what this PR does and why.

## Changes
- one bullet per distinct change, grouped by area

## Testing
What the changes show was tested, such as test files added or changed. If nothing in the diff shows testing, write "No test changes in this PR." Do not claim tests were run.

## Work item
AB#{id}
```

Omit the Work item section when no ID is known.

Describe only what the diff shows. Do not invent functionality. Call out anything a reviewer should check, such as database changes, configuration changes, breaking changes or follow-up work.

## Creating the PR

Show the title and description first and ask whether to create the pull request.

Create it only when the user explicitly confirms, and only if Azure DevOps MCP tools that can create pull requests are available. Before creating it:

1. check the branch has been pushed to the remote, and if not, tell the user and ask before pushing;
2. create the PR from the current branch to the target branch with the `repo_pull_request_write` tool and action `create`, using the repository name from `git remote -v`, the title and the description, and report the PR ID and URL it returns;
3. do not set auto-complete, approve, vote on or complete the PR;
4. do not add reviewers or link work items unless asked.

If the create call fails, show the error text exactly, do not retry repeatedly, and give the title and description for pasting into Azure DevOps.

If the tools are unavailable, or the user does not confirm, give the title and description for pasting into Azure DevOps and do not mention the missing connection beyond one short line.

## Output

Return the title and description in the shape above, then the question about creating the PR.

Do not wrap the title or description in a Markdown code block.
