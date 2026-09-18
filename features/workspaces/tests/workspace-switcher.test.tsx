import { useCreateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import { useInviteOrganizationMember } from "@/features/workspaces/hooks/use-organization-members";
import { OrganizationCreationProvider } from "@/features/workspaces/providers/organization-creation-provider";
import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

jest.mock("@/features/workspaces/hooks/use-workspace-mutations", () => ({
  useCreateOrganization: jest.fn()
}));
jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  useInviteOrganizationMember: jest.fn()
}));
const mockCreate = jest.fn();

// Jest's native renderer cannot load Metro's dynamic chunks. Keep the real
// setup flow, replacing only the lazy module-loading boundary in this suite.
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  lazy: () =>
    jest.requireActual(
      "@/features/workspaces/components/organization-setup-flow"
    ).OrganizationSetupFlow
}));
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/projects";

jest.mock("@/features/projects/hooks/use-workspace-project-count", () => ({
  useWorkspaceProjectCount: () => ({ data: 0, isError: false })
}));
jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));
jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}));

describe("WorkspaceSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/projects";
    mockCreate.mockResolvedValue({
      organization: { id: "organization-2", name: "Second Studio" },
      avatarUploadFailed: false
    });
    jest.mocked(useCreateOrganization).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
      error: null
    } as never);
    jest.mocked(useInviteOrganizationMember).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      error: null
    } as never);
  });

  it.each([
    [/Shared with me/, "/shared"],
    [/Organization settings/, "/organization"]
  ] as const)("opens %s from the workspace picker", async (name, route) => {
    await renderWithAppProviders(
      <OrganizationCreationProvider onCreated={() => mockReplace("/projects")}>
        <WorkspaceSwitcher presentation="sidebar" />
      </OrganizationCreationProvider>
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(await screen.findByRole("button", { name }));
    expect(mockPush).toHaveBeenCalledWith(route);
    expect(screen.queryByText("Your workspaces")).not.toBeOnTheScreen();
  });

  it("opens creation in a modal without navigating, and resets canceled input", async () => {
    await renderWithAppProviders(
      <OrganizationCreationProvider onCreated={() => mockReplace("/projects")}>
        <WorkspaceSwitcher presentation="sidebar" />
      </OrganizationCreationProvider>
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create new organization" })
    );
    const name = await screen.findByPlaceholderText("Studio North");
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByText("Your workspaces")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    await fireEvent.changeText(name, "Unsaved Studio");
    await fireEvent.press(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByPlaceholderText("Studio North")).not.toBeOnTheScreen();
    expect(mockCreate).not.toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create new organization" })
    );
    expect(
      await screen.findByPlaceholderText("Studio North")
    ).toHaveDisplayValue("");
  });

  it.each(["Skip for now", "Close"])(
    "finishes the saved organization with %s",
    async (finishAction) => {
      const refresh = jest.fn().mockResolvedValue(undefined);
      await renderWithAppProviders(
        <OrganizationCreationProvider
          onCreated={() => mockReplace("/projects")}
        >
          <WorkspaceSwitcher />
        </OrganizationCreationProvider>,
        {
          workspace: { refresh }
        }
      );
      await fireEvent.press(
        screen.getByRole("button", { name: "Current workspace" })
      );
      await fireEvent.press(
        screen.getByRole("button", { name: "Create new organization" })
      );
      await fireEvent.changeText(
        await screen.findByPlaceholderText("Studio North"),
        "Second Studio"
      );
      await fireEvent.press(screen.getByRole("button", { name: "Continue" }));
      expect(await screen.findByText("Invite your team")).toBeOnTheScreen();
      expect(mockCreate).toHaveBeenCalledWith({ name: "Second Studio" });
      expect(mockReplace).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByRole("button", { name: finishAction }));
      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith("/projects")
      );
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Invite your team")).not.toBeOnTheScreen();
    }
  );

  it("preserves modal input when responsive navigation remounts the switcher", async () => {
    const renderSwitcher = (compact: boolean) => (
      <OrganizationCreationProvider onCreated={jest.fn()}>
        <WorkspaceSwitcher
          key={compact ? "mobile" : "sidebar"}
          presentation={compact ? "mobile" : "sidebar"}
        />
      </OrganizationCreationProvider>
    );
    const view = await renderWithAppProviders(renderSwitcher(true));
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create new organization" })
    );
    await fireEvent.changeText(
      await screen.findByPlaceholderText("Studio North"),
      "Rotating Studio"
    );
    await view.rerender(renderSwitcher(false));
    expect(screen.getByPlaceholderText("Studio North")).toHaveDisplayValue(
      "Rotating Studio"
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("keeps creation failures visible in the modal", async () => {
    mockCreate.mockRejectedValue(new Error("private provider details"));
    jest.mocked(useCreateOrganization).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
      error: new Error("private provider details")
    } as never);
    await renderWithAppProviders(
      <OrganizationCreationProvider onCreated={() => mockReplace("/projects")}>
        <WorkspaceSwitcher />
      </OrganizationCreationProvider>
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create new organization" })
    );
    await fireEvent.changeText(
      await screen.findByPlaceholderText("Studio North"),
      "Second Studio"
    );
    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByText(
        "We could not create your practice or company. Try again."
      )
    ).toBeOnTheScreen();
    expect(
      screen.queryByText("private provider details")
    ).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("selects shared access and returns to projects when choosing a workspace", async () => {
    mockPathname = "/shared";
    await renderWithAppProviders(
      <OrganizationCreationProvider onCreated={() => mockReplace("/projects")}>
        <WorkspaceSwitcher />
      </OrganizationCreationProvider>
    );
    expect(screen.getByText("Shared with me")).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    expect(
      screen.getByRole("button", { name: "Shared with me" })
    ).toBeSelected();
    expect(
      screen.getByRole("button", { name: "Test workspace" })
    ).not.toBeSelected();
    await fireEvent.press(
      screen.getByRole("button", { name: "Test workspace" })
    );
    expect(mockReplace).toHaveBeenCalledWith("/projects");
  });
});
