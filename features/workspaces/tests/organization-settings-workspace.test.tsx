import { OrganizationSettingsWorkspace } from "@/features/workspaces/components/organization-settings-workspace";
import { useUpdateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";

jest.mock("@/features/workspaces/hooks/use-workspace-mutations", () => ({
  useUpdateOrganization: jest.fn()
}));

jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));

jest.mock(
  "@/features/workspaces/components/organization-members-settings",
  () => ({
    OrganizationMembersSettings: () => {
      const { Text } = jest.requireActual("react-native");
      return <Text>Member management content</Text>;
    }
  })
);

const workspace = {
  avatar: null,
  display_avatar: null,
  display_name: "Studio North",
  id: "workspace-1",
  name: null,
  organization_avatar: null,
  organization_id: "organization-1",
  organization_name: "Studio North",
  owner_user_id: "owner-1",
  role_code: "admin" as const
};
const updateAsync = jest.fn();

describe("OrganizationSettingsWorkspace", () => {
  beforeEach(() => {
    updateAsync.mockResolvedValue({
      avatar: null,
      id: workspace.organization_id,
      name: workspace.organization_name,
      owner_user_id: workspace.owner_user_id
    });
    jest.mocked(useUpdateOrganization).mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutateAsync: updateAsync
    } as never);
  });

  it("saves organization information from the General tab", async () => {
    await renderWithAppProviders(
      <OrganizationSettingsWorkspace
        activeTab="general"
        canManageMembers
        canUpdate
        isExpanded
        onChangeTab={jest.fn()}
        workspace={workspace}
      />
    );

    await fireEvent.changeText(
      screen.getByDisplayValue("Studio North"),
      "Studio South"
    );
    const save = screen.getByRole("button", { name: "Save organization" });
    expect(save).toBeEnabled();
    await fireEvent.press(save);

    await waitFor(() =>
      expect(updateAsync).toHaveBeenCalledWith({
        avatarAsset: null,
        currentAvatar: null,
        name: "Studio South",
        organizationId: "organization-1"
      })
    );
  });

  it("uses vertical General and Members tabs on expanded layouts", async () => {
    function Harness() {
      const React = jest.requireActual("react") as typeof import("react");
      const [activeTab, setActiveTab] = React.useState<"general" | "members">(
        "general"
      );
      return (
        <OrganizationSettingsWorkspace
          activeTab={activeTab}
          canManageMembers
          canUpdate
          isExpanded
          onChangeTab={setActiveTab}
          workspace={workspace}
        />
      );
    }

    await renderWithAppProviders(<Harness />);

    expect(screen.getAllByText("Organization settings")).not.toHaveLength(0);
    expect(screen.getByRole("tab", { name: "General" })).toBeSelected();
    expect(screen.getByText("Organization avatar")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Studio North")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("tab", { name: "Members" }));

    expect(screen.getByRole("tab", { name: "Members" })).toBeSelected();
    expect(screen.getByText("Member management content")).toBeOnTheScreen();
  });
});
