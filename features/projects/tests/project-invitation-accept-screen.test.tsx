import { useAuth } from "@/features/auth/hooks/use-auth";
import { useProjectInvitationPreview } from "@/features/projects/hooks/use-project-collaboration";
import { ProjectInvitationAcceptScreen } from "@/features/projects/screens/project-invitation-accept-screen";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}));

jest.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/features/projects/hooks/use-project-collaboration", () => ({
  useProjectInvitationPreview: jest.fn(),
  useRespondProjectInvitation: jest.fn(() => ({
    error: null,
    isError: false,
    isPending: false,
    mutateAsync: mockMutateAsync
  }))
}));

describe("ProjectInvitationAcceptScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ status: "accepted" });
    jest.mocked(useAuth).mockReturnValue({ session: null } as never);
    jest.mocked(useProjectInvitationPreview).mockReturnValue({
      data: {
        expiresAt: "2026-08-04T10:00:00.000Z",
        id: "30000000-0000-4000-8000-000000000001",
        inviterName: "Owner Person",
        projectId: "20000000-0000-4000-8000-000000000001",
        projectName: "River House",
        roleCode: "viewer",
        roleName: "Viewer",
        status: "pending"
      },
      isError: false,
      isLoading: false
    } as never);
  });

  it("automatically accepts after authentication returns", async () => {
    jest.mocked(useAuth).mockReturnValue({
      session: { user: { id: "user-1" } }
    } as never);

    await renderWithAppProviders(
      <ProjectInvitationAcceptScreen
        autoAccept
        token="secure-invitation-token-value-12345"
      />
    );

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        invitationId: "30000000-0000-4000-8000-000000000001",
        response: "accept"
      });
      expect(mockReplace).toHaveBeenCalledWith(
        "/projects/20000000-0000-4000-8000-000000000001"
      );
    });
  });

  it("preserves automatic acceptance through sign in", async () => {
    await renderWithAppProviders(
      <ProjectInvitationAcceptScreen token="secure-invitation-token-value-12345" />
    );

    fireEvent.press(screen.getByText("Accept"));

    expect(mockPush).toHaveBeenCalledWith(
      "/sign-in?next=%2Finvitations%2Faccept%3Fintent%3Daccept%23token%3Dsecure-invitation-token-value-12345"
    );
  });

  it("does not offer acceptance for an expired invitation", async () => {
    jest.mocked(useProjectInvitationPreview).mockReturnValue({
      data: {
        expiresAt: "2026-07-20T10:00:00.000Z",
        id: "30000000-0000-4000-8000-000000000001",
        inviterName: "Owner Person",
        projectId: "20000000-0000-4000-8000-000000000001",
        projectName: "River House",
        roleCode: "viewer",
        roleName: "Viewer",
        status: "expired"
      },
      isError: false,
      isLoading: false
    } as never);

    await renderWithAppProviders(
      <ProjectInvitationAcceptScreen token="secure-invitation-token-value-12345" />
    );

    expect(screen.getByText("This invitation is expired.")).toBeOnTheScreen();
    expect(screen.queryByText("Sign in")).not.toBeOnTheScreen();
  });
});
