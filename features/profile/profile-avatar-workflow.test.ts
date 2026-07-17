import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProfile } from "@/features/profile/services/profile.service";

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  getProfileAvatarPublicUrl: vi.fn(
    (path: string) =>
      `https://project.supabase.co/storage/v1/object/public/user-avatars/${path}`
  ),
  removeProfileAvatarObject: vi.fn(),
  updateProfileRow: vi.fn(),
  uploadProfileAvatarObject: vi.fn()
}));

vi.mock("@/features/profile/repositories/profile-avatar.repository", () => ({
  getProfileAvatarPublicUrl: mocks.getProfileAvatarPublicUrl,
  removeProfileAvatarObject: mocks.removeProfileAvatarObject,
  uploadProfileAvatarObject: mocks.uploadProfileAvatarObject
}));

vi.mock("@/features/profile/repositories/profile.repository", () => ({
  updateProfileRow: mocks.updateProfileRow
}));

vi.mock("@/features/profile/repositories/profile-auth.repository", () => ({
  getProfileUserIdentities: vi.fn(),
  linkProfileOAuthIdentity: vi.fn(),
  updateProfilePassword: vi.fn()
}));

vi.mock("@/lib/sentry", () => ({
  Sentry: { captureException: mocks.captureException }
}));

const profile = {
  avatar: null,
  first_name: "Florencia",
  last_name: null,
  phone_number: null
};
const avatarAsset = { uri: "file:///avatar.jpg" };

describe("profile avatar replacement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.uploadProfileAvatarObject.mockResolvedValue(
      "users/user-id/avatar/new.jpg"
    );
    mocks.updateProfileRow.mockResolvedValue({ id: "user-id" });
  });

  it("removes the new avatar when the profile update fails", async () => {
    mocks.updateProfileRow.mockRejectedValue(new Error("profile failed"));

    await expect(
      saveProfile({ avatarAsset, profile, userId: "user-id" })
    ).rejects.toThrow("profile failed");
    expect(mocks.removeProfileAvatarObject).toHaveBeenCalledWith({
      path: "users/user-id/avatar/new.jpg",
      userId: "user-id"
    });
  });

  it("removes the previous avatar after the new reference is saved", async () => {
    await saveProfile({
      avatarAsset,
      currentAvatarUrl:
        "https://project.supabase.co/storage/v1/object/public/user-avatars/users/user-id/avatar/old.jpg",
      profile,
      userId: "user-id"
    });

    expect(mocks.updateProfileRow).toHaveBeenCalledWith({
      expectedAvatar:
        "https://project.supabase.co/storage/v1/object/public/user-avatars/users/user-id/avatar/old.jpg",
      profile: {
        ...profile,
        avatar:
          "https://project.supabase.co/storage/v1/object/public/user-avatars/users/user-id/avatar/new.jpg"
      },
      userId: "user-id"
    });
    expect(mocks.removeProfileAvatarObject).toHaveBeenCalledWith({
      path: "users/user-id/avatar/old.jpg",
      userId: "user-id"
    });
  });

  it("keeps the successful profile update when old-object cleanup fails", async () => {
    mocks.removeProfileAvatarObject.mockRejectedValue(
      new Error("cleanup failed")
    );

    await expect(
      saveProfile({
        avatarAsset,
        currentAvatarUrl:
          "https://project.supabase.co/storage/v1/object/public/user-avatars/users/user-id/avatar/old.jpg",
        profile,
        userId: "user-id"
      })
    ).resolves.toEqual({ id: "user-id" });
    expect(mocks.captureException).toHaveBeenCalledOnce();
  });
});
