import type {
  ProjectSummary,
  StaticMapViewport
} from "@/features/projects/types";

export interface ProjectMapPoint {
  project: ProjectSummary;
  x: number;
  y: number;
}

export const PROJECTS_STATIC_MAP_WIDTH = 720;
export const PROJECTS_STATIC_MAP_HEIGHT = 520;
export const PROJECTS_MAP_MIN_ZOOM = 10;
export const PROJECTS_MAP_MAX_ZOOM = 18;

const MAP_PADDING_PERCENT = 12;
const MAP_DRAWABLE_PERCENT = 100 - MAP_PADDING_PERCENT * 2;
const MERCATOR_MAX_LATITUDE = 85.05112878;
const TILE_SIZE = 256;

type PanDirection = "down" | "left" | "right" | "up";

export function getProjectsMapViewport(
  projects: ProjectSummary[]
): StaticMapViewport | null {
  const locatedProjects = getLocatedProjects(projects);

  if (locatedProjects.length === 0) {
    return null;
  }

  const center = getAverageCenter(locatedProjects);

  return {
    centerLatitude: center.latitude,
    centerLongitude: center.longitude,
    zoom: getInitialZoom(locatedProjects)
  };
}

export function getProjectMapPoints(
  projects: ProjectSummary[],
  viewport?: StaticMapViewport | null
): ProjectMapPoint[] {
  const locatedProjects = getLocatedProjects(projects);

  if (locatedProjects.length === 0) {
    return [];
  }

  if (viewport) {
    return locatedProjects.map((project) =>
      getProjectedMapPoint(project, viewport)
    );
  }

  return getNormalizedMapPoints(locatedProjects);
}

export function getPannedProjectsMapViewport(
  viewport: StaticMapViewport,
  direction: PanDirection
) {
  const distance =
    direction === "left" || direction === "right"
      ? PROJECTS_STATIC_MAP_WIDTH * 0.28
      : PROJECTS_STATIC_MAP_HEIGHT * 0.28;
  const deltaX =
    direction === "left" ? distance : direction === "right" ? -distance : 0;
  const deltaY =
    direction === "up" ? distance : direction === "down" ? -distance : 0;

  return getDraggedProjectsMapViewport(viewport, deltaX, deltaY);
}

export function getDraggedProjectsMapViewport(
  viewport: StaticMapViewport,
  dragX: number,
  dragY: number
): StaticMapViewport {
  const center = projectLatLng(
    viewport.centerLatitude,
    viewport.centerLongitude,
    viewport.zoom
  );
  const nextCenter = unprojectLatLng(
    center.x - dragX,
    center.y - dragY,
    viewport.zoom
  );

  return {
    ...viewport,
    centerLatitude: nextCenter.latitude,
    centerLongitude: normalizeLongitude(nextCenter.longitude)
  };
}

export function getZoomedProjectsMapViewport(
  viewport: StaticMapViewport,
  delta: number
): StaticMapViewport {
  return {
    ...viewport,
    zoom: clampZoom(viewport.zoom + delta)
  };
}

export function isProjectMapPointVisible(point: ProjectMapPoint) {
  return point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100;
}

function getLocatedProjects(projects: ProjectSummary[]) {
  return projects.filter(
    (project) =>
      Number.isFinite(project.latitude) && Number.isFinite(project.longitude)
  );
}

function getProjectedMapPoint(
  project: ProjectSummary,
  viewport: StaticMapViewport
): ProjectMapPoint {
  const center = projectLatLng(
    viewport.centerLatitude,
    viewport.centerLongitude,
    viewport.zoom
  );
  const point = projectLatLng(
    project.latitude,
    project.longitude,
    viewport.zoom
  );

  return {
    project,
    x:
      50 +
      ((point.x - center.x) / PROJECTS_STATIC_MAP_WIDTH) * MAP_DRAWABLE_PERCENT,
    y:
      50 +
      ((point.y - center.y) / PROJECTS_STATIC_MAP_HEIGHT) * MAP_DRAWABLE_PERCENT
  };
}

