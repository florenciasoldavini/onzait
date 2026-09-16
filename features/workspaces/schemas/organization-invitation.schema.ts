import { z } from "zod";
import type { TFunction } from "i18next";

export const organizationInvitationFormSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  roleCode: z.enum(["admin", "member"])
});

export function createOrganizationInvitationFormSchema(
  t: TFunction<"features/workspaces">
) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(
        1,
        t(($) => $["features/workspaces"].members.emailRequired)
      )
      .email(t(($) => $["features/workspaces"].members.emailInvalid))
      .max(
        254,
        t(($) => $["features/workspaces"].members.emailTooLong)
      )
      .transform((email) => email.toLowerCase()),
    roleCode: z.enum(["admin", "member"])
  });
}

const organizationInvitationPreviewSchema = z.object({
  expires_at: z.string().datetime({ offset: true }),
  inviter_name: z.string(),
  organization_name: z.string().trim().min(1),
  role_code: z.enum(["admin", "member"]),
  status: z.enum(["accepted", "declined", "expired", "pending", "revoked"])
});

const organizationInvitationTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function parseOrganizationInvitationPreview(value: unknown) {
  return organizationInvitationPreviewSchema.parse(value);
}

export function parseOrganizationInvitationToken(value: unknown) {
  const result = organizationInvitationTokenSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export type OrganizationInvitationFormValues = z.infer<
  typeof organizationInvitationFormSchema
>;
