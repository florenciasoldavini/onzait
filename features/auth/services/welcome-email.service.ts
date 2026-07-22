import { invokeWelcomeToOnzaitEmail } from "@/features/auth/repositories/welcome-email.repository";

type SendWelcomeToOnzaitEmailInput = {
  name?: string;
};

export async function sendWelcomeToOnzaitEmail(
  input: SendWelcomeToOnzaitEmailInput = {}
) {
  return invokeWelcomeToOnzaitEmail({
    name: input.name?.trim() || undefined
  });
}
