import { parseOrganizationInvitationToken } from "@/features/workspaces/schemas/organization-invitation.schema";
import { OrganizationInvitationAcceptScreen } from "@/features/workspaces/screens/organization-invitation-accept-screen";
import {
  firstRouteParam,
  getUrlFragmentParam
} from "@/shared/utils/route-params";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

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
    <OrganizationInvitationAcceptScreen
      autoAccept={firstRouteParam(params.intent) === "accept"}
      token={token}
    />
  );
}
