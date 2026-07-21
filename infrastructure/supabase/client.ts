import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock
      }
    })
  : null;

if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

function getSupabaseRawErrorCode(error: unknown) {
  if (typeof error !== "object" || !error || !("code" in error)) {
    return null;
  }

  return String(error.code);
}

function getSupabaseRawErrorStatus(error: unknown) {
  if (typeof error !== "object" || !error || !("status" in error)) {
    return null;
  }

  return Number(error.status);
}

export function isSupabaseEmailRateLimitError(error: unknown) {
  const code = getSupabaseRawErrorCode(error);
  const status = getSupabaseRawErrorStatus(error);

  return (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  );
}

export function isSupabaseEmailSendQuotaError(error: unknown) {
  const code = getSupabaseRawErrorCode(error);

  return code === "over_email_send_rate_limit";
}

export function isSupabaseEmailCooldownError(error: unknown) {
  const code = getSupabaseRawErrorCode(error);
  const status = getSupabaseRawErrorStatus(error);

  return (
    !isSupabaseEmailSendQuotaError(error) &&
    (status === 429 || code === "over_request_rate_limit")
  );
}

export function isSupabaseEmailNotConfirmedError(error: unknown) {
  const code = getSupabaseRawErrorCode(error);

  return code === "email_not_confirmed";
}

export function getSupabaseErrorMessage(error: unknown) {
  if (!isSupabaseConfigured) {
    return "The app is not connected to its data service. Try again later.";
  }

  if (isSupabaseEmailSendQuotaError(error)) {
    return "Verification emails are temporarily limited. Try again later.";
  }

  if (isSupabaseEmailCooldownError(error)) {
    return "Wait about a minute, then resend the verification link.";
  }

  return getUserFacingErrorMessage(
    error,
    "We couldn't complete this request. Please try again."
  );
}
