import { AuthRepositoryError } from "@/features/auth/errors";
import {
  clearWebAuthUrlArtifacts,
  completeAuthSessionFromUrl,
  getActiveAuthUrl,
  getAuthParamsFromUrl,
  getAuthRedirectUrl,
  resendSignUpConfirmationEmail,
  sendPasswordResetEmail,
  startOAuthSignIn,
  updatePassword,
  urlHasAuthPayload
} from "@/lib/auth";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import {
  getSupabaseErrorMessage,
  isSupabaseEmailCooldownError,
  isSupabaseEmailNotConfirmedError,
  supabase
} from "@/lib/supabase";

function requireAuthClient() {
  if (!supabase) {
    throw new AuthRepositoryError(
      getSupabaseErrorMessage("Supabase is not configured.")
    );
  }

  return supabase.auth;
}

function toAuthRepositoryError(error: unknown) {
  if (error instanceof AuthRepositoryError) {
    return error;
  }

  const code = isSupabaseEmailNotConfirmedError(error)
    ? "email-not-confirmed"
    : isSupabaseEmailCooldownError(error)
      ? "email-cooldown"
      : "unknown";

  return new AuthRepositoryError(getSupabaseErrorMessage(error), code, error);
}

async function runAuthRequest<T>(request: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    throw toAuthRepositoryError(error);
  }
}

export async function signInWithEmailPassword({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  return runAuthRequest(async () => {
    const { data, error } = await requireAuthClient().signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  });
}

export async function signUpWithEmailPassword({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  return runAuthRequest(async () => {
    const { data, error } = await requireAuthClient().signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl("callback")
      }
    });

    if (error) {
      throw error;
    }

    return data;
  });
}

export function beginOAuthSignIn(provider: SupportedOAuthProvider) {
  return runAuthRequest(() => startOAuthSignIn(provider));
}

export function requestPasswordReset(email: string) {
  return runAuthRequest(() => sendPasswordResetEmail(email));
}

export function resendVerificationEmail(email: string) {
  return runAuthRequest(() => resendSignUpConfirmationEmail(email));
}

export function changePassword(password: string) {
  return runAuthRequest(() => updatePassword(password));
}

export function getAuthCallbackUrl(linkingUrl: string | null) {
  return getActiveAuthUrl(linkingUrl);
}

export function hasAuthCallbackPayload(url: string) {
  return urlHasAuthPayload(url);
}

export function parseAuthCallbackParams(url: string) {
  return getAuthParamsFromUrl(url);
}

export function completeAuthCallback(url: string) {
  return runAuthRequest(() => completeAuthSessionFromUrl(url));
}

export function clearCompletedWebAuthCallback() {
  clearWebAuthUrlArtifacts();
}
