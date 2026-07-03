import type {
  AddressSuggestion,
  ResolvedProjectAddress
} from "@/features/projects/types";

export function mapAddressSuggestions(payload: unknown): AddressSuggestion[] {
  if (!payload || typeof payload !== "object" || !("suggestions" in payload)) {
    return [];
  }

  const suggestions = (payload as { suggestions?: unknown }).suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .map((suggestion) => {
      if (!suggestion || typeof suggestion !== "object") {
        return null;
      }

      const placeId = (suggestion as { placeId?: unknown }).placeId;
      const text = (suggestion as { text?: unknown }).text;

      if (typeof placeId !== "string" || typeof text !== "string") {
        return null;
      }

      return { placeId, text };
    })
    .filter((suggestion): suggestion is AddressSuggestion =>
      Boolean(suggestion)
    );
}

export function mapResolvedAddress(payload: unknown): ResolvedProjectAddress {
  if (!payload || typeof payload !== "object") {
    throw new Error("Address lookup returned an invalid response.");
  }

  const address = (payload as { address?: unknown }).address;
  const latitude = (payload as { latitude?: unknown }).latitude;
  const longitude = (payload as { longitude?: unknown }).longitude;
  const placeId = (payload as { placeId?: unknown }).placeId;

  if (
    typeof address !== "string" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    typeof placeId !== "string"
  ) {
    throw new Error("Address lookup returned incomplete coordinates.");
  }

  return { address, latitude, longitude, placeId };
}
