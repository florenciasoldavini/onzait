# MVP Security Baseline

Purpose: practical security rules for upcoming MVP feature work
Source of truth for: security expectations around auth, authorization, RLS, uploads, validation, secrets, and release review
Update when: auth architecture, storage strategy, client data-access scope, backend ownership, or MVP entity model changes
Last reviewed: 2026-07-03

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
- Feature get/list reads must exclude soft-deleted rows by filtering `deleted_at is null`.
- Admin-wide visibility belongs in trusted RLS or server logic, not just in UI conditions.
- External APIs with secret keys or paid quotas must go through a trusted boundary with validation, rate limiting, and cache controls.

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
- a soft-delete visibility test when the table has `deleted_at`

### Default feature visibility

Unless a feature documents a more specific participant model:

- admin users can read and manage all non-deleted feature rows
- normal users can read and manage only rows they own
- deleted rows must be hidden from normal get/list requests
- soft deletion is a lifecycle state rather than an authorization boundary; owner/admin RLS may still authorize the row while repository reads exclude it
- client code can add owner filters for performance, but database/server authorization remains mandatory

### Projects

Current v1 direction:

- use an owner-based model
- admins can see and manage all non-deleted projects
- normal users can see and manage only projects where they are `owner_id`
- participant-based collaboration is deferred until membership flows are built

Baseline rules:

- users can only create projects for themselves
- users cannot reassign project ownership
- project delete is soft delete through `deleted_at`
- project address coordinates must come from the trusted Google Maps boundary, not direct client calls to Google web services

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

- `projects/{project_id}/cover/{generated_file_name}`
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
- new keys and env vars must be added to `env-sync.config.json`, regenerated into `.env.example`, and mirrored as easy-to-replace placeholders in `.env.local`
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

## External API boundaries

- Do not expose server-side API keys in Expo, web bundles, or public env vars.
- Client UI should call local feature services/hooks, not third-party web services directly.
- Trusted API boundaries must validate inputs, authenticate users when data is user-scoped, rate-limit abusive call patterns, and cache only where provider terms allow.
- Paid trusted API boundaries must enforce a durable usage cap before calling the provider when provider-side quotas cannot be lowered enough for development safety.
- Google Maps address lookup must keep the API key server-side, enforce monthly hard caps before Google calls, store selected `place_id` and coordinates only as project data, and show required Google Maps attribution near suggestions or resolved address content.
- Google Maps API keys should remain restricted to the specific APIs and platforms currently used. Project address lookup currently needs server-side Places API (New), selected-address map previews need server-side Maps Static API, the web projects map needs Maps JavaScript API with web-referrer restrictions, Android project maps need Maps SDK for Android with package/SHA-1 restrictions, and iOS project maps use the native default Apple Maps provider unless a future custom native build intentionally enables Google Maps on iOS. Before adding a feature that needs another Maps API or SDK, remind the project owner to update the Google Cloud key restrictions and confirm the new API is intentionally enabled.

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
  - `npm test`
  - `npx supabase test db` when migrations or RLS policies change
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
- all async UI states have explicit loading indicators, disabled states, skeletons, or equivalent feedback

## Non-goals for now

This baseline does not yet require:

- a full formal security program
- penetration testing
- advanced malware scanning
- enterprise audit logging

Those may matter later, but the current priority is getting the MVP foundation safely right.
