import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  beginOAuthSignIn,
  getCurrentAuthSession,
  observeAuthSession,
  signOutAuthSession,
  signInWithEmailPassword,
  signUpWithEmailPassword
} from "@/features/auth/repositories/auth.repository";

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getAuthRedirectUrl: vi.fn(() => "https://onzait.test/callback"),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
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
    error instanceof Error && error.message === "unconfirmed"
      ? "Confirm your email address before signing in."
      : "We couldn't complete this request. Please try again.",
  isSupabaseEmailCooldownError: (error: unknown) =>
    error instanceof Error && error.message === "cooldown",
  isSupabaseEmailNotConfirmedError: (error: unknown) =>
    error instanceof Error && error.message === "unconfirmed",
  supabase: {
    auth: {
      getSession: authMocks.getSession,
      onAuthStateChange: authMocks.onAuthStateChange,
      signOut: authMocks.signOut,
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
    ).rejects.toMatchObject({
      code: "email-not-confirmed",
      message: "Confirm your email address before signing in."
    });
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

    await expect(beginOAuthSignIn("google")).rejects.toMatchObject({
      code: "unknown",
      message: "We couldn't complete this request. Please try again."
    });
  });

  it("owns session restoration, observation, and sign-out transport", async () => {
    const session = { access_token: "token" };
    const unsubscribe = vi.fn();
    const listener = vi.fn();
    authMocks.getSession.mockResolvedValue({
      data: { session },
      error: null
    });
    authMocks.onAuthStateChange.mockImplementation((callback) => {
      callback("SIGNED_IN", session);
      return { data: { subscription: { unsubscribe } } };
    });
    authMocks.signOut.mockResolvedValue({ error: null });

    await expect(getCurrentAuthSession()).resolves.toEqual(session);
    const stopObserving = observeAuthSession(listener);
    await expect(signOutAuthSession()).resolves.toBeUndefined();

    expect(listener).toHaveBeenCalledWith(session);
    stopObserving();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
