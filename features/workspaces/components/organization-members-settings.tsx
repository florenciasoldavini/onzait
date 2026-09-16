import {
  useInviteOrganizationMember,
  useOrganizationMembers,
  useRemoveOrganizationMember,
  useUpdateOrganizationMemberRole
} from "@/features/workspaces/hooks/use-organization-members";
import type { OrganizationMember } from "@/features/workspaces/types/organization-membership";
import { OrganizationPendingInvitations } from "@/features/workspaces/components/organization-pending-invitations";
import {
  createOrganizationInvitationFormSchema,
  type OrganizationInvitationFormValues
} from "@/features/workspaces/schemas/organization-invitation.schema";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import {
  DestructiveConfirmationDialog,
  useDestructiveConfirmation
} from "@/shared/ui/components/destructive-confirmation-dialog";
import { AppHeading } from "@/shared/ui/components/heading";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { TextField } from "@/shared/ui/components/input";
import { SelectField } from "@/shared/ui/components/select-field";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { RefreshIcon, TrashIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export function OrganizationMembersSettings({
  canManageMembers,
  organizationId
}: {
  canManageMembers: boolean;
  organizationId: string;
}) {
  const membersQuery = useOrganizationMembers(organizationId);
  const invite = useInviteOrganizationMember(organizationId);
  const updateRole = useUpdateOrganizationMemberRole(organizationId);
  const removeMember = useRemoveOrganizationMember(organizationId);
  const confirmation = useDestructiveConfirmation();
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const invitationValidationSchema = useMemo(
    () => createOrganizationInvitationFormSchema(t),
    [t]
  );
  const members = membersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const form = useForm<OrganizationInvitationFormValues>({
    defaultValues: { email: "", roleCode: "member" },
    mode: "onChange",
    resolver: zodResolver(invitationValidationSchema)
  });
  const submit = form.handleSubmit(async (values) => {
    const result = await invite.mutateAsync(values);
    if (result.status === "already_member") {
      form.setError("email", {
        message: t(($) => $["features/workspaces"].members.alreadyMember)
      });
      return;
    }
    form.reset({ email: "", roleCode: "member" });
  });
  const confirmRemoval = async () => {
    if (!selectedMember) return;
    confirmation.clearError();
    try {
      await removeMember.mutateAsync(selectedMember.id);
      confirmation.close();
      setSelectedMember(null);
    } catch (error) {
      confirmation.setError(
        getUserFacingErrorMessage(
          error,
          t(($) => $["features/workspaces"].members.removeError)
        )
      );
    }
  };

  return (
    <View style={{ gap: atomSpacing[5] }}>
      {canManageMembers ? (
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[4] }}>
            <View style={{ gap: atomSpacing[1] }}>
              <AppText variant="label">
                {t(($) => $["features/workspaces"].settings.members)}
              </AppText>
              <AppText tone="muted">
                {t(($) => $["features/workspaces"].settings.membersDescription)}
              </AppText>
            </View>
            <AppHeading variant="section">
              {t(($) => $["features/workspaces"].members.inviteTitle)}
            </AppHeading>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  autoCapitalize="none"
                  errorText={fieldState.error?.message}
                  keyboardType="email-address"
                  label={t(($) => $["features/workspaces"].members.email)}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder="person@example.com"
                  required
                  value={field.value}
                />
              )}
            />
            <Controller
              control={form.control}
              name="roleCode"
              render={({ field }) => (
                <SelectField
                  label={t(($) => $["features/workspaces"].members.role)}
                  onChange={field.onChange}
                  options={[
                    {
                      label: t(($) => $["features/workspaces"].roles.member),
                      value: "member"
                    },
                    {
                      label: t(($) => $["features/workspaces"].roles.admin),
                      value: "admin"
                    }
                  ]}
                  required
                  value={field.value}
                />
              )}
            />
            {invite.error ? (
              <AppText tone="danger">
                {getUserFacingErrorMessage(
                  invite.error,
                  t(($) => $["features/workspaces"].members.inviteError)
                )}
              </AppText>
            ) : null}
            <AppButton
              isDisabled={!form.formState.isValid}
              loading={invite.isPending}
              onPress={() => void submit()}
            >
              {t(($) => $["features/workspaces"].members.invite)}
            </AppButton>
          </View>
        </AppCard>
      ) : null}

      {canManageMembers ? (
        <OrganizationPendingInvitations organizationId={organizationId} />
      ) : null}

      {membersQuery.isLoading ? (
        <SkeletonBlock height={220} />
      ) : membersQuery.isError ? (
        <InlineErrorState
          action={{
            icon: RefreshIcon,
            label: tShared(($) => $.shared.actions.retry),
            onPress: () => void membersQuery.refetch()
          }}
          description={getUserFacingErrorMessage(
            membersQuery.error,
            t(($) => $["features/workspaces"].members.loadError)
          )}
          title={t(($) => $["features/workspaces"].members.unavailable)}
        />
      ) : (
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[4] }}>
            <AppHeading variant="section">
              {t(($) => $["features/workspaces"].members.current)}
            </AppHeading>
            {members.map((member) => {
              const name = [member.first_name, member.last_name]
                .filter(Boolean)
                .join(" ");
              return (
                <View
                  key={member.id}
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: atomSpacing[3],
                    justifyContent: "space-between"
                  }}
                >
                  <View style={{ flex: 1, gap: atomSpacing[1], minWidth: 180 }}>
                    <AppText variant="bodySm">{name || member.email}</AppText>
                    <AppText tone="muted" variant="bodySm">
                      {member.email}
                    </AppText>
                  </View>
                  {canManageMembers && !member.is_owner ? (
                    <View
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: atomSpacing[2]
                      }}
                    >
                      <SelectField
                        disabled={updateRole.isPending}
                        label={t(($) => $["features/workspaces"].members.role)}
                        onChange={(roleCode) =>
                          updateRole.mutate({
                            membershipId: member.id,
                            roleCode
                          })
                        }
                        options={[
                          {
                            label: t(
                              ($) => $["features/workspaces"].roles.member
                            ),
                            value: "member"
                          },
                          {
                            label: t(
                              ($) => $["features/workspaces"].roles.admin
                            ),
                            value: "admin"
                          }
                        ]}
                        value={member.role_code}
                      />
                      <AppButton
                        accessibilityLabel={t(
                          ($) => $["features/workspaces"].members.removeLabel,
                          { name: name || member.email }
                        )}
                        color="danger"
                        fullWidth={false}
                        icon={TrashIcon}
                        layout="icon"
                        onPress={() => {
                          setSelectedMember(member);
                          confirmation.open();
                        }}
                        variant="bordered"
                      />
                    </View>
                  ) : (
                    <AppText tone="accent" variant="label">
                      {member.is_owner
                        ? t(($) => $["features/workspaces"].roles.owner)
                        : t(
                            ($) =>
                              $["features/workspaces"].roles[member.role_code]
                          )}
                    </AppText>
                  )}
                </View>
              );
            })}
            {updateRole.isError ? (
              <AppText tone="danger">
                {getUserFacingErrorMessage(
                  updateRole.error,
                  t(($) => $["features/workspaces"].members.roleError)
                )}
              </AppText>
            ) : null}
          </View>
        </AppCard>
      )}

      <DestructiveConfirmationDialog
        accessibilityLabel={t(
          ($) => $["features/workspaces"].members.removeTitle
        )}
        confirmLabel={t(($) => $["features/workspaces"].members.remove)}
        controller={confirmation}
        description={t(
          ($) => $["features/workspaces"].members.removeDescription,
          {
            name:
              [selectedMember?.first_name, selectedMember?.last_name]
                .filter(Boolean)
                .join(" ") ||
              selectedMember?.email ||
              "—"
          }
        )}
        isPending={removeMember.isPending}
        onConfirm={confirmRemoval}
        title={t(($) => $["features/workspaces"].members.removeTitle)}
      />
    </View>
  );
}
