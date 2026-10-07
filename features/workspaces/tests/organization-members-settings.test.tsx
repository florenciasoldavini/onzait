import { OrganizationInvitationEmailError } from "@/features/workspaces/errors/organization-invitation-email-error";
import { OrganizationMembersSettings } from "@/features/workspaces/components/organization-members-settings";
import {
  useInviteOrganizationMember,
  useResendOrganizationInvitation,
  useOrganizationMembers,
  usePendingOrganizationInvitations,
  useRemoveOrganizationMember,
  useRevokeOrganizationInvitation,
  useUpdateOrganizationMemberRole
} from "@/features/workspaces/hooks/use-organization-members";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  useInviteOrganizationMember: jest.fn(),
  useResendOrganizationInvitation: jest.fn(),
  useOrganizationMembers: jest.fn(),
  usePendingOrganizationInvitations: jest.fn(),
  useRemoveOrganizationMember: jest.fn(),
  useRevokeOrganizationInvitation: jest.fn(),
  useUpdateOrganizationMemberRole: jest.fn()
}));

const inviteAsync = jest.fn();
const resend = jest.fn();

describe("OrganizationMembersSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useResendOrganizationInvitation).mockReturnValue({
      mutate: resend,
      isPending: false,
      isError: false
    } as never);
    inviteAsync.mockResolvedValue({ status: "pending" });
    jest.mocked(useOrganizationMembers).mockReturnValue({
      data: {
        pageParams: [0],
        pages: [
          {
            items: [
              {
                email: "florencia@example.com",
                first_name: "Florencia",
                id: "membership-1",
                is_owner: true,
                joined_at: "2026-09-01T12:00:00.000Z",
                last_name: "Soldavini",
                role_code: "admin",
                user_id: "user-1"
              },
              {
                email: "dario@example.com",
                first_name: "Dario",
                id: "membership-2",
                is_owner: false,
                joined_at: "2026-09-10T12:00:00.000Z",
                last_name: "Mendez",
                role_code: "member",
                user_id: "user-2"
              }
            ],
            nextOffset: null
          }
        ]
      },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch: jest.fn()
    } as never);
    jest.mocked(usePendingOrganizationInvitations).mockReturnValue({
      data: {
        pageParams: [0],
        pages: [
          {
            items: [
              {
                delivery_status: "not_sent",
                last_delivery_attempt_at: null,
                created_at: "2026-09-16T12:00:00.000Z",
                email: "pending@example.com",
                expires_at: "2026-09-23T12:00:00.000Z",
                id: "invitation-1",
                invited_by_name: "Florencia Soldavini",
                role_code: "member"
              }
            ],
            nextOffset: null
          }
        ]
      },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch: jest.fn()
    } as never);
    jest.mocked(useInviteOrganizationMember).mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: inviteAsync,
      reset: jest.fn()
    } as never);
    jest.mocked(useUpdateOrganizationMemberRole).mockReturnValue({
      isError: false,
      isPending: false,
      mutate: jest.fn()
    } as never);
    jest.mocked(useRemoveOrganizationMember).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn()
    } as never);
    jest.mocked(useRevokeOrganizationInvitation).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn()
    } as never);
  });

  it("combines active members and pending invitations without showing the invite form", async () => {
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );

    expect(screen.getByText("2 active · 1 pending")).toBeOnTheScreen();
    expect(screen.getByText("Florencia Soldavini")).toBeOnTheScreen();
    expect(screen.getByText("Dario Mendez")).toBeOnTheScreen();
    expect(screen.getByText("pending@example.com")).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText("person@example.com")).toBeNull();
  });

  it("opens a modal from Invite member and submits a valid invitation", async () => {
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Invite member" })
    );
    const email = screen.getByPlaceholderText("person@example.com");
    expect(email).toBeOnTheScreen();

    await fireEvent.changeText(email, "new.member@example.com");
    await fireEvent.press(
      screen.getByRole("button", { name: "Send invitation" })
    );

    await waitFor(() =>
      expect(inviteAsync).toHaveBeenCalledWith({
        email: "new.member@example.com",
        roleCode: "member"
      })
    );
  });

  it("filters both members and invitations from the search control", async () => {
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText("Search members"),
      "pending@"
    );

    expect(screen.queryByText("Dario Mendez")).toBeNull();
    expect(screen.getByText("pending@example.com")).toBeOnTheScreen();
  });

  it("labels legacy invitations as unsent and lets managers resend", async () => {
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );
    expect(screen.getByText("Email not sent")).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole("button", {
        name: "Resend invitation to pending@example.com"
      })
    );
    expect(resend).toHaveBeenCalledWith("invitation-1");
  });

  it("shows a loader only on the invitation being resent", async () => {
    const query = usePendingOrganizationInvitations("organization-1");
    const firstInvitation = query.data!.pages[0].items[0];
    jest.mocked(usePendingOrganizationInvitations).mockReturnValue({
      ...query,
      data: {
        pageParams: [0],
        pages: [
          {
            items: [
              firstInvitation,
              {
                ...firstInvitation,
                id: "invitation-2",
                email: "other@example.com"
              }
            ],
            nextOffset: null
          }
        ]
      }
    } as never);
    jest.mocked(useResendOrganizationInvitation).mockReturnValue({
      mutate: resend,
      isPending: true,
      isError: false,
      variables: "invitation-1"
    } as never);

    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );

    const activeButton = screen.getByRole("button", {
      name: "Resend invitation to pending@example.com"
    });
    const otherButton = screen.getByRole("button", {
      name: "Resend invitation to other@example.com"
    });
    expect(
      activeButton.queryAll((node) => node.type === "ActivityIndicator")
    ).toHaveLength(1);
    expect(
      otherButton.queryAll((node) => node.type === "ActivityIndicator")
    ).toHaveLength(0);
    expect(activeButton).toBeDisabled();
    expect(otherButton).toBeDisabled();
  });

  it("keeps a failed invitation form open with a delivery-specific message", async () => {
    const failure = new OrganizationInvitationEmailError(
      "INVITATION_DELIVERY_FAILED"
    );
    inviteAsync.mockRejectedValue(failure);
    jest.mocked(useInviteOrganizationMember).mockReturnValue({
      error: failure,
      isPending: false,
      mutateAsync: inviteAsync,
      reset: jest.fn()
    } as never);
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Invite member" })
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText("person@example.com"),
      "new@example.com"
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Send invitation" })
    );
    expect(screen.getByPlaceholderText("person@example.com")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "The invitation was saved, but the email could not be sent. Wait a minute, then try again."
      )
    ).toBeOnTheScreen();
  });

  it("disables repeated sends and shows localized resend failures", async () => {
    jest.mocked(useResendOrganizationInvitation).mockReturnValue({
      mutate: resend,
      isPending: true,
      isError: true,
      error: new OrganizationInvitationEmailError("INVITATION_RATE_LIMITED")
    } as never);
    await renderWithAppProviders(
      <OrganizationMembersSettings
        canManageMembers
        organizationId="organization-1"
      />,
      { language: "es" }
    );
    expect(
      screen.getByRole("button", {
        name: "Reenviar invitación a pending@example.com"
      })
    ).toBeDisabled();
    expect(
      screen.getByText(
        "Espera antes de enviar otra invitación. Si alcanzaste el límite diario, inténtalo mañana."
      )
    ).toBeOnTheScreen();
  });
});
