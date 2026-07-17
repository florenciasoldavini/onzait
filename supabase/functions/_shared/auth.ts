import { createClient, type User } from "@supabase/supabase-js";

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function requireAuthenticatedUser(
  request: Request,
  message: string,
): Promise<User> {
  const authorization = request.headers.get("Authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new AuthenticationError(message);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = getPublishableKey();

  if (!supabaseUrl || !publishableKey) {
    throw new AuthenticationError(message);
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { headers: { Authorization: authorization } },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError(message);
  }

  return user;
}

function getPublishableKey() {
  const namedKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");

  if (namedKeys) {
    try {
      const keys = JSON.parse(namedKeys) as Record<string, unknown>;
      const defaultKey = keys.default;

      if (typeof defaultKey === "string") {
        return defaultKey;
      }

      const firstKey = Object.values(keys).find(
        (value): value is string => typeof value === "string",
      );

      if (firstKey) {
        return firstKey;
      }
    } catch {
      return null;
    }
  }

  return (
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY") ??
      null
  );
}
