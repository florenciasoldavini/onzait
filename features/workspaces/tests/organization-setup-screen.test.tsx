import { useCreateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import { useInviteOrganizationMember } from "@/features/workspaces/hooks/use-organization-members";
import OrganizationSetupScreen from "@/features/workspaces/screens/organization-setup-screen";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn()
}));

jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock("@/features/workspaces/hooks/use-workspace-mutations", () => ({
  useCreateOrganization: jest.fn()
}));

jest.mock("@/features/workspaces/hooks/use-organization-members", () => ({
  useInviteOrganizationMember: jest.fn()
}));

const mutateAsync = jest.fn();
const inviteAsync = jest.fn();
const createdOrganization = {
  organization: {
    avatar: null,
    id: "organization-2",
    name: "Studio North",
    owner_user_id: "owner-1"
  },
  workspace: {
    avatar: null,
    id: "workspace-2",
    name: null,
    organization_id: "organization-2"
  }
};

describe("OrganizationSetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockResolvedValue(createdOrganization);
    inviteAsync.mockResolvedValue({ status: "pending" });
    jest.mocked(useCreateOrganization).mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync
    } as never);
    jest.mocked(useInviteOrganizationMember).mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: inviteAsync
    } as never);
  });

  it("creates the organization in step one and then offers optional invitations", async () => {
    await renderWithAppProviders(<OrganizationSetupScreen />);

    expect(screen.getByText("Step 1 of 2")).toBeOnTheScreen();
    const submit = screen.getByRole("button", { name: "Continue" });
    expect(submit).toBeDisabled();

    await fireEvent.changeText(
      screen.getByPlaceholderText("Studio North"),
      "A"
    );

    expect(
      await screen.findByText("The practice or company name is too short.")
    ).toBeOnTheScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText("Studio North"),
      "  Studio North  "
    );

    await waitFor(() => expect(submit).toBeEnabled());
    await fireEvent.press(submit);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ name: "Studio North" });
    });
    expect(await screen.findByText("Step 2 of 2")).toBeOnTheScreen();
    expect(screen.getByText("Invite your team")).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Skip for now" })
    ).toBeOnTheScreen();
  });

  it("includes an optional avatar when creating the organization", async () => {
    jest
      .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({
        canAskAgain: true,
        expires: "never",
        granted: true,
        status: "granted" as never
      });
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      assets: [
        {
          fileName: "studio.png",
          height: 400,
          mimeType: "image/png",
          uri: "file:///studio.png",
          width: 400
        }
      ],
      canceled: false
    });
    await renderWithAppProviders(<OrganizationSetupScreen />);

    await fireEvent.press(screen.getByLabelText("Choose organization avatar"));
    await fireEvent.changeText(
      screen.getByPlaceholderText("Studio North"),
      "Studio North"
    );
    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        avatarAsset: {
          fileName: "studio.png",
          mimeType: "image/png",
          uri: "file:///studio.png"
        },
        name: "Studio North"
      })
    );
  });

  it("shows a user-friendly validation error in Spanish", async () => {
    await renderWithAppProviders(<OrganizationSetupScreen />, {
      language: "es"
    });

    await fireEvent.changeText(
      screen.getByPlaceholderText("Estudio Norte"),
      "A"
    );

    expect(
      await screen.findByText(
        "El nombre del estudio o empresa es demasiado corto."
      )
    ).toBeOnTheScreen();
  });

  it("uses organization copy and completes the additional flow only after step two", async () => {
    const onCreated = jest.fn();
    const refresh = jest.fn().mockResolvedValue(undefined);
    mutateAsync.mockResolvedValue({
      ...createdOrganization,
      organization: {
        ...createdOrganization.organization,
        name: "Second Studio"
      }
    });
    await renderWithAppProviders(
      <OrganizationSetupScreen mode="additional" onCreated={onCreated} />,
      { workspace: { refresh } }
    );

    expect(screen.getByText("Create a new organization")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Create a separate organization with its own workspace, projects, and directory."
      )
    ).toBeOnTheScreen();

    await fireEvent.changeText(
      screen.getByPlaceholderText("Studio North"),
      "Second Studio"
    );
    const submit = screen.getByRole("button", {
      name: "Continue"
    });
    await waitFor(() => expect(submit).toBeEnabled());
    await fireEvent.press(submit);

    expect(await screen.findByText("Invite your team")).toBeOnTheScreen();
    expect(onCreated).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole("button", { name: "Skip for now" }));

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it("lets users send multiple invitations before finishing setup", async () => {
    const refresh = jest.fn().mockResolvedValue(undefined);
    await renderWithAppProviders(<OrganizationSetupScreen />, {
      workspace: { refresh }
    });

    await fireEvent.changeText(
      screen.getByPlaceholderText("Studio North"),
      "Studio North"
    );
    await fireEvent.press(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("Invite your team");

    await fireEvent.changeText(
      screen.getByPlaceholderText("person@example.com"),
      "COLLEAGUE@example.com"
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Organization role" })
    );
    await fireEvent.press(screen.getByText("Admin"));
    const invite = screen.getByRole("button", { name: "Send invitation" });
    await waitFor(() => expect(invite).toBeEnabled());
    await fireEvent.press(invite);

    await waitFor(() =>
      expect(inviteAsync).toHaveBeenCalledWith({
        email: "colleague@example.com",
        roleCode: "admin"
      })
    );
    expect(
      screen.getByText("Invitation sent to colleague@example.com.")
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Finish setup" })
    ).toBeOnTheScreen();
  });
});
