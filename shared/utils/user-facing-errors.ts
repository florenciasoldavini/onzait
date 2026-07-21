export class UserFacingError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "UserFacingError";
    this.cause = cause;
  }
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string
) {
  if (error instanceof UserFacingError) {
    return error.message;
  }

  const code = getErrorField(error, "code")?.toLowerCase();
  const name = getErrorField(error, "name")?.toLowerCase();
  const storageError = getErrorField(error, "error")?.toLowerCase();
  const status = getErrorStatus(error);

  if (code === "invalid_credentials") {
    return "The email or password is incorrect. Check your details and try again.";
  }

  if (code === "email_not_confirmed") {
    return "Confirm your email address before signing in.";
  }

  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    code === "23505"
  ) {
    return "An account or record with these details already exists.";
  }

  if (code === "weak_password") {
    return "Choose a stronger password and try again.";
  }

  if (code === "same_password") {
    return "Choose a password that is different from your current password.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    status === 429
  ) {
    return "Too many requests were made. Wait a moment and try again.";
  }

  if (code === "manual_linking_disabled") {
    return "Account linking is temporarily unavailable. Try again later.";
  }

  if (code === "identity_already_exists") {
    return "That sign-in method is already linked to an account.";
  }

  if (code === "provider_disabled") {
    return "That sign-in method is not available right now.";
  }

  if (
    code === "session_not_found" ||
    code === "refresh_token_not_found" ||
    code === "refresh_token_already_used"
  ) {
    return "Your session has expired. Sign in and try again.";
  }

  if (code === "42501" || status === 401 || status === 403) {
    return "You do not have permission to complete this action.";
  }

  if (code === "23503") {
    return "This item is still in use and cannot be changed right now.";
  }

  if (
    code?.startsWith("08") ||
    code === "pgrst000" ||
    code === "pgrst001" ||
    code === "pgrst002" ||
    code === "pgrst003" ||
    (status !== null && status >= 500)
  ) {
    return "The service is temporarily unavailable. Try again shortly.";
  }

  if (name === "duplicate" || storageError === "duplicate") {
    return "A file with these details already exists. Choose another file and try again.";
  }

  if (
    name === "notfound" ||
    storageError === "notfound" ||
    status === 404
  ) {
    return "The requested item could not be found.";
  }

  if (status === 413) {
    return "This file is too large to upload. Choose a smaller file and try again.";
  }

  if (name === "typeerror" || status === 0) {
    return "Check your internet connection and try again.";
  }

  return fallback;
}

export function toUserFacingError(error: unknown, fallback: string) {
  if (error instanceof UserFacingError) {
    return error;
  }

  return new UserFacingError(
    getUserFacingErrorMessage(error, fallback),
    error
  );
}

function getErrorField(error: unknown, field: string) {
  if (typeof error !== "object" || !error || !(field in error)) {
    return null;
  }

  const value = (error as Record<string, unknown>)[field];
  return value === null || value === undefined ? null : String(value);
}

function getErrorStatus(error: unknown) {
  const rawStatus =
    getErrorField(error, "status") ?? getErrorField(error, "statusCode");
  const status = rawStatus === null ? Number.NaN : Number(rawStatus);

  return Number.isFinite(status) ? status : null;
}
