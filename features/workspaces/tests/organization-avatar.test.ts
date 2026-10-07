import {
  buildOrganizationAvatarPath,
  getOrganizationAvatarMimeType,
  isOrganizationAvatarPath
} from "@/features/workspaces/utils/organization-avatar";

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "secure-avatar-id")
}));

describe("organization avatar storage", () => {
  it("generates an avatar path when browser crypto is unavailable", () => {
    const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined
    });

    try {
      expect(
        buildOrganizationAvatarPath({
          asset: { fileName: "studio.png" },
          organizationId: "organization-1"
        })
      ).toBe("organizations/organization-1/avatar/secure-avatar-id.png");
    } finally {
      if (cryptoDescriptor) {
        Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, "crypto");
      }
    }
  });

  it("creates organization-scoped object paths", () => {
    expect(
      buildOrganizationAvatarPath({
        asset: { fileName: "studio.jpeg", mimeType: "image/jpeg" },
        organizationId: "organization-1",
        uuid: "avatar-1"
      })
    ).toBe("organizations/organization-1/avatar/avatar-1.jpg");
  });

  it("accepts only complete avatar paths for the expected organization", () => {
    expect(
      isOrganizationAvatarPath(
        "organizations/organization-1/avatar/avatar.png",
        "organization-1"
      )
    ).toBe(true);
    expect(
      isOrganizationAvatarPath(
        "organizations/organization-2/avatar/avatar.png",
        "organization-1"
      )
    ).toBe(false);
    expect(
      isOrganizationAvatarPath(
        "organizations/organization-1/avatar/nested/avatar.png"
      )
    ).toBe(false);
  });

  it("maps supported extensions to upload content types", () => {
    expect(getOrganizationAvatarMimeType("png")).toBe("image/png");
    expect(getOrganizationAvatarMimeType("jpg")).toBe("image/jpeg");
  });
});
