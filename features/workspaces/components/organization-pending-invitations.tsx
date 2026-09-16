import {
  usePendingOrganizationInvitations,
  useRevokeOrganizationInvitation
} from "@/features/workspaces/hooks/use-organization-members";
import type { PendingOrganizationInvitation } from "@/features/workspaces/types/organization-membership";
import { useLocalization } from "@/features/localization/hooks/use-localization";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import {
  DestructiveConfirmationDialog,
  useDestructiveConfirmation
} from "@/shared/ui/components/destructive-confirmation-dialog";
import { AppHeading } from "@/shared/ui/components/heading";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { AppText } from "@/shared/ui/components/text";
import { atomPalette, atomSpacing } from "@/shared/ui/components/theme";
import { RefreshIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function OrganizationPendingInvitations({
  organizationId
}: {
  organizationId: string;
}) {
  const { formattingLocale } = useLocalization();
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const query = usePendingOrganizationInvitations(organizationId);
  const revoke = useRevokeOrganizationInvitation(organizationId);
  const confirmation = useDestructiveConfirmation();
  const [selected, setSelected] =
    useState<PendingOrganizationInvitation | null>(null);
  const invitations = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(formattingLocale, { dateStyle: "medium" }),
    [formattingLocale]
  );

  const confirmRevoke = async () => {
    if (!selected) return;
    confirmation.clearError();
    try {
      await revoke.mutateAsync(selected.id);
      confirmation.close();
      setSelected(null);
    } catch (error) {
      confirmation.setError(
        getUserFacingErrorMessage(
          error,
          t(($) => $["features/workspaces"].pendingInvitations.revokeError)
        )
      );
    }
  };

  if (query.isLoading) {
    return <SkeletonBlock height={180} />;
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
          t(($) => $["features/workspaces"].pendingInvitations.loadError)
        )}
        title={t(
          ($) => $["features/workspaces"].pendingInvitations.unavailable
        )}
      />
    );
  }

  return (
    <>
      <AppCard padding="lg">
        <View style={{ gap: atomSpacing[4] }}>
          <View style={{ gap: atomSpacing[1] }}>
            <AppHeading variant="section">
              {t(($) => $["features/workspaces"].pendingInvitations.title)}
            </AppHeading>
            <AppText tone="muted" variant="bodySm">
              {t(
                ($) => $["features/workspaces"].pendingInvitations.description
              )}
            </AppText>
          </View>

          {invitations.length === 0 ? (
            <AppText tone="muted">
              {t(($) => $["features/workspaces"].pendingInvitations.empty)}
            </AppText>
          ) : (
            invitations.map((invitation, index) => (
              <View
                key={invitation.id}
                style={{
                  alignItems: "center",
                  borderTopColor: atomPalette.borderSubtle,
                  borderTopWidth: index === 0 ? 0 : 1,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: atomSpacing[3],
                  justifyContent: "space-between",
                  paddingTop: index === 0 ? 0 : atomSpacing[4]
                }}
              >
                <View style={{ flex: 1, gap: atomSpacing[1], minWidth: 200 }}>
                  <AppText selectable variant="label">
                    {invitation.email}
                  </AppText>
                  <AppText tone="muted" variant="bodySm">
                    {t(
                      ($) =>
                        $["features/workspaces"].pendingInvitations.details,
                      {
                        date: dateFormatter.format(
                          new Date(invitation.expires_at)
                        ),
                        role: t(
                          ($) =>
                            $["features/workspaces"].roles[invitation.role_code]
                        )
                      }
                    )}
                  </AppText>
                  <AppText tone="muted" variant="meta">
                    {t(
                      ($) =>
                        $["features/workspaces"].pendingInvitations.invitedBy,
                      { name: invitation.invited_by_name }
                    )}
                  </AppText>
                </View>
                <AppButton
                  color="danger"
                  fullWidth={false}
                  onPress={() => {
                    setSelected(invitation);
                    confirmation.open();
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {t(($) => $["features/workspaces"].pendingInvitations.revoke)}
                </AppButton>
              </View>
            ))
          )}

          {query.hasNextPage ? (
            <AppButton
              color="neutral"
              isDisabled={query.isFetchingNextPage}
              loading={query.isFetchingNextPage}
              onPress={() => void query.fetchNextPage()}
              size="sm"
              variant="bordered"
            >
              {t(($) => $["features/workspaces"].pendingInvitations.loadMore)}
            </AppButton>
          ) : null}
        </View>
      </AppCard>

      <DestructiveConfirmationDialog
        accessibilityLabel={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeTitle
        )}
        confirmLabel={t(
          ($) => $["features/workspaces"].pendingInvitations.revoke
        )}
        controller={confirmation}
        description={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeDescription,
          { email: selected?.email ?? "" }
        )}
        isPending={revoke.isPending}
        onConfirm={confirmRevoke}
        title={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeTitle
        )}
      />
    </>
  );
}
