import {
  mapAddressSuggestions,
  mapResolvedAddress,
  mapStaticMapPreview
} from "@/features/projects/maps/map-payloads";
import { getMapsFunctionErrorMessage } from "@/features/projects/maps/map-errors";
import { requireSupabase } from "@/infrastructure/supabase/repository";
import type {
  AddressSuggestion,
  ResolvedProjectAddress,
  StaticMapPoint,
  StaticMapPreview,
  StaticMapViewport
} from "@/features/projects/types/project.types";
import { UserFacingError } from "@/shared/utils/user-facing-errors";

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
    throw toMapsFunctionError(
      error,
      "Address suggestions are unavailable right now. Try again shortly."
    );
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
    throw toMapsFunctionError(
      error,
      "We couldn't load that address. Select it again and retry."
    );
  }

  return mapResolvedAddress(data);
}

export async function getStaticMapPreview({
  latitude,
  longitude,
  points,
  viewport
}: {
  latitude?: number;
  longitude?: number;
  points?: StaticMapPoint[];
  viewport?: StaticMapViewport | null;
}): Promise<StaticMapPreview> {
  const client = requireSupabase();
  const mapCenter = points?.length ? getMapCenter(points) : null;
  const { data, error } = await client.functions.invoke("maps-static-preview", {
    body: points?.length
      ? {
          centerLatitude: viewport?.centerLatitude,
          centerLongitude: viewport?.centerLongitude,
          latitude: viewport?.centerLatitude ?? mapCenter?.latitude,
          longitude: viewport?.centerLongitude ?? mapCenter?.longitude,
          zoom: viewport?.zoom,
          points
        }
      : { latitude, longitude }
  });

  if (error) {
    throw toMapsFunctionError(
      error,
      "Map preview is unavailable right now. Try again shortly."
    );
  }

  return mapStaticMapPreview(data);
}

function getMapCenter(points: StaticMapPoint[]) {
  const total = points.reduce(
    (sum, point) => ({
      latitude: sum.latitude + point.latitude,
      longitude: sum.longitude + point.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: total.latitude / points.length,
    longitude: total.longitude / points.length
  };
}

export function toMapsFunctionError(error: unknown, fallback: string) {
  return new UserFacingError(
    getMapsFunctionErrorMessage(error, fallback),
    error
  );
}
