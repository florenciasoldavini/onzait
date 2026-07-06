import {
  AuthFooterLink,
  AuthShell,
  authFieldSize
} from "@/components/auth/AuthShell";
import {
  AppButton,
  FieldMessage,
  PasswordVisibilityToggle,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import {
  clearWebAuthUrlArtifacts,
  completeAuthSessionFromUrl,
  getActiveAuthUrl,
  sendPasswordResetEmail,
  updatePassword,
  urlHasAuthPayload
} from "@/lib/auth";
import { getSupabaseErrorMessage } from "@/lib/supabase";
import { emailSchema } from "@/schemas/fields";
import { AtSignIcon, LockIcon } from "@/components/icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

type ResetMode = "request" | "update";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const [email, setEmail] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ResetMode>("request");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    confirmPassword: false,
    email: false,
    password: false
  });
  const validateEmail = (value: string) => {
    const result = emailSchema.safeParse(value);

    if (result.success) {
      return null;
    }

    return result.error.issues[0]?.message ?? "Invalid email address";
  };
  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "Password is required";
    }

    if (value.length < 8) {
      return "Use at least 8 characters for your new password";
    }

    return null;
  };
  const validateConfirmPassword = (
    confirmValue: string,
    passwordValue: string
  ) => {
    if (!confirmValue.trim()) {
      return "Please confirm your new password";
    }

    if (confirmValue !== passwordValue) {
      return "The passwords do not match";
    }

    return null;
  };
  const revealResetRequestValidation = () => {
    const nextEmailError = validateEmail(email);

    setTouchedFields((current) => ({ ...current, email: true }));
    setEmailError(nextEmailError);
  };
  const revealPasswordUpdateValidation = () => {
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );

    setTouchedFields((current) => ({
      ...current,
      confirmPassword: true,
      password: true
    }));
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
  };
  const isResetRequestValid = validateEmail(email) === null;
  const isPasswordUpdateValid =
    validatePassword(password) === null &&
    validateConfirmPassword(confirmPassword, password) === null;
  const isSubmitDisabled =
    isLoading ||
    (mode === "update" ? !isPasswordUpdateValid : !isResetRequestValid);

  useEffect(() => {
    const activeUrl = getActiveAuthUrl(linkingUrl);

    if (!activeUrl || !urlHasAuthPayload(activeUrl)) {
      return;
    }

    let isMounted = true;

    const prepareRecoverySession = async () => {
      try {
        setIsLoading(true);
        setFormError(null);

        const { type, session } = await completeAuthSessionFromUrl(activeUrl);

        if (!isMounted) {
          return;
        }

        clearWebAuthUrlArtifacts();

        if (type === "recovery" || session) {
          setConfirmPassword("");
          setConfirmPasswordError(null);
          setEmailError(null);
          setMode("update");
          setPassword("");
          setPasswordError(null);
          setTouchedFields({
            confirmPassword: false,
            email: false,
            password: false
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFormError(getSupabaseErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [linkingUrl]);

  async function handleResetRequest() {
    const nextEmailError = validateEmail(email);

    revealResetRequestValidation();

    if (nextEmailError) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      await sendPasswordResetEmail(email);
      router.replace("/sign-in");
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordUpdate() {
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password
    );

    revealPasswordUpdateValidation();

    if (nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      await updatePassword(password);
      router.replace("/");
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      description={
        mode === "update"
          ? "Set a new password for your account."
          : "Request a secure reset link."
      }
      panelTag={mode === "update" ? "Recovery / Update" : "Recovery / Request"}
      title={mode === "update" ? "Update Your Password" : "Reset Your Password"}
    >
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[4] }}>
          {mode === "request" ? (
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              errorText={emailError}
              helperText={
                !emailError ? "Enter the email tied to your account." : null
              }
              keyboardType="email-address"
              label="Email"
              leftIcon={AtSignIcon}
              onBlur={() => {
                setTouchedFields((current) => ({ ...current, email: true }));
                setEmailError(validateEmail(email));
              }}
              onChangeText={(value) => {
                setEmail(value);
                setFormError(null);

                if (touchedFields.email || emailError) {
                  setEmailError(validateEmail(value));
                }
              }}
              placeholder="name@company.com"
              size={authFieldSize}
              type="text"
              value={email}
            />
          ) : (
            <>
              <TextField
                autoCapitalize="none"
                autoComplete="new-password"
                errorText={passwordError}
                helperText={
                  !passwordError ? "Use at least 8 characters." : null
                }
                label="New Password"
                leftIcon={LockIcon}
                onBlur={() => {
                  setTouchedFields((current) => ({
                    ...current,
                    password: true
                  }));
                  setPasswordError(validatePassword(password));
                }}
                onChangeText={(value) => {
                  setPassword(value);
                  setFormError(null);

                  if (touchedFields.password || passwordError) {
                    setPasswordError(validatePassword(value));
                  }

                  if (touchedFields.confirmPassword || confirmPasswordError) {
                    setConfirmPasswordError(
                      validateConfirmPassword(confirmPassword, value)
                    );
                  }
                }}
                placeholder="new-password"
                rightSlot={
                  <PasswordVisibilityToggle
                    onPress={() => {
                      setPasswordVisible((current) => !current);
                    }}
                    visible={passwordVisible}
                  />
                }
                size={authFieldSize}
                type={passwordVisible ? "text" : "password"}
                value={password}
              />
              <TextField
                autoCapitalize="none"
                autoComplete="new-password"
                errorText={confirmPasswordError}
                label="Confirm Password"
                leftIcon={LockIcon}
                onBlur={() => {
                  setTouchedFields((current) => ({
                    ...current,
                    confirmPassword: true
                  }));
                  setConfirmPasswordError(
                    validateConfirmPassword(confirmPassword, password)
                  );
                }}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setFormError(null);

                  if (touchedFields.confirmPassword || confirmPasswordError) {
                    setConfirmPasswordError(
                      validateConfirmPassword(value, password)
                    );
                  }
                }}
                placeholder="confirm-password"
                rightSlot={
                  <PasswordVisibilityToggle
                    onPress={() => {
                      setConfirmPasswordVisible((current) => !current);
                    }}
                    visible={confirmPasswordVisible}
                  />
                }
                size={authFieldSize}
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
              />
            </>
          )}

          <AppButton
            isDisabled={isSubmitDisabled}
            loading={isLoading}
            onDisabledPress={
              !isLoading
                ? mode === "update"
                  ? !isPasswordUpdateValid
                    ? revealPasswordUpdateValidation
                    : undefined
                  : !isResetRequestValid
                    ? revealResetRequestValidation
                    : undefined
                : undefined
            }
            onPress={() => {
              if (mode === "update") {
                void handlePasswordUpdate();
              } else {
                void handleResetRequest();
              }
            }}
            size={authFieldSize}
          >
            {mode === "update" ? "Update Password" : "Send Reset Link"}
          </AppButton>
          {formError ? (
            <FieldMessage tone="error">{formError}</FieldMessage>
          ) : null}
        </View>

        <AuthFooterLink
          actionLabel="Return to Sign In"
          href="/sign-in"
          prompt="Remembered your password?"
        />
      </View>
    </AuthShell>
  );
}
