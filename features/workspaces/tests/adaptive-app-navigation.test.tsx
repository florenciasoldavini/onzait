import { WorkspaceContextBar } from "@/features/workspaces/components/workspace-context-bar";
import {
  AdaptiveSideNavigation,
  resolveSideNavigationBackground
} from "@/features/workspaces/components/adaptive-app-navigation";
import { getSansFontStyle } from "@/shared/theme/fonts";
import { atomPalette } from "@/shared/ui/components/theme";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithAppProviders } from "@/tests/support/render";

const mockProjectCount = jest.fn(() => ({
  data: 6 as number | undefined,
  isError: false
}));
jest.mock("@/features/projects/hooks/use-workspace-project-count", () => ({
  useWorkspaceProjectCount: () => mockProjectCount()
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockUseProfileAvatarUrl = jest.fn<
  { data: string | null },
  [string | null | undefined]
>(() => ({ data: null }));

jest.mock("@/features/profile/hooks/use-profile-avatar", () => ({
  useProfileAvatarUrl: (reference: string | null | undefined) =>
    mockUseProfileAvatarUrl(reference)
}));

jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));

jest.mock("expo-router", () => ({
  usePathname: () => "/projects",
  useRouter: () => ({ navigate: mockNavigate, push: mockPush })
}));

describe("AdaptiveSideNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectCount.mockReturnValue({ data: 6, isError: false });
    mockUseProfileAvatarUrl.mockReturnValue({ data: null });
  });

  it("uses the workspace-first desktop hierarchy and anchors the account below", async () => {
    await renderWithAppProviders(<AdaptiveSideNavigation expanded />, {
      auth: {
        user: {
          avatar: null,
          created_at: new Date("2026-01-01T00:00:00.000Z"),
          deleted_at: null,
          email: "florencia@example.com",
          first_name: "Florencia",
          id: "owner-1",
          last_name: "Soldavini",
          phone_number: null,
          role: "user",
          updated_at: null,
          welcome_email_sent_at: null
        }
      }
    });

    expect(screen.getByText("Workspace")).toBeOnTheScreen();
    expect(screen.getByText("Test workspace")).toHaveStyle(
      getSansFontStyle("600")
    );
    expect(screen.getByText("Projects")).toBeOnTheScreen();
    expect(screen.getByText("Tasks")).toBeOnTheScreen();
    expect(screen.getByText("Directory")).toBeOnTheScreen();
    expect(screen.queryByText("Shared")).not.toBeOnTheScreen();
    expect(screen.getByText("Florencia Soldavini")).toHaveStyle(
      getSansFontStyle("600")
    );
    expect(screen.getByText("Administrator")).toBeOnTheScreen();
    expect(screen.queryByText("ONZAIT")).not.toBeOnTheScreen();
    expect(await screen.findByText("FS")).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText("Profile"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it.each([true, false])(
    "shows the profile avatar with expanded=%s and falls back on image error",
    async (expanded) => {
      mockUseProfileAvatarUrl.mockReturnValue({
        data: "https://signed.example/profile-avatar.jpg"
      });

      await renderWithAppProviders(
        <AdaptiveSideNavigation expanded={expanded} />,
        {
          auth: {
            user: {
              avatar: "users/owner-1/avatar/profile-avatar.jpg",
              created_at: new Date("2026-01-01T00:00:00.000Z"),
              deleted_at: null,
              email: "florencia@example.com",
              first_name: "Florencia",
              id: "owner-1",
              last_name: "Soldavini",
              phone_number: null,
              role: "user",
              updated_at: null,
              welcome_email_sent_at: null
            }
          }
        }
      );

      expect(mockUseProfileAvatarUrl).toHaveBeenCalledWith(
        "users/owner-1/avatar/profile-avatar.jpg"
      );
      expect(
        screen.getByRole("image", { name: "Florencia Soldavini" })
      ).toHaveProp("source", [
        { uri: "https://signed.example/profile-avatar.jpg" }
      ]);
      expect(screen.queryByText("FS")).not.toBeOnTheScreen();
      fireEvent(
        screen.getByRole("image", { name: "Florencia Soldavini" }),
        "error",
        { nativeEvent: { error: "Image unavailable" } }
      );
      expect(await screen.findByText("FS")).toBeOnTheScreen();
    }
  );

  it("shows the mobile workspace selector beside the notification control", async () => {
    await renderWithAppProviders(<WorkspaceContextBar />);
    expect(
      screen.getByRole("button", { name: "Current workspace" })
    ).toBeOnTheScreen();
    expect(screen.getByText("Test workspace")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeDisabled();
    fireEvent.press(screen.getByRole("button", { name: "Current workspace" }));
    expect(
      await screen.findByText("Create new organization")
    ).toBeOnTheScreen();
  });

  it("opens the active workspace management action from the picker", async () => {
    await renderWithAppProviders(<WorkspaceContextBar />);
    fireEvent.press(screen.getByRole("button", { name: "Current workspace" }));
    expect(await screen.findByText("Your workspaces")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Test workspace" })
    ).toBeSelected();
    fireEvent.press(
      screen.getByRole("button", { name: /Organization settings/ })
    );
    expect(mockPush).toHaveBeenCalledWith("/organization");
  });

  it("hides workspace management when the user cannot manage members", async () => {
    await renderWithAppProviders(<WorkspaceContextBar />, {
      workspace: {
        activeWorkspace: {
          id: "workspace-1",
          organization_id: "org-1",
          organization_name: "Test",
          display_name: "Test workspace",
          name: null,
          avatar: null,
          display_avatar: null,
          organization_avatar: null,
          owner_user_id: "other-owner",
          role_code: "member"
        }
      }
    });
    fireEvent.press(screen.getByRole("button", { name: "Current workspace" }));
    expect(await screen.findByText("Your workspaces")).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: /Organization settings/ })
    ).not.toBeOnTheScreen();
  });

  it("provides hover and keyboard focus feedback on every picker action", async () => {
    await renderWithAppProviders(<WorkspaceContextBar />);
    fireEvent.press(screen.getByRole("button", { name: "Current workspace" }));
    await screen.findByText("Your workspaces");

    for (const name of [
      "Test workspace",
      /Organization settings/,
      "Shared with me",
      "Create new organization"
    ]) {
      const row = screen.getByRole("button", { name });
      const highlighted = name === "Test workspace" || name instanceof RegExp;
      const backgroundColor = highlighted
        ? `${atomPalette.accent}20`
        : atomPalette.surfaceLow;
      await fireEvent(row, "hoverIn");
      expect(row).toHaveStyle({ backgroundColor });
      await fireEvent(row, "hoverOut");
      expect(row).not.toHaveStyle({ backgroundColor });
      await fireEvent(row, "focus");
      expect(row).toHaveStyle({ backgroundColor });
      await fireEvent(row, "blur");
      expect(row).not.toHaveStyle({ backgroundColor });
    }
    expect(screen.getByText("Name, avatar & members")).toHaveStyle({
      color: atomPalette.accent
    });
    expect(screen.getByText("Organization settings")).toHaveStyle(
      getSansFontStyle("500")
    );
  });

  it.each([
    [0, "0 projects"],
    [1, "1 project"],
    [6, "6 projects"]
  ] as const)(
    "shows the real project count %s beneath the workspace",
    async (count, label) => {
      mockProjectCount.mockReturnValue({ data: count, isError: false });
      await renderWithAppProviders(<WorkspaceContextBar />);
      await fireEvent.press(
        screen.getByRole("button", { name: "Current workspace" })
      );
      expect(await screen.findByText(label)).toBeOnTheScreen();
    }
  );

  it("distinguishes loading and unavailable counts from zero projects", async () => {
    mockProjectCount.mockReturnValue({ data: undefined, isError: true });
    await renderWithAppProviders(<WorkspaceContextBar />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Current workspace" })
    );
    expect(
      await screen.findByText("Count unavailable · Reopen to retry")
    ).toBeOnTheScreen();
    expect(screen.queryByText("0 projects")).not.toBeOnTheScreen();
  });

  it("uses hover feedback without overriding the selected destination", () => {
    expect(
      resolveSideNavigationBackground({ focused: false, hovered: true })
    ).toBe(atomPalette.surfaceLow);
    expect(
      resolveSideNavigationBackground({ focused: true, hovered: true })
    ).toBe(`${atomPalette.accent}10`);
    expect(
      resolveSideNavigationBackground({ focused: false, hovered: false })
    ).toBe("transparent");
  });
});
