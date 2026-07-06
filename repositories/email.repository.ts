import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";

type SendWelcomeToOnzaitEmailInput = {
  name?: string;
};

type WelcomeToOnzaitResponse = {
  id?: string;
  ok: boolean;
  skipped?: boolean;
  welcome_email_sent_at?: string;
};

export async function invokeWelcomeToOnzaitEmail(
  input: SendWelcomeToOnzaitEmailInput = {}
) {
  if (!supabase) {
    throw new Error(getSupabaseErrorMessage("Supabase is not configured."));
  }

  const { data, error } =
    await supabase.functions.invoke<WelcomeToOnzaitResponse>(
      "welcome-to-onzait",
      {
        body: input
      }
    );

  if (error) {
    throw error;
  }

  return data;
}
