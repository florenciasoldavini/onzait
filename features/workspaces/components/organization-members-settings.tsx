import { useAuth } from "@/features/auth/hooks/use-auth";
import { useLocalization } from "@/features/localization/hooks/use-localization";
import { OrganizationInviteMemberDialog } from "@/features/workspaces/components/organization-invite-member-dialog";
import {
  useInviteOrganizationMember,
  useOrganizationMembers,
  usePendingOrganizationInvitations,
  useRemoveOrganizationMember,
  useRevokeOrganizationInvitation,
  useUpdateOrganizationMemberRole
} from "@/features/workspaces/hooks/use-organization-members";
import type {
  OrganizationMember,
  PendingOrganizationInvitation
} from "@/features/workspaces/types/organization-membership";
import type { OrganizationRole } from "@/features/workspaces/types/workspace";
import { useLayoutMode } from "@/shared/hooks/use-layout-mode";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import {
  DestructiveConfirmationDialog,
  useDestructiveConfirmation
} from "@/shared/ui/components/destructive-confirmation-dialog";
import { AppHeading } from "@/shared/ui/components/heading";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { TextField } from "@/shared/ui/components/input";
import { SelectMenu } from "@/shared/ui/components/select-menu";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { AppText } from "@/shared/ui/components/text";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import {
  MailIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon
} from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export function OrganizationMembersSettings({
  canManageMembers,
  organizationId
}: {
  canManageMembers: boolean;
  organizationId: string;
}) {
  const { user } = useAuth();
  const { formattingLocale } = useLocalization();
  const { isCompact } = useLayoutMode();
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const membersQuery = useOrganizationMembers(organizationId);
  const invitationsQuery = usePendingOrganizationInvitations(
    canManageMembers ? organizationId : undefined
  );
  const invite = useInviteOrganizationMember(organizationId);
  const updateRole = useUpdateOrganizationMemberRole(organizationId);
  const removeMember = useRemoveOrganizationMember(organizationId);
  const revokeInvitation = useRevokeOrganizationInvitation(organizationId);
  const removalConfirmation = useDestructiveConfirmation();
  const revokeConfirmation = useDestructiveConfirmation();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [selectedInvitation, setSelectedInvitation] =
    useState<PendingOrganizationInvitation | null>(null);
  const members = useMemo(
    () => membersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [membersQuery.data]
  );
  const invitations = useMemo(
    () => invitationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [invitationsQuery.data]
  );
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleMembers = useMemo(
    () =>
      members.filter((member) =>
        [member.first_name, member.last_name, member.email]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      ),
    [members, normalizedSearch]
  );
  const visibleInvitations = useMemo(
    () =>
      invitations.filter((invitation) =>
        invitation.email.toLocaleLowerCase().includes(normalizedSearch)
      ),
    [invitations, normalizedSearch]
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(formattingLocale, { dateStyle: "medium" }),
    [formattingLocale]
  );

  const closeInvite = () => {
    invite.reset();
    setInviteOpen(false);
  };
  const confirmRemoval = async () => {
    if (!selectedMember) return;
    removalConfirmation.clearError();
    try {
      await removeMember.mutateAsync(selectedMember.id);
      removalConfirmation.close();
      setSelectedMember(null);
    } catch (error) {
      removalConfirmation.setError(
        getUserFacingErrorMessage(
          error,
          t(($) => $["features/workspaces"].members.removeError)
        )
      );
    }
  };
  const confirmRevoke = async () => {
    if (!selectedInvitation) return;
    revokeConfirmation.clearError();
    try {
      await revokeInvitation.mutateAsync(selectedInvitation.id);
      revokeConfirmation.close();
      setSelectedInvitation(null);
    } catch (error) {
      revokeConfirmation.setError(
        getUserFacingErrorMessage(
          error,
          t(($) => $["features/workspaces"].pendingInvitations.revokeError)
        )
      );
    }
  };

  if (membersQuery.isLoading || invitationsQuery.isLoading) {
    return <SkeletonBlock height={360} />;
  }

  return (
    <>
      <AppCard padding="sm">
        <View style={styles.content}>
          <View
            style={[styles.toolbar, isCompact ? styles.toolbarCompact : null]}
          >
            <View style={styles.titleGroup}>
              <AppHeading variant="section">
                {t(($) => $["features/workspaces"].members.current)}
              </AppHeading>
              <AppText tone="muted" variant="meta">
                {t(($) => $["features/workspaces"].members.summary, {
                  active: members.length,
                  pending: invitations.length
                })}
              </AppText>
            </View>
            <View
              style={[
                styles.toolbarActions,
                isCompact ? styles.toolbarActionsCompact : null
              ]}
            >
              <View style={styles.searchField}>
                <TextField
                  accessibilityLabel={t(
                    ($) => $["features/workspaces"].members.search
                  )}
                  leftIcon={SearchIcon}
                  onChangeText={setSearch}
                  placeholder={t(
                    ($) => $["features/workspaces"].members.search
                  )}
                  size="md"
                  value={search}
                />
              </View>
              {canManageMembers ? (
                <AppButton
                  fullWidth={isCompact}
                  icon={PlusIcon}
                  iconAfter={false}
                  onPress={() => setInviteOpen(true)}
                  size="md"
                >
                  {t(($) => $["features/workspaces"].members.inviteAction)}
                </AppButton>
              ) : null}
            </View>
          </View>

          {membersQuery.isError || invitationsQuery.isError ? (
            <InlineErrorState
              action={{
                icon: RefreshIcon,
                label: tShared(($) => $.shared.actions.retry),
                onPress: () => {
                  void membersQuery.refetch();
                  void invitationsQuery.refetch();
                }
              }}
              description={t(($) => $["features/workspaces"].members.loadError)}
              title={t(($) => $["features/workspaces"].members.unavailable)}
            />
          ) : (
            <>
              {!isCompact ? <MemberListHeader /> : null}
              {visibleMembers.length === 0 &&
              visibleInvitations.length === 0 ? (
                <View style={styles.empty}>
                  <AppText tone="muted">
                    {normalizedSearch
                      ? t(
                          ($) =>
                            $["features/workspaces"].members.noSearchResults
                        )
                      : t(($) => $["features/workspaces"].members.noMembers)}
                  </AppText>
                </View>
              ) : (
                <View>
                  {visibleMembers.map((member) => (
                    <MemberRow
                      canManage={canManageMembers}
                      currentUserId={user?.id}
                      dateFormatter={dateFormatter}
                      isCompact={isCompact}
                      key={member.id}
                      member={member}
                      onRemove={() => {
                        setSelectedMember(member);
                        removalConfirmation.open();
                      }}
                      onRoleChange={(roleCode) =>
                        updateRole.mutate({
                          membershipId: member.id,
                          roleCode
                        })
                      }
                      rolePending={updateRole.isPending}
                    />
                  ))}
                  {visibleInvitations.map((invitation) => (
                    <InvitationRow
                      dateFormatter={dateFormatter}
                      invitation={invitation}
                      isCompact={isCompact}
                      key={invitation.id}
                      onRevoke={() => {
                        setSelectedInvitation(invitation);
                        revokeConfirmation.open();
                      }}
                    />
                  ))}
                </View>
              )}
              {updateRole.isError ? (
                <AppText selectable tone="danger">
                  {getUserFacingErrorMessage(
                    updateRole.error,
                    t(($) => $["features/workspaces"].members.roleError)
                  )}
                </AppText>
              ) : null}
              {membersQuery.hasNextPage || invitationsQuery.hasNextPage ? (
                <AppButton
                  color="neutral"
                  isDisabled={
                    membersQuery.isFetchingNextPage ||
                    invitationsQuery.isFetchingNextPage
                  }
                  loading={
                    membersQuery.isFetchingNextPage ||
                    invitationsQuery.isFetchingNextPage
                  }
                  onPress={() => {
                    if (membersQuery.hasNextPage)
                      void membersQuery.fetchNextPage();
                    if (invitationsQuery.hasNextPage)
                      void invitationsQuery.fetchNextPage();
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {t(($) => $["features/workspaces"].members.loadMore)}
                </AppButton>
              ) : null}
            </>
          )}
        </View>
      </AppCard>

      <OrganizationInviteMemberDialog
        error={invite.error}
        isPending={invite.isPending}
        onClose={closeInvite}
        onInvite={async (values) => {
          const result = await invite.mutateAsync(values);
          return result.status;
        }}
        visible={inviteOpen}
      />
      <DestructiveConfirmationDialog
        accessibilityLabel={t(
          ($) => $["features/workspaces"].members.removeTitle
        )}
        confirmLabel={t(($) => $["features/workspaces"].members.remove)}
        controller={removalConfirmation}
        description={t(
          ($) => $["features/workspaces"].members.removeDescription,
          { name: getMemberName(selectedMember) }
        )}
        isPending={removeMember.isPending}
        onConfirm={confirmRemoval}
        title={t(($) => $["features/workspaces"].members.removeTitle)}
      />
      <DestructiveConfirmationDialog
        accessibilityLabel={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeTitle
        )}
        confirmLabel={t(
          ($) => $["features/workspaces"].pendingInvitations.revoke
        )}
        controller={revokeConfirmation}
        description={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeDescription,
          { email: selectedInvitation?.email ?? "" }
        )}
        isPending={revokeInvitation.isPending}
        onConfirm={confirmRevoke}
        title={t(
          ($) => $["features/workspaces"].pendingInvitations.revokeTitle
        )}
      />
    </>
  );
}

