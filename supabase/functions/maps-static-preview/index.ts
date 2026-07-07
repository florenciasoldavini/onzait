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

const rateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 40;
const STATIC_MAP_WIDTH = 720;
const STATIC_MAP_HEIGHT = 520;

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
      return json({ error: "Too many map previews. Try again shortly." }, 429);
    }

    const body = await request.json().catch(() => null);
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return json({ error: "Select a valid map location." }, 400);
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return json({ error: "Google Maps is not configured." }, 500);
    }

    const usageLimit = await consumeGoogleMapsMonthlyLimit({
      defaultLimit: 100,
      envName: "GOOGLE_MAPS_STATIC_MONTHLY_LIMIT",
      service: "maps_static_preview"
    });

    if (!usageLimit.allowed) {
      return json({ error: usageLimit.message }, usageLimit.status);
    }

    const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
    url.searchParams.set("center", `${latitude},${longitude}`);
    url.searchParams.set("zoom", "17");
    url.searchParams.set("size", `${STATIC_MAP_WIDTH}x${STATIC_MAP_HEIGHT}`);
    url.searchParams.set("scale", "2");
    url.searchParams.set("maptype", "roadmap");
    url.searchParams.append("style", "feature:poi|visibility:off");
    url.searchParams.append("style", "feature:transit|visibility:off");
    url.searchParams.set("key", apiKey);

    const googleResponse = await fetch(url);

    if (!googleResponse.ok) {
      if (googleResponse.status === 403) {
        return json(
          {
            error:
              "Maps Static API is not enabled or allowed for this Google Maps key."
          },
          502
        );
      }

      if (googleResponse.status === 429) {
        return json(
          { error: "Google Maps preview quota was reached. Try again later." },
          429
        );
      }

      return json({ error: "Map preview is unavailable right now." }, 502);
    }

    const contentType =
      googleResponse.headers.get("content-type") ?? "image/png";

    if (!contentType.startsWith("image/")) {
      return json({ error: "Map preview returned an invalid image." }, 502);
    }

    const bytes = new Uint8Array(await googleResponse.arrayBuffer());
    const imageDataUrl = `data:${contentType};base64,${toBase64(bytes)}`;

    return json({
      attribution: "Google Maps",
      imageDataUrl
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Map preview failed.";
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
    throw new Error("You must be authenticated to load map previews.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } }
  });
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be authenticated to load map previews.");
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

function getIpAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: corsHeaders,
    status
  });
}
