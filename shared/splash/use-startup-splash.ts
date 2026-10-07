import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";

const startupKey = "onzait.startup-visited";
let visitedThisRun = false;

function claimFirstVisit() {
  let visited = visitedThisRun;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      visited = visited || window.sessionStorage.getItem(startupKey) === "1";
      window.sessionStorage.setItem(startupKey, "1");
    } catch {
      // Restricted browser storage still permits one animation per runtime.
    }
  }
  visitedThisRun = true;
  return !visited;
}

export function useStartupSplash({
  ready,
  authenticated
}: {
  ready: boolean;
  authenticated: boolean;
}) {
  const decided = useRef(false);
  const [visible, setVisible] = useState(false);
  const finish = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!ready || decided.current) return;
    decided.current = true;
    const firstVisit = claimFirstVisit();
    setVisible(firstVisit && !authenticated);
    if (Platform.OS !== "web" && (!firstVisit || authenticated)) {
      SplashScreen.hide();
    }
  }, [authenticated, ready]);

  return { visible, finish };
}
