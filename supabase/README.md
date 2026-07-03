# Supabase Setup

Purpose: tracked Supabase schema, migration, RLS, and auth URL guidance
Source of truth for: current Supabase bootstrap scope, migration expectations, and direct client-access policy
Update when: migrations, RLS policy, auth redirect configuration, or client data-access rules change
Last reviewed: 2026-05-12

This folder is the starting point for tracked Supabase database changes.

## Included migrations

- `20260510090001_create_users_bootstrap.sql`
  Creates only the auth bootstrap schema: `public.user_role` and `public.users`.
- `20260510090002_enable_users_rls.sql`
  Enables RLS for `public.users` and grants direct client access only to that table.

Right now, the tracked bootstrap intentionally creates only the `users` table. The rest of the product tables should be added later as feature-specific migrations instead of being front-loaded.

## Current RLS strategy

The current frontend talks directly to:

- Supabase Auth
- `public.users`

So the first policy pass is intentionally narrow:

- only `public.users` exists in the current tracked bootstrap
- direct `authenticated` Data API access is granted only for `public.users`
- `users` policies are anchored directly to `auth.uid() = users.id`

Everything else should be added later with its own schema migration plus its own RLS pass when the app starts reading or writing that table from the client.

## Next policy wave

When the app starts exposing more project data directly from the client, the next tables to policy should likely be:

- `project_participants`
- `projects`
- `photos`
- `todos`
- storage buckets for project images / receipts

Those policies should probably be participant-based, not global role-based.

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

## Notes

- The backend uses a service-role path for privileged operations, so server-side flows are not blocked by these client RLS restrictions.
- The repo now expects migrations to be applied via the Supabase CLI after linking the project.
