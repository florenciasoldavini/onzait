import {
  useMyOrganizationInvitations,
  useRespondOrganizationInvitation
} from "@/features/workspaces/hooks/use-organization-members";
import { OrganizationInvitationCard } from "@/features/workspaces/components/organization-invitation-card";
import { AppHeading } from "@/shared/ui/components/heading";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { atomSpacing } from "@/shared/ui/components/theme";
import { RefreshIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function OrganizationInvitationList() {
  const query = useMyOrganizationInvitations();
  const response = useRespondOrganizationInvitation();
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const invitations = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isLoading) {
    return <SkeletonBlock height={150} />;
  }

  if (query.isError) {
    return (
      <InlineErrorState
        action={{
          icon: RefreshIcon,
          label: tShared(($) => $.shared.actions.retry),
          onPress: () => void query.refetch()
        }}
        description={getUserFacingErrorMessage(
          query.error,
          t(($) => $["features/workspaces"].invitations.loadError)
        )}
        title={t(($) => $["features/workspaces"].invitations.title)}
      />
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: atomSpacing[4] }}>
      <AppHeading variant="section">
        {t(($) => $["features/workspaces"].invitations.title)}
      </AppHeading>
      {invitations.map((invitation) => (
        <OrganizationInvitationCard
          errorMessage={
            response.isError
              ? getUserFacingErrorMessage(
                  response.error,
                  t(($) => $["features/workspaces"].invitations.respondError)
                )
              : null
          }
          invitation={invitation}
          isPending={response.isPending}
          key={invitation.id}
          onAccept={() =>
            void response.mutateAsync({
              invitationId: invitation.id,
              response: "accepted"
            })
          }
          onDecline={() =>
            void response.mutateAsync({
              invitationId: invitation.id,
              response: "declined"
            })
          }
        />
      ))}
    </View>
  );
}
