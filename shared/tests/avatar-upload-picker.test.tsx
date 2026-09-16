import { AvatarUploadPicker } from "@/shared/ui/components/avatar-upload-picker";
import { atomRadii } from "@/shared/ui/components/theme";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn()
}));

const baseProps = {
  accessibilityLabel: "Choose avatar",
  errorFallback: "We couldn't open your photos.",
  hint: "Optional · JPG, PNG or WebP up to 5 MB",
  imageAccessibilityLabel: "Avatar preview",
  label: "Avatar",
  permissionDeniedMessage: "Enable photo access in settings.",
  permissionRequiredMessage: "Allow photo access and try again."
};

describe("AvatarUploadPicker", () => {
  it("renders the shared circular presentation and selects an image", async () => {
    const onChange = jest.fn();
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
          fileName: "avatar.png",
          height: 400,
          mimeType: "image/png",
          uri: "file:///avatar.png",
          width: 400
        }
      ],
      canceled: false
    });

    await renderWithAppProviders(
      <AvatarUploadPicker {...baseProps} onChange={onChange} value={null} />
    );

    expect(screen.getByText("Avatar")).toBeOnTheScreen();
    expect(
      screen.getByText("Optional · JPG, PNG or WebP up to 5 MB")
    ).toBeOnTheScreen();
    expect(screen.getByTestId("avatar-upload-preview")).toHaveStyle({
      borderRadius: atomRadii.full,
      overflow: "hidden"
    });
    expect(screen.getByTestId("avatar-upload-badge")).toHaveStyle({
      position: "absolute"
    });

    fireEvent.press(screen.getByRole("button", { name: "Choose avatar" }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        fileName: "avatar.png",
        mimeType: "image/png",
        uri: "file:///avatar.png"
      });
    });
  });
});