function MemberListHeader() {
  const { t } = useTranslation("features/workspaces");
  return (
    <View style={[styles.row, styles.columnHeader]}>
      <AppText style={styles.identityColumn} tone="muted" variant="eyebrow">
        {t(($) => $["features/workspaces"].members.name)}
      </AppText>
      <AppText style={styles.emailColumn} tone="muted" variant="eyebrow">
        {t(($) => $["features/workspaces"].members.email)}
      </AppText>
      <AppText style={styles.roleColumn} tone="muted" variant="eyebrow">
        {t(($) => $["features/workspaces"].members.roleShort)}
      </AppText>
      <AppText style={styles.activityColumn} tone="muted" variant="eyebrow">
        {t(($) => $["features/workspaces"].members.joined)}
      </AppText>
      <View style={styles.actionColumn} />
    </View>
  );
}

function MemberRow({
  canManage,
  currentUserId,
  dateFormatter,
  isCompact,
  member,
  onRemove,
  onRoleChange,
  rolePending
}: {
  canManage: boolean;
  currentUserId?: string;
  dateFormatter: Intl.DateTimeFormat;
  isCompact: boolean;
  member: OrganizationMember;
  onRemove: () => void;
  onRoleChange: (role: OrganizationRole) => void;
  rolePending: boolean;
}) {
  const { t } = useTranslation("features/workspaces");
  const name = getMemberName(member);
  const isCurrentUser = member.user_id === currentUserId;
  const roleOptions = [
    {
      label: t(($) => $["features/workspaces"].roles.member),
      value: "member" as const
    },
    {
      label: t(($) => $["features/workspaces"].roles.admin),
      value: "admin" as const
    }
  ];

  return (
    <View style={[styles.row, isCompact ? styles.rowCompact : null]}>
      <View
        style={[
          styles.identity,
          isCompact ? styles.identityCompact : styles.identityColumn
        ]}
      >
        <View style={styles.avatar}>
          <AppText tone="accent" variant="label">
            {getInitials(member.first_name, member.last_name)}
          </AppText>
        </View>
        <View style={styles.memberCopy}>
          <View style={styles.nameLine}>
            <AppText numberOfLines={1} variant="bodySm">
              {name}
            </AppText>
            {isCurrentUser ? (
              <AppText tone="muted" variant="meta">
                {t(($) => $["features/workspaces"].members.you)}
              </AppText>
            ) : null}
          </View>
          {isCompact ? (
            <AppText numberOfLines={1} tone="muted" variant="bodySm">
              {member.email}
            </AppText>
          ) : null}
        </View>
      </View>
      {!isCompact ? (
        <AppText numberOfLines={1} style={styles.emailColumn} variant="bodySm">
          {member.email}
        </AppText>
      ) : null}
      <View style={[styles.roleColumn, isCompact ? styles.compactMeta : null]}>
        {canManage && !member.is_owner ? (
          <View
            pointerEvents={rolePending ? "none" : "auto"}
            style={rolePending ? styles.disabled : null}
          >
            <SelectMenu
              accessibilityLabel={t(
                ($) => $["features/workspaces"].members.changeRole,
                { name }
              )}
              minWidth={132}
              onChange={onRoleChange}
              options={roleOptions}
              value={member.role_code}
            />
          </View>
        ) : (
          <StatusPill
            label={t(
              ($) =>
                $["features/workspaces"].roles[
                  member.is_owner ? "owner" : member.role_code
                ]
            )}
            tone="accent"
          />
        )}
      </View>
      <AppText
        style={[styles.activityColumn, isCompact ? styles.compactDate : null]}
        tone="muted"
        variant="meta"
      >
        {dateFormatter.format(new Date(member.joined_at))}
      </AppText>
      <View style={styles.actionColumn}>
        {canManage && !member.is_owner ? (
          <AppButton
            accessibilityLabel={t(
              ($) => $["features/workspaces"].members.removeLabel,
              { name }
            )}
            color="danger"
            fullWidth={false}
            icon={TrashIcon}
            layout="icon"
            onPress={onRemove}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  );
}

function InvitationRow({
  dateFormatter,
  invitation,
  isCompact,
  onRevoke
}: {
  dateFormatter: Intl.DateTimeFormat;
  invitation: PendingOrganizationInvitation;
  isCompact: boolean;
  onRevoke: () => void;
}) {
  const { t } = useTranslation("features/workspaces");
  return (
    <View style={[styles.row, isCompact ? styles.rowCompact : null]}>
      <View
        style={[
          styles.identity,
          isCompact ? styles.identityCompact : styles.identityColumn
        ]}
      >
        <View style={[styles.avatar, styles.invitationAvatar]}>
          <MailIcon color={atomPalette.textMuted} size={16} />
        </View>
        <View style={styles.memberCopy}>
          <AppText tone="muted" variant="bodySm">
            {t(($) => $["features/workspaces"].pendingInvitations.sentLabel)}
          </AppText>
          <AppText tone="muted" variant="meta">
            {t(($) => $["features/workspaces"].pendingInvitations.invitedBy, {
              name: invitation.invited_by_name
            })}
          </AppText>
          {isCompact ? (
            <AppText numberOfLines={1} variant="bodySm">
              {invitation.email}
            </AppText>
          ) : null}
        </View>
      </View>
      {!isCompact ? (
        <AppText numberOfLines={1} style={styles.emailColumn} variant="bodySm">
          {invitation.email}
        </AppText>
      ) : null}
      <View style={[styles.roleColumn, isCompact ? styles.compactMeta : null]}>
        <StatusPill
          label={t(($) => $["features/workspaces"].pendingInvitations.pending)}
          tone="warning"
        />
      </View>
      <AppText
        style={[styles.activityColumn, isCompact ? styles.compactDate : null]}
        tone="muted"
        variant="meta"
      >
        {t(($) => $["features/workspaces"].pendingInvitations.expires, {
          date: dateFormatter.format(new Date(invitation.expires_at))
        })}
      </AppText>
      <View style={styles.actionColumn}>
        <AppButton
          accessibilityLabel={t(
            ($) => $["features/workspaces"].pendingInvitations.revokeLabel,
            { email: invitation.email }
          )}
          color="danger"
          fullWidth={false}
          icon={TrashIcon}
          layout="icon"
          onPress={onRevoke}
          size="sm"
          variant="ghost"
        />
      </View>
    </View>
  );
}

function StatusPill({
  label,
  tone
}: {
  label: string;
  tone: "accent" | "warning";
}) {
  return (
    <View
      style={[
        styles.statusPill,
        tone === "warning" ? styles.statusWarning : styles.statusAccent
      ]}
    >
      <AppText
        style={tone === "warning" ? styles.statusWarningText : undefined}
        tone={tone === "accent" ? "accent" : "default"}
        variant="meta"
      >
        {label}
      </AppText>
    </View>
  );
}

function getMemberName(member: OrganizationMember | null) {
  if (!member) return "—";
  return (
    [member.first_name, member.last_name].filter(Boolean).join(" ") ||
    member.email
  );
}

function getInitials(firstName: string, lastName: string | null) {
  return [firstName, lastName]
    .filter(Boolean)
    .map((part) => part!.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  actionColumn: {
    alignItems: "flex-end",
    minWidth: 40,
    width: 40
  },
  activityColumn: { minWidth: 110, width: 150 },
  avatar: {
    alignItems: "center",
    backgroundColor: `${atomPalette.accent}12`,
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  columnHeader: {
    backgroundColor: atomPalette.surfaceLow,
    borderTopWidth: 1,
    minHeight: 44
  },
  compactDate: { flex: 1, minWidth: 120, width: "auto" },
  compactMeta: { minWidth: 0, width: "auto" },
  content: { gap: 0 },
  disabled: { opacity: 0.55 },
  emailColumn: { flex: 1.1, minWidth: 180 },
  empty: {
    alignItems: "center",
    borderTopColor: atomPalette.borderSubtle,
    borderTopWidth: 1,
    padding: atomSpacing[8]
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[3],
    minWidth: 0
  },
  identityColumn: { flex: 1.2, minWidth: 210 },
  identityCompact: { flexBasis: "100%", width: "100%" },
  invitationAvatar: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderStyle: "dashed",
    borderWidth: 1
  },
  memberCopy: { flex: 1, gap: atomSpacing[1], minWidth: 0 },
  nameLine: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: atomSpacing[2]
  },
  roleColumn: { minWidth: 132, width: 148 },
  row: {
    alignItems: "center",
    borderTopColor: atomPalette.borderSubtle,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: atomSpacing[4],
    minHeight: 72,
    paddingHorizontal: atomSpacing[4],
    paddingVertical: atomSpacing[3]
  },
  rowCompact: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: atomSpacing[3],
    paddingHorizontal: atomSpacing[3]
  },
  searchField: { flex: 1, maxWidth: 520, minWidth: 220 },
  statusAccent: { backgroundColor: `${atomPalette.accent}10` },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: atomRadii.md,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[2]
  },
  statusWarning: { backgroundColor: atomPalette.warningSurface },
  statusWarningText: { color: atomPalette.warningText },
  titleGroup: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: atomSpacing[3]
  },
  toolbar: {
    alignItems: "stretch",
    gap: atomSpacing[4],
    padding: atomSpacing[4]
  },
  toolbarActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[3],
    justifyContent: "space-between",
    width: "100%"
  },
  toolbarActionsCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    maxWidth: undefined,
    width: "100%"
  },
  toolbarCompact: {
    gap: atomSpacing[4]
  }
});
