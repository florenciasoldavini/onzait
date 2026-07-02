import AsyncStorage from "@react-native-async-storage/async-storage";
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

export function getSupabaseErrorMessage(error: unknown) {
  if (!isSupabaseConfigured) {
    return "Supabase is not configured yet. Add your new project URL and publishable key to .env.local and restart Expo.";
  }

  const message =
    typeof error === "object" && error && "message" in error
      ? String(error.message)
      : typeof error === "string"
        ? error
        : "Unknown Supabase error.";

  if (message.toLowerCase().includes("fetch")) {
    return "Supabase is currently unreachable. If your old project was paused, create the new project, update the Expo env vars, and restart the app.";
  }

  return message;
}
