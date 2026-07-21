import { sendWelcomeToOnzaitEmail } from "@/features/auth/services/welcome-email.service";
import {
  createAuthUser,
  getAuthErrorMessage,
  getCurrentAuthSession,
  hydrateAuthUser,
  isAuthConfigured,
  signOutAuthSession,
  subscribeToAuthState,
  updateAuthUserProfile,
  type EditableUserProfile
} from "@/features/auth/services/auth-session.service";
import type { User } from "@/features/auth/types/auth.types";
import { Sentry } from "@/infrastructure/monitoring/sentry";
import type { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useRef, useState } from "react";

interface AuthContextType {
  authError: string | null;
  createUser: (
    session: Session,
    profile?: Partial<User>
  ) => Promise<User | null>;
  isLoading: boolean;
  logOut: () => Promise<void>;
  session: Session | null;
  updateUserProfile: (
    profile: Partial<EditableUserProfile>
  ) => Promise<User | null>;
  user: User | null;
}

const defaultAuthError = isAuthConfigured
  ? null
  : "Supabase is not configured yet. Add your new project URL and publishable key to .env.local and restart Expo.";

export const AuthContext = createContext<AuthContextType>({
  authError: defaultAuthError,
  createUser: async () => null,
  isLoading: true,
  logOut: async () => {},
  session: null,
  updateUserProfile: async () => null,
  user: null
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authError, setAuthError] = useState<string | null>(defaultAuthError);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const welcomeEmailAttemptsRef = useRef<Set<string>>(new Set());

  const maybeSendWelcomeEmail = (nextUser: User) => {
    if (
      nextUser.welcome_email_sent_at ||
      welcomeEmailAttemptsRef.current.has(nextUser.id)
    ) {
      return;
    }

    welcomeEmailAttemptsRef.current.add(nextUser.id);

    void sendWelcomeToOnzaitEmail({ name: nextUser.first_name })
      .then((result) => {
        const welcomeEmailSentAt = result?.welcome_email_sent_at;

        if (!welcomeEmailSentAt) {
          return;
        }

        setUser((currentUser) =>
          currentUser?.id === nextUser.id
            ? {
                ...currentUser,
                welcome_email_sent_at: new Date(welcomeEmailSentAt)
              }
            : currentUser
        );
      })
      .catch((error) => {
        Sentry.captureException(error);
      });
  };

  const createUser = async (
    nextSession: Session,
    profile?: Partial<User>
  ): Promise<User | null> => {
    try {
      const nextUser = await createAuthUser(nextSession, profile);

      setUser(nextUser);
      setAuthError(null);
      maybeSendWelcomeEmail(nextUser);
      return nextUser;
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      return null;
    }
  };

  const updateUserProfile = async (
    profile: Partial<EditableUserProfile>
  ): Promise<User | null> => {
    if (!session) return null;

    try {
      const nextUser = await updateAuthUserProfile(session, user, profile);

      setUser(nextUser);
      setAuthError(null);
      return nextUser;
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      return null;
    }
  };

  const hydrateUser = async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(nextSession);
      setUser(null);
      return;
    }

    setSession(nextSession);

    try {
      const nextUser = await hydrateAuthUser(nextSession);

      setUser(nextUser);
      setAuthError(null);
      maybeSendWelcomeEmail(nextUser);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      setUser(null);
    }
  };

  const logOut = async () => {
    try {
      await signOutAuthSession();
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
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
      username:
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        undefined
    });
    Sentry.setTag("auth_state", session ? "authenticated" : "anonymous");
    Sentry.setTag("user_role", user?.role ?? "unknown");
  }, [session, user]);

  useEffect(() => {
    if (!isAuthConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await getCurrentAuthSession();

        if (!isMounted) {
          return;
        }

        await hydrateUser(currentSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAuthError(getAuthErrorMessage(error));
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const unsubscribe = subscribeToAuthState((_event, nextSession) => {
      void hydrateUser(nextSession).finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authError,
        createUser,
        isLoading,
        logOut,
        session,
        updateUserProfile,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
