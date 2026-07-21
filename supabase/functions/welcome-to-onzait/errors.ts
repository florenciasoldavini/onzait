import { jsonResponse } from "../_shared/cors.ts";

export type WelcomeEmailFailure =
  | "configuration"
  | "delivery"
  | "profile-missing"
  | "state-conflict"
  | "state-unavailable";

const publicFailures: Record<
  WelcomeEmailFailure,
  { code: string; message: string; status: number }
> = {
  configuration: {
    code: "WELCOME_EMAIL_UNAVAILABLE",
    message:
      "Welcome emails are temporarily unavailable. You can continue using Onzait and try again later.",
    status: 503,
  },
  delivery: {
    code: "WELCOME_EMAIL_DELIVERY_FAILED",
    message:
      "Your account is ready, but we couldn't send the welcome email. You can continue using Onzait.",
    status: 502,
  },
  "profile-missing": {
    code: "WELCOME_EMAIL_PROFILE_NOT_READY",
    message:
      "Your account setup is still finishing. Please try again in a moment.",
    status: 409,
  },
  "state-conflict": {
    code: "WELCOME_EMAIL_ALREADY_PROCESSING",
    message:
      "Your welcome email is already being prepared. Please try again shortly.",
    status: 409,
  },
  "state-unavailable": {
    code: "WELCOME_EMAIL_UNAVAILABLE",
    message:
      "We couldn't prepare your welcome email right now. You can continue using Onzait and try again later.",
    status: 500,
  },
};

export function welcomeEmailFailureResponse(failure: WelcomeEmailFailure) {
  const publicFailure = publicFailures[failure];

  return jsonResponse(
    { code: publicFailure.code, error: publicFailure.message },
    { status: publicFailure.status },
  );
}
