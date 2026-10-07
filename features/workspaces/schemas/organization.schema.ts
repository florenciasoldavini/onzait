import { z } from "zod";
import type { TFunction } from "i18next";

export const organizationSetupSchema = z.object({
  name: z.string().trim().min(2).max(120)
});

export function createOrganizationSetupSchema(
  t: TFunction<"features/workspaces">
) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        t(($) => $["features/workspaces"].setup.validation.nameRequired)
      )
      .min(
        2,
        t(($) => $["features/workspaces"].setup.validation.nameTooShort)
      )
      .max(
        120,
        t(($) => $["features/workspaces"].setup.validation.nameTooLong)
      )
  });
}

export type OrganizationSetupValues = z.infer<typeof organizationSetupSchema>;
