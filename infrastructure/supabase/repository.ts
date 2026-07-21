import { getSupabaseErrorMessage, supabase } from "@/infrastructure/supabase/client";

export function requireSupabase() {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  return supabase;
}

export function toRepositoryError(error: unknown) {
  return new Error(getSupabaseErrorMessage(error));
}
