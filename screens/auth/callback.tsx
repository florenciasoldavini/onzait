import { AppButton, AppHeading, AppText } from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import {
  AuthShell,
  AuthStatusMessage,
  authFormControlSize
} from "@/components/auth/AuthShell";
import {
  clearWebAuthUrlArtifacts,
  completeAuthSessionFromUrl,
  getActiveAuthUrl,
  getAuthParamsFromUrl,
  urlHasAuthPayload
} from "@/lib/auth";
import {
  getAuthCallbackIntent,
  getOAuthProviderLabel,
  getPostAuthRedirectPath,
  type AuthCallbackIntent
} from "@/lib/auth-callback";
import { getSupabaseErrorMessage } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [callbackIntent, setCallbackIntent] = useState<AuthCallbackIntent>({
    kind: "sign-in"
  });
  const [statusMessage, setStatusMessage] = useState(
    "Finishing secure access..."
  );

  useEffect(() => {
    const activeUrl = getActiveAuthUrl(linkingUrl);

    if (!activeUrl) {
      setErrorMessage(
        "This auth link is missing the session payload. Try signing in again."
      );
      return;
    }

    const params = getAuthParamsFromUrl(activeUrl);
    const initialIntent = getAuthCallbackIntent(params);
    setCallbackIntent(initialIntent);

    if (!urlHasAuthPayload(activeUrl)) {
      setStatusMessage(
        initialIntent.kind === "identity-link"
          ? "We couldn't finish linking your account."
          : "We couldn't finish the sign-in redirect."
      );
      setErrorMessage(
        initialIntent.kind === "identity-link"
          ? "This link is missing the account confirmation payload. Try linking again."
          : "This auth link is missing the session payload. Try signing in again."
      );
      return;
    }

    let isMounted = true;

    const finishAuth = async () => {
      const intent: AuthCallbackIntent = initialIntent;

      try {
        setStatusMessage(
          intent.kind === "identity-link"
            ? `Connecting your ${getOAuthProviderLabel(intent.provider)} account...`
            : "Finishing sign in..."
        );
        const { type } = await completeAuthSessionFromUrl(activeUrl);

        if (!isMounted) {
          return;
        }

        clearWebAuthUrlArtifacts();
        router.replace(
          getPostAuthRedirectPath(type, params.get("next"), intent) as Href
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatusMessage(
          intent.kind === "identity-link"
            ? "We couldn't finish linking your account."
            : "We couldn't finish the sign-in redirect."
        );
        setErrorMessage(getSupabaseErrorMessage(error));
      }
    };

    void finishAuth();

    return () => {
      isMounted = false;
    };
  }, [linkingUrl, router]);

  const isIdentityLink = callbackIntent.kind === "identity-link";
  const providerLabel = isIdentityLink
    ? getOAuthProviderLabel(callbackIntent.provider)
    : null;

  return (
    <AuthShell
      description={
        isIdentityLink
          ? "Return securely to your profile while the new sign-in method is confirmed."
          : "The redirect handoff should still feel deliberate and structured while the session finalizes."
      }
      eyebrow="Auth Callback / Redirect"
      panelTag="Auth / Callback"
      title="Completing Your Access"
    >
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[2] }}>
          <AppText tone="muted" variant="eyebrow">
            Redirect / Session Resolution
          </AppText>
          <AppHeading variant="title">
            {isIdentityLink ? `Linking ${providerLabel}` : "Signing You In"}
          </AppHeading>
          <AppText tone="muted">{statusMessage}</AppText>
        </View>

        {errorMessage ? (
          <AuthStatusMessage tone="danger">{errorMessage}</AuthStatusMessage>
        ) : (
          <AuthStatusMessage>
            <AppText variant="meta">
              STATUS / HANDOFF IN PROGRESS / WAITING FOR SESSION CONFIRMATION
            </AppText>
          </AuthStatusMessage>
        )}

        {errorMessage ? (
          <AppButton
            onPress={() => {
              router.replace(isIdentityLink ? "/profile" : "/sign-in");
            }}
            size={authFormControlSize}
          >
            {isIdentityLink ? "Back to Profile" : "Back to Sign In"}
          </AppButton>
        ) : null}
      </View>
    </AuthShell>
  );
}
