import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useProjectInvitationPreview,
  useRespondProjectInvitation
} from "@/features/projects/hooks/use-project-collaboration";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { AppHeading } from "@/shared/ui/components/heading";
import { Screen } from "@/shared/ui/components/screen";
import { AppText } from "@/shared/ui/components/text";
import { atomPalette, atomSpacing } from "@/shared/ui/components/theme";
import { MailIcon } from "@/shared/ui/icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useLocalization } from "@/features/localization/hooks/use-localization";
import { getProjectRoleLabel } from "@/features/projects/utils/project-role-label";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef } from "react";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";

export function ProjectInvitationLandingContent({
  autoAccept,
  invitation,
  token
}: {
  autoAccept: boolean;
  invitation: NonNullable<
    ReturnType<typeof useProjectInvitationPreview>["data"]
  >;
  token: string;
}) {
  const router = useRouter();
  const { language } = useLocalization();
  const { t } = useTranslation("features/projects");
  const { session } = useAuth();
  const response = useRespondProjectInvitation();
  const automaticAcceptanceStarted = useRef(false);
  const available = invitation.status === "pending";
  const accept = useCallback(async () => {
    if (!session) {
      const nextPath = `/invitations/accept?intent=accept#token=${token}`;
      router.push(`/sign-in?next=${encodeURIComponent(nextPath)}` as never);
      return;
    }

    try {
      await response.mutateAsync({
        invitationId: invitation.id,
        response: "accept"
      });
      router.replace(`/projects/${invitation.projectId}` as never);
    } catch {
      // The mutation error is rendered with safe product wording below.
    }
  }, [invitation.id, invitation.projectId, response, router, session, token]);

  useEffect(() => {
    if (
      !autoAccept ||
      !session ||
      !available ||
      automaticAcceptanceStarted.current
    ) {
      return;
    }

    automaticAcceptanceStarted.current = true;
    void accept();
  }, [accept, autoAccept, available, session]);

  return (
    <Screen centered>
      <AppCard padding="lg" style={{ maxWidth: 560, width: "100%" }}>
        <View style={{ gap: atomSpacing[4] }}>
          <MailIcon color={atomPalette.accent} size="lg" />
          <AppHeading selectable variant="hero">
            {t(($) => $["features/projects"].invitations.join, {
              project: invitation.projectName
            })}
          </AppHeading>
          <AppText selectable tone="muted">
            {t(($) => $["features/projects"].invitations.invitedAs, {
              inviter: invitation.inviterName,
              role: getProjectRoleLabel(
                invitation.roleCode,
                language,
                invitation.roleName
              )
            })}
          </AppText>
          {!available ? (
            <AppText selectable tone="danger">
              {t(($) => $["features/projects"].invitations.invalidStatus, {
                status: t(
                  ($) =>
                    $["features/projects"].invitationStatuses[invitation.status]
                )
              })}
            </AppText>
          ) : (
            <View style={{ gap: atomSpacing[3] }}>
              {response.isError ? (
                <AppText tone="danger">
                  {getUserFacingErrorMessage(
                    response.error,
                    t(($) => $["features/projects"].invitations.respondError)
                  )}
                </AppText>
              ) : null}
              {!session ? (
                <AppText tone="muted" variant="bodySm">
                  {t(
                    ($) => $["features/projects"].invitations.signInDescription
                  )}
                </AppText>
              ) : null}
              <AppButton
                loading={response.isPending}
                onPress={() => void accept()}
              >
                {t(($) => $["features/projects"].invitations.accept)}
              </AppButton>
            </View>
          )}
        </View>
      </AppCard>
    </Screen>
  );
}
