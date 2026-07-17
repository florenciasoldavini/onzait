import { startOAuthIdentityLink, updatePassword } from "@/lib/auth";
import type { SupportedOAuthProvider } from "@/lib/auth-callback";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";

function requireAuthClient() {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  return supabase.auth;
}

export async function getProfileUserIdentities() {
  const { data, error } = await requireAuthClient().getUserIdentities();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return data.identities;
}

export function linkProfileOAuthIdentity(provider: SupportedOAuthProvider) {
  return startOAuthIdentityLink(provider);
}

export function updateProfilePassword(password: string) {
  return updatePassword(password);
}
