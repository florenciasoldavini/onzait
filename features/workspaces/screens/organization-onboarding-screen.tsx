import { ProjectInvitationCard } from "@/features/projects/components/project-invitations/project-invitation-card";
import { useMyProjectInvitations } from "@/features/projects/hooks/use-project-collaboration";
import { OrganizationInvitationCard } from "@/features/workspaces/components/organization-invitation-card";
import {
  useMyOrganizationInvitations,
  useRespondOrganizationInvitation
} from "@/features/workspaces/hooks/use-organization-members";
import OrganizationSetupScreen from "@/features/workspaces/screens/organization-setup-screen";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { Screen } from "@/shared/ui/components/screen";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { atomSpacing } from "@/shared/ui/components/theme";
import { RefreshIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function OrganizationOnboardingScreen() {
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const organizationInvitations = useMyOrganizationInvitations();
  const projectInvitations = useMyProjectInvitations();
  const response = useRespondOrganizationInvitation();
  const organizationInvitation =
    organizationInvitations.data?.pages[0]?.items[0];
  const projectInvitation = projectInvitations.data?.pages[0]?.items[0];
  const isLoading =
    organizationInvitations.isLoading || projectInvitations.isLoading;
  const isError = organizationInvitations.isError || projectInvitations.isError;

  if (isLoading) {
    return (
      <Screen centered>
        <View style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}>
          <SkeletonBlock height={240} />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen centered>
        <View style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}>
          <InlineErrorState
            action={{
              icon: RefreshIcon,
              label: tShared(($) => $.shared.actions.retry),
              onPress: () => {
                void Promise.all([
                  organizationInvitations.refetch(),
                  projectInvitations.refetch()
                ]);
              }
            }}
            description={t(
              ($) => $["features/workspaces"].invitations.loadError
            )}
            title={t(($) => $["features/workspaces"].invitations.unavailable)}
          />
        </View>
      </Screen>
    );
  }

  if (organizationInvitation) {
    return (
      <Screen centered>
        <View
          style={{
            alignSelf: "center",
            gap: atomSpacing[4],
            maxWidth: 560,
            width: "100%"
          }}
        >
          <OrganizationInvitationCard
            errorMessage={
              response.isError
                ? getUserFacingErrorMessage(
                    response.error,
                    t(($) => $["features/workspaces"].invitations.respondError)
                  )
                : null
            }
            invitation={organizationInvitation}
            isPending={response.isPending}
            onAccept={() =>
              void response.mutateAsync({
                invitationId: organizationInvitation.id,
                response: "accepted"
              })
            }
            onDecline={() =>
              void response.mutateAsync({
                invitationId: organizationInvitation.id,
                response: "declined"
              })
            }
          />
        </View>
      </Screen>
    );
  }

  if (projectInvitation) {
    return (
      <Screen centered>
        <View style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}>
          <ProjectInvitationCard highlighted invitation={projectInvitation} />
        </View>
      </Screen>
    );
  }

  return <OrganizationSetupScreen />;
}
