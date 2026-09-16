import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProfileAvatarPicker } from "@/features/profile/components/profile-avatar-picker";
import type { ProfileAvatarAsset } from "@/features/profile/services/profile.service";
import {
  createProfileInfoSchema,
  type ProfileInfoInput
} from "@/features/profile/schemas/profile.schemas";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { FieldMessage } from "@/shared/ui/components/field-message";
import { TextField } from "@/shared/ui/components/input";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { PhoneIcon, UserIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

function getProfileInfoDefaults(
  profile:
    | {
        avatar?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        phone_number?: string | null;
      }
    | null
    | undefined
): ProfileInfoInput {
  return {
    avatar: profile?.avatar ?? "",
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    phoneNumber: profile?.phone_number ?? ""
  };
}

export function ProfileInfoTab() {
  const { t } = useTranslation("features/profile");
  const { i18n, t: tShared } = useTranslation("shared");
  const { session, updateUserProfile, user } = useAuth();
  const [avatarAsset, setAvatarAsset] = useState<ProfileAvatarAsset | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const profileInfoSchema = useMemo(
    () => createProfileInfoSchema(tShared),
    [i18n.resolvedLanguage, tShared]
  );
  const form = useForm<ProfileInfoInput>({
    defaultValues: getProfileInfoDefaults(user),
    mode: "onChange",
    resolver: zodResolver(profileInfoSchema)
  });
  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    watch
  } = form;
  const avatar = watch("avatar");
  const isSaveDisabled = isSaving || !isValid || (!isDirty && !avatarAsset);

  useEffect(() => {
    setAvatarAsset(null);
    reset(getProfileInfoDefaults(user));
    setFormError(null);
    setStatusMessage(null);
  }, [
    session?.user.email,
    user?.avatar,
    user?.email,
    user?.first_name,
    user?.last_name,
    user?.phone_number,
    reset
  ]);

  const clearMessages = () => {
    setFormError(null);
    setStatusMessage(null);
  };

  const saveProfile = handleSubmit(async (values) => {
    if (!user) {
      setFormError(t(($) => $["features/profile"].info.signInError));
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const updatedUser = await updateUserProfile(
        {
          avatar: values.avatar,
          first_name: values.firstName.trim(),
          last_name: values.lastName,
          phone_number: values.phoneNumber
        },
        avatarAsset
      );

      if (updatedUser) {
        setAvatarAsset(null);
        reset(getProfileInfoDefaults(updatedUser));
        setStatusMessage(t(($) => $["features/profile"].info.updated));
      }
    } catch (error) {
      setFormError(
        getUserFacingErrorMessage(
          error,
          t(($) => $["features/profile"].info.saveError)
        )
      );
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <AppCard padding="lg">
      <View style={styles.content}>
        <View style={styles.heading}>
          <AppText variant="label">
            {t(($) => $["features/profile"].info.profile)}
          </AppText>
          <AppText tone="muted">
            {t(($) => $["features/profile"].info.personalDetails)}
          </AppText>
        </View>

        <View style={styles.fields}>
          <ProfileAvatarPicker
            currentReference={avatar}
            onChange={(asset) => {
              setAvatarAsset(asset);
              clearMessages();
            }}
            value={avatarAsset}
          />

          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label={t(($) => $["features/profile"].info.firstName)}
                leftIcon={UserIcon}
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  field.onChange(value);
                  clearMessages();
                }}
                placeholder={t(($) => $["features/profile"].info.firstName)}
                required
                size="md"
                value={field.value}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <TextField
                label={t(($) => $["features/profile"].info.lastName)}
                leftIcon={UserIcon}
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  field.onChange(value);
                  clearMessages();
                }}
                placeholder={t(($) => $["features/profile"].info.lastName)}
                size="md"
                value={field.value}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextField
                autoComplete="tel"
                keyboardType="phone-pad"
                label={t(($) => $["features/profile"].info.phone)}
                leftIcon={PhoneIcon}
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  field.onChange(value);
                  clearMessages();
                }}
                placeholder={t(($) => $["features/profile"].info.phone)}
                size="md"
                textContentType="telephoneNumber"
                value={field.value}
              />
            )}
          />
        </View>

        <View style={styles.messages}>
          <AppButton
            isDisabled={isSaveDisabled}
            loading={isSaving}
            onPress={() => void saveProfile()}
            size="md"
          >
            {t(($) => $["features/profile"].info.save)}
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
  );
}

const styles = StyleSheet.create({
  content: {
    gap: atomSpacing[5]
  },
  fields: {
    gap: atomSpacing[4]
  },
  heading: {
    gap: atomSpacing[1]
  },
  messages: {
    gap: atomSpacing[3]
  }
});
