import {
  autocompleteAddressSuggestions,
  getStaticMapPreview,
  resolveAddressSuggestion
} from "@/features/projects/repositories/maps.repository";
import type {
  StaticMapPoint,
  StaticMapViewport
} from "@/features/projects/types/project.types";

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

export async function getProjectAddressMapPreview({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) {
  return getStaticMapPreview({ latitude, longitude });
}

export async function getProjectsMapPreview({
  points,
  viewport
}: {
  points: StaticMapPoint[];
  viewport?: StaticMapViewport | null;
}) {
  return getStaticMapPreview({ points, viewport });
}
