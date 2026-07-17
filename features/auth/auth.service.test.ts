import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthRepositoryError } from "@/features/auth/errors";
import {
  AuthCallbackError,
  finishAuthCallback,
  preparePasswordRecovery,
  resendEmailVerification,
  signInWithEmail,
  signUpWithEmail
} from "@/features/auth/services/auth.service";

const repositoryMocks = vi.hoisted(() => ({
  clearCompletedWebAuthCallback: vi.fn(),
  completeAuthCallback: vi.fn(),
  getAuthCallbackUrl: vi.fn(),
  hasAuthCallbackPayload: vi.fn(),
  parseAuthCallbackParams: vi.fn(),
  resendVerificationEmail: vi.fn(),
  signInWithEmailPassword: vi.fn(),
  signUpWithEmailPassword: vi.fn()
}));

vi.mock("@/features/auth/repositories/auth.repository", () => ({
  beginOAuthSignIn: vi.fn(),
  changePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  ...repositoryMocks
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes email before signing in", async () => {
    repositoryMocks.signInWithEmailPassword.mockResolvedValue({
      session: { access_token: "token" }
    });

    await expect(
      signInWithEmail({ email: "  BUILDER@EXAMPLE.COM ", password: "secret" })
    ).resolves.toEqual({ status: "signed-in" });
    expect(repositoryMocks.signInWithEmailPassword).toHaveBeenCalledWith({
      email: "builder@example.com",
      password: "secret"
    });
  });

  it("returns a verification outcome for an unconfirmed sign-in", async () => {
    repositoryMocks.signInWithEmailPassword.mockRejectedValue(
      new AuthRepositoryError("Email not confirmed", "email-not-confirmed")
    );

    await expect(
      signInWithEmail({ email: "USER@example.com", password: "secret" })
    ).resolves.toEqual({
      email: "user@example.com",
      status: "email-unverified"
    });
  });

  it("returns a verification-sent outcome when sign-up has no session", async () => {
    repositoryMocks.signUpWithEmailPassword.mockResolvedValue({
      session: null
    });

    await expect(
      signUpWithEmail({ email: "USER@example.com", password: "secret" })
    ).resolves.toEqual({
      email: "user@example.com",
      status: "verification-sent"
    });
  });

  it("returns a rate-limited outcome for sign-up cooldowns", async () => {
    repositoryMocks.signUpWithEmailPassword.mockRejectedValue(
      new AuthRepositoryError("Wait before retrying", "email-cooldown")
    );

    await expect(
      signUpWithEmail({ email: "user@example.com", password: "secret" })
    ).resolves.toEqual({
      email: "user@example.com",
      status: "verification-rate-limited"
    });
  });

  it("represents verification resend cooldowns without leaking provider errors", async () => {
    repositoryMocks.resendVerificationEmail.mockRejectedValue(
      new AuthRepositoryError("Wait before retrying", "email-cooldown")
    );

    await expect(resendEmailVerification("USER@example.com")).resolves.toEqual({
      status: "rate-limited"
    });
    expect(repositoryMocks.resendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com"
    );
  });

  it("prepares a password update only from a recovery payload", async () => {
    repositoryMocks.getAuthCallbackUrl.mockReturnValue("onzait://reset");
    repositoryMocks.hasAuthCallbackPayload.mockReturnValue(true);
    repositoryMocks.completeAuthCallback.mockResolvedValue({
      session: null,
      type: "recovery"
    });

    await expect(preparePasswordRecovery("onzait://reset")).resolves.toEqual({
      shouldUpdatePassword: true
    });
    expect(
      repositoryMocks.clearCompletedWebAuthCallback
    ).toHaveBeenCalledOnce();
  });

  it("rejects callback URLs without an auth payload and preserves link intent", async () => {
    repositoryMocks.getAuthCallbackUrl.mockReturnValue(
      "https://onzait.test/callback?auth_action=identity-link&provider=google"
    );
    repositoryMocks.parseAuthCallbackParams.mockReturnValue(
      new URLSearchParams("auth_action=identity-link&provider=google")
    );
    repositoryMocks.hasAuthCallbackPayload.mockReturnValue(false);

    const completion = finishAuthCallback(null);

    await expect(completion).rejects.toBeInstanceOf(AuthCallbackError);
    await expect(completion).rejects.toMatchObject({
      intent: { kind: "identity-link", provider: "google" }
    });
  });

  it("completes auth callbacks and returns the safe destination", async () => {
    repositoryMocks.getAuthCallbackUrl.mockReturnValue(
      "https://onzait.test/callback?code=abc&next=%2Fprojects"
    );
    repositoryMocks.parseAuthCallbackParams.mockReturnValue(
      new URLSearchParams("code=abc&next=%2Fprojects")
    );
    repositoryMocks.hasAuthCallbackPayload.mockReturnValue(true);
    repositoryMocks.completeAuthCallback.mockResolvedValue({
      session: { access_token: "token" },
      type: null
    });

    await expect(finishAuthCallback(null)).resolves.toEqual({
      intent: { kind: "sign-in" },
      redirectPath: "/projects"
    });
    expect(
      repositoryMocks.clearCompletedWebAuthCallback
    ).toHaveBeenCalledOnce();
  });
});
