import { AppButton } from "@/shared/ui/components/button";
import { AppCard } from "@/shared/ui/components/card";
import { atomSpacing } from "@/shared/ui/components/theme";
import { CloseIcon } from "@/shared/ui/icons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OrganizationSetupDialog({
  children,
  canCancel,
  showCancel = true,
  onCancel
}: {
  children: ReactNode;
  canCancel: boolean;
  showCancel?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation("shared");
  const { t: tWorkspace } = useTranslation("features/workspaces");
  const insets = useSafeAreaInsets();
  const close = () => {
    if (canCancel) onCancel();
  };
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
      supportedOrientations={["portrait", "landscape"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={Platform.OS !== "web"}
        style={[
          styles.root,
          {
            paddingTop: insets.top + atomSpacing[4],
            paddingBottom: insets.bottom + atomSpacing[4]
          }
        ]}
      >
        <Pressable
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          tabIndex={-1}
          onPress={close}
          style={styles.backdrop}
        />
        <AppCard
          accessibilityViewIsModal
          role="dialog"
          accessibilityLabel={tWorkspace(
            ($) => $["features/workspaces"].setup.additionalTitle
          )}
          style={styles.card}
        >
          <View style={styles.closeRow}>
            <AppButton
              accessibilityLabel={t(($) => $.shared.actions.close)}
              icon={CloseIcon}
              layout="icon"
              shape="pill"
              fullWidth={false}
              color="neutral"
              variant="ghost"
              isDisabled={!canCancel}
              onPress={close}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {children}
            {showCancel ? (
              <View style={styles.actions}>
                <AppButton
                  color="neutral"
                  variant="ghost"
                  isDisabled={!canCancel}
                  onPress={close}
                >
                  {t(($) => $.shared.actions.cancel)}
                </AppButton>
              </View>
            ) : null}
          </ScrollView>
        </AppCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: atomSpacing[4]
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)"
  },
  card: { maxWidth: 600, maxHeight: "100%", width: "100%", padding: 0 },
  actions: { alignSelf: "center", maxWidth: 520, width: "100%" },
  closeRow: {
    alignItems: "flex-end",
    paddingHorizontal: atomSpacing[3],
    paddingTop: atomSpacing[2]
  },
  content: {
    padding: atomSpacing[6],
    paddingTop: atomSpacing[2],
    gap: atomSpacing[3]
  }
});
