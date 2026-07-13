import {
  toLiveUserLocation,
  type LiveUserLocation
} from "@/features/projects/live-user-location-values";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

export type LiveUserLocationStatus =
  | "idle"
  | "requesting"
  | "unavailable"
  | "watching";

export function useLiveUserLocation() {
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const [location, setLocation] = useState<LiveUserLocation | null>(null);
  const [status, setStatus] = useState<LiveUserLocationStatus>("idle");

  const stop = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setLocation(null);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (subscriptionRef.current || status === "requesting") {
      return;
    }

    setStatus("requesting");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        setStatus("unavailable");
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 3000
        },
        (position) => {
          setLocation(toLiveUserLocation(position));
          setStatus("watching");
        }
      );

      subscriptionRef.current = subscription;
      setStatus("watching");
    } catch {
      setLocation(null);
      setStatus("unavailable");
    }
  }, [status]);

  useEffect(
    () => () => {
      subscriptionRef.current?.remove();
    },
    []
  );

  return {
    isRequesting: status === "requesting",
    isWatching: status === "watching",
    location,
    start,
    status,
    stop
  };
}
