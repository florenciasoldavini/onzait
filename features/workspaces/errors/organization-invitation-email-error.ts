import type { TFunction } from "i18next";

export class OrganizationInvitationEmailError extends Error {
  constructor(
    readonly code: unknown,
    readonly cause?: unknown
  ) {
    super("Organization invitation email request failed");
  }
}

export function organizationInvitationEmailMessage(
  error: unknown,
  t: TFunction<"features/workspaces">
) {
  if (error instanceof OrganizationInvitationEmailError) {
    if (error.code === "INVITATION_SENDER_NOT_CONFIGURED")
      return t(
        ($) => $["features/workspaces"].invitationEmail.senderUnavailable
      );
    if (error.code === "INVITATION_DELIVERY_FAILED")
      return t(($) => $["features/workspaces"].invitationEmail.deliveryFailed);
    if (error.code === "INVITATION_RATE_LIMITED")
      return t(($) => $["features/workspaces"].invitationEmail.rateLimited);
    if (error.code === "INVITATION_STATUS_UNCONFIRMED")
      return t(
        ($) => $["features/workspaces"].invitationEmail.statusUnconfirmed
      );
  }
  return t(($) => $["features/workspaces"].invitationEmail.unavailable);
}
