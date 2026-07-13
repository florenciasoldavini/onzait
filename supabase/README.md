# Supabase Setup

Purpose: tracked Supabase schema, migration, RLS, and auth URL guidance
Source of truth for: current Supabase bootstrap scope, migration expectations, and direct client-access policy
Update when: migrations, RLS policy, auth redirect configuration, or client data-access rules change
Last reviewed: 2026-07-06

This folder is the starting point for tracked Supabase database changes.

## Included migrations

- `20260510090001_create_users_bootstrap.sql`
  Creates only the auth bootstrap schema: `public.user_role` and `public.users`.
- `20260510090002_enable_users_rls.sql`
  Enables RLS for `public.users` and grants direct client access only to that table.
- `20260703133205_create_projects_feature.sql`
  Creates the first projects feature schema, owner/admin RLS, and private project cover storage policies.
- `20260706191340_add_welcome_email_sent_at_to_users.sql`
  Adds `public.users.welcome_email_sent_at` as the once-per-user marker for the product welcome email.

The tracked bootstrap started with only the `users` table. Product tables should continue to be added as feature-specific migrations instead of being front-loaded.

## Current RLS strategy

The current frontend talks directly to:

- Supabase Auth
- `public.users`
- `public.projects`
- private Supabase Storage for project cover images

Current policy rules:

- `users` policies are anchored directly to `auth.uid() = users.id`
- feature tables default to owner access for normal users and admin-wide access for `users.role = 'admin'`
- feature RLS policies enforce owner/admin authorization independently from lifecycle state
- every get/list repository query must exclude soft-deleted rows with `deleted_at is null`
- clients may add owner filters for normal users for performance, but RLS remains the real authorization boundary
- product emails can use `users.welcome_email_sent_at` as a non-sensitive idempotency marker, but Edge Functions should own marker writes so client sessions cannot repeatedly trigger the same email

Everything else should be added later with its own schema migration plus its own RLS pass when the app starts reading or writing that table from the client.

## Next policy wave

When the app starts exposing more project data directly from the client, the next tables to policy should likely be:

- `project_participants`
- `photos`
- `todos`
- storage buckets for project photos / receipts

Those policies should use explicit participant or owner rules plus admin-wide support where the product requires it.

## Project storage

- `project-covers` is private.
- Cover paths use `projects/{project_id}/cover/{generated_file_name}`.
- Storage policies should allow only project owners or admins to read, upload, replace, and remove cover images.
- Signed URLs are used for preview display; do not make operational project media globally public by default.

## Supabase tests

- Database and RLS changes should include pgTAP tests under `supabase/tests/`.
- Run `npx supabase test db` after migrations or policy changes when local Supabase is available.
- Tests should cover owner access, admin access, cross-user denial, soft-delete filtering, and storage policy behavior.

## Edge Functions

- Google Maps and other paid/secret external APIs must be called through Supabase Edge Functions or another trusted server boundary.
- Edge Functions must validate request payloads, authenticate user-scoped calls, rate-limit abusive patterns, and avoid persistent third-party content caching unless provider terms allow it.
- Google Maps functions also enforce durable monthly hard caps before calling Google. Defaults are 500 autocomplete calls/month, 100 place-detail calls/month, and 100 static map preview calls/month unless Supabase secrets override them.
- Google Maps address functions store only selected project data such as address, `place_id`, latitude, and longitude.
- The server-side Google Maps key should stay restricted to the APIs used by deployed Edge Functions. Project address lookup currently needs Places API (New), and selected-address map previews need Maps Static API. If a new Edge Function needs another Maps API, update the Google Cloud API key restrictions before releasing that feature. Client map rendering uses separate restricted keys for Maps JavaScript API on web and Maps SDK for iOS/Android in native builds.

## Auth URL configuration

In Supabase Auth, set:

- `Site URL`: `https://onzait.vercel.app`
- additional redirect URLs for local web: `http://localhost:8081/**` (adjust if Expo web is running on a different port)
- additional redirect URLs for production web paths: `https://onzait.vercel.app/**`
- additional redirect URLs for native app auth:
  - `onzait://callback`
  - `onzait://reset-password`

If you want auth links to work on Vercel preview deploys too, add your preview wildcard once you confirm the account slug. Supabase's current Vercel pattern is:

- `https://*-<your-vercel-account-or-team-slug>.vercel.app/**`

Expo Go uses temporary `exp://.../--/<path>` links instead of the production native scheme. When testing Google or Apple OAuth in Expo Go, add the exact current Expo Go callback URL, such as `exp://<host>:8081/--/callback`, to Supabase Auth redirect URLs. This URL can change with the dev server host or port, so a development build is more reliable for ongoing OAuth testing.

## Pending Launch Setup

Pending auth branding, custom domain, DNS, and branded email setup live in [docs/pending-launch-setup.md](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/docs/pending-launch-setup.md:1).

## Notes

- The backend uses a service-role path for privileged operations, so server-side flows are not blocked by these client RLS restrictions.
- The repo now expects migrations to be applied via the Supabase CLI after linking the project.
