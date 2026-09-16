import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { renderWithAppProviders } from "@/tests/support/render";
import { fireEvent, screen } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/projects";
let mockActions: {
  dividerBefore?: boolean;
  label: string;
  onPress: () => void;
  selected?: boolean;
  tone?: "accent" | "neutral";
}[] = [];
let mockValueSelected = true;
let mockDisplayValue: string | undefined;

jest.mock("@/features/workspaces/hooks/use-organization-avatar", () => ({
  useOrganizationAvatarUrl: () => null
}));

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}));

jest.mock("@/shared/ui/components/select-menu", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native");

  return {
    SelectMenu: ({
      actions,
      displayValue,
      eyebrow,
      onChange,
      options,
      valueSelected
    }: {
      actions: { label: string; onPress: () => void }[];
      displayValue?: string;
      eyebrow?: string;
      onChange: (value: string) => void;
      options: { label: string }[];
      valueSelected: boolean;
    }) => {
      mockActions = actions;
      mockDisplayValue = displayValue;
      mockValueSelected = valueSelected;

      return (
        <View>
          {eyebrow ? <Text>{eyebrow}</Text> : null}
          <Pressable onPress={() => onChange("workspace-1")}>
            <Text>{options[0]?.label}</Text>
          </Pressable>
          {actions.map((action) => (
            <Pressable
              accessibilityLabel={action.label}
              key={action.label}
              onPress={action.onPress}
            >
              <Text>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      );
    }
  };
});

describe("WorkspaceSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActions = [];
    mockPathname = "/projects";
    mockDisplayValue = undefined;
    mockValueSelected = true;
  });

  it("groups shared access above organization management actions", async () => {
    await renderWithAppProviders(<WorkspaceSwitcher presentation="sidebar" />);

    expect(screen.getByText("Workspace")).toBeOnTheScreen();
    expect(screen.getByText("Test workspace")).toBeOnTheScreen();
    expect(mockActions[0]).toMatchObject({
      label: "Shared with me",
      selected: false,
      tone: "neutral"
    });
    expect(mockActions[0]?.dividerBefore).toBeUndefined();
    expect(mockActions[1]).toMatchObject({
      dividerBefore: true,
      label: "Organization settings",
      tone: "neutral"
    });
    expect(mockActions[2]).toMatchObject({
      dividerBefore: false,
      label: "Create new organization",
      tone: "accent"
    });
    expect(mockValueSelected).toBe(true);

    await fireEvent.press(screen.getByLabelText("Shared with me"));
    expect(mockPush).toHaveBeenCalledWith("/shared");

    await fireEvent.press(screen.getByLabelText("Organization settings"));
    expect(mockPush).toHaveBeenCalledWith("/organization");

    await fireEvent.press(screen.getByLabelText("Create new organization"));
    expect(mockPush).toHaveBeenCalledWith("/organizations/new");
  });

  it("selects shared access instead of the active workspace on the shared route", async () => {
    mockPathname = "/shared";
    await renderWithAppProviders(<WorkspaceSwitcher />);

    expect(mockActions[0]).toMatchObject({
      label: "Shared with me",
      selected: true,
      tone: "neutral"
    });
    expect(mockValueSelected).toBe(false);
    expect(mockDisplayValue).toBe("Shared with me");

    await fireEvent.press(screen.getByText("Test workspace"));
    expect(mockReplace).toHaveBeenCalledWith("/projects");
  });
});
