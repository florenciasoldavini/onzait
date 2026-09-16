import { useProfileAvatarUrl } from "@/features/profile/hooks/use-profile-avatar";
import type { ProfileAvatarAsset } from "@/features/profile/services/profile.service";
import { AvatarUploadPicker } from "@/shared/ui/components/avatar-upload-picker";
import { useTranslation } from "react-i18next";

export function ProfileAvatarPicker({
  currentReference,
  onChange,
  value
}: {
  currentReference: string | null | undefined;
  onChange: (asset: ProfileAvatarAsset) => void;
  value: ProfileAvatarAsset | null;
}) {
  const { t } = useTranslation("features/profile");
  const {
    data: currentUrl = null,
    error,
    isLoading
  } = useProfileAvatarUrl(currentReference);

  return (
    <AvatarUploadPicker
      accessibilityLabel={t(
        ($) => $["features/profile"].info.avatarAccessibility
      )}
      currentUrl={currentUrl}
      errorFallback={t(($) => $["features/profile"].info.photoError)}
      hint={t(($) => $["features/profile"].info.avatarHint)}
      imageAccessibilityLabel={t(
        ($) => $["features/profile"].info.avatarPreviewLabel
      )}
      isLoading={isLoading}
      label={t(($) => $["features/profile"].info.avatarLabel)}
      loadErrorMessage={
        error ? t(($) => $["features/profile"].info.avatarError) : null
      }
      onChange={onChange}
      permissionDeniedMessage={t(($) => $["features/profile"].info.photoDenied)}
      permissionRequiredMessage={t(
        ($) => $["features/profile"].info.photoPermission
      )}
      value={value}
    />
  );
}
