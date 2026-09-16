import { useCreateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { OrganizationSetupInvitationsStep } from "@/features/workspaces/components/organization-setup-invitations-step";
import { OrganizationAvatarPicker } from "@/features/workspaces/components/organization-avatar-picker";
import type { OrganizationAvatarAsset } from "@/features/workspaces/services/workspaces.service";
import {
  createOrganizationSetupSchema,
  type OrganizationSetupValues
} from "@/features/workspaces/schemas/organization.schema";
import { AppButton } from "@/shared/ui/components/button";
import { AppHeading } from "@/shared/ui/components/heading";
import { TextField } from "@/shared/ui/components/input";
import { Screen } from "@/shared/ui/components/screen";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function OrganizationSetupScreen({
  mode = "initial",
  onCreated
}: {
  mode?: "additional" | "initial";
  onCreated?: () => void;
}) {
  const { t } = useTranslation("features/workspaces");
  const { refresh } = useWorkspace();
  const createOrganization = useCreateOrganization({ refreshOnSuccess: false });
  const [avatarAsset, setAvatarAsset] =
    useState<OrganizationAvatarAsset | null>(null);
  const [createdOrganization, setCreatedOrganization] = useState<{
    avatarUploadFailed: boolean;
    id: string;
    name: string;
  } | null>(null);
  const validationSchema = useMemo(() => createOrganizationSetupSchema(t), [t]);
  const { control, formState, handleSubmit } = useForm<OrganizationSetupValues>(
    {
      defaultValues: { name: "" },
      mode: "onChange",
      resolver: zodResolver(validationSchema)
    }
  );

  const submit = handleSubmit(async (values) => {
    const result = await createOrganization.mutateAsync({
      ...(avatarAsset ? { avatarAsset } : {}),
      name: values.name
    });
    setCreatedOrganization({
      avatarUploadFailed: result.avatarUploadFailed,
      id: result.organization.id,
      name: result.organization.name
    });
  });
  const complete = async () => {
    await refresh();
    onCreated?.();
  };
  const isAdditional = mode === "additional";

  return (
    <Screen centered keyboardSafe>
      <View
        style={{
          alignSelf: "center",
          gap: atomSpacing[6],
          maxWidth: 520,
          width: "100%"
        }}
      >
        {createdOrganization ? (
          <View style={{ gap: atomSpacing[4] }}>
            {createdOrganization.avatarUploadFailed ? (
              <AppText tone="danger" variant="bodySm">
                {t(($) => $["features/workspaces"].avatar.creationWarning)}
              </AppText>
            ) : null}
            <OrganizationSetupInvitationsStep
              onComplete={complete}
              organizationId={createdOrganization.id}
              organizationName={createdOrganization.name}
            />
          </View>
        ) : (
          <>
            <View style={{ gap: atomSpacing[2] }}>
              <AppText tone="accent" variant="eyebrow">
                {t(($) => $["features/workspaces"].setup.step, {
                  current: 1,
                  total: 2
                })}
              </AppText>
              <AppHeading variant="title">
                {t(($) =>
                  isAdditional
                    ? $["features/workspaces"].setup.additionalTitle
                    : $["features/workspaces"].setup.title
                )}
              </AppHeading>
              <AppText>
                {t(($) =>
                  isAdditional
                    ? $["features/workspaces"].setup.additionalDescription
                    : $["features/workspaces"].setup.description
                )}
              </AppText>
            </View>

            <OrganizationAvatarPicker
              onChange={setAvatarAsset}
              value={avatarAsset}
            />

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  autoCapitalize="words"
                  errorText={fieldState.error?.message}
                  label={t(($) => $["features/workspaces"].setup.nameLabel)}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder={t(
                    ($) => $["features/workspaces"].setup.namePlaceholder
                  )}
                  required
                  value={field.value}
                />
              )}
            />

            {createOrganization.error ? (
              <AppText tone="danger">
                {getUserFacingErrorMessage(
                  createOrganization.error,
                  t(($) => $["features/workspaces"].setup.error)
                )}
              </AppText>
            ) : null}

            <AppButton
              isDisabled={!formState.isValid}
              loading={createOrganization.isPending}
              onPress={() => void submit()}
            >
              {t(($) => $["features/workspaces"].setup.next)}
            </AppButton>
          </>
        )}
      </View>
    </Screen>
  );
}
