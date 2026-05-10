import { ScreenLayout } from "@/components/ScreenLayout";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
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
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";

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
    <ScreenLayout>
      <VStack className="w-full flex-1 items-center justify-center gap-4">
        <Text className="w-full text-2xl font-bold">Reset Password</Text>
        <Text className="w-full text-sm text-typography-700">
          {mode === "update"
            ? "Set a new password for your account."
            : "Enter your email and we'll send you a reset link."}
        </Text>
        <FormControl className="w-full" isInvalid={Boolean(errorMessage)}>
          <VStack className="w-full gap-4">
            {mode === "request" ? (
              <VStack className="w-full">
                <FormControlLabel>
                  <FormControlLabelText>Email</FormControlLabelText>
                </FormControlLabel>
                <Input className="my-1 rounded-full">
                  <InputField
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="johndoe@gmail.com"
                    type="text"
                    value={email}
                  />
                </Input>
              </VStack>
            ) : (
              <>
                <VStack className="w-full">
                  <FormControlLabel>
                    <FormControlLabelText>New Password</FormControlLabelText>
                  </FormControlLabel>
                  <Input className="my-1 rounded-full">
                    <InputField
                      autoCapitalize="none"
                      autoComplete="new-password"
                      onChangeText={setPassword}
                      placeholder="New password"
                      type="password"
                      value={password}
                    />
                  </Input>
                </VStack>
                <VStack className="w-full">
                  <FormControlLabel>
                    <FormControlLabelText>Confirm Password</FormControlLabelText>
                  </FormControlLabel>
                  <Input className="my-1 rounded-full">
                    <InputField
                      autoCapitalize="none"
                      autoComplete="new-password"
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm password"
                      type="password"
                      value={confirmPassword}
                    />
                  </Input>
                </VStack>
              </>
            )}
            {errorMessage ? (
              <FormControlError>
                <FormControlErrorText>{errorMessage}</FormControlErrorText>
              </FormControlError>
            ) : null}
            <Button
              className="w-full rounded-full"
              onPress={() => {
                if (mode === "update") {
                  void handlePasswordUpdate();
                } else {
                  void handleResetRequest();
                }
              }}
            >
              <ButtonText>
                {isLoading
                  ? mode === "update"
                    ? "Updating..."
                    : "Sending..."
                  : mode === "update"
                    ? "Update Password"
                    : "Send Reset Link"}
              </ButtonText>
            </Button>
          </VStack>
        </FormControl>
        <Text>
          Remembered your password? <Link href="/sign-in">Sign in</Link>
        </Text>
      </VStack>
    </ScreenLayout>
  );
}
