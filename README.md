# onzait

Purpose: project setup, daily development commands, verification, and deployment basics
Source of truth for: install, run, env workflow, quality checks, and platform entrypoints
Update when: scripts, required env vars, local setup, verification steps, or deployment flow change
Last reviewed: 2026-05-12

Mobile-first construction and job-site management app built with Expo Router, React Native, Supabase Auth, and static web export for Vercel.

## Stack

- Expo Router + React Native
- Expo web static export
- Supabase Auth + `public.users`
- Vercel for web hosting
- EAS for native builds
- Sentry for error monitoring

## Package manager

Use `npm` for this repository. The repo is checked in with `package-lock.json`, and CI runs with npm as well.

## Prerequisites

- Node.js 22 or newer
- npm
- Expo-compatible iOS Simulator / Android Emulator if you want to run native locally
- Supabase project configured for auth

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local envs:
   - Frontend secrets live in `.env.local`
   - `.env.example` is generated from `env-sync.config.json`

3. Verify your env contract:

   ```bash
   npm run env:check
   ```

4. Start the app:

   ```bash
   npm run start
   ```

Useful shortcuts:

- `npm run ios`
- `npm run android`
- `npm run web`

## Environment workflow

Environment metadata and sync targets live in `env-sync.config.json`.

Useful commands:

```bash
npm run env:example
npm run env:check
npm run sync:env
npm run sync:env -- --dry-run
```

Current app-facing env vars:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SITE_URL`
- `EXPO_PUBLIC_APP_ENV`

Backend-only env vars currently tracked in `.env.example`:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `SITE_URL`
- `DATABASE_URL`
- `DIRECT_URL`

## Auth architecture

- Supabase is the source of truth for identity
- `public.users.id` must match `auth.users.id`
- Global role lives in `public.users.role`
- New users default to `user`
- Role assignment must stay server/database controlled

Supported flows:

- Email/password
- Google OAuth
- Apple OAuth
- Password reset

Supabase Auth redirect URLs must include every callback target used by the app:

- `https://onzait.vercel.app/callback`
- `https://onzait.vercel.app/reset-password`
- `onzait://callback`
- `onzait://reset-password`

Expo Go uses a temporary `exp://.../--/callback` URL for native OAuth testing. Add the exact current Expo Go URL shown by the app/dev session to Supabase Auth redirect URLs, or use a development build so OAuth can return to `onzait://callback`.

Important files:

- `lib/auth.ts`
- `lib/supabase.ts`
- `contexts/auth.tsx`
- `app/_layout.tsx`
- `app/(auth)/callback.tsx`

## Database and backend status

The current tracked Supabase bootstrap is intentionally minimal:

- only `public.users` is created in tracked migrations
- only `public.users` currently has direct authenticated client access
- future product tables should be added as feature-specific migrations

There is also a separate Express/Prisma backend under `backend/`, but it is not the main auth path today.

See:

- `supabase/README.md`
- `backend/README.md`

## Quality checks

Run these before shipping:

```bash
npm run env:check
npx tsc --noEmit
npm run lint
npm run build
```

## Deployment

### Web

- Hosting target: Vercel
- Build command: `npm run build`
- Output directory: `dist`

### Native

- EAS project: `@florenciasoldavini/onzait`
- iOS bundle identifier: `com.florenciasoldavini.onzait`
- Android package: `com.florenciasoldavini.onzait`

## Additional docs

- `AGENTS.md`
- `docs/CONTRIBUTING.md`
- `docs/performance-baseline.md`
- `docs/seo-accessibility-baseline.md`
- `docs/security-baseline.md`
- `supabase/README.md`
- `docs/onzait-design-system.md`
- `docs/onzait-step-1-foundation.md`
- `docs/onzait-step-2-foundations.md`
