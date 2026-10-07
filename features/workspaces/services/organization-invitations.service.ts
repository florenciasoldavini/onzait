import type { SupportedLanguage } from "@/features/localization/types/language";
import type { OrganizationRole } from "@/features/workspaces/types/workspace";
import { sendOrganizationInvitationRequest } from "@/features/workspaces/repositories/organization-invitations.repository";

export function inviteOrganizationMember(input: {
  email: string;
  language: SupportedLanguage;
  organizationId: string;
  roleCode: OrganizationRole;
}) {
  return sendOrganizationInvitationRequest({
    ...input,
    email: input.email.trim().toLowerCase(),
    action: "invite"
  });
}

export function resendOrganizationInvitation(
  organizationId: string,
  invitationId: string
) {
  return sendOrganizationInvitationRequest({
    action: "resend",
    organizationId,
    invitationId
  });
}
