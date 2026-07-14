export type LiveUserLocation = {
  accuracy: number | null;
  latitude: number;
  longitude: number;
};

export function toLiveUserLocation(position: {
  coords: {
    accuracy: number | null;
    latitude: number;
    longitude: number;
  };
}): LiveUserLocation {
  return {
    accuracy: position.coords.accuracy,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}
