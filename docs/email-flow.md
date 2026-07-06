# Product Email Flow

Purpose: test and document the first non-auth email path
Source of truth for: product email boundaries, Edge Function secrets, and the current welcome-email example
Update when: product email providers, function names, secrets, or invocation rules change
Last reviewed: 2026-07-06

## Current Example

The first product email example is `welcome-to-onzait`.

Flow:

1. App code calls `sendWelcomeToOnzaitEmail` from `services/email.service.ts`.
2. The service calls `invokeWelcomeToOnzaitEmail` from `repositories/email.repository.ts`.
3. The repository invokes the Supabase Edge Function `welcome-to-onzait`.
4. The Edge Function reads the signed-in user's email from the verified Supabase JWT.
5. The Edge Function checks `public.users.welcome_email_sent_at`.
6. If the marker is empty, the function renders the Onzait-styled React Email template to HTML, sends it through Resend, and saves the sent marker.

The client does not send a recipient email address. The function chooses the recipient from the authenticated user's `public.users` row.

## Trigger Rule

The welcome email should trigger after the user's email is verified and the app has created or loaded their `public.users` profile. In practice, `contexts/auth.tsx` calls the email service when a signed-in user is hydrated and `welcome_email_sent_at` is empty.

The email is intentionally not sent at raw signup time because email/password users may still be unverified. The marker keeps the email once-per-user across future logins, page refreshes, and app launches.

## Function Files

- `supabase/functions/welcome-to-onzait/index.ts`
- `supabase/functions/_shared/email/welcome-to-onzait.tsx`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/jwt.ts`

## Template Development

React Email is installed as a dev dependency and templates live in:

```txt
supabase/functions/_shared/email
```

Preview templates locally with:

```sh
npm run email:dev
```

## Required Secrets

For local function testing:

```sh
supabase functions serve welcome-to-onzait --env-file .env.local
```

For production, add these in Supabase Edge Function secrets:

```txt
RESEND_API_KEY
EMAIL_FROM
EMAIL_REPLY_TO
SITE_URL
```

`RESEND_API_KEY` is required. The other values have development fallbacks, but should be set before production.

## Deployment Checklist

Apply the database marker migration:

```sh
npx supabase db push
```

Add or update the Edge Function secrets in the Supabase dashboard or with the Supabase CLI:

```sh
npx supabase secrets set RESEND_API_KEY="..."
npx supabase secrets set EMAIL_FROM="Onzait <onboarding@resend.dev>"
npx supabase secrets set SITE_URL="https://onzait.vercel.app"
```

Then deploy the function:

```sh
npx supabase functions deploy welcome-to-onzait --use-api
```

After deployment, test with a verified user whose `public.users.welcome_email_sent_at` value is empty.

## Sender Defaults

Until a sending domain is verified, the function falls back to:

```txt
Onzait <onboarding@resend.dev>
```

After a domain is verified, use a sender like:

```txt
Onzait <no-reply@auth.onzait.com>
```

The pending domain, DNS, and branded sender checklist lives in [docs/pending-launch-setup.md](/Users/florenciasoldavini/Documents/Projects/OnSite/on-site/docs/pending-launch-setup.md:1).

## Test Invocation

From app code, call:

```ts
await sendWelcomeToOnzaitEmail({ name: "Flor" });
```

The user must be signed in. Supabase will include the current session JWT when invoking the Edge Function.
