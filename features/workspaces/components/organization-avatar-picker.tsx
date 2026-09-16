import { useOrganizationAvatarUrl } from "@/features/workspaces/hooks/use-organization-avatar";
import type { OrganizationAvatarAsset } from "@/features/workspaces/services/workspaces.service";
import { AvatarUploadPicker } from "@/shared/ui/components/avatar-upload-picker";
import { useTranslation } from "react-i18next";

export function OrganizationAvatarPicker({
  currentReference = null,
  onChange,
  value
}: {
  currentReference?: string | null;
  onChange: (asset: OrganizationAvatarAsset) => void;
  value: OrganizationAvatarAsset | null;
}) {
  const { t } = useTranslation("features/workspaces");
  const currentUrl = useOrganizationAvatarUrl(currentReference);

  return (
    <AvatarUploadPicker
      accessibilityLabel={t(
        ($) => $["features/workspaces"].avatar.accessibilityLabel
      )}
      currentUrl={currentUrl}
      errorFallback={t(($) => $["features/workspaces"].avatar.error)}
      hint={t(($) => $["features/workspaces"].avatar.hint)}
      imageAccessibilityLabel={t(
        ($) => $["features/workspaces"].avatar.previewLabel
      )}
      label={t(($) => $["features/workspaces"].avatar.label)}
      onChange={onChange}
      permissionDeniedMessage={t(($) => $["features/workspaces"].avatar.denied)}
      permissionRequiredMessage={t(
        ($) => $["features/workspaces"].avatar.permission
      )}
      value={value}
    />
  );
}
