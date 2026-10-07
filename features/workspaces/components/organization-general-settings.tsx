import { OrganizationAvatarPicker } from "@/features/workspaces/components/organization-avatar-picker";
import { useUpdateOrganization } from "@/features/workspaces/hooks/use-workspace-mutations";
import type { OrganizationAvatarAsset } from "@/features/workspaces/services/workspaces.service";
import {
  createOrganizationSetupSchema,
  type OrganizationSetupValues
} from "@/features/workspaces/schemas/organization.schema";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { FieldMessage } from "@/shared/ui/components/field-message";
import { TextField } from "@/shared/ui/components/input";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

export function OrganizationGeneralSettings({
  canUpdate,
  workspace
}: {
  canUpdate: boolean;
  workspace: WorkspaceSummary;
}) {
  const { t } = useTranslation("features/workspaces");
  const [avatarAsset, setAvatarAsset] =
    useState<OrganizationAvatarAsset | null>(null);
  const [saved, setSaved] = useState(false);
  const updateOrganization = useUpdateOrganization();
  const schema = useMemo(() => createOrganizationSetupSchema(t), [t]);
  const form = useForm<OrganizationSetupValues>({
    defaultValues: { name: workspace.organization_name },
    mode: "onChange",
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    form.reset({ name: workspace.organization_name });
    setAvatarAsset(null);
    setSaved(false);
  }, [form, workspace.organization_avatar, workspace.organization_name]);

  const submit = form.handleSubmit(async ({ name }) => {
    setSaved(false);
    await updateOrganization.mutateAsync({
      avatarAsset,
      currentAvatar: workspace.organization_avatar,
      name,
      organizationId: workspace.organization_id
    });
    setAvatarAsset(null);
    form.reset({ name: name.trim() });
    setSaved(true);
  });
  const isDisabled =
    !canUpdate ||
    !form.formState.isValid ||
    updateOrganization.isPending ||
    (!form.formState.isDirty && !avatarAsset);

  return (
    <AppCard padding="lg">
      <View style={{ gap: atomSpacing[5] }}>
        <View style={{ gap: atomSpacing[1] }}>
          <AppText variant="label">
            {t(($) => $["features/workspaces"].settings.general)}
          </AppText>
          <AppText tone="muted">
            {t(($) => $["features/workspaces"].settings.generalDescription)}
          </AppText>
        </View>

        <OrganizationAvatarPicker
          currentReference={workspace.organization_avatar}
          onChange={(asset) => {
            setAvatarAsset(asset);
            setSaved(false);
          }}
          value={avatarAsset}
        />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              autoCapitalize="words"
              editable={canUpdate}
              errorText={fieldState.error?.message}
              label={t(($) => $["features/workspaces"].setup.nameLabel)}
              onBlur={field.onBlur}
              onChangeText={(value) => {
                field.onChange(value);
                setSaved(false);
              }}
              required
              value={field.value}
            />
          )}
        />

        <View style={{ gap: atomSpacing[3] }}>
          <AppButton
            isDisabled={isDisabled}
            loading={updateOrganization.isPending}
            onPress={() => void submit()}
          >
            {t(($) => $["features/workspaces"].settings.save)}
          </AppButton>
          {saved ? (
            <FieldMessage tone="success">
              {t(($) => $["features/workspaces"].settings.saved)}
            </FieldMessage>
          ) : null}
          {updateOrganization.isError ? (
            <FieldMessage tone="error">
              {getUserFacingErrorMessage(
                updateOrganization.error,
                t(($) => $["features/workspaces"].settings.saveError)
              )}
            </FieldMessage>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}
