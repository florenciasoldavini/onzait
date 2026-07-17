export type AuthRepositoryErrorCode =
  | "email-cooldown"
  | "email-not-confirmed"
  | "unknown";

export class AuthRepositoryError extends Error {
  constructor(
    message: string,
    readonly code: AuthRepositoryErrorCode = "unknown"
  ) {
    super(message);
    this.name = "AuthRepositoryError";
  }
}
