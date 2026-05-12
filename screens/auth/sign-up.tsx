import {
  AuthDivider,
  AuthFooterLink,
  AuthShell,
  AuthStatusMessage
} from "@/components/auth/AuthShell";
import {
  AppButton,
  PasswordVisibilityToggle,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { AuthContext } from "@/contexts/auth";
import { getAuthRedirectUrl, startOAuthSignIn } from "@/lib/auth";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { AtSign, Lock } from "lucide-react-native";
import { useContext, useState } from "react";
import { Alert, View } from "react-native";

const googleLogo = require("@/assets/images/auth/google-logo.png");
const appleLogo = require("@/assets/images/auth/apple-logo.png");

export default function SignUpScreen() {
  const router = useRouter();
  const { authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "email" | "google" | null
  >(null);

  async function signUpWithEmail() {
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
      setLoadingAction(null);
    }
  }

  async function signUpWithProvider(provider: "apple" | "google") {
    try {
      setLoadingAction(provider);
      setErrorMessage(null);
      await startOAuthSignIn(provider);
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Sign up failed", message);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <AuthShell
      description="Create your workspace access."
      panelTag="Access / New Session"
      title="Create Account"
    >
      <View style={{ gap: atomSpacing[6] }}>
        {authError ? (
          <AuthStatusMessage tone="danger">{authError}</AuthStatusMessage>
        ) : null}

        <View style={{ gap: atomSpacing[4] }}>
          <View
            style={{
              flexDirection: "row",
              gap: atomSpacing[3],
              justifyContent: "center"
            }}
          >
            <AppButton
              accessibilityLabel="Continue with Google"
              fullWidth={false}
              imageSource={googleLogo}
              layout="icon"
              loading={loadingAction === "google"}
              onPress={() => {
                void signUpWithProvider("google");
              }}
              shape="pill"
              size="iconLg"
              variant="secondary"
            />
            <AppButton
              accessibilityLabel="Continue with Apple"
              fullWidth={false}
              imageSource={appleLogo}
              layout="icon"
              loading={loadingAction === "apple"}
              onPress={() => {
                void signUpWithProvider("apple");
              }}
              shape="pill"
              size="iconLg"
              variant="secondary"
            />
          </View>

          <AuthDivider label="OR CREATE WITH EMAIL" />

          <TextField
            autoCapitalize="none"
            autoComplete="email"
            errorText={errorMessage}
            keyboardType="email-address"
            label="Email"
            leftIcon={AtSign}
            onChangeText={setEmail}
            placeholder="name@company.com"
            type="text"
            value={email}
          />

          <TextField
            autoCapitalize="none"
            autoComplete="new-password"
            helperText={!errorMessage ? "Use at least 8 characters." : null}
            label="Password"
            leftIcon={Lock}
            onChangeText={setPassword}
            placeholder="min 8 characters"
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

          <AppButton
            loading={loadingAction === "email"}
            onPress={() => {
              void signUpWithEmail();
            }}
          >
            {loadingAction === "email" ? "Creating..." : "Create Account"}
          </AppButton>
        </View>

        <AuthFooterLink
          actionLabel="Sign In"
          href="/sign-in"
          prompt="Already have an account?"
        />
      </View>
    </AuthShell>
  );
}
