import { AppButton, AppHeading, AppText } from "@/components/atoms";
import {
  AuthStatusMessage,
  AuthShell
} from "@/components/auth/AuthShell";
import { atomSpacing } from "@/components/atoms/theme";
import {
  clearWebAuthUrlArtifacts,
  completeAuthSessionFromUrl,
  getActiveAuthUrl,
  getPostAuthRedirectPath,
  urlHasAuthPayload
} from "@/lib/auth";
import { getSupabaseErrorMessage } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Finishing sign in...");

  useEffect(() => {
    const activeUrl = getActiveAuthUrl(linkingUrl);

    if (!activeUrl || !urlHasAuthPayload(activeUrl)) {
      setErrorMessage(
        "This auth link is missing the session payload. Try signing in again."
      );
      return;
    }

    let isMounted = true;

    const finishAuth = async () => {
      try {
        const { type } = await completeAuthSessionFromUrl(activeUrl);

        if (!isMounted) {
          return;
        }

        clearWebAuthUrlArtifacts();
        router.replace(getPostAuthRedirectPath(type));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatusMessage("We couldn't finish the sign-in redirect.");
        setErrorMessage(getSupabaseErrorMessage(error));
      }
    };

    void finishAuth();

    return () => {
      isMounted = false;
    };
  }, [linkingUrl, router]);

  return (
    <AuthShell
      description="The redirect handoff should still feel deliberate and structured while the session finalizes."
      eyebrow="Auth Callback / Redirect"
      panelTag="Auth / Callback"
      title="Completing your access."
    >
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[2] }}>
          <AppText tone="muted" variant="eyebrow">
            Redirect / Session Resolution
          </AppText>
          <AppHeading variant="title">Signing you in.</AppHeading>
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
              router.replace("/sign-in");
            }}
          >
            Back to Sign In
          </AppButton>
        ) : null}
      </View>
    </AuthShell>
  );
}
