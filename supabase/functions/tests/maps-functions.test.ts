import {
  AuthenticationError,
  requireAuthenticatedUser
} from "../_shared/auth.ts";
import { createRateLimiter } from "../_shared/rate-limit.ts";
import { getTrimmedString } from "../_shared/request.ts";
import { createTtlCache } from "../_shared/ttl-cache.ts";
import {
  parseMapPoints,
  parseMapViewport
} from "../maps-static-preview/input.ts";
import { parseSuggestions } from "../places-autocomplete/payload.ts";
import { parseResolvedPlace } from "../places-resolve/payload.ts";

function assertEquals(actual: unknown, expected: unknown) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}.`);
  }
}

Deno.test("request strings are narrowed and trimmed", () => {
  assertEquals(
    getTrimmedString({ input: "  Main Street  " }, "input"),
    "Main Street"
  );
  assertEquals(getTrimmedString({ input: 42 }, "input"), "");
  assertEquals(getTrimmedString(null, "input"), "");
});

Deno.test(
  "authenticated handlers reject requests without a bearer token",
  async () => {
    try {
      await requireAuthenticatedUser(
        new Request("https://example.com"),
        "Authentication required."
      );
      throw new Error("Expected authentication to fail.");
    } catch (error) {
      assertEquals(error instanceof AuthenticationError, true);
      assertEquals(
        error instanceof Error ? error.message : null,
        "Authentication required."
      );
    }
  }
);

Deno.test("rate limiter blocks until its window resets", () => {
  let now = 1_000;
  const limiter = createRateLimiter({
    maxRequests: 2,
    now: () => now,
    windowMs: 60_000
  });

  assertEquals(limiter.consume("user:ip"), true);
  assertEquals(limiter.consume("user:ip"), true);
  assertEquals(limiter.consume("user:ip"), false);

  now += 60_000;
  assertEquals(limiter.consume("user:ip"), true);
});

Deno.test("TTL cache expires stored responses", () => {
  let now = 1_000;
  const cache = createTtlCache<string>(() => now);

  cache.set("result", "cached", 500);
  assertEquals(cache.get("result"), "cached");

  now += 500;
  assertEquals(cache.get("result"), null);
});

Deno.test("static map input accepts valid points and clamps zoom", () => {
  assertEquals(
    parseMapPoints({
      points: [
        { latitude: -34.6037, longitude: -58.3816 },
        { latitude: 200, longitude: 10 },
        null
      ]
    }),
    [{ latitude: -34.6037, longitude: -58.3816 }]
  );
  assertEquals(
    parseMapViewport({
      centerLatitude: -34.6037,
      centerLongitude: -58.3816,
      zoom: 99
    }),
    {
      centerLatitude: -34.6037,
      centerLongitude: -58.3816,
      zoom: 18
    }
  );
  assertEquals(parseMapViewport({ latitude: 100, longitude: 10 }), null);
});

Deno.test("autocomplete payload discards malformed predictions", () => {
  assertEquals(
    parseSuggestions({
      suggestions: [
        {
          placePrediction: {
            placeId: "place-1",
            text: { text: "Main Street" }
          }
        },
        { placePrediction: { placeId: "missing-text" } },
        null
      ]
    }),
    [{ placeId: "place-1", text: "Main Street" }]
  );
});

Deno.test("place details require a typed address and coordinates", () => {
  assertEquals(
    parseResolvedPlace(
      {
        formattedAddress: "Main Street",
        id: "google-place-id",
        location: { latitude: -34.6037, longitude: -58.3816 }
      },
      "fallback-id"
    ),
    {
      address: "Main Street",
      attribution: "Google Maps",
      latitude: -34.6037,
      longitude: -58.3816,
      placeId: "google-place-id"
    }
  );
  assertEquals(
    parseResolvedPlace(
      { formattedAddress: "Main Street", location: { latitude: "invalid" } },
      "fallback-id"
    ),
    null
  );
});
