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
- `users` policies are anchored directly to `auth.uid() = users.id`

Everything else is denied by default until the app starts reading or writing those tables from the client.

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

If you want auth links to work on Vercel preview deploys too, add your preview wildcard once you confirm the account slug. Supabase's current Vercel pattern is:

- `https://*-<your-vercel-account-or-team-slug>.vercel.app/**`

The app also has the native scheme `onzait`, so if you later add email confirmation, password reset, or OAuth flows for iPhone/Android, include native deep-link URLs too.

## Notes

- The backend uses a service-role path for privileged operations, so server-side flows are not blocked by these client RLS restrictions.
- The repo currently tracks SQL migrations, but the Supabase CLI is not installed in this environment yet, so `supabase/config.toml` was not bootstrapped here.
