import { requireSupabase } from "@/infrastructure/supabase/repository";
import { OrganizationInvitationEmailError } from "@/features/workspaces/errors/organization-invitation-email-error";

export async function sendOrganizationInvitationRequest(
  body: Record<string, unknown>
) {
  const { data, error } = await requireSupabase().functions.invoke<{
    ok: boolean;
    code?: string;
    data?: { id?: string; status: "already_member" | "pending" };
  }>("organization-invitations", { body });
  if (error) {
    const response = (error as { context?: Response }).context;
    const failure =
      response && typeof response.clone === "function"
        ? await response
            .clone()
            .json()
            .catch(() => null)
        : null;
    throw new OrganizationInvitationEmailError(failure?.code, error);
  }
  if (
    !data?.ok ||
    !data.data ||
    !["already_member", "pending"].includes(data.data.status)
  ) {
    throw new OrganizationInvitationEmailError(data?.code);
  }
  return data.data;
}
