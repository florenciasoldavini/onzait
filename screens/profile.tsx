import {
  AppButton,
  AppCard,
  AppText,
  FieldMessage,
  Screen,
  TextField
} from "@/components/atoms";
import { atomPalette, atomRadii, atomSpacing } from "@/components/atoms/theme";
import { authCardMaxWidth } from "@/components/auth/AuthShell";
import { AuthContext } from "@/contexts/auth";
import {
  startOAuthIdentityLink,
  type SupportedOAuthProvider
} from "@/lib/auth";
import { getSupabaseErrorMessage, supabase } from "@/lib/supabase";
import type { UserIdentity } from "@supabase/supabase-js";
import {
  Camera,
  CheckCircle2,
  Link2,
  LogOut,
  Mail,
  Phone,
  UserRound
} from "lucide-react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Image, View } from "react-native";

const appleLogo = require("@/assets/images/auth/apple-logo.png");
const googleLogo = require("@/assets/images/auth/google-logo.png");

type IdentityProvider = "apple" | "email" | "google";

const providerCopy = {
  apple: {
    label: "Apple",
    supporting: "Apple account"
  },
  email: {
    label: "Email",
    supporting: "Password access"
  },
  google: {
    label: "Google",
    supporting: "Google account"
  }
} satisfies Record<IdentityProvider, { label: string; supporting: string }>;

