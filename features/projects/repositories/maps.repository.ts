import {
  mapAddressSuggestions,
  mapResolvedAddress,
  mapStaticMapPreview
} from "@/features/projects/maps";
import { getMapsFunctionErrorMessage } from "@/features/projects/maps-errors";
import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";
import type {
  AddressSuggestion,
  ResolvedProjectAddress,
  StaticMapPreview
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
    throw await toMapsFunctionError(error);
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
    throw await toMapsFunctionError(error);
  }

  return mapResolvedAddress(data);
}

export async function getStaticMapPreview({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}): Promise<StaticMapPreview> {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("maps-static-preview", {
    body: { latitude, longitude }
  });

  if (error) {
    throw await toMapsFunctionError(error);
  }

  return mapStaticMapPreview(data);
}

export async function toMapsFunctionError(error: unknown) {
  const message = await getMapsFunctionErrorMessage(error);

  if (message) {
    return new Error(message);
  }

  return toRepositoryError(error);
}
