import { AppText } from "@/components/atoms/text";
import { atomSpacing } from "@/components/atoms/theme";
import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

export interface BreadcrumbItem {
  accessibilityLabel?: string;
  label: ReactNode;
  onPress?: () => void;
}

export function Breadcrumb({
  items,
  style
}: {
  items: BreadcrumbItem[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityRole="text"
      style={[
        {
          alignItems: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: atomSpacing[2]
        },
        style
      ]}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View
            key={`${index}-${String(item.label)}`}
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: atomSpacing[2]
            }}
          >
            {item.onPress ? (
              <Pressable
                accessibilityLabel={item.accessibilityLabel}
                accessibilityRole="link"
                hitSlop={8}
                onPress={item.onPress}
              >
                {({ pressed }) => (
                  <AppText
                    tone="muted"
                    variant="eyebrow"
                    style={{ opacity: pressed ? 0.72 : 1 }}
                  >
                    {item.label}
                  </AppText>
                )}
              </Pressable>
            ) : (
              <AppText tone={isLast ? "accent" : "muted"} variant="eyebrow">
                {item.label}
              </AppText>
            )}
            {!isLast ? (
              <AppText tone="muted" variant="eyebrow">
                /
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
