import { useAuth } from "@/features/auth/hooks/use-auth";
import { OrganizationInvitationCard } from "@/features/workspaces/components/organization-invitation-card";
import {
  useOrganizationInvitationPreview,
  useRespondOrganizationInvitationByToken
} from "@/features/workspaces/hooks/use-organization-members";
import { AppCard } from "@/shared/ui/components/card";
import { AppHeading } from "@/shared/ui/components/heading";
import { RouteStateBoundary } from "@/shared/ui/components/route-feedback";
import { Screen } from "@/shared/ui/components/screen";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { AlertIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function OrganizationInvitationAcceptScreen({
  autoAccept = false,
  token
}: {
  autoAccept?: boolean;
  token?: string;
}) {
  const { session } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("features/workspaces");
  const preview = useOrganizationInvitationPreview(token);
  const response = useRespondOrganizationInvitationByToken();
  const automaticAcceptanceStarted = useRef(false);
  const invitation = preview.data;

  const accept = useCallback(async () => {
    if (!token) return;

    if (!session) {
      const nextPath = `/organization-invitations/accept?intent=accept#token=${token}`;
      router.push(`/sign-in?next=${encodeURIComponent(nextPath)}` as never);
      return;
    }

    try {
      await response.mutateAsync({ response: "accepted", token });
      router.replace("/" as never);
    } catch {
      // The mutation error is rendered with localized product copy below.
    }
  }, [response, router, session, token]);

  useEffect(() => {
    if (
      !autoAccept ||
      !session ||
      !token ||
      invitation?.status !== "pending" ||
      automaticAcceptanceStarted.current
    ) {
      return;
    }

    automaticAcceptanceStarted.current = true;
    void accept();
  }, [accept, autoAccept, invitation?.status, session, token]);

  return (
    <RouteStateBoundary
      feedback={{
        invalidParams: {
          description: t(
            ($) => $["features/workspaces"].invitations.incomplete
          ),
          icon: AlertIcon,
          title: t(($) => $["features/workspaces"].invitations.unavailable)
        },
        loadError: {
          description: getUserFacingErrorMessage(
            preview.error,
            t(($) => $["features/workspaces"].invitations.invalid)
          ),
          icon: AlertIcon,
          title: t(($) => $["features/workspaces"].invitations.unavailable)
        },
        notFound: {
          description: t(($) => $["features/workspaces"].invitations.invalid),
          icon: AlertIcon,
          title: t(($) => $["features/workspaces"].invitations.unavailable)
        }
      }}
      isError={preview.isError}
      isInvalid={!token}
      isLoading={preview.isLoading}
      isNotFound={!invitation}
      loadingFallback={
        <Screen centered>
          <View style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}>
            <SkeletonBlock height={240} />
          </View>
        </Screen>
      }
      resourceName="organization invitation"
    >
      {invitation?.status === "pending" ? (
        <Screen centered>
          <View style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}>
            <OrganizationInvitationCard
              errorMessage={
                response.isError
                  ? getUserFacingErrorMessage(
                      response.error,
                      t(
                        ($) => $["features/workspaces"].invitations.respondError
                      )
                    )
                  : null
              }
              invitation={invitation}
              isPending={response.isPending}
              onAccept={() => void accept()}
            />
          </View>
        </Screen>
      ) : invitation ? (
        <Screen centered>
          <AppCard
            padding="lg"
            style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
          >
            <View style={{ gap: atomSpacing[3] }}>
              <AppHeading variant="title">
                {t(($) => $["features/workspaces"].invitations.unavailable)}
              </AppHeading>
              <AppText tone="muted">
                {t(($) => $["features/workspaces"].invitations.invalidStatus, {
                  status: t(
                    ($) =>
                      $["features/workspaces"].invitationStatuses[
                        invitation.status
                      ]
                  )
                })}
              </AppText>
            </View>
          </AppCard>
        </Screen>
      ) : null}
    </RouteStateBoundary>
  );
}
