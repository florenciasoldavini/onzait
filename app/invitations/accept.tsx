import { ProjectInvitationAcceptScreen } from "@/features/projects/screens/project-invitation-accept-screen";
import {
  firstRouteParam,
  getUrlFragmentParam
} from "@/shared/utils/route-params";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export default function ProjectInvitationAcceptRoute() {
  const params = useLocalSearchParams<{ intent?: string | string[] }>();
  const linkingUrl = Linking.useURL();
  const token = useMemo(
    () => getUrlFragmentParam(linkingUrl, "token"),
    [linkingUrl]
  );

  return (
    <ProjectInvitationAcceptScreen
      autoAccept={firstRouteParam(params.intent) === "accept"}
      token={token}
    />
  );
}
