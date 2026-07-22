import { UserFacingError } from "@/shared/utils/user-facing-errors";

export type AuthRepositoryErrorCode =
  | "email-cooldown"
  | "email-not-confirmed"
  | "unknown";

export class AuthRepositoryError extends UserFacingError {
  constructor(
    message: string,
    readonly code: AuthRepositoryErrorCode = "unknown",
    cause?: unknown
  ) {
    super(message, cause);
    this.name = "AuthRepositoryError";
  }
}
