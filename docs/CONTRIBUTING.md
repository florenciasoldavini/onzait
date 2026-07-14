# Documentation Maintenance

Purpose: lightweight rules for keeping project documentation current
Source of truth for: documentation ownership, update triggers, and doc review workflow
Update when: doc ownership changes, PR process changes, or new documentation categories are introduced
Last reviewed: 2026-07-08

## Core rule

Documentation should be updated in the same change where behavior, setup, or architecture changes.

When a new project rule is added, scan existing code, docs, env config, and tests for places where the rule already applies. Either update those surfaces in the same change or record a clear follow-up gap.

## Source of truth map

- `README.md`
  - Project setup
  - Daily development commands
  - Verification steps
  - Deployment basics
- `AGENTS.md`
  - Current architecture snapshot
  - Auth decisions
  - Product and platform guardrails
- `supabase/README.md`
  - Supabase bootstrap scope
  - Migrations
  - RLS decisions
  - Auth redirect configuration
- `backend/README.md`
  - Backend-only setup and status
  - Backend routes and scripts
- `docs/`
  - Longer-lived design and reference material
- `docs/onzait-design-system.md`
  - Active design-system rules
  - Token and primitive source map
  - Reusable interaction-state decisions

## Update triggers

Update `README.md` when:

- package scripts change
- local setup changes
- verification commands change
- deploy flow changes
- required env vars change

Update `AGENTS.md` when:

- auth architecture changes
- route guarding changes
- platform ownership changes
- naming or product constraints change
- project-level implementation rules change
- supported platform expectations change for web, iOS, or Android

Update env documentation when:

- a feature introduces a new key or env var
- `env-sync.config.json` changes
- `.env.example` needs regeneration
- `.env.local` needs a local placeholder for a newly required value

Update `supabase/README.md` when:

- a new migration is added
- RLS changes
- client data-access scope changes
- auth redirect configuration changes

Update `backend/README.md` when:

- backend scripts change
- backend env vars change
- backend route surface changes
- backend ownership or status changes

Update `docs/onzait-design-system.md` when:

- a reusable visual rule is decided
- a design-system primitive changes
- a component state pattern changes
- a screen-level design decision should become reusable

## PR workflow

- Every PR should either update affected docs or explicitly state that no doc update was needed.
- Use `.github/pull_request_template.md` to review doc impact before merging.

## CI workflow

- `.env.example` is generated from `env-sync.config.json`.
- CI enforces that generated env documentation is up to date through `npm run env:check`.

## Writing rules

- Keep operational docs short and specific.
- Prefer one source of truth per topic.
- Mark non-authoritative docs clearly as `Deprecated`, `Historical`, or `Draft`.
- Do not document planned architecture as if it already exists.
