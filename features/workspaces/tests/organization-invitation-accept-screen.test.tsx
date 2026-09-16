import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useOrganizationInvitationPreview,
  useRespondOrganizationInvitationByToken
} from "@/features/workspaces/hooks/use-organization-members";
import { OrganizationInvitationAcceptScreen } from "@/features/workspaces/screens/organization-invitation-accept-screen";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mutateAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}));

jest.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  useOrganizationInvitationPreview: jest.fn(),
  useRespondOrganizationInvitationByToken: jest.fn()
}));

const token = "a".repeat(64);

describe("OrganizationInvitationAcceptScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockResolvedValue({ status: "accepted" });
    jest.mocked(useAuth).mockReturnValue({ session: null } as never);
    jest.mocked(useOrganizationInvitationPreview).mockReturnValue({
      data: {
        expires_at: "2026-09-23T12:00:00.000Z",
        inviter_name: "Owner Person",
        organization_name: "Studio North",
        role_code: "member",
        status: "pending"
      },
      isError: false,
      isLoading: false
    } as never);
    jest.mocked(useRespondOrganizationInvitationByToken).mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutateAsync
    } as never);
  });

  it("preserves automatic acceptance through authentication", async () => {
    await renderWithAppProviders(
      <OrganizationInvitationAcceptScreen token={token} />
    );

    fireEvent.press(screen.getByText("Join organization"));

    expect(mockPush).toHaveBeenCalledWith(
      `/sign-in?next=${encodeURIComponent(
        `/organization-invitations/accept?intent=accept#token=${token}`
      )}`
    );
  });

  it("automatically accepts after authentication returns", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session: { user: { id: "user-1" } }
    } as never);

    await renderWithAppProviders(
      <OrganizationInvitationAcceptScreen autoAccept token={token} />
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        response: "accepted",
        token
      });
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
