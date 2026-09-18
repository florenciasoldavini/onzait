import { organizationInvitationEmailMessage } from "@/features/workspaces/errors/organization-invitation-email-error";
import { useInviteOrganizationMember } from "@/features/workspaces/hooks/use-organization-members";
import {
  createOrganizationInvitationFormSchema,
  type OrganizationInvitationFormValues
} from "@/features/workspaces/schemas/organization-invitation.schema";
import { AppButton } from "@/shared/ui/components/button";
import { AppHeading } from "@/shared/ui/components/heading";
import { TextField } from "@/shared/ui/components/input";
import { SelectDropdownField } from "@/shared/ui/components/select-dropdown-field";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export function OrganizationSetupInvitationsStep({
  onComplete,
  onPendingChange,
  organizationId,
  organizationName
}: {
  onComplete: () => Promise<void>;
  onPendingChange?: (pending: boolean) => void;
  organizationId: string;
  organizationName: string;
}) {
  const { t } = useTranslation("features/workspaces");
  const invite = useInviteOrganizationMember(organizationId);
  const [lastInvitedEmail, setLastInvitedEmail] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const validationSchema = useMemo(
    () => createOrganizationInvitationFormSchema(t),
    [t]
  );
  const form = useForm<OrganizationInvitationFormValues>({
    defaultValues: { email: "", roleCode: "member" },
    mode: "onChange",
    resolver: zodResolver(validationSchema)
  });
  const isBusy =
    invite.isPending || form.formState.isSubmitting || isCompleting;
  useEffect(() => {
    onPendingChange?.(isBusy);
  }, [isBusy, onPendingChange]);
  const submit = form.handleSubmit(async (values) => {
    setLastInvitedEmail(null);
    try {
      const result = await invite.mutateAsync(values);
      if (result.status === "already_member") {
        form.setError("email", {
          message: t(($) => $["features/workspaces"].members.alreadyMember)
        });
        return;
      }
      setLastInvitedEmail(values.email);
      form.reset({ email: "", roleCode: "member" });
    } catch {
      // Keep the form open; the mutation exposes a localized error below.
    }
  });
  const complete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <View style={{ gap: atomSpacing[6] }}>
      <View style={{ gap: atomSpacing[2] }}>
        <AppText tone="accent" variant="eyebrow">
          {t(($) => $["features/workspaces"].setup.step, {
            current: 2,
            total: 2
          })}
        </AppText>
        <AppHeading variant="title">
          {t(($) => $["features/workspaces"].setup.inviteTitle)}
        </AppHeading>
        <AppText>
          {t(($) => $["features/workspaces"].setup.inviteDescription, {
            organization: organizationName
          })}
        </AppText>
      </View>

      <View style={{ gap: atomSpacing[4] }}>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              autoCapitalize="none"
              errorText={fieldState.error?.message}
              keyboardType="email-address"
              label={t(($) => $["features/workspaces"].members.email)}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="person@example.com"
              required
              value={field.value}
            />
          )}
        />
        <Controller
          control={form.control}
          name="roleCode"
          render={({ field }) => (
            <SelectDropdownField
              accessibilityLabel={t(
                ($) => $["features/workspaces"].members.role
              )}
              label={t(($) => $["features/workspaces"].members.role)}
              onChange={field.onChange}
              options={[
                {
                  label: t(($) => $["features/workspaces"].roles.member),
                  value: "member"
                },
                {
                  label: t(($) => $["features/workspaces"].roles.admin),
                  value: "admin"
                }
              ]}
              required
              value={field.value}
            />
          )}
        />
      </View>

      {lastInvitedEmail ? (
        <AppText tone="success">
          {t(($) => $["features/workspaces"].setup.invitationSent, {
            email: lastInvitedEmail
          })}
        </AppText>
      ) : null}
      {invite.error ? (
        <AppText tone="danger">
          {organizationInvitationEmailMessage(invite.error, t)}
        </AppText>
      ) : null}

      <View style={{ gap: atomSpacing[2] }}>
        <AppButton
          isDisabled={!form.formState.isValid || isCompleting}
          loading={invite.isPending}
          onPress={() => void submit()}
        >
          {t(($) => $["features/workspaces"].members.invite)}
        </AppButton>
        <AppButton
          color="neutral"
          isDisabled={invite.isPending}
          loading={isCompleting}
          onPress={() => void complete()}
          variant="ghost"
        >
          {t(($) =>
            lastInvitedEmail
              ? $["features/workspaces"].setup.finish
              : $["features/workspaces"].setup.skip
          )}
        </AppButton>
      </View>
    </View>
  );
}
