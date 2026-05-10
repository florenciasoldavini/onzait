import { supabase, getSupabaseErrorMessage, isSupabaseConfigured } from "@/lib/supabase";
import { Sentry } from "@/lib/sentry";
import type { User } from "@/types/models/user";
import type { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  authError: string | null;
  createUser: (session: Session, profile?: Partial<User>) => Promise<User | null>;
  isLoading: boolean;
  logOut: () => Promise<void>;
  session: Session | null;
  user: User | null;
}

const defaultAuthError = isSupabaseConfigured
  ? null
  : "Supabase is not configured yet. Add your new project URL and publishable key to .env.local and restart Expo.";

export const AuthContext = createContext<AuthContextType>({
  authError: defaultAuthError,
  createUser: async () => null,
  isLoading: true,
  logOut: async () => {},
  session: null,
  user: null
});

const getFallbackProfile = (
  session: Session,
  profile?: Partial<User>
): Omit<User, "created_at" | "updated_at" | "deleted_at"> => {
  const metadata = session.user.user_metadata ?? {};
  const email = (session.user.email ?? profile?.email ?? "").trim().toLowerCase();
  const emailName = email.split("@")[0] ?? "User";

  return {
    avatar: profile?.avatar ?? null,
    email,
    id: session.user.id,
    first_name:
      profile?.first_name ??
      metadata.first_name ??
      metadata.given_name ??
      emailName,
    last_name:
      profile?.last_name ?? metadata.last_name ?? metadata.family_name ?? null,
    phone_number: profile?.phone_number ?? null,
    role: "user"
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authError, setAuthError] = useState<string | null>(defaultAuthError);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const createUser = async (
    nextSession: Session,
    profile?: Partial<User>
  ): Promise<User | null> => {
    if (!supabase) {
      return null;
    }

    const payload = getFallbackProfile(nextSession, profile);
    const { data, error } = await supabase.from("users").insert(payload).select().single();

    if (error) {
      const isDuplicate =
        (typeof error === "object" &&
          error &&
          "code" in error &&
          String(error.code) === "23505") ||
        getSupabaseErrorMessage(error).toLowerCase().includes("duplicate");

      if (isDuplicate) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", payload.email)
          .maybeSingle();

        if (existingUser) {
          const nextUser = existingUser as User;

          if (nextUser.id === payload.id) {
            setUser(nextUser);
            setAuthError(null);
            return nextUser;
          }

          setAuthError(
            "This email is already linked to a different sign-in method. Use the method you signed up with first, then we can add account linking later."
          );
          return null;
        }
      }

      setAuthError(getSupabaseErrorMessage(error));
      return null;
    }

    const nextUser = data as User;
    setUser(nextUser);
    setAuthError(null);
    return nextUser;
  };

  const hydrateUser = async (nextSession: Session | null) => {
    if (!supabase || !nextSession) {
      setSession(nextSession);
      setUser(null);
      return;
    }

    setSession(nextSession);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", nextSession.user.id)
      .maybeSingle();

    if (error) {
      setAuthError(getSupabaseErrorMessage(error));
      setUser(null);
      return;
    }

    if (!data) {
      await createUser(nextSession);
      return;
    }

    setUser(data as User);
    setAuthError(null);
  };

  const logOut = async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(getSupabaseErrorMessage(error));
      return;
    }

    setSession(null);
    setUser(null);
    setAuthError(null);
  };

  useEffect(() => {
    if (!session && !user) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      email: user?.email ?? session?.user.email,
      id: user?.id ?? session?.user.id,
      username: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || undefined
    });
    Sentry.setTag("auth_state", session ? "authenticated" : "anonymous");
    Sentry.setTag("user_role", user?.role ?? "unknown");
  }, [session, user]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const supabaseClient = supabase;
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          setAuthError(getSupabaseErrorMessage(error));
          setSession(null);
          setUser(null);
          return;
        }

        await hydrateUser(data.session);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAuthError(getSupabaseErrorMessage(error));
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      void hydrateUser(nextSession).finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ authError, createUser, isLoading, logOut, session, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
