import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import { UserFacingError } from "@/lib/user-facing-errors";

export function requireSupabase() {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  return supabase;
}

export function toRepositoryError(error: unknown) {
  return new UserFacingError(getSupabaseErrorMessage(error), error);
}
