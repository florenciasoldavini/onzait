import { isRecord } from "../_shared/request.ts";

export type AutocompleteSuggestion = {
  placeId: string;
  text: string;
};

export function parseSuggestions(payload: unknown): AutocompleteSuggestion[] {
  if (!isRecord(payload) || !Array.isArray(payload.suggestions)) {
    return [];
  }

  return payload.suggestions.flatMap((suggestion) => {
    if (!isRecord(suggestion) || !isRecord(suggestion.placePrediction)) {
      return [];
    }

    const prediction = suggestion.placePrediction;
    const placeId = prediction.placeId;
    const text = isRecord(prediction.text) ? prediction.text.text : null;

    return typeof placeId === "string" && typeof text === "string"
      ? [{ placeId, text }]
      : [];
  });
}
