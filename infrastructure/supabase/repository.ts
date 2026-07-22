import { getSupabaseErrorMessage, supabase } from "@/infrastructure/supabase/client";
import { UserFacingError } from "@/shared/utils/user-facing-errors";

export function requireSupabase() {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  return supabase;
}

export function toRepositoryError(error: unknown) {
  return new UserFacingError(getSupabaseErrorMessage(error), error);
}
