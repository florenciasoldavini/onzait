import { Breadcrumb } from "@/shared/ui/components/breadcrumb";
import { AppHeading } from "@/shared/ui/components/heading";
import { AppText } from "@/shared/ui/components/text";
import { atomSpacing } from "@/shared/ui/components/theme";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

export function NavScreenHeader({
  breadcrumbLabel,
  description,
  style,
  title
}: {
  breadcrumbLabel?: ReactNode;
  description?: ReactNode;
  style?: StyleProp<ViewStyle>;
  title: ReactNode;
}) {
  return (
    <View style={[{ gap: atomSpacing[3] }, style]}>
      <Breadcrumb
        items={[{ label: breadcrumbLabel ?? title }]}
        showTrailingSeparator
      />
      <AppHeading variant="hero">{title}</AppHeading>
      {typeof description === "string" ? (
        <AppText tone="muted">{description}</AppText>
      ) : (
        description
      )}
    </View>
  );
}
