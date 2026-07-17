import {
  buildProfileAvatarPath,
  getProfileAvatarPathFromPublicUrl
} from "@/features/profile/avatar-storage";
import { describe, expect, it } from "vitest";

describe("profile avatar storage paths", () => {
  it("stores uploaded avatars under the current user folder", () => {
    expect(
      buildProfileAvatarPath({
        asset: { fileName: "headshot.jpeg", mimeType: "image/jpeg" },
        userId: "user-id",
        uuid: "avatar-id"
      })
    ).toBe("users/user-id/avatar/avatar-id.jpg");
  });

  it("falls back to mime type when the asset has no file name", () => {
    expect(
      buildProfileAvatarPath({
        asset: { mimeType: "image/png" },
        userId: "user-id",
        uuid: "avatar-id"
      })
    ).toBe("users/user-id/avatar/avatar-id.png");
  });

  it("extracts only the current user's avatar path from a public URL", () => {
    expect(
      getProfileAvatarPathFromPublicUrl({
        bucket: "user-avatars",
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/user-avatars/users/user-id/avatar/avatar-id.jpg",
        userId: "user-id"
      })
    ).toBe("users/user-id/avatar/avatar-id.jpg");
  });

  it("rejects external and other-user avatar URLs", () => {
    expect(
      getProfileAvatarPathFromPublicUrl({
        bucket: "user-avatars",
        publicUrl: "https://images.example.com/avatar.jpg",
        userId: "user-id"
      })
    ).toBeNull();
    expect(
      getProfileAvatarPathFromPublicUrl({
        bucket: "user-avatars",
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/user-avatars/users/other-user/avatar/avatar-id.jpg",
        userId: "user-id"
      })
    ).toBeNull();
  });
});
