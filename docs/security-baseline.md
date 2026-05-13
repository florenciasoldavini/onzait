# MVP Security Baseline

Purpose: practical security rules for upcoming MVP feature work
Source of truth for: security expectations around auth, authorization, RLS, uploads, validation, secrets, and release review
Update when: auth architecture, storage strategy, client data-access scope, backend ownership, or MVP entity model changes
Last reviewed: 2026-05-12

## Scope

This baseline is for the next product phase:

- projects
- project detail views
- tasks CRUD
- project uploads and photos

It is intentionally practical. The goal is to prevent the most likely and most damaging mistakes while the product surface is expanding.

## Core principles

- Supabase Auth remains the single source of truth for identity.
- Authorization must be enforced in the database or trusted server code, not only in the UI.
- The client must never be trusted to assign access, role, ownership, or participant scope.
- Every client-accessible table must have explicit RLS before the UI ships.
- New features should default to least privilege.

## Threat model

Assume all of the following are possible:

- a user can inspect and tamper with client requests
- a user can modify route params, IDs, and payloads
- a user can try to read another project's data
- a user can try to upload unsafe or oversized files
- a leaked secret or overly broad bucket policy can expose data at scale

The main MVP security goal is preventing horizontal privilege escalation:

- user A must not be able to read or modify user B's project, tasks, or files unless they are an allowed participant

## Identity and auth

- Supabase is the source of truth for authentication.
- `public.users.id` must continue to match `auth.users.id`.
- Global role must remain controlled by the database or trusted server path only.
- The client must not be able to choose or escalate `role`.
- If future admin-only flows are added, admin status must be checked in trusted policy or backend logic, not by hiding UI controls.

## Authorization and RLS

No new client-accessible table should ship without:

- RLS enabled
- explicit `select`, `insert`, `update`, and `delete` policy review
- a cross-user access test case

### Projects

Recommended direction:

- create a participant-based model
- avoid global read/write permissions
- avoid relying only on `users.role = admin` for normal project collaboration

Baseline rules:

- users can only read projects they participate in
- users can only create projects through a clearly defined owner/creator rule
- users can only update projects if they have an allowed project-level role
- users can only delete or archive projects if explicitly allowed by policy

### Tasks

Baseline rules:

- a task must belong to a project
- task access should be derived from project participation
- users must not be able to move a task to another project they do not control
- status updates and assignment changes must still respect project-level access

### Project participants

Baseline rules:

- participant rows must not be freely client-writable without clear restrictions
- the client must not be able to add itself to any arbitrary project
- the client must not be able to promote itself to a stronger participant role

If project invitations or membership management are added later, they should be reviewed as a separate high-risk flow.

## Upload and storage security

Uploads are a high-risk area for this product because project photos and documents can expose sensitive operational information.

Baseline rules:

- do not use a globally public bucket by default
- scope file access to project participants
- store files under predictable, project-scoped paths
- validate allowed MIME types and extensions
- enforce file size limits
- reject files with missing or suspicious metadata
- do not trust filenames provided by the client

Recommended path structure:

- `projects/{project_id}/photos/{generated_file_name}`
- `projects/{project_id}/documents/{generated_file_name}`

Before shipping uploads, decide:

- whether buckets are private or signed-URL based
- who can upload
- who can delete
- how long signed URLs remain valid

## Secrets and environment handling

- never commit real secrets to git
- `.env.local` remains local-only
- `.env.example` remains generated only
- service-role credentials must never be used in client code
- preview, development, and production secrets should remain separated
- rotate secrets if they are exposed in logs, screenshots, or commits

High-risk secrets:

- Supabase service-role key
- database credentials
- Sentry auth token
- any future storage or third-party integration secrets

## Input validation

Every new boundary must validate inputs:

- forms
- route params
- query params
- upload metadata
- backend request bodies

Minimum validation expectations:

- required fields
- allowed enum values
- string length limits
- UUID format checks
- date validation
- URL validation where applicable
- server-side ownership or membership checks for referenced IDs

Do not rely on UI-level disabled controls as protection.

## Frontend security

- route guards are UX only, not authorization
- never trust client-side role checks as real enforcement
- do not expose service credentials in app code or public env vars
- be careful with deep links and callback URLs
- do not render unsanitized HTML
- avoid leaking sensitive backend or auth internals in user-facing error messages

For web specifically:

- ensure keyboard access for sensitive flows
- ensure auth state changes do not accidentally expose protected screens during hydration

## Backend security

The backend is not the main auth path today, but if MVP features start using it:

- every protected route must authenticate the caller
- every protected route must authorize the action, not just the session
- service-role operations must stay server-only
- request schemas must be validated at the edge
- security-relevant failures should be logged without exposing secrets

## Logging and monitoring

- use Sentry for unexpected errors and auth-related failures where useful
- do not log passwords, tokens, refresh tokens, signed URLs, or service keys
- avoid dumping entire request bodies for sensitive endpoints
- tag events with enough context to debug permission issues without exposing user data

## Dependency and release hygiene

- keep dependencies reasonably current
- remove unused packages when practical
- run verification before merges:
  - `npm run env:check`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
  - `npm run build --prefix backend`

## MVP release checklist

Before shipping `projects`, `tasks`, or `uploads`, confirm:

- the table has RLS enabled
- read/write policies were reviewed for cross-user access
- access is participant-based where appropriate
- the client cannot assign privileged roles or membership arbitrarily
- upload limits and allowed file types are enforced
- sensitive secrets are not exposed to the client
- at least one cross-user access test case was performed manually or automatically

## Non-goals for now

This baseline does not yet require:

- a full formal security program
- penetration testing
- advanced malware scanning
- enterprise audit logging

Those may matter later, but the current priority is getting the MVP foundation safely right.