export default function ProfileScreen() {
  const { logOut, session, updateUserProfile, user } = useContext(AuthContext);
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [linkingProvider, setLinkingProvider] =
    useState<SupportedOAuthProvider | null>(null);

  const linkedProviders = useMemo(() => {
    return new Set(
      identities.map((identity) => identity.provider.toLowerCase())
    );
  }, [identities]);

  const refreshIdentities = useCallback(async () => {
    if (!supabase || !session) {
      setIdentities([]);
      return;
    }

    setIdentityLoading(true);
    setIdentityError(null);

    try {
      const { data, error } = await supabase.auth.getUserIdentities();

      if (error) {
        throw error;
      }

      setIdentities(data.identities);
    } catch (error) {
      setIdentityError(getSupabaseErrorMessage(error));
    } finally {
      setIdentityLoading(false);
    }
  }, [session]);

  useEffect(() => {
    setAvatar(user?.avatar ?? "");
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setFirstNameError(null);
    setFormError(null);
    setStatusMessage(null);
  }, [user?.avatar, user?.first_name, user?.last_name, user?.phone_number]);

  useEffect(() => {
    void refreshIdentities();
  }, [refreshIdentities]);

  async function saveProfile() {
    const nextFirstName = firstName.trim();

    if (!nextFirstName) {
      setFirstNameError("First name is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setStatusMessage(null);

    try {
      const updatedUser = await updateUserProfile({
        avatar,
        first_name: nextFirstName,
        last_name: lastName,
        phone_number: phoneNumber
      });

      if (updatedUser) {
        setStatusMessage("Profile updated");
      }
    } catch (error) {
      setFormError(getSupabaseErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function linkProvider(provider: SupportedOAuthProvider) {
    setLinkingProvider(provider);
    setIdentityError(null);
    setStatusMessage(null);

    try {
      await startOAuthIdentityLink(provider);
      await refreshIdentities();
      setStatusMessage(`${providerCopy[provider].label} linked`);
    } catch (error) {
      setIdentityError(getSupabaseErrorMessage(error));
    } finally {
      setLinkingProvider(null);
    }
  }

  return (
    <Screen>
      <View
        style={{
          alignSelf: "center",
          gap: atomSpacing[5],
          maxWidth: authCardMaxWidth,
          width: "100%"
        }}
      >
        <View style={{ gap: atomSpacing[2] }}>
          <AppText variant="eyebrow">Account / Profile</AppText>
          <AppText style={{ fontSize: 28, lineHeight: 34 }}>
            {user?.first_name ? `${user.first_name}'s workspace` : "Profile"}
          </AppText>
          <AppText tone="muted">{user?.email ?? session?.user.email}</AppText>
        </View>

        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[5] }}>
            <View style={{ gap: atomSpacing[1] }}>
              <AppText variant="label">Profile</AppText>
              <AppText tone="muted">Personal details</AppText>
            </View>

            <View style={{ gap: atomSpacing[4] }}>
              <View
                style={{
                  alignItems: "center",
                  gap: atomSpacing[3]
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: atomPalette.surfaceLow,
                    borderColor: atomPalette.border,
                    borderRadius: atomRadii.full,
                    borderWidth: 1,
                    height: 96,
                    justifyContent: "center",
                    overflow: "hidden",
                    width: 96
                  }}
                >
                  {avatar.trim() ? (
                    <Image
                      source={{ uri: avatar.trim() }}
                      style={{
                        height: "100%",
                        width: "100%"
                      }}
                    />
                  ) : (
                    <Camera
                      color={atomPalette.textSubtle}
                      size={28}
                      strokeWidth={1.8}
                    />
                  )}
                </View>
                <AppText
                  style={{ maxWidth: 240, textAlign: "center" }}
                  tone="muted"
                  variant="bodySm"
                >
                  Use an image URL for now. File upload will come later with
                  storage.
                </AppText>
              </View>

              <TextField
                autoCapitalize="none"
                autoComplete="url"
                keyboardType="url"
                label="Avatar URL"
                leftIcon={Camera}
                onChangeText={(value) => {
                  setAvatar(value);
                  setFormError(null);
                }}
                placeholder="https://..."
                size="md"
                value={avatar}
              />

              <TextField
                errorText={firstNameError}
                label="First Name"
                leftIcon={UserRound}
                onBlur={() => {
                  setFirstNameError(
                    firstName.trim() ? null : "First name is required"
                  );
                }}
                onChangeText={(value) => {
                  setFirstName(value);
                  setFormError(null);

                  if (firstNameError) {
                    setFirstNameError(
                      value.trim() ? null : "First name is required"
                    );
                  }
                }}
                placeholder="First name"
                size="md"
                value={firstName}
              />

              <TextField
                label="Last Name"
                leftIcon={UserRound}
                onChangeText={(value) => {
                  setLastName(value);
                  setFormError(null);
                }}
                placeholder="Last name"
                size="md"
                value={lastName}
              />

              <TextField
                autoComplete="tel"
                keyboardType="phone-pad"
                label="Phone"
                leftIcon={Phone}
                onChangeText={(value) => {
                  setPhoneNumber(value);
                  setFormError(null);
                }}
                placeholder="Phone number"
                size="md"
                textContentType="telephoneNumber"
                value={phoneNumber}
              />

            </View>

            <View style={{ gap: atomSpacing[3] }}>
              <AppButton
                isDisabled={isSaving}
                loading={isSaving}
                onPress={() => {
                  void saveProfile();
                }}
                size="md"
              >
                Save Profile
              </AppButton>

              {statusMessage ? (
                <FieldMessage tone="success">{statusMessage}</FieldMessage>
              ) : null}
              {formError ? (
                <FieldMessage tone="error">{formError}</FieldMessage>
              ) : null}
            </View>
          </View>
        </AppCard>

        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[5] }}>
            <View style={{ gap: atomSpacing[1] }}>
              <AppText variant="label">Sign-In Methods</AppText>
              <AppText tone="muted">Connected access</AppText>
            </View>

            <View style={{ gap: atomSpacing[3] }}>
              <IdentityMethodRow
                isLinked={linkedProviders.has("email")}
                provider="email"
              />
              <IdentityMethodRow
                isLinked={linkedProviders.has("google")}
                isLoading={linkingProvider === "google"}
                onLink={() => {
                  void linkProvider("google");
                }}
                provider="google"
              />
              <IdentityMethodRow
                isLinked={linkedProviders.has("apple")}
                isLoading={linkingProvider === "apple"}
                onLink={() => {
                  void linkProvider("apple");
                }}
                provider="apple"
              />
            </View>

            {identityLoading ? (
              <FieldMessage>Checking linked methods...</FieldMessage>
            ) : null}
            {identityError ? (
              <FieldMessage tone="error">{identityError}</FieldMessage>
            ) : null}
          </View>
        </AppCard>

        <AppButton
          icon={LogOut}
          iconAfter={false}
          onPress={() => {
            void logOut();
          }}
          size="md"
          variant="destructive"
        >
          Log Out
        </AppButton>
      </View>
    </Screen>
  );
}

function IdentityMethodRow({
  isLinked,
  isLoading = false,
  onLink,
  provider
}: {
  isLinked: boolean;
  isLoading?: boolean;
  onLink?: () => void;
  provider: IdentityProvider;
}) {
  const copy = providerCopy[provider];
  const isOAuthProvider = provider === "google" || provider === "apple";

  return (
    <View
      style={{
        alignItems: "center",
        borderColor: atomPalette.border,
        borderRadius: atomRadii.lg,
        borderWidth: 1,
        flexDirection: "row",
        gap: atomSpacing[3],
        justifyContent: "space-between",
        padding: atomSpacing[4]
      }}
    >
      <View
        style={{
          alignItems: "center",
          flex: 1,
          flexDirection: "row",
          gap: atomSpacing[3]
        }}
      >
        <ProviderIcon provider={provider} />
        <View style={{ flex: 1, gap: atomSpacing[1] }}>
          <AppText>{copy.label}</AppText>
          <AppText tone="muted" variant="bodySm">
            {copy.supporting}
          </AppText>
        </View>
      </View>

      {isLinked ? (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: atomSpacing[1]
          }}
        >
          <CheckCircle2 color={atomPalette.successText} size={16} />
          <AppText tone="success" variant="label">
            Linked
          </AppText>
        </View>
      ) : isOAuthProvider ? (
        <AppButton
          fullWidth={false}
          icon={Link2}
          iconAfter={false}
          isDisabled={isLoading}
          loading={isLoading}
          onPress={onLink}
          size="sm"
          variant="secondary"
        >
          Link
        </AppButton>
      ) : null}
    </View>
  );
}

function ProviderIcon({ provider }: { provider: IdentityProvider }) {
  if (provider === "google" || provider === "apple") {
    return (
      <Image
        source={provider === "google" ? googleLogo : appleLogo}
        style={{
          height: 24,
          resizeMode: "contain",
          width: 24
        }}
      />
    );
  }

  return <Mail color={atomPalette.textMuted} size={24} strokeWidth={1.8} />;
}
