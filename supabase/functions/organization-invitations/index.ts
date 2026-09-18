import { createClient } from "@supabase/supabase-js";
import {
  AuthenticationError,
  requireAuthenticatedUser,
} from "../_shared/auth.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { buildOrganizationInvitationEmail } from "../_shared/email/organization-invitation.tsx";
import { resolveEmailLanguage } from "../_shared/email/localization.ts";

type Reservation = {
  id: string;
  status: "pending";
  token: string;
  invited_email: string;
  role_code: "admin" | "member";
  expires_at: string;
  language_code: string;
  delivery_version: number;
  organization_name: string;
  inviter_name: string;
};
type Input = {
  p_organization_id: string;
  p_email?: string;
  p_role_code?: string;
  p_language_code?: string;
  p_invitation_id?: string;
};
type Dependencies = {
  authenticate: (request: Request) => Promise<unknown>;
  reserve: (request: Request, input: Input) => Promise<{
    data: Reservation | { status: "already_member" } | null;
    error: { code?: string } | null;
  }>;
  mark: (invitation: Reservation, status: "sent" | "failed") => Promise<void>;
  send: typeof fetch;
  apiKey?: string;
  from: string;
  replyTo?: string;
  siteUrl: string;
};

const fail = (code: string, status: number) =>
  jsonResponse({ ok: false, code }, { status });

export function createHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }
    if (request.method !== "POST") return fail("METHOD_NOT_ALLOWED", 405);
    try {
      await deps.authenticate(request);
    } catch (error) {
      return fail(
        "UNAUTHORIZED",
        error instanceof AuthenticationError ? 401 : 503,
      );
    }
    if (!deps.apiKey) return fail("INVITATION_UNAVAILABLE", 503);
    const body = await request.json().catch(() => null);
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (
      !body || typeof body !== "object" ||
      typeof body.organizationId !== "string" ||
      !uuid.test(body.organizationId) ||
      !["invite", "resend"].includes(body.action)
    ) return fail("INVALID_REQUEST", 400);
    const input: Input = { p_organization_id: body.organizationId };
    if (body.action === "resend") {
      if (
        typeof body.invitationId !== "string" || !uuid.test(body.invitationId)
      ) {
        return fail("INVALID_REQUEST", 400);
      }
      input.p_invitation_id = body.invitationId;
    } else {
      if (
        typeof body.email !== "string" || body.email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
        !["admin", "member"].includes(body.roleCode)
      ) return fail("INVALID_REQUEST", 400);
      input.p_email = body.email.trim().toLowerCase();
      input.p_role_code = body.roleCode;
      input.p_language_code = resolveEmailLanguage(body.language);
    }
    let invitation: Reservation;
    try {
      const { data, error } = await deps.reserve(request, input);
      if (error || !data) {
        if (error?.code === "P0429") {
          return fail("INVITATION_RATE_LIMITED", 429);
        }
        if (error?.code === "42501") return fail("INVITATION_FORBIDDEN", 403);
        if (error?.code === "P0002") return fail("INVITATION_NOT_FOUND", 404);
        return fail("INVITATION_UNAVAILABLE", 503);
      }
      if (data.status === "already_member") {
        return jsonResponse({ ok: true, data });
      }
      invitation = data;
    } catch {
      return fail("INVITATION_UNAVAILABLE", 503);
    }
    let deliveryFailureCode = "INVITATION_DELIVERY_FAILED";
    try {
      // Origin selects a destination only; authentication and organization permissions
      // are still required above. Never reflect arbitrary origins into token links.
      const siteUrl = request.headers.get("Origin") === "http://localhost:8081"
        ? "http://localhost:8081"
        : deps.siteUrl;
      const email = await buildOrganizationInvitationEmail({
        acceptUrl: `${
          siteUrl.replace(/\/+$/, "")
        }/organization-invitations/accept#token=${
          encodeURIComponent(invitation.token)
        }`,
        expiresAt: invitation.expires_at,
        inviterName: invitation.inviter_name,
        language: invitation.language_code,
        organizationName: invitation.organization_name,
        roleCode: invitation.role_code,
      });
      const response = await deps.send("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deps.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key":
            `organization-invitation-${invitation.id}-${invitation.delivery_version}`,
        },
        body: JSON.stringify({
          from: deps.from,
          to: invitation.invited_email,
          ...email,
          ...(deps.replyTo ? { reply_to: deps.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10000),
      });
      await response.body?.cancel();
      if (!response.ok) {
        if (
          response.status === 403 &&
          /@resend\.dev(?:>|$)/i.test(deps.from.trim())
        ) {
          deliveryFailureCode = "INVITATION_SENDER_NOT_CONFIGURED";
        }
        console.error("Organization invitation provider rejected delivery", {
          invitationId: invitation.id,
          status: response.status,
        });
        throw new Error("Provider rejected delivery");
      }
    } catch {
      await deps.mark(invitation, "failed").catch(() => {
        console.error(
          "Organization invitation failure state could not be saved",
          { invitationId: invitation.id },
        );
      });
      return fail(deliveryFailureCode, 502);
    }
    try {
      await deps.mark(invitation, "sent");
    } catch {
      // Provider accepted the email: do not misreport this as a failed send.
      console.error("Organization invitation sent state could not be saved", {
        invitationId: invitation.id,
      });
      return fail("INVITATION_STATUS_UNCONFIRMED", 503);
    }
    return jsonResponse({
      ok: true,
      data: { id: invitation.id, status: "pending" },
    });
  };
}

function serviceClient(authorization?: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing server configuration");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    ...(authorization
      ? { global: { headers: { Authorization: authorization } } }
      : {}),
  });
}

export default {
  fetch: createHandler({
    authenticate: (request) =>
      requireAuthenticatedUser(
        request,
        "Sign in to invite organization members.",
      ),
    reserve: async (request, input) => {
      // The user's JWT is forwarded: the database checks their organization permissions.
      return await serviceClient(request.headers.get("Authorization")!)
        .rpc("prepare_organization_invitation_email", input);
    },
    mark: async (invitation, status) => {
      // Only the server can record provider acceptance; stale responses cannot overwrite a newer attempt.
      const { data, error } = await serviceClient().from(
        "organization_invitations",
      )
        .update({
          delivery_status: status,
          email_sent_at: status === "sent" ? new Date().toISOString() : null,
        })
        .eq("id", invitation.id).eq(
          "delivery_version",
          invitation.delivery_version,
        )
        .select("id").single();
      if (error || !data) throw new Error("Delivery state update failed");
    },
    send: fetch,
    apiKey: Deno.env.get("RESEND_API_KEY"),
    from: Deno.env.get("EMAIL_FROM") ?? "Onzait <onboarding@resend.dev>",
    replyTo: Deno.env.get("EMAIL_REPLY_TO"),
    siteUrl: Deno.env.get("SITE_URL") ?? Deno.env.get("EXPO_PUBLIC_SITE_URL") ??
      "https://onzait.vercel.app",
  }),
};
