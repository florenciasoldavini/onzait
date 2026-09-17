import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen } from "@testing-library/react-native";

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
  });

  it.each([
    [/Shared with me/, "/shared"],
    [/Organization settings/, "/organization"],
    [/Create new organization/, "/organizations/new"]
  ] as const)("opens %s from the workspace picker", async (name, route) => {
    await renderWithAppProviders(<WorkspaceSwitcher presentation="sidebar" />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    await fireEvent.press(await screen.findByRole("button", { name }));
    expect(mockPush).toHaveBeenCalledWith(route);
    expect(screen.queryByText("Your workspaces")).not.toBeOnTheScreen();
  });

  it("selects shared access and returns to projects when choosing a workspace", async () => {
    mockPathname = "/shared";
    await renderWithAppProviders(<WorkspaceSwitcher />);
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
