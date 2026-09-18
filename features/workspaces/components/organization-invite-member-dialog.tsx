import { organizationInvitationEmailMessage } from "@/features/workspaces/errors/organization-invitation-email-error";
import {
  createOrganizationInvitationFormSchema,
  type OrganizationInvitationFormValues
} from "@/features/workspaces/schemas/organization-invitation.schema";
import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { AppHeading } from "@/shared/ui/components/heading";
import { TextField } from "@/shared/ui/components/input";
import { SelectDropdownField } from "@/shared/ui/components/select-dropdown-field";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, View } from "react-native";

export function OrganizationInviteMemberDialog({
  error,
  isPending,
  onClose,
  onInvite,
  visible
}: {
  error: unknown;
  isPending: boolean;
  onClose: () => void;
  onInvite: (
    values: OrganizationInvitationFormValues
  ) => Promise<"already_member" | "pending">;
  visible: boolean;
}) {
  const { t } = useTranslation("features/workspaces");
  const { t: tShared } = useTranslation("shared");
  const schema = useMemo(() => createOrganizationInvitationFormSchema(t), [t]);
  const form = useForm<OrganizationInvitationFormValues>({
    defaultValues: { email: "", roleCode: "member" },
    mode: "onChange",
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (!visible) {
      form.reset({ email: "", roleCode: "member" });
    }
  }, [form, visible]);

  const close = () => {
    if (!isPending) onClose();
  };
  const submit = form.handleSubmit(async (values) => {
    try {
      const status = await onInvite(values);
      if (status === "already_member") {
        form.setError("email", {
          message: t(($) => $["features/workspaces"].members.alreadyMember)
        });
        return;
      }
      onClose();
    } catch {
      // The mutation exposes a localized product error below the form.
    }
  });

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={t(
            ($) => $["features/workspaces"].members.closeInvite
          )}
          accessibilityRole="button"
          disabled={isPending}
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.backdrop} />
        <AppCard padding="lg" style={styles.card}>
          <View style={styles.content}>
            <View style={styles.copy}>
              <AppHeading variant="section">
                {t(($) => $["features/workspaces"].members.inviteTitle)}
              </AppHeading>
              <AppText tone="muted">
                {t(($) => $["features/workspaces"].members.inviteDescription)}
              </AppText>
            </View>

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  autoCapitalize="none"
                  editable={!isPending}
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
            <View
              pointerEvents={isPending ? "none" : "auto"}
              style={isPending ? styles.disabled : null}
            >
              <Controller
                control={form.control}
                name="roleCode"
                render={({ field, fieldState }) => (
                  <SelectDropdownField
                    errorText={fieldState.error?.message}
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

            {error ? (
              <AppText selectable tone="danger">
                {organizationInvitationEmailMessage(error, t)}
              </AppText>
            ) : null}

            <View style={styles.actions}>
              <AppButton
                color="neutral"
                fullWidth={false}
                isDisabled={isPending}
                onPress={close}
                size="md"
                variant="bordered"
              >
                {tShared(($) => $.shared.actions.cancel)}
              </AppButton>
              <AppButton
                fullWidth={false}
                isDisabled={!form.formState.isValid || isPending}
                loading={isPending}
                onPress={() => void submit()}
                size="md"
              >
                {t(($) => $["features/workspaces"].members.invite)}
              </AppButton>
            </View>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: atomSpacing[3],
    justifyContent: "flex-end"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)"
  },
  card: { maxWidth: 560, width: "100%" },
  content: { gap: atomSpacing[5] },
  copy: { gap: atomSpacing[2] },
  disabled: { opacity: 0.65 },
  root: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: atomSpacing[5]
  }
});
