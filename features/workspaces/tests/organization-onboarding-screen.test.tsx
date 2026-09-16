import { useCreateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import {
  useMyOrganizationInvitations,
  useRespondOrganizationInvitation
} from "@/features/workspaces/hooks/use-organization-members";
import { useMyProjectInvitations } from "@/features/projects/hooks/use-project-collaboration";
import OrganizationOnboardingScreen from "@/features/workspaces/screens/organization-onboarding-screen";
import { renderWithAppProviders } from "@/tests/support/render";
import { screen } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}));

jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));

jest.mock("@/features/workspaces/hooks/use-workspace-mutations", () => ({
  useCreateOrganization: jest.fn()
}));

jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  useMyOrganizationInvitations: jest.fn(),
  useRespondOrganizationInvitation: jest.fn()
}));

jest.mock("@/features/projects/hooks/use-project-collaboration", () => ({
  useMyProjectInvitations: jest.fn(),
  useRespondProjectInvitation: jest.fn()
}));

const emptyQuery = {
  data: { pages: [{ items: [] }] },
  isError: false,
  isLoading: false,
  refetch: jest.fn()
};

describe("OrganizationOnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCreateOrganization).mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: jest.fn()
    } as never);
    jest
      .mocked(useMyOrganizationInvitations)
      .mockReturnValue(emptyQuery as never);
    jest.mocked(useMyProjectInvitations).mockReturnValue(emptyQuery as never);
    jest.mocked(useRespondOrganizationInvitation).mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutateAsync: jest.fn()
    } as never);
  });

  it("shows only organization creation when there are no invitations", async () => {
    await renderWithAppProviders(<OrganizationOnboardingScreen />);

    expect(screen.getByRole("button", { name: "Continue" })).toBeOnTheScreen();
    expect(screen.queryByText("View invitations")).not.toBeOnTheScreen();
    expect(
      screen.queryByText("View projects shared with me")
    ).not.toBeOnTheScreen();
  });

  it("shows an organization invitation instead of the creation form", async () => {
    jest.mocked(useMyOrganizationInvitations).mockReturnValue({
      ...emptyQuery,
      data: {
        pages: [
          {
            items: [
              {
                created_at: "2026-09-16T12:00:00.000Z",
                expires_at: "2026-09-23T12:00:00.000Z",
                id: "10000000-0000-4000-8000-000000000001",
                organization_id: "20000000-0000-4000-8000-000000000001",
                organization_name: "Studio North",
                role_code: "member"
              }
            ]
          }
        ]
      }
    } as never);

    await renderWithAppProviders(<OrganizationOnboardingScreen />);

    expect(screen.getByText("Join Studio North")).toBeOnTheScreen();
    expect(
      screen.queryByText("Set up your practice or company")
    ).not.toBeOnTheScreen();
  });
});
