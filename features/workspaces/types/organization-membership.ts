import type { OrganizationRole } from "@/features/workspaces/types/workspace";

export interface OrganizationMember {
  email: string;
  first_name: string;
  id: string;
  is_owner: boolean;
  joined_at: string;
  last_name: string | null;
  role_code: OrganizationRole;
  user_id: string;
}

export interface OrganizationInvitation {
  created_at: string;
  expires_at: string;
  id: string;
  organization_id: string;
  organization_name: string;
  role_code: OrganizationRole;
}

export type OrganizationInvitationStatus =
  | "accepted"
  | "declined"
  | "expired"
  | "pending"
  | "revoked";

export interface OrganizationInvitationPreview {
  expires_at: string;
  inviter_name: string;
  organization_name: string;
  role_code: OrganizationRole;
  status: OrganizationInvitationStatus;
}

export interface OrganizationMemberPage {
  items: OrganizationMember[];
  nextOffset: number | null;
}

export interface OrganizationInvitationPage {
  items: OrganizationInvitation[];
  nextOffset: number | null;
}

export interface PendingOrganizationInvitation {
  delivery_status: "not_sent" | "sending" | "sent" | "failed";
  last_delivery_attempt_at: string | null;
  created_at: string;
  email: string;
  expires_at: string;
  id: string;
  invited_by_name: string;
  role_code: OrganizationRole;
}

export interface PendingOrganizationInvitationPage {
  items: PendingOrganizationInvitation[];
  nextOffset: number | null;
}
