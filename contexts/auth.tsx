import { supabase } from "@/lib/supabase";
import { User } from "@/types/models/user";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  logOut: () => void;
  createUser: (userData: User) => Promise<void>;
  getUser: (session: Session) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logOut: () => {},
  createUser: async () => {},
  getUser: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  /**
   * @function createUser
   * @param {User} userData - The user data to create
   * @description Creates a new user in the database
   * @returns {Promise<void>} void
   */
  const createUser = async (userData: User) => {
    const { data, error } = await supabase
      .from("users")
      .insert({
        ...userData,
        email: userData.email
      })
      .select();

    if (error) {
      return console.error(error);
    }

    const user = data?.[0] as User;
    setUser(user);
  };

  /**
   * @function getUser
   * @param {Session} session - The session object
   * @description Gets the user data for a session
   * @returns {Promise<{user: User | null, docId: string | null}>} user and docId or null if not found
   */
  const getUser = async (session: Session) => {
    if (session) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email);

      if (error) {
        return console.error(error);
      }

      const user = data?.[0] as User;
      setUser(user);

      router.push("/(app)/(tabs)");
    }
  };

  /**
   * @function logOut
   * @description Logs out the user and redirects to the sign-in page
   * @returns {Promise<void>} void
   */
  const logOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/(auth)/sign-in");
  };``

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getUser(session);
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getUser(session);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, logOut, createUser, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};
