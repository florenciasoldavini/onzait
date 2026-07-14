---
name: onzait-create-commit
description: Create, prepare, or split safe focused commits for the Onzait repository using Conventional Commits. Use when asked to commit all or selected changes, commit staged files, prepare a clean commit, or separate work into commits; scope and stage explicit files or hunks, run relevant verification, protect unrelated changes and secrets, and never push.
---

# Create an Onzait commit

Create one coherent, professionally described commit at a time. Follow nearer repository instructions when they conflict with this workflow and report the conflict.

## 1. Inspect repository context

Before staging or committing:

1. Read the nearest `AGENTS.md` and relevant contribution instructions.
2. Inspect the current branch and run `git status --short --branch`.
3. Inspect every modified, deleted, untracked, and already staged file.
4. Review the complete unstaged diff and staged diff.
5. Identify changes that predate the current task.

Treat existing unrelated changes as user-owned. Never discard, reset, overwrite, include, or silently reclassify them. Do not switch branches without explaining why. Never assume the whole working tree belongs in one commit.

## 2. Establish a coherent scope

Determine intended scope from, in order:

1. the user's explicit request;
2. files changed for the task;
3. the logical product or engineering outcome;
4. existing staged files;
5. repository conventions.

Keep one feature, fix, focused refactor, documentation update, CI change, migration slice, or test-only improvement per commit. Do not mix independent features, fixes, dependency work, broad formatting, generated noise, or unrelated documentation.

When multiple logical changes exist, propose file or hunk groupings. Commit all groups separately only when the user authorized all of them. Stop when safe separation is unclear.

## 3. Stage explicitly and review

Stage explicit paths or patch hunks. Prefer `git add <explicit-paths>`. Use patch staging when one file contains related and unrelated edits.

- Never use `git add .` unless every changed file has first been proven in scope.
- Preserve unrelated unstaged work.
- Never stage `.env.local`, credentials, secrets, temporary state, or accidental artifacts.
- Stage generated files only when intentionally versioned and required by the change.
- Do not create an empty commit.

If files are already staged, inspect them rather than assuming their scope is correct. Preserve valid user staging when possible. Stop if changing it could disrupt unclear user intent.

After staging, inspect the staged file list, `git diff --cached --stat`, and the complete `git diff --cached`. Confirm that every staged line is relevant and non-sensitive.

## 4. Protect secrets and sensitive data

Inspect the staged diff for API keys, access tokens, private keys, passwords, database URLs, Supabase service-role keys or temporary metadata, Google Maps server keys, Resend credentials, Sentry auth tokens, Vercel or EAS credentials, native configuration secrets, personal data, and `.env.local`.

Run configured secret scanning or pre-commit hooks when available. Never bypass scanning merely to commit, replace one real secret with another, expose values in the handoff, or commit a secret because it already existed locally.

On a suspected secret, stop. Report only the affected file and risk category, then recommend remediation without printing the value.

## 5. Verify the staged change

Choose checks from repository instructions and staged files. For normal application changes, consider:

```bash
npm run env:check
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Apply scope-specific checks:

- Backend or shared-contract changes: run `npm run build --prefix backend`.
- Supabase migrations, RLS, grants, triggers, functions, or database behavior: inspect migration safety and permissions, run relevant SQL tests when the environment is available, and confirm documentation.
- Documentation-only changes: inspect Markdown and links, confirm commands exist, and run environment drift checks only when relevant.
- CI changes: inspect workflow YAML, confirm referenced scripts, and run introduced or changed commands when practical.
- README changes: compare package-manager instructions, scripts, CI claims, lockfiles, and environment metadata to repository sources.
- Focused changes: run targeted tests when they provide the appropriate evidence.

Record passed, failed, skipped, and unavailable checks honestly. Explain environment limitations and never hide failures. Do not commit when a relevant required check fails unless the user explicitly authorizes committing despite that known failure; report that authorization and failure in the handoff.

## 6. Write the commit message

After the staged scope is final, read [references/commit-conventions.md](references/commit-conventions.md). Use it to select the Conventional Commit type and Onzait scope, write the concise imperative description, and decide whether a body or footer adds necessary context.

Ensure the message describes the complete staged outcome without unverifiable claims, invented issues, generated attribution, or unrelated concerns.

## 7. Commit with hooks enabled

Allow configured pre-commit hooks to run normally. Never use `--no-verify` unless the user explicitly requests it after the failure is explained. Do not disable linting or secret scanning or modify hook configuration just to pass.

If a hook fails:

1. Inspect the failure.
2. Fix it only when the fix is within scope.
3. Restage files changed by an automatic formatter.
4. Review the entire staged diff again.
5. Retry only after the staged content is correct.

Stop when the necessary fix would materially expand scope.

Immediately before committing, rerun `git status --short`, review the staged file list and complete cached diff, confirm the message matches, confirm no secrets or unrelated work are staged, and confirm the diff is non-empty.

Create the commit. Do not amend, create a fixup, or sign unless explicitly requested or existing repository/user configuration requires signing.

## 8. Verify the result

After committing:

1. Confirm the commit exists and read its SHA and title.
2. Inspect the committed file list and confirm it matches the intended scope.
3. Run `git status --short --branch`.
4. Confirm unrelated changes remain untouched.
5. Do not report success if hooks rejected the commit.

Never push, force-push, reset, delete branches, rewrite history, discard working-tree changes, bypass hooks without authorization, or use destructive cleanup commands. Delegate pushing and PR creation to `onzait-create-pr` when that skill exists.

## 9. Hand off evidence

After success, report:

- commit SHA and title;
- Conventional Commit type and scope;
- files included;
- verification commands and results;
- pre-commit hook results;
- uncommitted changes intentionally excluded;
- known failures, skipped checks, and follow-up work;
- confirmation that nothing was pushed.

If no commit was created, state exactly why.
