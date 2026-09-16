import { organizationInvitationFormSchema } from "@/features/workspaces/schemas/organization-invitation.schema";
import { organizationSetupSchema } from "@/features/workspaces/schemas/organization.schema";

describe("organization schemas", () => {
  it("normalizes a valid organization invitation", () => {
    expect(
      organizationInvitationFormSchema.parse({
        email: "  PERSON@EXAMPLE.COM ",
        roleCode: "member"
      })
    ).toEqual({ email: "person@example.com", roleCode: "member" });
  });

  it("keeps organization names within the database contract", () => {
    expect(organizationSetupSchema.parse({ name: "  Studio North  " })).toEqual(
      { name: "Studio North" }
    );
    expect(organizationSetupSchema.safeParse({ name: "A" }).success).toBe(
      false
    );
  });
});
