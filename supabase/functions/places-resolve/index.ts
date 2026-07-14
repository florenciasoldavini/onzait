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
const RATE_LIMIT_MAX = 30;
const CACHE_TTL_MS = 5 * 60_000;

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
        { error: "Too many address resolutions. Try again shortly." },
        429
      );
    }

    const body = await request.json().catch(() => null);
    const placeId =
      typeof body?.placeId === "string" ? body.placeId.trim() : "";
    const sessionToken =
      typeof body?.sessionToken === "string" ? body.sessionToken.trim() : "";

    if (placeId.length < 3 || placeId.length > 255) {
      return json({ error: "Select a valid Google Maps address result." }, 400);
    }

    if (sessionToken.length < 8 || sessionToken.length > 128) {
      return json({ error: "Missing address search session token." }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return json({ error: "Google Maps is not configured." }, 500);
    }

    const cached = getCached(placeId);

    if (cached) {
      return json(cached);
    }

    const usageLimit = await consumeGoogleMapsMonthlyLimit({
      defaultLimit: 100,
      envName: "GOOGLE_MAPS_PLACE_DETAILS_MONTHLY_LIMIT",
      service: "places_resolve"
    });

    if (!usageLimit.allowed) {
      return json({ error: usageLimit.message }, usageLimit.status);
    }

    const url = new URL(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
    );
    url.searchParams.set("sessionToken", sessionToken);

    const googleResponse = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,formattedAddress,location"
      }
    });

    if (!googleResponse.ok) {
      return json({ error: "Address details are unavailable right now." }, 502);
    }

    const place = await googleResponse.json();
    const latitude = place.location?.latitude;
    const longitude = place.location?.longitude;
    const address = place.formattedAddress;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !address
    ) {
      return json({ error: "Selected address is missing coordinates." }, 422);
    }

    const value = {
      address,
      attribution: "Google Maps",
      latitude,
      longitude,
      placeId: place.id ?? placeId
    };

    setCached(placeId, value, CACHE_TTL_MS);
    return json(value);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Address lookup failed.";
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
    throw new Error("You must be authenticated to resolve addresses.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be authenticated to resolve addresses.");
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
