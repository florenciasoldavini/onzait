import { OrganizationPendingInvitations } from "@/features/workspaces/components/organization-pending-invitations";
import {
  usePendingOrganizationInvitations,
  useRevokeOrganizationInvitation
} from "@/features/workspaces/hooks/use-organization-members";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  usePendingOrganizationInvitations: jest.fn(),
  useRevokeOrganizationInvitation: jest.fn()
}));

const revokeAsync = jest.fn();

describe("OrganizationPendingInvitations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    revokeAsync.mockResolvedValue({
      invitation_id: "invitation-1",
      status: "revoked"
    });
    jest.mocked(usePendingOrganizationInvitations).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                created_at: "2026-09-16T12:00:00.000Z",
                email: "colleague@example.com",
                expires_at: "2026-09-23T12:00:00.000Z",
                id: "invitation-1",
                invited_by_name: "Florencia Soldavini",
                role_code: "member"
              }
            ],
            nextOffset: null
          }
        ],
        pageParams: [0]
      },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch: jest.fn()
    } as never);
    jest.mocked(useRevokeOrganizationInvitation).mockReturnValue({
      isPending: false,
      mutateAsync: revokeAsync
    } as never);
  });

  it("lists pending invitations and requires confirmation before revoking", async () => {
    await renderWithAppProviders(
      <OrganizationPendingInvitations organizationId="organization-1" />
    );

    expect(screen.getByText("Pending invitations")).toBeOnTheScreen();
    expect(screen.getByText("colleague@example.com")).toBeOnTheScreen();
    expect(
      screen.getByText("Invited by Florencia Soldavini")
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Revoke" }));
    expect(screen.getByText("Revoke invitation?")).toBeOnTheScreen();
    expect(revokeAsync).not.toHaveBeenCalled();

    const revokeButtons = screen.getAllByRole("button", { name: "Revoke" });
    await fireEvent.press(revokeButtons[revokeButtons.length - 1]);

    await waitFor(() =>
      expect(revokeAsync).toHaveBeenCalledWith("invitation-1")
    );
  });
});
