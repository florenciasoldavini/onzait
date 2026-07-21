import {
  AuthDivider,
  AuthFooterLink,
  AuthStatusMessage,
  AuthShell,
  authFieldSize,
  authFormStackGap,
  authSocialButtonSize
} from "@/features/auth/components/auth-shell";
import {
  AppButton,
  AppLink,
  FieldMessage,
  PasswordVisibilityToggle,
  TextField
} from "@/shared/ui/components";
import { atomSpacing } from "@/shared/ui/components/theme";
import {
  getAuthErrorMessage,
  isAuthEmailNotConfirmedError,
  signInWithEmailPassword,
  startOAuthSignIn
} from "@/features/auth/services/auth.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth.schemas";
import { AtSignIcon, LockIcon } from "@/shared/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

const googleLogo = require("@/assets/images/auth/google-logo.png");
const appleLogo = require("@/assets/images/auth/apple-logo.png");

export default function SignInScreen() {
  const router = useRouter();
  const { authError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    "apple" | "email" | "google" | null
  >(null);
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onChange",
    resolver: zodResolver(loginSchema)
  });
  const {
    control,
    formState: { isValid },
    handleSubmit,
    trigger
  } = form;
  const isBusy = loadingAction !== null;

  const revealEmailSignInValidation = () => {
    void trigger();
  };

  const signInWithEmail = handleSubmit(async ({ email, password }) => {
    const signInEmail = email.trim().toLowerCase();

    setLoadingAction("email");
    setFormError(null);

    try {
      await signInWithEmailPassword(signInEmail, password);
    } catch (error) {
      if (isAuthEmailNotConfirmedError(error)) {
        router.replace(`/verify-email?email=${encodeURIComponent(signInEmail)}`);
        return;
      }

      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  });

  async function signInWithProvider(provider: "apple" | "google") {
    try {
      setLoadingAction(provider);
      setFormError(null);
      await startOAuthSignIn(provider);
    } catch (error) {
      const message = getAuthErrorMessage(error);
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
              color="neutral"
              variant="bordered"
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
              color="neutral"
              variant="bordered"
            />
          </View>

          <AuthDivider label="OR CONTINUE WITH EMAIL" />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                autoCapitalize="none"
                autoComplete="email"
                errorText={fieldState.error?.message}
                keyboardType="email-address"
                label="Email Address"
                leftIcon={AtSignIcon}
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  field.onChange(value);
                  setFormError(null);
                }}
                placeholder="architect@onzait.com"
                required
                size={authFieldSize}
                textContentType="emailAddress"
                type="text"
                value={field.value}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                accessory={<AppLink href="/reset-password">Forgot?</AppLink>}
                autoCapitalize="none"
                autoComplete="password"
                errorText={fieldState.error?.message}
                label="Secure Password"
                leftIcon={LockIcon}
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  field.onChange(value);
                  setFormError(null);
                }}
                placeholder="••••••••••••"
                required
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
                value={field.value}
              />
            )}
          />

          <AppButton
            isDisabled={!isValid || isBusy}
            loading={loadingAction === "email"}
            onDisabledPress={
              !isValid && !isBusy ? revealEmailSignInValidation : undefined
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
