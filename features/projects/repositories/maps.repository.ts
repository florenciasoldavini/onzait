import {
  mapAddressSuggestions,
  mapResolvedAddress
} from "@/features/projects/maps";
import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";
import type {
  AddressSuggestion,
  ResolvedProjectAddress
} from "@/features/projects/types";

export async function autocompleteAddressSuggestions({
  input,
  sessionToken
}: {
  input: string;
  sessionToken: string;
}): Promise<AddressSuggestion[]> {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("places-autocomplete", {
    body: { input, sessionToken }
  });

  if (error) {
    throw toRepositoryError(error);
  }

  return mapAddressSuggestions(data);
}

export async function resolveAddressSuggestion({
  placeId,
  sessionToken
}: {
  placeId: string;
  sessionToken: string;
}): Promise<ResolvedProjectAddress> {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("places-resolve", {
    body: { placeId, sessionToken }
  });

  if (error) {
    throw toRepositoryError(error);
  }

  return mapResolvedAddress(data);
}
