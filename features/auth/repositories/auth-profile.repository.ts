import { getSupabaseErrorMessage, supabase } from "@/infrastructure/supabase/client";
import { UserFacingError } from "@/shared/utils/user-facing-errors";
import type { User } from "@/features/auth/types/auth.types";

export type AuthProfileInsert = Omit<
  User,
  "created_at" | "updated_at" | "deleted_at" | "welcome_email_sent_at"
>;

export type AuthProfileBackfill = Partial<
  Pick<User, "avatar" | "first_name" | "last_name" | "phone_number">
>;

export class AuthProfileRepositoryError extends UserFacingError {
  constructor(
    message: string,
    readonly code: "duplicate" | "unknown",
    cause?: unknown
  ) {
    super(message, cause);
    this.name = "AuthProfileRepositoryError";
  }
}

function requireDataClient() {
  if (!supabase) {
    throw new UserFacingError(
      "The app is not connected to its data service. Try again later."
    );
  }

  return supabase;
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || !error || !("code" in error)) {
    return null;
  }

  return String(error.code);
}

export async function findAuthProfileById(userId: string) {
  const { data, error } = await requireDataClient()
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new UserFacingError(getSupabaseErrorMessage(error), error);
  }

  return data as User | null;
}

export async function insertAuthProfile(profile: AuthProfileInsert) {
  const { data, error } = await requireDataClient()
    .from("users")
    .insert(profile)
    .select()
    .single();

  if (error) {
    const isDuplicate = getErrorCode(error) === "23505";

    throw new AuthProfileRepositoryError(
      isDuplicate
        ? "An account with these details already exists."
        : getSupabaseErrorMessage(error),
      isDuplicate ? "duplicate" : "unknown",
      error
    );
  }

  return data as User;
}

export async function updateAuthProfileBackfill({
  profile,
  userId
}: {
  profile: AuthProfileBackfill;
  userId: string;
}) {
  const { data, error } = await requireDataClient()
    .from("users")
    .update({
      ...profile,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new UserFacingError(getSupabaseErrorMessage(error), error);
  }

  return data as User;
}
