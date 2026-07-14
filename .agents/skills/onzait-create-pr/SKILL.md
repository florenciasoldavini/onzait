---
name: onzait-create-pr
description: Publish or prepare a focused Onzait GitHub pull request safely. Use for Onzait requests to create, open, publish, push, or prepare a branch for review or a PR to development or main; verify branch scope, commits, tests, security, documentation, and the current repository pull request template before pushing and creating the PR.
---

# Publish an Onzait pull request

Publish only work that is coherent, verified, safe to share, and authorized by the user. Do not merge or enable auto-merge.

## 1. Establish repository state

Before writing, committing, pushing, or creating a PR:

1. Read the nearest `AGENTS.md` and relevant contribution, architecture, security, environment, database, and deployment documentation.
2. Read `.github/pull_request_template.md` when it exists.
3. Inspect:
   - the current branch;
   - `git status --short --branch`;
   - configured remotes and the intended remote URL;
   - the current branch upstream, allowing for no upstream;
   - all commits and the complete diff between the intended base and `HEAD`;
   - untracked and uncommitted files.
4. Refresh remote evidence when needed and permitted. Inspect recent PRs or branch structure when that evidence is available.
5. Treat pre-existing unrelated changes as user-owned. Never discard, reset, overwrite, stage, commit, or publish them.

Use read-only Git inspection first. Do not infer scope from the latest commit alone.

## 2. Select the base and head

Determine the base in this order:

1. Use the user's explicit base.
2. Follow repository instructions.
3. Follow current branch conventions.
4. Use recent PR and branch evidence.

While Onzait uses an integration branch, target feature PRs to `development`. If repository evidence later shows a feature-to-main workflow, target `main`. Ask only when conflicting evidence prevents a safe choice.

Never:

- create a PR from a base branch to itself;
- create a feature PR directly from `main` without a separate feature branch;
- push the base branch as part of this workflow.

Confirm that the current branch is the intended feature branch before publishing.

## 3. Audit scope and commit readiness

Review every commit in `base..HEAD` and every file in the complete base-to-head diff. Identify unrelated commits or files, generated output, temporary files, environment files, secrets, and native build artifacts.

- Stop and recommend splitting the work when the branch contains multiple unrelated changes.
- Never silently add unrelated files or commits.
- Do not rewrite published history merely for visual cleanliness.
- Preserve unrelated working-tree changes.

If intended changes remain uncommitted, use `onzait-create-commit` only when that skill exists and the user has authorized committing. Do not duplicate its commit workflow here. If authorization is unclear, stop and state what must be committed. Never use broad staging such as `git add .` unless every changed file has been proven in scope.

## 4. Review security and configuration

Inspect the full diff for credentials, private configuration, personal data, and unsafe trust-boundary changes. Never publish `.env.local`, private API keys, service-role keys, database passwords, provider credentials, or secrets in logs and screenshots.

Review carefully when the diff touches:

- `.env.example` or `env-sync.config.json`;
- Supabase configuration, migrations, RLS, grants, triggers, database functions, Storage, or Edge Functions;
- Google Maps, Resend, Sentry, Vercel, or EAS configuration.

Ensure server secrets have not moved into Expo public variables. Run the repository's configured secret scanner when available. Stop on a suspected secret and never bypass scanning to publish.

## 5. Verify the affected scope

Select checks from repository instructions and the changed files. For normal application work, consider:

```bash
npm run env:check
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Additionally:

- Run `npm run build --prefix backend` when the active backend, shared schemas, or backend configuration are affected.
- Run Supabase SQL tests when migrations, RLS, grants, triggers, functions, or database behavior change and the required environment is available.
- Perform relevant manual web verification for web-facing behavior.
- Perform relevant iOS or Android verification when native behavior changes and the target is available.
- Inspect GitHub Actions results when available.

Record each check as passed, failed, skipped, or unavailable. Never claim a result that did not run. Explain why conditional checks do not apply and describe exact environment limitations. Do not imply local success guarantees CI success.

Do not present the PR as ready when a required check fails.

## 6. Prepare title, body, and visual evidence

Create a concise title that represents the complete diff. Prefer an imperative Conventional Commit-style title when appropriate, for example `feat(projects): add map-based workspace` or `ci: run unit tests in pull requests`. Avoid vague or inflated titles.

Treat the current `.github/pull_request_template.md` as the source of truth for body headings, order, and checklists. Populate every relevant section from the request, commits, diff, code, documentation, and actual verification results.

- Remove or replace author-only HTML guidance where appropriate.
- Preserve useful headings and checklists.
- Check an item only when it was actually completed.
- Leave conditional items unchecked or mark them not applicable when accurate.
- State known limitations and incomplete sections honestly.
- Never fabricate behavior, test results, metrics, screenshots, impact, or decisions.

If the template is missing, use these headings in order: Problem, Solution, User impact, Architecture and decisions, Screenshots, Verification, Data/security/environment impact, Documentation, Known limitations, and Follow-up.

For meaningful visual changes, search for real evidence produced during implementation. Verify it reflects current behavior and exposes no personal data, credentials, or sensitive project information. Include mobile and web evidence when behavior differs, and a short video or GIF for interaction-heavy work when useful. Never generate a fake screenshot. If required evidence is unavailable, keep the PR in draft and report what is missing.

## 7. Choose draft or ready status

Default to a draft PR unless the user explicitly requests ready-for-review.

Keep it draft when required checks fail or cannot run, screenshots are required but missing, migrations remain unapplied or unverified, provider setup is incomplete, scope concerns or blockers remain, or required documentation is incomplete.

Create ready-for-review only when the user explicitly requests it or repository instructions clearly require it, and scope, required verification, documentation, limitations, and visual evidence are complete. Never equate PR creation with production readiness.

## 8. Push and create the PR

Immediately before pushing, reconfirm the feature branch, remote, included commits, complete diff, working tree, and absence of secrets.

1. Push the current branch without force and set its upstream when needed.
2. Never force-push unless the user explicitly requests it and the consequences have been explained.
3. If GitHub CLI authentication fails, use a connected GitHub integration when available; do not expose credentials while diagnosing auth.
4. Create the PR against the verified base with the prepared title, completed current template, and correct draft state.
5. Preserve repository conventions. Do not add labels, reviewers, or assignees unless requested or clearly required.
6. Do not merge or enable auto-merge.

Do not report success until the PR actually exists.

## 9. Hand off evidence

After creation, report:

- PR URL and title;
- base and head branches;
- draft or ready status;
- included commits and changed-file summary;
- local verification commands and results;
- GitHub Actions state when available;
- migrations, environment changes, deployment steps, and provider-console steps;
- known limitations and missing screenshots or verification;
- uncommitted local changes intentionally left untouched;
- confirmation that the body follows the current repository template;
- any incomplete template section and why.
