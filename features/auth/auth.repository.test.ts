import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  beginOAuthSignIn,
  signInWithEmailPassword,
  signUpWithEmailPassword
} from "@/features/auth/repositories/auth.repository";
import { AuthRepositoryError } from "@/features/auth/errors";

const authMocks = vi.hoisted(() => ({
  getAuthRedirectUrl: vi.fn(() => "https://onzait.test/callback"),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  clearWebAuthUrlArtifacts: vi.fn(),
  completeAuthSessionFromUrl: vi.fn(),
  getActiveAuthUrl: vi.fn(),
  getAuthParamsFromUrl: vi.fn(),
  getAuthRedirectUrl: authMocks.getAuthRedirectUrl,
  resendSignUpConfirmationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  startOAuthSignIn: authMocks.signInWithOAuth,
  updatePassword: vi.fn(),
  urlHasAuthPayload: vi.fn()
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  isSupabaseEmailCooldownError: (error: unknown) =>
    error instanceof Error && error.message === "cooldown",
  isSupabaseEmailNotConfirmedError: (error: unknown) =>
    error instanceof Error && error.message === "unconfirmed",
  supabase: {
    auth: {
      signInWithPassword: authMocks.signInWithPassword,
      signUp: authMocks.signUp
    }
  }
}));

describe("auth repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("owns the Supabase password sign-in request", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null
    });

    await signInWithEmailPassword({
      email: "user@example.com",
      password: "secret"
    });

    expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret"
    });
  });

  it("classifies unconfirmed email errors at the transport boundary", async () => {
    authMocks.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error("unconfirmed")
    });

    await expect(
      signInWithEmailPassword({
        email: "user@example.com",
        password: "secret"
      })
    ).rejects.toEqual(
      new AuthRepositoryError("unconfirmed", "email-not-confirmed")
    );
  });

  it("owns sign-up redirect configuration", async () => {
    authMocks.signUp.mockResolvedValue({
      data: { session: null },
      error: null
    });

    await signUpWithEmailPassword({
      email: "user@example.com",
      password: "secret"
    });

    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret",
      options: {
        emailRedirectTo: "https://onzait.test/callback"
      }
    });
  });

  it("normalizes OAuth transport failures", async () => {
    authMocks.signInWithOAuth.mockRejectedValue(new Error("oauth failed"));

    await expect(beginOAuthSignIn("google")).rejects.toEqual(
      new AuthRepositoryError("oauth failed", "unknown")
    );
  });
});
