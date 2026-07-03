# AGENTS.md

Purpose: architecture snapshot, product decisions, and implementation guardrails for contributors and agents
Source of truth for: current auth architecture, platform decisions, naming rules, and high-level project constraints
Update when: auth flow, platform ownership, schema strategy, CI expectations, or product naming decisions change
Last reviewed: 2026-05-12

## Project Snapshot

- Project name: `onzait`
- Stack: `Expo Router` + `React Native` + `Expo web static export`
- Backend/data direction:
  - frontend talks directly to `Supabase Auth` and `public.users`
  - separate Express/Prisma backend exists under `backend/`, but it is not the main auth path today
- Main product goal: mobile-first construction / job-site management app that is also usable in a browser for client feedback

## Current Platform Setup

- Web is deployed on Vercel
  - production URL: `https://onzait.vercel.app`
- Native build/distribution is wired through EAS
  - Expo owner/project: `@florenciasoldavini/onzait`
- Database/auth is on Supabase
- Error monitoring is wired with Sentry

## Auth Architecture

- Supabase is the source of truth for identity
- `public.users.id` must match `auth.users.id` / `auth.uid()`
- Global role lives in `public.users.role`
- New users default to role `user`
- The first real admin should be promoted manually with SQL after signup
- Do not let the client choose or escalate role values

### Supported Auth Flows

- Email/password
- Google OAuth
- Apple OAuth
- Password reset
- Shared callback/session handling lives in [lib/auth.ts](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/lib/auth.ts:1)

### Important Auth Files

- [lib/auth.ts](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/lib/auth.ts:1)
- [lib/supabase.ts](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/lib/supabase.ts:1)
- [contexts/auth.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/contexts/auth.tsx:1)
- [app/\_layout.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/app/_layout.tsx:1)
- [app/(auth)/callback.tsx](</Users/florenciasoldavini/Documents/Projects/OnSite/on-site/app/(auth)/callback.tsx:1>)
- [screens/auth/sign-in.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/screens/auth/sign-in.tsx:1)
- [screens/auth/sign-up.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/screens/auth/sign-up.tsx:1)
- [screens/auth/reset-password.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/screens/auth/reset-password.tsx:1)

### Auth Gotchas

- Do not manually force `router.replace("/")` immediately after sign-in unless you are sure auth state has already settled
- The current route guard is session-driven in [app/\_layout.tsx](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/app/_layout.tsx:43)
- Web redirect URLs should use the current browser origin when available; hosted fallback comes from `EXPO_PUBLIC_SITE_URL`
- Native auth redirects use `onzait://` in development/production builds
- Expo Go auth redirects use the current `exp://.../--/<path>` callback and must be allow-listed in Supabase while testing OAuth there

## Supabase Decisions

- We intentionally simplified the initial schema bootstrap to `users` only
- Do not front-load the entire product schema
- Add new tables as feature-specific migrations when each feature is actually built

### Current Tracked Supabase Migrations

- [20260510090001_create_users_bootstrap.sql](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/supabase/migrations/20260510090001_create_users_bootstrap.sql:1)
- [20260510090002_enable_users_rls.sql](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/supabase/migrations/20260510090002_enable_users_rls.sql:1)

### RLS Baseline

- Only `public.users` is currently created in the tracked Supabase bootstrap
- Only `public.users` currently has direct authenticated Data API access
- Policies are anchored to `auth.uid() = users.id`
- Insert policy forces `role = 'user'`
- Update policy prevents users from changing their own role

### Migration Gotcha

- Supabase migration filenames must use unique full timestamps
- Do not create multiple migration files that collapse to the same parsed version prefix
- The earlier `20260509_...` naming caused a remote `schema_migrations` collision

## User Model Decisions

- `users.id`: UUID from Supabase Auth
- `users.email`: unique, normalized to lowercase in app code
- `users.last_name`: nullable
- `users.role`: enum-like DB type `user_role` with values `admin | user`

## Environment Workflow

- `.env.local` is the local source of truth for real secrets
- `.env.example` is generated, not hand-maintained
- env metadata and sync targets live in [env-sync.config.json](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/env-sync.config.json:1)
- the current performance baseline lives in [docs/performance-baseline.md](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/docs/performance-baseline.md:1)
- the current SEO and accessibility baseline lives in [docs/seo-accessibility-baseline.md](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/docs/seo-accessibility-baseline.md:1)
- the current security baseline for MVP feature work lives in [docs/security-baseline.md](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/docs/security-baseline.md:1)

### Useful Commands

- `npm run env:example`
- `npm run env:check`
- `npm run sync:env`
- `npm run sync:env -- --dry-run`

## CI / Verification

- CI currently checks:
  - `npm run env:check`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`

### Useful Local Checks

- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`

## Web / Hosting Notes

- Vercel is the current web hosting target
- Static web export is the current build path
- `vercel.json` uses:
  - `buildCommand: npm run build`
  - `outputDirectory: dist`
  - `cleanUrls: true`

## Mobile / Native Notes

- EAS is configured
- Bundle/package identifiers:
  - iOS: `com.florenciasoldavini.onzait`
  - Android: `com.florenciasoldavini.onzait`
- Face ID / Touch ID is intentionally not implemented yet

## Naming / Brand Decisions

- Current product/app name: `onzait`
- Older `on-site` naming is legacy and should not be reintroduced unless intentionally migrating something old

## Practical Next Steps

- Promote the first real user to `admin` manually via SQL
- Add future tables through feature-specific Supabase migrations
- Add project-level RLS only when those tables are actually introduced
- If auth changes again, preserve the rule that role assignment must stay server/database controlled
