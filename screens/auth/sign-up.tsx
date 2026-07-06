import {
  AuthDivider,
  AuthFooterLink,
  AuthShell,
  AuthStatusMessage,
  authFieldSize,
  authFormStackGap,
  authSocialButtonSize
} from "@/components/auth/AuthShell";
import {
  AppButton,
  FieldMessage,
  PasswordVisibilityToggle,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { AuthContext } from "@/contexts/auth";
import { getAuthRedirectUrl, startOAuthSignIn } from "@/lib/auth";
import {
  getSupabaseErrorMessage,
  isSupabaseEmailCooldownError,
  supabase
} from "@/lib/supabase";
import { emailSchema } from "@/schemas/fields";
import { AtSignIcon, LockIcon } from "@/components/icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { View } from "react-native";

const googleLogo = require("@/assets/images/auth/google-logo.png");
const appleLogo = require("@/assets/images/auth/apple-logo.png");

export default function SignUpScreen() {
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

    if (value.length < 8) {
      return "Use at least 8 characters";
    }

    return null;
  };
  const revealEmailSignUpValidation = () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    setTouchedFields({ email: true, password: true });
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
  };
  const isEmailSignUpValid =
    validateEmail(email) === null && validatePassword(password) === null;
  const isBusy = loadingAction !== null;

  async function signUpWithEmail() {
    if (!supabase) {
      setFormError(getSupabaseErrorMessage("Supabase is not configured."));
      return;
    }

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    revealEmailSignUpValidation();

    if (nextEmailError || nextPasswordError) {
      return;
    }

    const signUpEmail = email.trim().toLowerCase();

    setLoadingAction("email");
    setFormError(null);

    try {
      const {
        data: { session },
        error
      } = await supabase.auth.signUp({
        email: signUpEmail,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("callback")
        }
      });

      if (error) {
        if (isSupabaseEmailCooldownError(error)) {
          router.replace(
            `/verify-email?email=${encodeURIComponent(signUpEmail)}&notice=rate-limited`
          );
        } else {
          const message = getSupabaseErrorMessage(error);
          setFormError(message);
        }
      } else if (!session) {
        router.replace(
          `/verify-email?email=${encodeURIComponent(signUpEmail)}&notice=sent`
        );
      }
    } catch (error) {
      const message = getSupabaseErrorMessage(error);
      setFormError(message);
    } finally {
      setLoadingAction(null);
    }
  }

  async function signUpWithProvider(provider: "apple" | "google") {
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
      description="Create your workspace access."
      panelTag="Access / New Session"
      title="Create Account"
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
                void signUpWithProvider("google");
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
                void signUpWithProvider("apple");
              }}
              shape="pill"
              size={authSocialButtonSize}
              variant="secondary"
            />
          </View>

          <AuthDivider label="OR CREATE WITH EMAIL" />

          <TextField
            autoCapitalize="none"
            autoComplete="email"
            errorText={emailError}
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

          <TextField
            autoCapitalize="none"
            autoComplete="new-password"
            errorText={passwordError}
            helperText={!passwordError ? "Use at least 8 characters." : null}
            label="Password"
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
            placeholder="min 8 characters"
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

          <AppButton
            isDisabled={!isEmailSignUpValid || isBusy}
            loading={loadingAction === "email"}
            onDisabledPress={
              !isEmailSignUpValid && !isBusy
                ? revealEmailSignUpValidation
                : undefined
            }
            onPress={() => {
              void signUpWithEmail();
            }}
            size={authFieldSize}
          >
            Create Account
          </AppButton>
          {formError ? (
            <FieldMessage tone="error">{formError}</FieldMessage>
          ) : null}
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
