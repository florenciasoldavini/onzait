import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { lazy, Suspense } from "react";

const ProfileScreen = lazy(() => import("@/screens/profile"));

export default function Profile() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProfileScreen />
    </Suspense>
  );
}
