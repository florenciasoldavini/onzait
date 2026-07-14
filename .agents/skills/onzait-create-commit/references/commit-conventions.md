# Onzait commit conventions

Read this reference only after finalizing the staged scope and before writing the commit message.

## Format

Use:

```text
<type>(<scope>): <description>
```

Omit the scope when none is useful:

```text
<type>: <description>
```

Mark a genuine breaking change with `!` and a migration footer:

```text
<type>(<scope>)!: <description>

BREAKING CHANGE: <incompatibility and migration path>
```

## Allowed types

| Type | Use for |
| --- | --- |
| `feat` | New user-facing or product functionality |
| `fix` | Correcting broken or unintended behavior |
| `docs` | Documentation-only changes |
| `style` | Formatting with no behavior change; never visual UI work |
| `refactor` | Restructuring without intended behavior changes |
| `perf` | Performance improvements |
| `test` | Test-only changes |
| `build` | Build tooling, packaging, or build dependencies |
| `ci` | CI workflows and automation |
| `chore` | Maintenance that fits no more precise type |
| `revert` | Reverting an earlier commit |

Use `feat` only for added functionality, `fix` only for corrected behavior, `ci` for `.github/workflows`, and `build` for build-system configuration or dependencies. Prefer `refactor` when behavior stays unchanged. Use `style` only for formatting, not CSS or interface design. Avoid `chore` when a precise type applies.

## Onzait scopes

Choose the narrowest stable product or architecture area:

- `auth`
- `projects`
- `tasks`
- `profile`
- `maps`
- `email`
- `supabase`
- `database`
- `storage`
- `design-system`
- `icons`
- `navigation`
- `accessibility`
- `responsive`
- `readme`
- `docs`
- `ci`
- `backend`
- `env`
- `deps`
- `release`

Use lowercase kebab-case. Prefer product or architecture areas over filenames. Do not invent a highly specific one-off scope. Omit the scope for genuinely repository-wide changes. Follow existing history only when its scope usage is coherent.

## Description

- Use imperative language describing the completed outcome.
- Start lowercase unless a proper noun requires capitalization.
- Prefer about 72 characters or fewer.
- Omit a trailing period.
- Be specific and outcome-oriented.
- Avoid vague words such as `update`, `changes`, `improvements`, `fixes`, `stuff`, and `miscellaneous`.
- Do not mention Codex, AI, or an agent unless the change is specifically AI tooling.
- Make no unverifiable claims.

## Body and footers

Add a body only when the title cannot explain important why, architecture, tradeoffs, security, migration/deployment needs, platform differences, or an unusual implementation. Separate it with a blank line, wrap reasonably, explain what and why, and do not repeat the title or add promotional language.

Use footers only when factual:

- `BREAKING CHANGE: ...`
- `Closes #123`
- `Fixes #123`
- `Refs #123`

Never invent an issue number. Use `BREAKING CHANGE:` only for genuine incompatibility and include the migration path. Add co-author trailers only when explicitly requested and factually correct.

## Examples

Good:

```text
feat(projects): add map-based address selection
feat(tasks): add project-scoped task management
fix(auth): preserve the callback route after verification
fix(maps): enforce monthly usage limits before requests
refactor(icons): route Lucide imports through the app boundary
test(projects): cover owner filters and address validation
docs(readme): present Onzait as a product case study
ci: run unit tests for pull requests
chore(deps): align Expo package versions
```

Avoid:

```text
update files
fix stuff
improvements
feat: added some new things
style(projects): redesign project cards
chore: changes requested by user
docs: README updates and task feature and CI fixes
```
