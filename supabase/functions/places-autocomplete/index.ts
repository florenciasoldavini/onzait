// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { consumeGoogleMapsMonthlyLimit } from "../_shared/google-maps-usage-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};

const cache = new Map<string, { expiresAt: number; value: unknown }>();
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 40;
const CACHE_TTL_MS = 30_000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const user = await getAuthenticatedUser(request);
    const ipAddress = getIpAddress(request);
    const rateKey = `${user.id}:${ipAddress}`;

    if (!consumeRateLimit(rateKey)) {
      return json(
        { error: "Too many address lookups. Try again shortly." },
        429
      );
    }

    const body = await request.json().catch(() => null);
    const input = typeof body?.input === "string" ? body.input.trim() : "";
    const sessionToken =
      typeof body?.sessionToken === "string" ? body.sessionToken.trim() : "";

    if (input.length < 3 || input.length > 160) {
      return json(
        { error: "Enter at least 3 characters for address search." },
        400
      );
    }

    if (sessionToken.length < 8 || sessionToken.length > 128) {
      return json({ error: "Missing address search session token." }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return json({ error: "Google Maps is not configured." }, 500);
    }

    const cacheKey = `${input.toLowerCase()}:${sessionToken}`;
    const cached = getCached(cacheKey);

    if (cached) {
      return json(cached);
    }

    const usageLimit = await consumeGoogleMapsMonthlyLimit({
      defaultLimit: 500,
      envName: "GOOGLE_MAPS_AUTOCOMPLETE_MONTHLY_LIMIT",
      service: "places_autocomplete"
    });

    if (!usageLimit.allowed) {
      return json({ error: usageLimit.message }, usageLimit.status);
    }

    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        body: JSON.stringify({
          input,
          sessionToken
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text"
        },
        method: "POST"
      }
    );

    if (!googleResponse.ok) {
      return json({ error: "Address search is unavailable right now." }, 502);
    }

    const googlePayload = await googleResponse.json();
    const suggestions = Array.isArray(googlePayload.suggestions)
      ? googlePayload.suggestions
          .map((suggestion) => suggestion?.placePrediction)
          .filter(Boolean)
          .map((prediction) => ({
            placeId: prediction.placeId,
            text: prediction.text?.text ?? ""
          }))
          .filter((prediction) => prediction.placeId && prediction.text)
      : [];
    const value = {
      attribution: "Google Maps",
      suggestions
    };

    setCached(cacheKey, value, CACHE_TTL_MS);
    return json(value);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Address search failed.";
    const status = message.includes("authenticated") ? 401 : 500;

    return json({ error: message }, status);
  }
});

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (
    !authorization.startsWith("Bearer ") ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    throw new Error("You must be authenticated to search addresses.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be authenticated to search addresses.");
  }

  return user;
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count += 1;
  return true;
}

function getCached(key: string) {
  const current = cache.get(key);

  if (!current || current.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return current.value;
}

function setCached(key: string, value: unknown, ttlMs: number) {
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });
}

function getIpAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: corsHeaders,
    status
  });
}
