import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getProfileUserIdentities,
  linkProfileOAuthIdentity,
  updateProfilePassword
} from "@/features/profile/repositories/profile-auth.repository";

const authMocks = vi.hoisted(() => ({
  getUserIdentities: vi.fn(),
  startOAuthIdentityLink: vi.fn(),
  updatePassword: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  startOAuthIdentityLink: authMocks.startOAuthIdentityLink,
  updatePassword: authMocks.updatePassword
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  supabase: {
    auth: {
      getUserIdentities: authMocks.getUserIdentities
    }
  }
}));

describe("profile auth repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the identities reported by Supabase Auth", async () => {
    const identities = [{ id: "google-id", provider: "google" }];
    authMocks.getUserIdentities.mockResolvedValue({
      data: { identities },
      error: null
    });

    await expect(getProfileUserIdentities()).resolves.toEqual(identities);
  });

  it("normalizes identity lookup errors at the repository boundary", async () => {
    authMocks.getUserIdentities.mockResolvedValue({
      data: { identities: [] },
      error: new Error("Identity lookup failed")
    });

    await expect(getProfileUserIdentities()).rejects.toThrow(
      "Identity lookup failed"
    );
  });

  it("delegates OAuth linking to the shared cross-platform auth transport", async () => {
    authMocks.startOAuthIdentityLink.mockResolvedValue({ provider: "google" });

    await expect(linkProfileOAuthIdentity("google")).resolves.toEqual({
      provider: "google"
    });
    expect(authMocks.startOAuthIdentityLink).toHaveBeenCalledWith("google");
  });

  it("delegates password changes to the shared auth transport", async () => {
    authMocks.updatePassword.mockResolvedValue({ user: { id: "user-id" } });

    await expect(updateProfilePassword("new-password")).resolves.toEqual({
      user: { id: "user-id" }
    });
    expect(authMocks.updatePassword).toHaveBeenCalledWith("new-password");
  });
});
