import {
  AuthFooterLink,
  AuthShell
} from "@/components/auth/AuthShell";
import {
  AppButton,
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
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { AtSign, Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

type ResetMode = "request" | "update";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ResetMode>("request");
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const activeUrl = getActiveAuthUrl(linkingUrl);

    if (!activeUrl || !urlHasAuthPayload(activeUrl)) {
      return;
    }

    let isMounted = true;

    const prepareRecoverySession = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const { type, session } = await completeAuthSessionFromUrl(activeUrl);

        if (!isMounted) {
          return;
        }

        clearWebAuthUrlArtifacts();

        if (type === "recovery" || session) {
          setMode("update");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getSupabaseErrorMessage(error));
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
    if (!email) {
      setErrorMessage("Enter the email address for your account.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await sendPasswordResetEmail(email);
      Alert.alert("Check your email", "We sent you a password reset link.");
      router.replace("/sign-in");
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Reset request failed", message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasswordUpdate() {
    if (!password) {
      setErrorMessage("Enter a new password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await updatePassword(password);
      Alert.alert("Password updated", "Your password has been changed.");
      router.replace("/");
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Password update failed", message);
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
      title={mode === "update" ? "Update your password." : "Reset your password."}
    >
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[4] }}>
          {mode === "request" ? (
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              errorText={errorMessage}
              helperText={
                !errorMessage
                  ? "Enter the email tied to your account."
                  : null
              }
              keyboardType="email-address"
              label="Email"
              leftIcon={AtSign}
              onChangeText={setEmail}
              placeholder="name@company.com"
              type="text"
              value={email}
            />
          ) : (
            <>
              <TextField
                autoCapitalize="none"
                autoComplete="new-password"
                errorText={errorMessage}
                helperText={!errorMessage ? "Use at least 8 characters." : null}
                label="New Password"
                leftIcon={Lock}
                onChangeText={setPassword}
                placeholder="new-password"
                rightSlot={
                  <PasswordVisibilityToggle
                    onPress={() => {
                      setPasswordVisible((current) => !current);
                    }}
                    visible={passwordVisible}
                  />
                }
                type={passwordVisible ? "text" : "password"}
                value={password}
              />
              <TextField
                autoCapitalize="none"
                autoComplete="new-password"
                label="Confirm Password"
                leftIcon={Lock}
                onChangeText={setConfirmPassword}
                placeholder="confirm-password"
                rightSlot={
                  <PasswordVisibilityToggle
                    onPress={() => {
                      setConfirmPasswordVisible((current) => !current);
                    }}
                    visible={confirmPasswordVisible}
                  />
                }
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
              />
            </>
          )}

          <AppButton
            loading={isLoading}
            onPress={() => {
              if (mode === "update") {
                void handlePasswordUpdate();
              } else {
                void handleResetRequest();
              }
            }}
          >
            {isLoading
              ? mode === "update"
                ? "Updating..."
                : "Sending..."
              : mode === "update"
                ? "Update Password"
                : "Send Reset Link"}
          </AppButton>
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
