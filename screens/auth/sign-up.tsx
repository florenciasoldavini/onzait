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
import { getAuthRedirectUrl } from "@/lib/auth";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Text } from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!supabase) {
      setErrorMessage(getSupabaseErrorMessage("Supabase is not configured."));
      return;
    }

    if (!email || !password) {
      setErrorMessage("Enter both your email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { session },
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("callback")
        }
      });

      if (error) {
        const message = getSupabaseErrorMessage(error);
        setErrorMessage(message);
        Alert.alert("Sign up failed", message);
      } else if (!session) {
        Alert.alert(
          "Check your email",
          "Your account was created. Confirm your email, then sign in."
        );
        router.replace("/sign-in");
      }
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout>
      <VStack className="w-full flex-1 items-center justify-center gap-4">
        <Text className="w-full text-2xl font-bold">Sign Up</Text>
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
                  autoComplete="new-password"
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
                void signUpWithEmail();
              }}
            >
              <ButtonText>{loading ? "Creating..." : "Sign Up"}</ButtonText>
            </Button>
          </VStack>
        </FormControl>
        <Text>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </Text>
      </VStack>
    </ScreenLayout>
  );
}
