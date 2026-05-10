import { ScreenLayout } from "@/components/ScreenLayout";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
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
import { Text } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const linkingUrl = Linking.useURL();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Finishing sign in...");

  useEffect(() => {
    const activeUrl = getActiveAuthUrl(linkingUrl);

    if (!activeUrl || !urlHasAuthPayload(activeUrl)) {
      setErrorMessage("This auth link is missing the session payload. Try signing in again.");
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
    <ScreenLayout>
      <VStack className="w-full flex-1 items-center justify-center gap-4">
        <Text className="w-full text-2xl font-bold">Signing you in</Text>
        <Text className="w-full text-sm text-typography-700">{statusMessage}</Text>
        {errorMessage ? (
          <>
            <Text className="w-full text-sm text-red-600">{errorMessage}</Text>
            <Button
              className="w-full rounded-full"
              onPress={() => {
                router.replace("/sign-in");
              }}
            >
              <ButtonText>Back to sign in</ButtonText>
            </Button>
          </>
        ) : null}
      </VStack>
    </ScreenLayout>
  );
}
