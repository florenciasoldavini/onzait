# Pending Launch Setup

Purpose: durable checklist for setup work that is important before launch but not part of the core app code path yet
Source of truth for: pending domain, auth branding, DNS, and production email-sending decisions
Update when: a domain is purchased, DNS ownership changes, Supabase Auth branding changes, or Resend/Supabase email delivery is finalized
Last reviewed: 2026-09-17

## Summary

`onzait.com` was purchased through Vercel Domains on 2026-09-17, with DNS managed by Vercel. The production web app uses `https://www.onzait.com`; `https://onzait.com` redirects there. The existing Vercel URL remains available for compatibility.

## Pending Auth Branding

Google account selection currently shows the Supabase project callback domain (`wuaiwcppoefmprzoupaf.supabase.co`) in the "Go to..." line because Supabase Auth owns the OAuth callback URL.

Reviewed on 2026-09-17:

- Google OAuth app name is already `Onzait`.
- Saved `https://www.onzait.com` as the Google OAuth application homepage and added `onzait.com` to authorized domains, preserving existing entries.
- Google sign-in was verified end to end with the existing owner account on `www.onzait.com`.
- Google OAuth remains in **Testing** mode. Public launch requires reviewing audience/publication settings and supplying approved public privacy-policy and terms pages (currently absent).
- Optional Supabase custom auth domain remains inactive. It costs approximately $10/month ([pricing](https://supabase.com/docs/guides/platform/manage-your-usage/custom-domains)). Prefer a separate hostname such as `api.onzait.com` to keep backend branding distinct from the existing email sending domain.
- Before activating a custom auth domain, add its callback URL to every enabled OAuth provider and validate the migration. Keep the existing Supabase callback URI configured.

## Custom Paid Domain

Completed on 2026-09-17:

- Connected `onzait.com` and `www.onzait.com` to the Onzait production project; apex redirects permanently to `www`.
- Updated `EXPO_PUBLIC_SITE_URL` and `SITE_URL` locally and in Vercel Production. Preview deployments continue to use their current browser origin.
- Updated hosted Supabase `SITE_URL` for product email links and Auth Site URL to `https://www.onzait.com`.
- Added exact `/callback` and `/reset-password` Auth redirect URLs for both domain variants, preserving existing localhost, native, and Vercel entries.
- Added query-bearing variants (`/callback\?**` and `/reset-password\?**`) for `http://localhost:8081`, `https://www.onzait.com`, `https://onzait.com`, and `https://onzait.vercel.app`. Keep the literal backslash when entering these Supabase glob patterns: it escapes `?`, so only query strings on those exact paths are allowed. Invitation OAuth uses `next`, while confirmation/recovery and identity linking also carry query parameters. Exact URLs alone caused invitation sign-in from localhost to fall back to the production Site URL. Preserve both the exact and query-bearing entries when changing domains ([redirect URL pattern documentation](https://supabase.com/docs/guides/auth/redirect-urls)).
- Added `https://onzait.com/*` and `https://www.onzait.com/*` to the Google Maps browser key's HTTP referrer allowlist; retained existing referrers and the Maps JavaScript API restriction.
- Verified HTTPS apex redirect, Google sign-in return, Maps autocomplete, place resolution, and rendered map preview on the canonical domain. No project was created during testing.
- Rebuilt existing production commit `953c629` with the new Vercel environment settings; deployment `8AeCrFZb3wdAZVUjzptpEMXwSZf2` is Ready. Unmerged development work was not published.

## Email Sending Domain

You do not need to create a real inbox for `no-reply@...` just to send transactional email. Resend can send from a verified domain or subdomain once DNS is configured. A real inbox is only needed if people should reply and someone should receive those replies.

Configured on 2026-09-17:

- Resend sending domain: `auth.onzait.com`, verified with DKIM and SPF.
- Sender: `Onzait <notifications@auth.onzait.com>`.
- `EMAIL_FROM` is updated in `.env.local`, hosted Supabase Edge Function secrets, and Vercel Production/Preview environment configuration.
- The hosted Supabase sender was verified against its SHA-256 digest. Updated function secrets take effect immediately without redeploying ([Supabase documentation](https://supabase.com/docs/guides/functions/secrets)). Vercel's copy applies to future deployments; live transactional sending runs in Supabase.
- DMARC is configured in monitoring mode (`p=none`).
- Receiving, open tracking, and click tracking remain disabled in Resend.
- Product email links use `https://www.onzait.com`.

Remaining email validation:

1. Send Spanish and English welcome, invitation, confirmation, and recovery emails to confirm delivery, sender, CTA URLs, and HTML language. No delivery test was sent during domain setup.
2. Configure `EMAIL_REPLY_TO` only when a real monitored mailbox exists.
3. Review DMARC enforcement after validating all legitimate senders.

Supabase Auth emails and product emails are configured in different places:

- Product emails use the `welcome-to-onzait`, `project-collaboration`, and `organization-invitations` Edge Functions plus Resend.
- Current signup confirmation/resend and password recovery emails use the signed
  `auth-send-email` hook plus Resend.
- Before enabling that hook, disable unused Auth email flows and hosted security
  notifications, configure the signing secret, and prove signed staging
  delivery in both languages.

The restricted `onboarding@resend.dev` test sender has been replaced. Previously failed organization invitations can be retried using **Resend email**; DNS verification alone does not prove inbox delivery.

## DNS Ownership Notes

Registrar and DNS provider: Vercel Domains. Nameservers: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.

Email DNS records added on 2026-09-17:

- `resend._domainkey.auth` TXT: the DKIM public key supplied by Resend
- `send.auth` MX, priority 10: `feedback-smtp.sa-east-1.amazonses.com`
- `send.auth` TXT: `v=spf1 include:amazonses.com ~all`
- `_dmarc.auth` TXT: `v=DMARC1; p=none;`

The sending domain is `auth.onzait.com`. DNS publication, Resend verification, and hosted sender activation are confirmed. DMARC starts in monitoring mode and does not configure a report mailbox.

## Launch verification findings — 2026-09-17

- **Production deployment blocker:** the current production commit (`953c629`, July 25) predates organization/workspace features. The signed-in Projects screen reports “Projects unavailable”; schema incompatibility is suspected, not yet proven from a failing query. `/organization-invitations/accept` returns Vercel 404. Deploy a reviewed current release before testing real organization invitation acceptance.
- **Email tests:** 18 local rendering, signed-auth-hook, and organization-invitation tests passed. Ten bilingual delivery previews are prepared, using real template builders and clearly labeled nonfunctional sample links. These do not validate live signup/recovery/invitation workflows.
- **Reply-to:** left unset; no monitored reply mailbox was explicitly designated.
- **DMARC:** retain `p=none` until delivered messages' authentication results and all legitimate senders are validated. No aggregate-report mailbox is configured; this is not a completed monitoring period. Move to enforcement only after that review.
