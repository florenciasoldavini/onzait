import { sendOrganizationInvitationRequest } from "@/features/workspaces/repositories/organization-invitations.repository";
import { OrganizationInvitationEmailError } from "@/features/workspaces/errors/organization-invitation-email-error";
import { requireSupabase } from "@/infrastructure/supabase/repository";

jest.mock("@/infrastructure/supabase/repository", () => ({
  requireSupabase: jest.fn()
}));
const invoke = jest.fn();
beforeEach(() => {
  invoke.mockReset();
  jest
    .mocked(requireSupabase)
    .mockReturnValue({ functions: { invoke } } as never);
});

it("sends invitations through the authenticated email function", async () => {
  invoke.mockResolvedValue({
    data: { ok: true, data: { id: "invitation", status: "pending" } },
    error: null
  });
  const body = {
    action: "invite",
    organizationId: "organization",
    email: "person@example.com",
    language: "es",
    roleCode: "member"
  };
  await expect(sendOrganizationInvitationRequest(body)).resolves.toEqual({
    id: "invitation",
    status: "pending"
  });
  expect(invoke).toHaveBeenCalledWith("organization-invitations", { body });
});

it("preserves structured delivery failures without exposing provider messages", async () => {
  invoke.mockResolvedValue({
    data: null,
    error: {
      context: {
        clone: () => ({
          json: async () => ({
            code: "INVITATION_DELIVERY_FAILED",
            error: "secret provider message"
          })
        })
      }
    }
  });
  await expect(
    sendOrganizationInvitationRequest({ action: "resend" })
  ).rejects.toMatchObject({ code: "INVITATION_DELIVERY_FAILED" });
  await expect(
    sendOrganizationInvitationRequest({ action: "resend" })
  ).rejects.not.toThrow("secret provider message");
});

it("rejects malformed and unsuccessful responses rather than showing sent", async () => {
  for (const data of [
    null,
    { ok: false },
    { ok: true },
    { ok: true, data: { status: "unknown" } }
  ]) {
    invoke.mockResolvedValue({ data, error: null });
    await expect(
      sendOrganizationInvitationRequest({ action: "invite" })
    ).rejects.toBeInstanceOf(OrganizationInvitationEmailError);
  }
});
