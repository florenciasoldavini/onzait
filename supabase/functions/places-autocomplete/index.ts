import {
  AuthenticationError,
  requireAuthenticatedUser,
} from "../_shared/auth.ts";
import { corsHeaders, getIpAddress, jsonResponse } from "../_shared/cors.ts";
import { consumeGoogleMapsMonthlyLimit } from "../_shared/google-maps-usage-limit.ts";
import { createRateLimiter } from "../_shared/rate-limit.ts";
import { getTrimmedString } from "../_shared/request.ts";
import { createTtlCache } from "../_shared/ttl-cache.ts";
import { type AutocompleteSuggestion, parseSuggestions } from "./payload.ts";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 40;
const CACHE_TTL_MS = 30_000;
const cache = createTtlCache<AutocompleteResponse>();
const rateLimiter = createRateLimiter({
  maxRequests: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
});

type AutocompleteResponse = {
  attribution: "Google Maps";
  suggestions: AutocompleteSuggestion[];
};

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
      "You must be authenticated to search addresses.",
    );
    const ipAddress = getIpAddress(request);
    const rateKey = `${user.id}:${ipAddress}`;

    if (!rateLimiter.consume(rateKey)) {
      return jsonResponse(
        { error: "Too many address lookups. Try again shortly." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const input = getTrimmedString(body, "input");
    const sessionToken = getTrimmedString(body, "sessionToken");

    if (input.length < 3 || input.length > 160) {
      return jsonResponse(
        { error: "Enter at least 3 characters for address search." },
        { status: 400 },
      );
    }

    if (sessionToken.length < 8 || sessionToken.length > 128) {
      return jsonResponse(
        { error: "Missing address search session token." },
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

    const cacheKey = `${input.toLowerCase()}:${sessionToken}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return jsonResponse(cached);
    }

    const usageLimit = await consumeGoogleMapsMonthlyLimit({
      defaultLimit: 500,
      envName: "GOOGLE_MAPS_AUTOCOMPLETE_MONTHLY_LIMIT",
      service: "places_autocomplete",
    });

    if (!usageLimit.allowed) {
      return jsonResponse(
        { error: usageLimit.message },
        { status: usageLimit.status },
      );
    }

    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        body: JSON.stringify({
          input,
          sessionToken,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
        },
        method: "POST",
      },
    );

    if (!googleResponse.ok) {
      return jsonResponse(
        { error: "Address search is unavailable right now." },
        { status: 502 },
      );
    }

    const googlePayload: unknown = await googleResponse.json();
    const value: AutocompleteResponse = {
      attribution: "Google Maps",
      suggestions: parseSuggestions(googlePayload),
    };

    cache.set(cacheKey, value, CACHE_TTL_MS);
    return jsonResponse(value);
  } catch (error) {
    const isAuthenticationError = error instanceof AuthenticationError;
    const message = isAuthenticationError
      ? error.message
      : "Address search is unavailable right now.";
    const status = isAuthenticationError ? 401 : 500;

    if (!isAuthenticationError) {
      console.error("places-autocomplete failed", error);
    }

    return jsonResponse({ error: message }, { status });
  }
});
