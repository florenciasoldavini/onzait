import {
  finishAuthCallback,
  preparePasswordRecovery,
  resendEmailVerification,
  sendPasswordReset,
  signInWithEmail,
  signInWithOAuth,
  signUpWithEmail,
  updateAccountPassword
} from "@/features/auth/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useEmailSignIn() {
  return useMutation({ mutationFn: signInWithEmail });
}

export function useEmailSignUp() {
  return useMutation({ mutationFn: signUpWithEmail });
}

export function useOAuthSignIn() {
  return useMutation({ mutationFn: signInWithOAuth });
}

export function usePasswordResetRequest() {
  return useMutation({ mutationFn: sendPasswordReset });
}

export function usePasswordRecoveryPreparation() {
  return useMutation({ mutationFn: preparePasswordRecovery });
}

export function usePasswordUpdate() {
  return useMutation({ mutationFn: updateAccountPassword });
}

export function useEmailVerificationResend() {
  return useMutation({ mutationFn: resendEmailVerification });
}

export function useAuthCallbackCompletion() {
  return useMutation({ mutationFn: finishAuthCallback });
}
