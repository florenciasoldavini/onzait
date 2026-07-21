import type { User } from "@/features/auth/types";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  findUserProfileByEmail: vi.fn(),
  findUserProfileById: vi.fn(),
  getCurrentAuthSession: vi.fn(),
  insertUserProfile: vi.fn(),
  signOutAuthSession: vi.fn(),
  subscribeToAuthState: vi.fn(),
  updateUserProfileRecord: vi.fn()
}));

vi.mock("@/features/auth/repositories/auth.repository", () => repository);
vi.mock("@/infrastructure/supabase/client", () => ({
  getSupabaseErrorMessage: (error: unknown) => String(error),
  isSupabaseConfigured: true
}));

import {
  createAuthUser,
  hydrateAuthUser
} from "@/features/auth/services/auth-session.service";

const session = {
  user: {
    email: " Builder@Example.com ",
    id: "user-1",
    identities: [],
    user_metadata: {}
  }
} as unknown as Session;

const existingUser: User = {
  avatar: null,
  created_at: new Date("2026-07-21T00:00:00.000Z"),
  deleted_at: null,
  email: "builder@example.com",
  first_name: "Builder",
  id: "user-1",
  last_name: null,
  phone_number: null,
  role: "user",
  updated_at: null,
  welcome_email_sent_at: null
};

describe("auth session service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes the fallback profile before inserting it", async () => {
    repository.insertUserProfile.mockResolvedValue(existingUser);

    await expect(createAuthUser(session)).resolves.toBe(existingUser);
    expect(repository.insertUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "builder@example.com",
        first_name: "builder",
        id: "user-1",
        role: "user"
      })
    );
  });

  it("returns an existing profile without writing when no backfill is needed", async () => {
    repository.findUserProfileById.mockResolvedValue(existingUser);

    await expect(hydrateAuthUser(session)).resolves.toBe(existingUser);
    expect(repository.updateUserProfileRecord).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email owned by a different auth user", async () => {
    repository.insertUserProfile.mockRejectedValue({ code: "23505" });
    repository.findUserProfileByEmail.mockResolvedValue({
      ...existingUser,
      id: "different-user"
    });

    await expect(createAuthUser(session)).rejects.toThrow(
      "already linked to a different sign-in method"
    );
  });
});
