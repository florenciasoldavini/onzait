import {
  createOrganizationInvitationRow,
  listPendingOrganizationInvitationRows,
  listMyOrganizationInvitationRows,
  listOrganizationMemberRows,
  previewOrganizationInvitationRow,
  removeOrganizationMemberRow,
  respondOrganizationInvitationByTokenRow,
  respondOrganizationInvitationRow,
  revokeOrganizationInvitationRow,
  updateOrganizationMemberRoleRow
} from "@/features/workspaces/repositories/organization-members.repository";
import type {
  OrganizationInvitationPage,
  OrganizationMemberPage,
  PendingOrganizationInvitationPage
} from "@/features/workspaces/types/organization-membership";
import type { OrganizationRole } from "@/features/workspaces/types/workspace";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

const organizationMembersKey = (organizationId: string) =>
  ["organization-members", organizationId] as const;
const organizationInvitationsKey = ["organization-invitations"] as const;
const pendingOrganizationInvitationsKey = (organizationId: string) =>
  ["organization-pending-invitations", organizationId] as const;

export function useOrganizationMembers(organizationId?: string) {
  return useInfiniteQuery<
    OrganizationMemberPage,
    Error,
    InfiniteData<OrganizationMemberPage>,
    ReturnType<typeof organizationMembersKey>,
    number
  >({
    enabled: Boolean(organizationId),
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listOrganizationMemberRows(organizationId!, pageParam),
    queryKey: organizationMembersKey(organizationId ?? "")
  });
}

export function useInviteOrganizationMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; roleCode: OrganizationRole }) =>
      createOrganizationInvitationRow({ organizationId, ...input }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationMembersKey(organizationId)
        }),
        queryClient.invalidateQueries({
          queryKey: pendingOrganizationInvitationsKey(organizationId)
        })
      ]);
    }
  });
}

export function usePendingOrganizationInvitations(organizationId?: string) {
  return useInfiniteQuery<
    PendingOrganizationInvitationPage,
    Error,
    InfiniteData<PendingOrganizationInvitationPage>,
    ReturnType<typeof pendingOrganizationInvitationsKey>,
    number
  >({
    enabled: Boolean(organizationId),
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listPendingOrganizationInvitationRows(organizationId!, pageParam),
    queryKey: pendingOrganizationInvitationsKey(organizationId ?? "")
  });
}

export function useRevokeOrganizationInvitation(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeOrganizationInvitationRow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: pendingOrganizationInvitationsKey(organizationId)
      });
    }
  });
}

export function useMyOrganizationInvitations() {
  return useInfiniteQuery<
    OrganizationInvitationPage,
    Error,
    InfiniteData<OrganizationInvitationPage>,
    typeof organizationInvitationsKey,
    number
  >({
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listMyOrganizationInvitationRows(pageParam),
    queryKey: organizationInvitationsKey
  });
}

export function useOrganizationInvitationPreview(token?: string) {
  return useQuery({
    enabled: Boolean(token),
    queryFn: () => previewOrganizationInvitationRow(token!),
    queryKey: [...organizationInvitationsKey, "preview", token],
    retry: false
  });
}

export function useRespondOrganizationInvitation() {
  const queryClient = useQueryClient();
  const { refresh } = useWorkspace();
  return useMutation({
    mutationFn: ({
      invitationId,
      response
    }: {
      invitationId: string;
      response: "accepted" | "declined";
    }) => respondOrganizationInvitationRow(invitationId, response),
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsKey
      });
    }
  });
}

export function useRespondOrganizationInvitationByToken() {
  const queryClient = useQueryClient();
  const { refresh } = useWorkspace();
  return useMutation({
    mutationFn: ({
      response,
      token
    }: {
      response: "accepted" | "declined";
      token: string;
    }) => respondOrganizationInvitationByTokenRow(token, response),
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsKey
      });
    }
  });
}

export function useUpdateOrganizationMemberRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { membershipId: string; roleCode: OrganizationRole }) =>
      updateOrganizationMemberRoleRow(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationMembersKey(organizationId)
      });
    }
  });
}

export function useRemoveOrganizationMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeOrganizationMemberRow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationMembersKey(organizationId)
      });
    }
  });
}
