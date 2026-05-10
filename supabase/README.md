# Supabase Setup

This folder is the starting point for tracked Supabase database changes.

## Included migrations

- `20260509_000001_initial_schema.sql`
  Creates the current application schema based on the Prisma data model.
- `20260509_000002_rls_baseline.sql`
  Enables RLS across the exposed `public` schema and grants direct client access only to `public.users`.

## Current RLS strategy

The current frontend talks directly to:

- Supabase Auth
- `public.users`

So the first policy pass is intentionally narrow:

- every `public` table has RLS enabled
- direct `authenticated` Data API access is granted only for `public.users`
- `users` policies are anchored to `auth.uid()` via `users.auth_user_id`

Everything else is denied by default until the app starts reading or writing those tables from the client.

## Next policy wave

When the app starts exposing more project data directly from the client, the next tables to policy should likely be:

- `project_participants`
- `projects`
- `photos`
- `todos`
- storage buckets for project images / receipts

Those policies should probably be participant-based, not global role-based.

## Notes

- The backend uses a service-role path for privileged operations, so server-side flows are not blocked by these client RLS restrictions.
- The repo currently tracks SQL migrations, but the Supabase CLI is not installed in this environment yet, so `supabase/config.toml` was not bootstrapped here.
