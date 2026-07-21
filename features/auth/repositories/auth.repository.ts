import type { User } from "@/features/auth/types";
import {
  getSupabaseErrorMessage,
  supabase
} from "@/infrastructure/supabase/client";
import type {
  AuthChangeEvent,
  Session,
  SignInWithOAuthCredentials
} from "@supabase/supabase-js";

type UserInsert = Omit<
  User,
  "created_at" | "deleted_at" | "updated_at" | "welcome_email_sent_at"
>;

function requireSupabase() {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  return supabase;
}

export async function exchangeAuthCode(code: string) {
  const { data, error } = await requireSupabase().auth.exchangeCodeForSession(
    code
  );

  if (error) throw error;
  return data.session;
}

export async function setAuthSession(
  accessToken: string,
  refreshToken: string
) {
  const { data, error } = await requireSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error) throw error;
  return data.session;
}

export async function beginOAuthSignIn(
  credentials: SignInWithOAuthCredentials
) {
  const { data, error } = await requireSupabase().auth.signInWithOAuth(
    credentials
  );

  if (error) throw error;
  return data;
}

export async function beginOAuthIdentityLink(
  credentials: SignInWithOAuthCredentials
) {
  const { data, error } = await requireSupabase().auth.linkIdentity(credentials);

  if (error) throw error;
  return data;
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string
) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) throw error;
}

export async function resendSignupConfirmation(
  email: string,
  emailRedirectTo: string
) {
  const { error } = await requireSupabase().auth.resend({
    email,
    options: { emailRedirectTo },
    type: "signup"
  });

  if (error) throw error;
}

export async function changePassword(password: string) {
  const { data, error } = await requireSupabase().auth.updateUser({ password });

  if (error) throw error;
  return data;
}

export async function signInWithEmailPassword(
  email: string,
  password: string
) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmailPassword({
  email,
  emailRedirectTo,
  password
}: {
  email: string;
  emailRedirectTo: string;
  password: string;
}) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    options: { emailRedirectTo },
    password
  });

  if (error) throw error;
  return data;
}

export async function getAuthUserIdentities() {
  const { data, error } = await requireSupabase().auth.getUserIdentities();

  if (error) throw error;
  return data.identities;
}

export async function getCurrentAuthSession() {
  const { data, error } = await requireSupabase().auth.getSession();

  if (error) throw error;
  return data.session;
}

export function subscribeToAuthState(
  listener: (event: AuthChangeEvent, session: Session | null) => void
) {
  const {
    data: { subscription }
  } = requireSupabase().auth.onAuthStateChange(listener);

  return () => subscription.unsubscribe();
}

export async function signOutAuthSession() {
  const { error } = await requireSupabase().auth.signOut();

  if (error) throw error;
}

export async function insertUserProfile(payload: UserInsert) {
  const { data, error } = await requireSupabase()
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function findUserProfileByEmail(email: string) {
  const { data, error } = await requireSupabase()
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as User | null;
}

export async function findUserProfileById(id: string) {
  const { data, error } = await requireSupabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as User | null;
}

export async function updateUserProfileRecord(
  id: string,
  patch: Partial<User>
) {
  const { data, error } = await requireSupabase()
    .from("users")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}
