import { parseOrganizationInvitationToken } from "@/features/workspaces/schemas/organization-invitation.schema";
import {
  firstRouteParam,
  getUrlFragmentParam
} from "@/shared/utils/route-params";
import { RouteLoadingScreen } from "@/shared/route-loading-screen";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { lazy, Suspense, useMemo } from "react";

const OrganizationInvitationAcceptScreen = lazy(async () => {
  const module = await import(
    "@/features/workspaces/screens/organization-invitation-accept-screen"
  );
  return { default: module.OrganizationInvitationAcceptScreen };
});

export default function OrganizationInvitationAcceptRoute() {
  const params = useLocalSearchParams<{ intent?: string | string[] }>();
  const linkingUrl = Linking.useURL();
  const token = useMemo(
    () =>
      parseOrganizationInvitationToken(
        getUrlFragmentParam(linkingUrl, "token")
      ),
    [linkingUrl]
  );

  return (
    <Suspense fallback={<RouteLoadingScreen />}>
      <OrganizationInvitationAcceptScreen
        autoAccept={firstRouteParam(params.intent) === "accept"}
        token={token}
      />
    </Suspense>
  );
}
