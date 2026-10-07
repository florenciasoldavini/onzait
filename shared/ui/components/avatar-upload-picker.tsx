import { FieldMessage } from "@/shared/ui/components/field-message";
import { AppText } from "@/shared/ui/components/text";
import {
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import { CameraIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";

export type AvatarUploadAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export function AvatarUploadPicker({
  accessibilityLabel,
  currentUrl = "",
  errorFallback,
  hint,
  imageAccessibilityLabel,
  isLoading = false,
  label,
  loadErrorMessage,
  onChange,
  permissionDeniedMessage,
  permissionRequiredMessage,
  value
}: {
  accessibilityLabel: string;
  currentUrl?: string | null;
  errorFallback: string;
  hint: string;
  imageAccessibilityLabel: string;
  isLoading?: boolean;
  label: string;
  loadErrorMessage?: string | null;
  onChange: (asset: AvatarUploadAsset) => void;
  permissionDeniedMessage: string;
  permissionRequiredMessage: string;
  value: AvatarUploadAsset | null;
}) {
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = isFocused || isHovered;
  const previewUri = value?.uri ?? currentUrl?.trim() ?? "";

  const pickImage = async () => {
    setPickerError(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setPickerError(
          permission.canAskAgain
            ? permissionRequiredMessage
            : permissionDeniedMessage
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.82
      });

      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      onChange({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri
      });
    } catch (error) {
      setPickerError(getUserFacingErrorMessage(error, errorFallback));
    }
  };

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={() => void pickImage()}
        style={({ pressed }) => [
          styles.picker,
          pressed ? styles.pickerPressed : null,
          Platform.OS === "web" ? styles.webCursor : null
        ]}
      >
        <View
          style={[
            styles.preview,
            isInteractive ? styles.previewInteractive : null
          ]}
          testID="avatar-upload-preview"
        >
          {value?.uri ? (
            <Image
              accessibilityLabel={imageAccessibilityLabel}
              accessibilityRole="image"
              accessible
              contentFit="cover"
              source={{ uri: value.uri }}
              style={styles.image}
            />
          ) : isLoading ? (
            <ActivityIndicator color={atomPalette.textSubtle} />
          ) : previewUri ? (
            <Image
              accessibilityLabel={imageAccessibilityLabel}
              accessibilityRole="image"
              accessible
              contentFit="cover"
              source={{ uri: previewUri }}
              style={styles.image}
            />
          ) : (
            <CameraIcon color={atomPalette.textSubtle} size="lg" />
          )}
        </View>
        <View style={styles.badge} testID="avatar-upload-badge">
          <CameraIcon color={atomPalette.accentText} size="sm" />
        </View>
      </Pressable>

      <View style={styles.copy}>
        <AppText variant="bodySm">{label}</AppText>
        <AppText tone="muted" variant="caption">
          {hint}
        </AppText>
      </View>

      {pickerError ? (
        <FieldMessage tone="error">{pickerError}</FieldMessage>
      ) : loadErrorMessage ? (
        <FieldMessage tone="error">{loadErrorMessage}</FieldMessage>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: atomPalette.accent,
    borderColor: atomPalette.surface,
    borderRadius: atomRadii.full,
    borderWidth: 2,
    bottom: 1,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 1,
    width: 32
  },
  copy: {
    alignItems: "center",
    gap: atomSpacing[1]
  },
  image: {
    height: "100%",
    width: "100%"
  },
  picker: {
    height: 108,
    padding: 2,
    width: 108
  },
  pickerPressed: {
    opacity: 0.76
  },
  preview: {
    alignItems: "center",
    backgroundColor: atomPalette.surfaceLow,
    borderColor: atomPalette.border,
    borderRadius: atomRadii.full,
    borderWidth: 1,
    height: 104,
    justifyContent: "center",
    overflow: "hidden",
    width: 104
  },
  previewInteractive: {
    borderColor: atomPalette.accent
  },
  root: {
    alignItems: "center",
    gap: atomSpacing[2]
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
