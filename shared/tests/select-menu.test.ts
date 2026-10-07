import { atomPalette } from "@/shared/ui/components/theme";
import { resolveSelectMenuItemBackground } from "@/shared/ui/components/select-menu";

describe("resolveSelectMenuItemBackground", () => {
  it("uses consistent hover feedback for selectable and action rows", () => {
    expect(
      resolveSelectMenuItemBackground({
        hovered: true,
        pressed: false,
        selected: false
      })
    ).toBe(atomPalette.surfaceLow);
  });

  it("keeps selected and pressed feedback above hover feedback", () => {
    expect(
      resolveSelectMenuItemBackground({
        hovered: true,
        pressed: false,
        selected: true
      })
    ).toBe(`${atomPalette.accent}10`);
    expect(
      resolveSelectMenuItemBackground({
        hovered: true,
        pressed: true,
        selected: true
      })
    ).toBe(atomPalette.surfaceStrong);
  });
});
