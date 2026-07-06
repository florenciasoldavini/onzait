import {
  AuthDivider,
  AuthFooterLink,
  AuthStatusMessage,
  AuthShell,
  authFieldSize,
  authFormStackGap,
  authSocialButtonSize
} from "@/components/auth/AuthShell";
import {
  AppButton,
  AppLink,
  FieldMessage,
  PasswordVisibilityToggle,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { AuthContext } from "@/contexts/auth";
import { startOAuthSignIn } from "@/lib/auth";
import {
  getSupabaseErrorMessage,
  isSupabaseEmailNotConfirmedError,
  supabase
} from "@/lib/supabase";
import { emailSchema } from "@/schemas/fields";
import { AtSignIcon, LockIcon } from "@/components/icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { View } from "react-native";

const googleLogo = require("@/assets/images/auth/google-logo.png");
const appleLogo = require("@/assets/images/auth/apple-logo.png");

export default function SignInScreen() {
  const router = useRouter();
  const { authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "email" | "google" | null
  >(null);
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

    return null;
  };
  const revealEmailSignInValidation = () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    setTouchedFields({ email: true, password: true });
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
  };
  const isEmailSignInValid =
    validateEmail(email) === null && validatePassword(password) === null;
  const isBusy = loadingAction !== null;

  async function signInWithEmail() {
    if (!supabase) {
      setFormError(getSupabaseErrorMessage("Supabase is not configured."));
      return;
    }

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    revealEmailSignInValidation();

    if (nextEmailError || nextPasswordError) {
      return;
    }

    const signInEmail = email.trim().toLowerCase();

    setLoadingAction("email");
    setFormError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password
      });

      if (error) {
        if (isSupabaseEmailNotConfirmedError(error)) {
          router.replace(
            `/verify-email?email=${encodeURIComponent(signInEmail)}`
          );
          return;
        }

        const message = getSupabaseErrorMessage(error);
        setFormError(message);
      }
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setFormError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function signInWithProvider(provider: "apple" | "google") {
    try {
      setLoadingAction(provider);
      setFormError(null);
      await startOAuthSignIn(provider);
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setFormError(message);
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

        <View style={{ gap: authFormStackGap }}>
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
              isDisabled={isBusy}
              layout="icon"
              loading={loadingAction === "google"}
              onPress={() => {
                void signInWithProvider("google");
              }}
              shape="pill"
              size={authSocialButtonSize}
              variant="secondary"
            />
            <AppButton
              accessibilityLabel="Continue with Apple"
              fullWidth={false}
              imageSource={appleLogo}
              isDisabled={isBusy}
              layout="icon"
              loading={loadingAction === "apple"}
              onPress={() => {
                void signInWithProvider("apple");
              }}
              shape="pill"
              size={authSocialButtonSize}
              variant="secondary"
            />
          </View>

          <AuthDivider label="OR CONTINUE WITH EMAIL" />

          <TextField
            autoCapitalize="none"
            autoComplete="email"
            errorText={emailError}
            keyboardType="email-address"
            label="Email Address"
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
            placeholder="architect@onzait.com"
            size={authFieldSize}
            textContentType="emailAddress"
            type="text"
            value={email}
          />

          <TextField
            accessory={<AppLink href="/reset-password">Forgot?</AppLink>}
            autoCapitalize="none"
            autoComplete="password"
            errorText={passwordError}
            label="Secure Password"
            leftIcon={LockIcon}
            onBlur={() => {
              setTouchedFields((current) => ({ ...current, password: true }));
              setPasswordError(validatePassword(password));
            }}
            onChangeText={(value) => {
              setPassword(value);
              setFormError(null);

              if (touchedFields.password || passwordError) {
                setPasswordError(validatePassword(value));
              }
            }}
            placeholder="••••••••••••"
            rightSlot={
              <PasswordVisibilityToggle
                onPress={() => {
                  setPasswordVisible((current) => !current);
                }}
                visible={passwordVisible}
              />
            }
            size={authFieldSize}
            textContentType="password"
            type={passwordVisible ? "text" : "password"}
            value={password}
          />

          <AppButton
            isDisabled={!isEmailSignInValid || isBusy}
            loading={loadingAction === "email"}
            onDisabledPress={
              !isEmailSignInValid && !isBusy
                ? revealEmailSignInValidation
                : undefined
            }
            onPress={() => {
              void signInWithEmail();
            }}
            size={authFieldSize}
          >
            Sign In
          </AppButton>
          {formError ? (
            <FieldMessage tone="error">{formError}</FieldMessage>
          ) : null}
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
