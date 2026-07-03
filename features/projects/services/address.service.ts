import {
  autocompleteAddressSuggestions,
  resolveAddressSuggestion
} from "@/features/projects/repositories/maps.repository";

export async function autocompleteProjectAddress({
  input,
  sessionToken
}: {
  input: string;
  sessionToken: string;
}) {
  return autocompleteAddressSuggestions({ input, sessionToken });
}

export async function resolveProjectAddress({
  placeId,
  sessionToken
}: {
  placeId: string;
  sessionToken: string;
}) {
  return resolveAddressSuggestion({ placeId, sessionToken });
}