function getNormalizedMapPoints(
  projects: ProjectSummary[]
): ProjectMapPoint[] {
  const latitudes = projects.map((project) => project.latitude);
  const longitudes = projects.map((project) => project.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = maxLatitude - minLatitude;
  const longitudeRange = maxLongitude - minLongitude;

  return projects.map((project) => {
    const xRatio =
      longitudeRange === 0
        ? 0.5
        : (project.longitude - minLongitude) / longitudeRange;
    const yRatio =
      latitudeRange === 0
        ? 0.5
        : 1 - (project.latitude - minLatitude) / latitudeRange;

    return {
      project,
      x: MAP_PADDING_PERCENT + xRatio * MAP_DRAWABLE_PERCENT,
      y: MAP_PADDING_PERCENT + yRatio * MAP_DRAWABLE_PERCENT
    };
  });
}

function getAverageCenter(projects: ProjectSummary[]) {
  const total = projects.reduce(
    (sum, project) => ({
      latitude: sum.latitude + project.latitude,
      longitude: sum.longitude + project.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: total.latitude / projects.length,
    longitude: total.longitude / projects.length
  };
}

function getInitialZoom(projects: ProjectSummary[]) {
  if (projects.length <= 1) {
    return 15;
  }

  const latitudes = projects.map((project) => project.latitude);
  const longitudes = projects.map((project) => project.longitude);
  const latitudeFraction =
    (latitudeToMercatorRadians(Math.max(...latitudes)) -
      latitudeToMercatorRadians(Math.min(...latitudes))) /
    Math.PI;
  const longitudeFraction =
    (Math.max(...longitudes) - Math.min(...longitudes)) / 360;
  const latitudeZoom = getBoundsZoom(
    PROJECTS_STATIC_MAP_HEIGHT,
    latitudeFraction
  );
  const longitudeZoom = getBoundsZoom(
    PROJECTS_STATIC_MAP_WIDTH,
    longitudeFraction
  );

  return clampZoom(Math.min(latitudeZoom, longitudeZoom, 15));
}

function getBoundsZoom(mapSize: number, fraction: number) {
  if (!Number.isFinite(fraction) || fraction <= 0) {
    return PROJECTS_MAP_MAX_ZOOM;
  }

  return Math.floor(
    Math.log((mapSize * 0.76) / TILE_SIZE / fraction) / Math.LN2
  );
}

function projectLatLng(latitude: number, longitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** clampZoom(zoom);
  const clampedLatitude = clampLatitude(latitude);
  const sinLatitude = Math.sin((clampedLatitude * Math.PI) / 180);

  return {
    x: ((normalizeLongitude(longitude) + 180) / 360) * scale,
    y:
      (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale
  };
}

function unprojectLatLng(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** clampZoom(zoom);
  const longitude = (x / scale) * 360 - 180;
  const mercator = Math.PI - (2 * Math.PI * y) / scale;
  const latitude =
    (180 / Math.PI) *
    Math.atan(0.5 * (Math.exp(mercator) - Math.exp(-mercator)));

  return {
    latitude: clampLatitude(latitude),
    longitude
  };
}

function latitudeToMercatorRadians(latitude: number) {
  const clampedLatitude = clampLatitude(latitude);
  const sinLatitude = Math.sin((clampedLatitude * Math.PI) / 180);
  const radians = Math.log((1 + sinLatitude) / (1 - sinLatitude)) / 2;

  return Math.max(Math.min(radians, Math.PI), -Math.PI) / 2;
}

function clampLatitude(latitude: number) {
  return Math.max(
    -MERCATOR_MAX_LATITUDE,
    Math.min(MERCATOR_MAX_LATITUDE, latitude)
  );
}

function normalizeLongitude(longitude: number) {
  let normalized = longitude;

  while (normalized < -180) {
    normalized += 360;
  }

  while (normalized > 180) {
    normalized -= 360;
  }

  return normalized;
}

function clampZoom(zoom: number) {
  return Math.max(
    PROJECTS_MAP_MIN_ZOOM,
    Math.min(PROJECTS_MAP_MAX_ZOOM, Math.round(zoom))
  );
}
