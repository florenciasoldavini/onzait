import { isRecord } from "../_shared/request.ts";

const STATIC_MAP_MIN_ZOOM = 10;
const STATIC_MAP_MAX_ZOOM = 18;

export function parseMapPoints(body: unknown) {
  if (isRecord(body) && Array.isArray(body.points)) {
    return body.points
      .slice(0, 50)
      .map((point) =>
        isRecord(point)
          ? {
            latitude: Number(point.latitude),
            longitude: Number(point.longitude),
          }
          : { latitude: Number.NaN, longitude: Number.NaN }
      )
      .filter(
        (point) =>
          isValidLatitude(point.latitude) && isValidLongitude(point.longitude),
      );
  }

  const latitude = Number(isRecord(body) ? body.latitude : Number.NaN);
  const longitude = Number(isRecord(body) ? body.longitude : Number.NaN);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return [];
  }

  return [{ latitude, longitude }];
}

export function parseMapViewport(body: unknown) {
  const input = isRecord(body) ? body : {};
  const centerLatitude = Number(input.centerLatitude ?? input.latitude);
  const centerLongitude = Number(input.centerLongitude ?? input.longitude);
  const zoom = Number(input.zoom);

  if (!isValidLatitude(centerLatitude) || !isValidLongitude(centerLongitude)) {
    return null;
  }

  return {
    centerLatitude,
    centerLongitude,
    zoom: Number.isFinite(zoom) ? clampZoom(zoom) : 15,
  };
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function clampZoom(value: number) {
  return Math.max(
    STATIC_MAP_MIN_ZOOM,
    Math.min(STATIC_MAP_MAX_ZOOM, Math.round(value)),
  );
}
