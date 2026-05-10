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
import { AuthContext } from "@/contexts/auth";
import { startOAuthSignIn } from "@/lib/auth";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Platform, Text } from "react-native";

export default function SignInScreen() {
  const { authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "email" | "google" | null
  >(null);

  async function signInWithEmail() {
    if (!supabase) {
      setErrorMessage(getSupabaseErrorMessage("Supabase is not configured."));
      return;
    }

    if (!email || !password) {
      setErrorMessage("Enter both your email and password.");
      return;
    }

    setLoadingAction("email");
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Sign in failed", message);
    }

    setLoadingAction(null);
  }

  async function signInWithProvider(provider: "apple" | "google") {
    setLoadingAction(provider);
    setErrorMessage(null);

    try {
      await startOAuthSignIn(provider);
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Sign in failed", message);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <ScreenLayout>
      <VStack className="w-full flex-1 items-center justify-center gap-4">
        <Text className="w-full text-2xl font-bold">Sign In</Text>
        {authError ? (
          <Text className="w-full text-sm text-red-600">{authError}</Text>
        ) : null}
        <FormControl className="w-full" isInvalid={Boolean(errorMessage)}>
          <VStack className="w-full gap-4">
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
            <VStack>
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1 rounded-full">
                <InputField
                  autoCapitalize="none"
                  autoComplete="password"
                  onChangeText={setPassword}
                  placeholder="password"
                  type="password"
                  value={password}
                />
              </Input>
            </VStack>
            {errorMessage ? (
              <FormControlError>
                <FormControlErrorText>{errorMessage}</FormControlErrorText>
              </FormControlError>
            ) : null}
            <Button
              className="w-full rounded-full"
              onPress={() => {
                void signInWithEmail();
              }}
            >
              <ButtonText>
                {loadingAction === "email" ? "Signing In..." : "Sign In"}
              </ButtonText>
            </Button>
          </VStack>
        </FormControl>
        <Link href="/reset-password">Forgot password?</Link>
        <Text>Or</Text>
        <VStack className="w-full gap-4">
          <Button
            className="w-full rounded-full"
            onPress={() => {
              void signInWithProvider("google");
            }}
            variant="outline"
          >
            <ButtonText>
              {loadingAction === "google"
                ? "Redirecting to Google..."
                : "Sign in with Google"}
            </ButtonText>
          </Button>
          {Platform.OS !== "android" ? (
            <Button
              className="w-full rounded-full"
              onPress={() => {
                void signInWithProvider("apple");
              }}
              variant="outline"
            >
              <ButtonText>
                {loadingAction === "apple"
                  ? "Redirecting to Apple..."
                  : "Sign in with Apple"}
              </ButtonText>
            </Button>
          ) : null}
        </VStack>
        <Text>
          Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
        </Text>
      </VStack>
    </ScreenLayout>
  );
}
