import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import { lazy, Suspense } from "react";

const ProfileScreen = lazy(
  () => import("@/features/profile/screens/profile-screen")
);

export default function Profile() {
  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <ProfileScreen />
    </Suspense>
  );
}
