import { isRecord } from "../_shared/request.ts";

export type ResolvedPlace = {
  address: string;
  attribution: "Google Maps";
  latitude: number;
  longitude: number;
  placeId: string;
};

export function parseResolvedPlace(
  payload: unknown,
  fallbackPlaceId: string,
): ResolvedPlace | null {
  if (!isRecord(payload) || !isRecord(payload.location)) {
    return null;
  }

  const address = payload.formattedAddress;
  const latitude = payload.location.latitude;
  const longitude = payload.location.longitude;
  const id = payload.id;

  if (
    typeof address !== "string" ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return null;
  }

  return {
    address,
    attribution: "Google Maps",
    latitude,
    longitude,
    placeId: typeof id === "string" ? id : fallbackPlaceId,
  };
}
