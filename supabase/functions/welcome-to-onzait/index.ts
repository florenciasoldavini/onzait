import { createClient } from "npm:@supabase/supabase-js@2.50.3";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { renderWelcomeToOnzaitEmail } from "../_shared/email/welcome-to-onzait.tsx";
import { getAuthClaims } from "../_shared/jwt.ts";

type WelcomeRequestBody = {
  name?: string;
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const emailFrom =
  Deno.env.get("EMAIL_FROM") ?? "Onzait <onboarding@resend.dev>";
const emailReplyTo = Deno.env.get("EMAIL_REPLY_TO");
const appUrl =
  Deno.env.get("SITE_URL") ??
  Deno.env.get("EXPO_PUBLIC_SITE_URL") ??
  "https://onzait.vercel.app";
const supabaseUrl = Deno.env.get("SUPABASE_URL");

type UserEmailState = {
  email: string;
  first_name: string;
  welcome_email_sent_at: string | null;
};

function getPublishableKey() {
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");

  if (publishableKeys) {
    try {
      const keys = JSON.parse(publishableKeys) as Record<string, string>;
      return keys.default ?? Object.values(keys)[0] ?? null;
    } catch {
      return null;
    }
  }

  return Deno.env.get("SUPABASE_ANON_KEY") ?? null;
}

function getFirstNameFromEmail(email: string) {
  return email.split("@")[0]?.split(/[._-]/)[0] || "there";
}

function getFirstName(
  claims: ReturnType<typeof getAuthClaims>,
  body: WelcomeRequestBody
) {
  return (
    body.name?.trim() ||
    claims?.user_metadata?.first_name?.trim() ||
    claims?.user_metadata?.full_name?.trim().split(/\s+/)[0] ||
    claims?.user_metadata?.name?.trim().split(/\s+/)[0] ||
    (claims?.email ? getFirstNameFromEmail(claims.email) : "there")
  );
}

async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  if (!resendApiKey) {
    return jsonResponse(
      { error: "RESEND_API_KEY is not configured for this function." },
      { status: 500 }
    );
  }

  const claims = getAuthClaims(req);
  const authorization = req.headers.get("Authorization");

  if (!claims?.email || !claims.sub || !authorization) {
    return jsonResponse(
      { error: "A signed-in user with an email address is required." },
      { status: 401 }
    );
  }

  const publishableKey = getPublishableKey();

  if (!supabaseUrl || !publishableKey) {
    return jsonResponse(
      { error: "Supabase function environment is not configured." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: authorization
      }
    }
  });

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("email, first_name, welcome_email_sent_at")
    .eq("id", claims.sub)
    .maybeSingle();

  const userEmailState = user as UserEmailState | null;

  if (userError) {
    return jsonResponse(
      { error: "Could not check welcome email state." },
      { status: 500 }
    );
  }

  if (!userEmailState) {
    return jsonResponse(
      { error: "User profile was not found." },
      { status: 404 }
    );
  }

  if (userEmailState.welcome_email_sent_at) {
    return jsonResponse({
      ok: true,
      skipped: true,
      welcome_email_sent_at: userEmailState.welcome_email_sent_at
    });
  }

  let body: WelcomeRequestBody = {};

  try {
    body = (await req.json()) as WelcomeRequestBody;
  } catch {
    body = {};
  }

  const name =
    body.name?.trim() ||
    userEmailState.first_name ||
    getFirstName(claims, body);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `welcome-to-onzait-${claims.sub}`
    },
    body: JSON.stringify({
      from: emailFrom,
      to: userEmailState.email,
      subject: "Welcome to onzait",
      html: await renderWelcomeToOnzaitEmail({ appUrl, name }),
      ...(emailReplyTo ? { reply_to: emailReplyTo } : {})
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return jsonResponse(
      { error: "Resend could not send the welcome email.", details: result },
      { status: response.status }
    );
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("users")
    .update({ welcome_email_sent_at: sentAt })
    .eq("id", claims.sub)
    .is("welcome_email_sent_at", null);

  if (updateError) {
    return jsonResponse(
      {
        error:
          "Welcome email was sent, but the sent marker could not be saved.",
        id: result.id
      },
      { status: 500 }
    );
  }

  return jsonResponse({
    id: result.id,
    ok: true,
    skipped: false,
    welcome_email_sent_at: sentAt
  });
}

export default { fetch: handler };
