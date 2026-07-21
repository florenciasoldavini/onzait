import {
  beginOAuthIdentityLink,
  beginOAuthSignIn,
  changePassword,
  exchangeAuthCode,
  getAuthUserIdentities,
  requestPasswordReset,
  resendSignupConfirmation,
  signInWithEmailPassword as signInWithEmailPasswordRequest,
  signUpWithEmailPassword as signUpWithEmailPasswordRequest,
  setAuthSession
} from "@/features/auth/repositories/auth.repository";
import {
  getSupabaseErrorMessage,
  isSupabaseEmailCooldownError,
  isSupabaseEmailNotConfirmedError,
  isSupabaseEmailRateLimitError,
  isSupabaseEmailSendQuotaError
} from "@/infrastructure/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SupportedOAuthProvider = "apple" | "google";

export interface AuthRedirectResult {
  session: Session | null;
  type: string | null;
}

function getConfiguredSiteUrl() {
  const configuredSiteUrl = process.env.EXPO_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return null;
}

function getBrowserOrigin() {
  if (typeof window === "undefined" || !window.location.origin) {
    return null;
  }

  return window.location.origin.replace(/\/+$/, "");
}

function isExpoGo() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function getNativeAuthRedirectUrl(
  path: "callback" | "reset-password",
  queryParams?: Record<string, string>
) {
  return Linking.createURL(path, {
    queryParams,
    scheme: isExpoGo() ? "exp" : "onzait"
  });
}

function getCombinedSearchParams(url: URL) {
  const searchParams = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

  for (const [key, value] of hashParams.entries()) {
    if (!searchParams.has(key)) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export function getAuthRedirectUrl(
  path: "callback" | "reset-password" = "callback",
  queryParams?: Record<string, string>
) {
  if (Platform.OS === "web") {
    const siteUrl = getBrowserOrigin() ?? getConfiguredSiteUrl();

    if (!siteUrl) {
      throw new Error(
        "Missing EXPO_PUBLIC_SITE_URL. Add it to your env vars before using hosted auth redirects."
      );
    }

    const searchParams = new URLSearchParams(queryParams);
    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

    return `${siteUrl}/${path}${search}`;
  }

  return getNativeAuthRedirectUrl(path, queryParams);
}

export function getAuthParamsFromUrl(url: string) {
  return getCombinedSearchParams(new URL(url));
}

export function urlHasAuthPayload(url: string) {
  const params = getAuthParamsFromUrl(url);

  return (
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.has("code") ||
    params.has("error") ||
    params.has("error_description") ||
    params.has("type")
  );
}

export function getActiveAuthUrl(linkingUrl: string | null) {
  if (linkingUrl) {
    return linkingUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.href;
  }

  return null;
}

export async function completeAuthSessionFromUrl(
  url: string
): Promise<AuthRedirectResult> {
  const params = getAuthParamsFromUrl(url);
  const authType = params.get("type");
  const errorDescription =
    params.get("error_description") ?? params.get("error");
  const code = params.get("code");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  if (code) {
    return { session: await exchangeAuthCode(code), type: authType };
  }

  if (accessToken && refreshToken) {
    return {
      session: await setAuthSession(accessToken, refreshToken),
      type: authType
    };
  }

  return { session: null, type: authType };
}

export async function startOAuthSignIn(provider: SupportedOAuthProvider) {
  const redirectTo = getAuthRedirectUrl("callback");
  const providerLabel = provider === "google" ? "Google" : "Apple";

  if (Platform.OS === "web") {
    return beginOAuthSignIn({
      provider,
      options: { redirectTo }
    });
  }

  const data = await beginOAuthSignIn({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (!data?.url) {
    throw new Error(
      `${providerLabel} sign-in could not start because Supabase did not return an OAuth URL.`
    );
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !("url" in result) || !result.url) {
    const redirectHelp = isExpoGo()
      ? `Add the current Expo Go redirect URL (${redirectTo}) to Supabase Auth redirect URLs, or test ${providerLabel} sign-in in a development build using onzait://callback.`
      : `Add ${redirectTo} to Supabase Auth redirect URLs.`;

    throw new Error(
      `${providerLabel} sign-in did not return to the app. ${redirectHelp}`
    );
  }

  return completeAuthSessionFromUrl(result.url);
}

export async function startOAuthIdentityLink(provider: SupportedOAuthProvider) {
  const redirectTo = getAuthRedirectUrl("callback", { next: "/profile" });
  const providerLabel = provider === "google" ? "Google" : "Apple";

  if (Platform.OS === "web") {
    return beginOAuthIdentityLink({
      provider,
      options: { redirectTo }
    });
  }

  const data = await beginOAuthIdentityLink({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (!data?.url) {
    throw new Error(
      `${providerLabel} linking could not start because Supabase did not return an OAuth URL.`
    );
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !("url" in result) || !result.url) {
    const redirectHelp = isExpoGo()
      ? `Add the current Expo Go redirect URL (${redirectTo}) to Supabase Auth redirect URLs, or test ${providerLabel} linking in a development build using onzait://callback.`
      : `Add ${redirectTo} to Supabase Auth redirect URLs.`;

    throw new Error(
      `${providerLabel} linking did not return to the app. ${redirectHelp}`
    );
  }

  return completeAuthSessionFromUrl(result.url);
}

export async function sendPasswordResetEmail(email: string) {
  await requestPasswordReset(email, getAuthRedirectUrl("reset-password"));
}

export async function resendSignUpConfirmationEmail(email: string) {
  await resendSignupConfirmation(email, getAuthRedirectUrl("callback"));
}

export async function updatePassword(password: string) {
  return changePassword(password);
}

export function signInWithEmailPassword(email: string, password: string) {
  return signInWithEmailPasswordRequest(email, password);
}

export function signUpWithEmailPassword(email: string, password: string) {
  return signUpWithEmailPasswordRequest({
    email,
    emailRedirectTo: getAuthRedirectUrl("callback"),
    password
  });
}

export function getLinkedAuthIdentities() {
  return getAuthUserIdentities();
}

export {
  getSupabaseErrorMessage as getAuthErrorMessage,
  isSupabaseEmailCooldownError as isAuthEmailCooldownError,
  isSupabaseEmailNotConfirmedError as isAuthEmailNotConfirmedError,
  isSupabaseEmailRateLimitError as isAuthEmailRateLimitError,
  isSupabaseEmailSendQuotaError as isAuthEmailSendQuotaError
};

function getSafePostAuthRedirectPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

export function getPostAuthRedirectPath(
  authType: string | null,
  nextPath: string | null = null
) {
  if (authType === "recovery") {
    return "/reset-password";
  }

  return getSafePostAuthRedirectPath(nextPath);
}

export function clearWebAuthUrlArtifacts() {
  const origin = getBrowserOrigin();

  if (typeof window === "undefined" || !origin) {
    return;
  }

  const cleanUrl = `${origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}
