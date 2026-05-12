import {
  AuthDivider,
  AuthFooterLink,
  AuthStatusMessage,
  AuthShell
} from "@/components/auth/AuthShell";
import {
  AppButton,
  AppLink,
  PasswordVisibilityToggle,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { AuthContext } from "@/contexts/auth";
import { startOAuthSignIn } from "@/lib/auth";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import { AtSign, Lock } from "lucide-react-native";
import { useContext, useState } from "react";
import { Alert, View } from "react-native";

const googleLogo = require("@/assets/images/auth/google-logo.png");
const appleLogo = require("@/assets/images/auth/apple-logo.png");

export default function SignInScreen() {
  const { authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    try {
      setLoadingAction(provider);
      setErrorMessage(null);
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
    <AuthShell
      description="Access your workspace."
      panelTag="Access / Sign In"
      title="Welcome Back"
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
                void signInWithProvider("google");
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
                void signInWithProvider("apple");
              }}
              shape="pill"
              size="iconLg"
              variant="secondary"
            />
          </View>

          <AuthDivider label="OR CONTINUE WITH EMAIL" />

          <TextField
            autoCapitalize="none"
            autoComplete="email"
            errorText={errorMessage}
            keyboardType="email-address"
            label="Email Address"
            leftIcon={AtSign}
            onChangeText={setEmail}
            placeholder="architect@onzait.com"
            textContentType="emailAddress"
            type="text"
            value={email}
          />

          <TextField
            accessory={
              <AppLink href="/reset-password">Forgot?</AppLink>
            }
            autoCapitalize="none"
            autoComplete="password"
            label="Secure Password"
            leftIcon={Lock}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            rightSlot={
              <PasswordVisibilityToggle
                onPress={() => {
                  setPasswordVisible((current) => !current);
                }}
                visible={passwordVisible}
              />
            }
            textContentType="password"
            type={passwordVisible ? "text" : "password"}
            value={password}
          />

          <AppButton
            loading={loadingAction === "email"}
            onPress={() => {
              void signInWithEmail();
            }}
            size="lg"
          >
            {loadingAction === "email" ? "Signing In..." : "Sign In"}
          </AppButton>
        </View>

        <AuthFooterLink
          actionLabel="Create an Account"
          href="/sign-up"
          prompt="New to the platform?"
        />
      </View>
    </AuthShell>
  );
}
