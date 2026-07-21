import {
  findUserProfileByEmail,
  findUserProfileById,
  getCurrentAuthSession,
  insertUserProfile,
  signOutAuthSession,
  subscribeToAuthState,
  updateUserProfileRecord
} from "@/features/auth/repositories/auth.repository";
import type { User } from "@/features/auth/types";
import {
  getSupabaseErrorMessage,
  isSupabaseConfigured
} from "@/infrastructure/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type EditableUserProfile = Pick<
  User,
  "avatar" | "first_name" | "last_name" | "phone_number"
>;

export const isAuthConfigured = isSupabaseConfigured;
export const getAuthErrorMessage = getSupabaseErrorMessage;

type AuthProfileMetadata = Record<string, unknown>;

function getCleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMetadataValue(
  metadataSources: AuthProfileMetadata[],
  keys: string[]
) {
  for (const metadata of metadataSources) {
    for (const key of keys) {
      const value = getCleanString(metadata[key]);

      if (value) return value;
    }
  }

  return null;
}

function getNameParts(fullName: string | null) {
  if (!fullName) return { firstName: null, lastName: null };

  const parts = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null
  };
}

function getEmailName(email: string) {
  return email.split("@")[0] || "User";
}

function getAuthMetadataSources(session: Session) {
  return [
    session.user.user_metadata,
    ...(session.user.identities ?? []).map(
      (identity) => identity.identity_data ?? {}
    )
  ] satisfies AuthProfileMetadata[];
}

function buildFallbackProfile(session: Session, profile?: Partial<User>) {
  const email = (session.user.email ?? profile?.email ?? "")
    .trim()
    .toLowerCase();
  const emailName = getEmailName(email);
  const metadataSources = getAuthMetadataSources(session);
  const fullName =
    getMetadataValue(metadataSources, ["full_name", "name", "display_name"]) ??
    getMetadataValue(metadataSources, ["fullName", "displayName"]);
  const { firstName, lastName } = getNameParts(fullName);

  return {
    avatar:
      getCleanString(profile?.avatar) ??
      getMetadataValue(metadataSources, ["avatar_url", "picture", "avatar"]) ??
      getMetadataValue(metadataSources, ["photo_url", "photoURL"]) ??
      null,
    email,
    first_name:
      getCleanString(profile?.first_name) ??
      getMetadataValue(metadataSources, ["first_name", "given_name"]) ??
      getMetadataValue(metadataSources, ["firstName", "givenName"]) ??
      firstName ??
      emailName,
    id: session.user.id,
    last_name:
      getCleanString(profile?.last_name) ??
      getMetadataValue(metadataSources, ["last_name", "family_name"]) ??
      getMetadataValue(metadataSources, ["lastName", "familyName"]) ??
      lastName ??
      null,
    phone_number:
      getCleanString(profile?.phone_number) ??
      getMetadataValue(metadataSources, ["phone_number", "phone"]) ??
      getMetadataValue(metadataSources, ["phoneNumber"]) ??
      null,
    role: "user" as const
  };
}

function buildProfileBackfillPatch(existingUser: User, session: Session) {
  const authProfile = buildFallbackProfile(session);
  const emailName = getEmailName(authProfile.email).toLowerCase();
  const patch: Partial<EditableUserProfile> = {};
  const existingFirstName = existingUser.first_name.trim().toLowerCase();
  const authFirstName = authProfile.first_name.trim();

  if (
    authFirstName &&
    authFirstName.toLowerCase() !== emailName &&
    (!existingFirstName || existingFirstName === emailName)
  ) {
    patch.first_name = authFirstName;
  }

  if (!existingUser.last_name && authProfile.last_name) {
    patch.last_name = authProfile.last_name;
  }

  if (!existingUser.avatar && authProfile.avatar) {
    patch.avatar = authProfile.avatar;
  }

  if (!existingUser.phone_number && authProfile.phone_number) {
    patch.phone_number = authProfile.phone_number;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

function isDuplicateProfileError(error: unknown) {
  return (
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      String(error.code) === "23505") ||
    (error instanceof Error && error.message.toLowerCase().includes("duplicate"))
  );
}

export async function createAuthUser(
  session: Session,
  profile?: Partial<User>
) {
  const payload = buildFallbackProfile(session, profile);

  try {
    return await insertUserProfile(payload);
  } catch (error) {
    if (!isDuplicateProfileError(error)) throw error;

    const existingUser = await findUserProfileByEmail(payload.email);

    if (existingUser?.id === payload.id) return existingUser;

    throw new Error(
      "This email is already linked to a different sign-in method. Use the method you signed up with first, then link the additional provider from your profile."
    );
  }
}

export async function hydrateAuthUser(session: Session) {
  const existingUser = await findUserProfileById(session.user.id);

  if (!existingUser) return createAuthUser(session);

  const backfillPatch = buildProfileBackfillPatch(existingUser, session);

  if (!backfillPatch) return existingUser;

  try {
    return await updateUserProfileRecord(session.user.id, {
      ...backfillPatch,
      updated_at: new Date()
    });
  } catch {
    return existingUser;
  }
}

export function updateAuthUserProfile(
  session: Session,
  currentUser: User | null,
  profile: Partial<EditableUserProfile>
) {
  return updateUserProfileRecord(session.user.id, {
    avatar: profile.avatar?.trim() || null,
    first_name: profile.first_name?.trim() ?? currentUser?.first_name ?? "",
    last_name: profile.last_name?.trim() || null,
    phone_number: profile.phone_number?.trim() || null,
    updated_at: new Date()
  });
}

export {
  getCurrentAuthSession,
  signOutAuthSession,
  subscribeToAuthState
};
