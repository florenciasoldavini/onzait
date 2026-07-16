import {
  AuthenticationError,
  requireAuthenticatedUser,
} from "../_shared/auth.ts";
import { corsHeaders, getIpAddress, jsonResponse } from "../_shared/cors.ts";
import { consumeGoogleMapsMonthlyLimit } from "../_shared/google-maps-usage-limit.ts";
import { createRateLimiter } from "../_shared/rate-limit.ts";
import { parseMapPoints, parseMapViewport } from "./input.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 40;
const STATIC_MAP_WIDTH = 720;
const STATIC_MAP_HEIGHT = 520;
const rateLimiter = createRateLimiter({
  maxRequests: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
});

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const user = await requireAuthenticatedUser(
      request,
      "You must be authenticated to load map previews.",
    );
    const ipAddress = getIpAddress(request);
    const rateKey = `${user.id}:${ipAddress}`;

    if (!rateLimiter.consume(rateKey)) {
      return jsonResponse(
        { error: "Too many map previews. Try again shortly." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const points = parseMapPoints(body);
    const viewport = parseMapViewport(body);

    if (points.length === 0 && !viewport) {
      return jsonResponse(
        { error: "Select a valid map location." },
        { status: 400 },
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return jsonResponse(
        { error: "Google Maps is not configured." },
        { status: 500 },
      );
    }

    const usageLimit = await consumeGoogleMapsMonthlyLimit({
      defaultLimit: 100,
      envName: "GOOGLE_MAPS_STATIC_MONTHLY_LIMIT",
      service: "maps_static_preview",
    });

    if (!usageLimit.allowed) {
      return jsonResponse(
        { error: usageLimit.message },
        { status: usageLimit.status },
      );
    }

    const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
    url.searchParams.set("size", `${STATIC_MAP_WIDTH}x${STATIC_MAP_HEIGHT}`);
    url.searchParams.set("scale", "2");
    url.searchParams.set("maptype", "roadmap");
    url.searchParams.append("style", "feature:poi|visibility:off");
    url.searchParams.append("style", "feature:transit|visibility:off");

    if (viewport) {
      url.searchParams.set(
        "center",
        `${viewport.centerLatitude},${viewport.centerLongitude}`,
      );
      url.searchParams.set("zoom", String(viewport.zoom));
    } else if (points.length === 1) {
      const [point] = points;

      url.searchParams.set("center", `${point.latitude},${point.longitude}`);
      url.searchParams.set("zoom", "15");
    } else {
      for (const point of points) {
        url.searchParams.append(
          "visible",
          `${point.latitude},${point.longitude}`,
        );
      }
    }

    url.searchParams.set("key", apiKey);

    const googleResponse = await fetch(url);

    if (!googleResponse.ok) {
      if (googleResponse.status === 403) {
        return jsonResponse(
          {
            error:
              "Maps Static API is not enabled or allowed for this Google Maps key.",
          },
          { status: 502 },
        );
      }

      if (googleResponse.status === 429) {
        return jsonResponse(
          { error: "Google Maps preview quota was reached. Try again later." },
          { status: 429 },
        );
      }

      return jsonResponse(
        { error: "Map preview is unavailable right now." },
        { status: 502 },
      );
    }

    const contentType = googleResponse.headers.get("content-type") ??
      "image/png";

    if (!contentType.startsWith("image/")) {
      return jsonResponse(
        { error: "Map preview returned an invalid image." },
        { status: 502 },
      );
    }

    const bytes = new Uint8Array(await googleResponse.arrayBuffer());
    const imageDataUrl = `data:${contentType};base64,${toBase64(bytes)}`;

    return jsonResponse({
      attribution: "Google Maps",
      imageDataUrl,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Map preview failed.";
    const status = error instanceof AuthenticationError ? 401 : 500;

    return jsonResponse({ error: message }, { status });
  }
});

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
