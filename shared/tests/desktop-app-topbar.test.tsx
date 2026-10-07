import { useAppTopBarSearch } from "@/shared/hooks/use-app-topbar";
import { DesktopAppTopBar } from "@/shared/ui/components/desktop-app-topbar";
import { renderWithAppProviders } from "@/tests/support/render";
import { userEvent } from "@testing-library/react-native";
import { useMemo, useState } from "react";

function TopBarSearchHarness() {
  const [value, setValue] = useState("");
  const search = useMemo(
    () => ({
      onChangeText: setValue,
      placeholder: "Search projects",
      value
    }),
    [value]
  );
  useAppTopBarSearch(search);

  return null;
}

describe("DesktopAppTopBar", () => {
  it("hosts the registered search and a disabled notifications control", async () => {
    const user = userEvent.setup();
    const view = await renderWithAppProviders(
      <>
        <TopBarSearchHarness />
        <DesktopAppTopBar />
      </>
    );

    const search = await view.findByPlaceholderText("Search projects");
    await user.type(search, "river");
    expect(view.getByDisplayValue("river")).toBeOnTheScreen();

    expect(view.getByRole("button", { name: "Notifications" })).toBeDisabled();
  });
});
