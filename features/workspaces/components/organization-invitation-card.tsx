import type { OrganizationRole } from "@/features/workspaces/types/workspace";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { AppHeading } from "@/shared/ui/components/heading";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export function OrganizationInvitationCard({
  errorMessage,
  invitation,
  isPending,
  onAccept,
  onDecline
}: {
  errorMessage?: string | null;
  invitation: {
    inviter_name?: string;
    organization_name: string;
    role_code: OrganizationRole;
  };
  isPending: boolean;
  onAccept: () => void;
  onDecline?: () => void;
}) {
  const { t } = useTranslation("features/workspaces");

  return (
    <AppCard padding="lg" style={{ maxWidth: 560, width: "100%" }}>
      <View style={{ gap: atomSpacing[4] }}>
        <View style={{ gap: atomSpacing[2] }}>
          <AppHeading variant="title">
            {t(($) => $["features/workspaces"].invitations.joinTitle, {
              organization: invitation.organization_name
            })}
          </AppHeading>
          <AppText tone="muted">
            {t(($) => $["features/workspaces"].invitations.role, {
              role: t(
                ($) => $["features/workspaces"].roles[invitation.role_code]
              )
            })}
          </AppText>
          {invitation.inviter_name ? (
            <AppText tone="muted">
              {t(($) => $["features/workspaces"].invitations.invitedBy, {
                inviter: invitation.inviter_name
              })}
            </AppText>
          ) : null}
        </View>

        {errorMessage ? <AppText tone="danger">{errorMessage}</AppText> : null}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: atomSpacing[3]
          }}
        >
          <AppButton
            fullWidth={!onDecline}
            isDisabled={isPending}
            loading={isPending}
            onPress={onAccept}
          >
            {t(($) => $["features/workspaces"].invitations.accept)}
          </AppButton>
          {onDecline ? (
            <AppButton
              color="neutral"
              fullWidth={false}
              isDisabled={isPending}
              onPress={onDecline}
              variant="bordered"
            >
              {t(($) => $["features/workspaces"].invitations.decline)}
            </AppButton>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}
