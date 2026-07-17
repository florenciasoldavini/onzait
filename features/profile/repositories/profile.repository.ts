import {
  requireSupabase,
  toRepositoryError
} from "@/features/projects/repositories/supabase.repository";
import type { User } from "@/types/models/user";

export type ProfileUpdateInput = Pick<
  User,
  "avatar" | "first_name" | "last_name" | "phone_number"
>;

export async function updateProfileRow({
  expectedAvatar,
  profile,
  userId
}: {
  expectedAvatar?: string | null;
  profile: ProfileUpdateInput;
  userId: string;
}) {
  const client = requireSupabase();
  let query = client
    .from("users")
    .update({
      avatar: profile.avatar?.trim() || null,
      first_name: profile.first_name.trim(),
      last_name: profile.last_name?.trim() || null,
      phone_number: profile.phone_number?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (expectedAvatar !== undefined) {
    query = expectedAvatar
      ? query.eq("avatar", expectedAvatar)
      : query.is("avatar", null);
  }

  const { data, error } = await query.select().maybeSingle();

  if (error) {
    throw toRepositoryError(error);
  }

  if (!data) {
    throw new Error(
      "The profile avatar changed while this upload was in progress. Refresh and try again."
    );
  }

  return data as User;
}
