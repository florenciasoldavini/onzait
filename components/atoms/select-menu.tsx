import { AppText } from "@/components/atoms/text";
import { atomMotion } from "@/components/atoms/motion";
import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/components/atoms/theme";
import {
  CheckIcon,
  ChevronDownIcon,
  type AppIconComponent
} from "@/components/icons";
import { useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutRectangle,
  type ViewStyle
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export interface SelectMenuOption<TValue extends string> {
  label: string;
  value: TValue;
}

export function SelectMenu<TValue extends string>({
  accessibilityLabel,
  field = false,
  icon: Icon,
  isInvalid = false,
  labelPrefix,
  minWidth = 192,
  onChange,
  options,
  value
}: {
  accessibilityLabel?: string;
  field?: boolean;
  icon?: AppIconComponent;
  isInvalid?: boolean;
  labelPrefix?: string;
  minWidth?: number;
  onChange: (value: TValue) => void;
  options: SelectMenuOption<TValue>[];
  value: TValue;
}) {
  const triggerRef = useRef<View>(null);
  const { height, width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<TValue | null>(null);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(
    null
  );
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const menuWidth = Math.min(
    Math.max(triggerLayout?.width ?? minWidth, minWidth),
    width - atomSpacing[4] * 2
  );
  const menuHeightEstimate = options.length * 44 + atomSpacing[2] * 2;
  const fallbackLeft = (width - menuWidth) / 2;
  const fallbackTop = (height - menuHeightEstimate) / 2;
  const menuLeft = clamp(
    triggerLayout?.x ?? fallbackLeft,
    atomSpacing[4],
    width - menuWidth - atomSpacing[4]
  );
  const preferredTop =
    (triggerLayout?.y ?? 0) + (triggerLayout?.height ?? 0) + atomSpacing[2];
  const menuTop =
    preferredTop + menuHeightEstimate > height - atomSpacing[4] && triggerLayout
      ? Math.max(atomSpacing[4], triggerLayout.y - menuHeightEstimate)
      : clamp(
          triggerLayout ? preferredTop : fallbackTop,
          atomSpacing[4],
          height - menuHeightEstimate - atomSpacing[4]
        );

  const openMenu = () => {
    triggerRef.current?.measureInWindow(
      (x, y, measuredWidth, measuredHeight) => {
        setTriggerLayout({
          height: measuredHeight,
          width: measuredWidth,
          x,
          y
        });
        setIsOpen(true);
      }
    );
  };

  return (
    <>
      <View
        collapsable={false}
        ref={triggerRef}
        style={field ? styles.triggerRootField : undefined}
      >
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onHoverIn={() => setIsTriggerHovered(true)}
          onHoverOut={() => setIsTriggerHovered(false)}
          onPress={openMenu}
          style={[
            styles.triggerRoot,
            field ? styles.triggerRootField : null,
            Platform.OS === "web" ? styles.webCursor : null
          ]}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.triggerSurface,
                field ? styles.triggerSurfaceField : null,
                isTriggerHovered ? styles.triggerHovered : null,
                pressed || isOpen ? styles.triggerPressed : null,
                isInvalid ? styles.triggerInvalid : null
              ]}
            >
              {Icon ? (
                <Icon color={atomPalette.text} size={16} strokeWidth={1.9} />
              ) : null}
              <AppText
                numberOfLines={1}
                style={[
                  styles.triggerLabel,
                  field ? styles.triggerLabelField : null
                ]}
                variant={field ? "body" : "bodySm"}
              >
                {labelPrefix
                  ? `${labelPrefix}: ${selectedOption?.label ?? ""}`
                  : selectedOption?.label}
              </AppText>
              <ChevronDownIcon
                color={atomPalette.text}
                size={16}
                strokeWidth={1.9}
              />
            </View>
          )}
        </Pressable>
      </View>

      <Modal
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityLabel="Close select menu"
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            entering={FadeIn.duration(atomMotion.duration.enter)}
            exiting={FadeOut.duration(atomMotion.duration.exit)}
            style={[
              styles.menu,
              {
                left: menuLeft,
                top: menuTop,
                width: menuWidth
              }
            ]}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const isHovered = hoveredValue === option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={option.value}
                  onHoverIn={() => setHoveredValue(option.value)}
                  onHoverOut={() =>
                    setHoveredValue((current) =>
                      current === option.value ? null : current
                    )
                  }
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected ? styles.optionSelected : null,
                    isHovered && !isSelected ? styles.optionHovered : null,
                    pressed ? styles.optionPressed : null,
                    Platform.OS === "web" ? styles.webCursor : null
                  ]}
                >
                  <AppText
                    numberOfLines={1}
                    tone={isSelected ? "accent" : "default"}
                    variant="bodySm"
                  >
                    {option.label}
                  </AppText>
                  {isSelected ? (
                    <CheckIcon color={atomPalette.accent} size={16} />
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  menu: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.borderSubtle,
    borderRadius: atomRadii.sm,
    borderWidth: 1,
    gap: atomSpacing[1],
    padding: atomSpacing[1],
    position: "absolute"
  },
  triggerHovered: {
    backgroundColor: atomPalette.surfaceRaised,
    borderColor: atomPalette.borderStrong
  },
  triggerLabel: {
    flexShrink: 1
  },
  triggerLabelField: {
    flex: 1
  },
  triggerInvalid: {
    borderColor: atomPalette.error
  },
  triggerPressed: {
    backgroundColor: atomPalette.surfaceStrong,
    borderColor: atomPalette.borderStrong
  },
  triggerRoot: {
    alignSelf: "flex-start",
    flexShrink: 0
  },
  triggerRootField: {
    alignSelf: "stretch",
    flexShrink: 1
  },
  triggerSurface: {
    alignItems: "center",
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderRadius: atomRadii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: atomSpacing[2],
    justifyContent: "center",
    minHeight: atomControlHeights.sm,
    minWidth: 0,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[1]
  },
  triggerSurfaceField: {
    borderRadius: atomControlRadius,
    justifyContent: "flex-start",
    minHeight: atomControlHeights.lg,
    paddingHorizontal: atomSpacing[4],
    paddingVertical: 0
  },
  option: {
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: atomRadii.md,
    flexDirection: "row",
    gap: atomSpacing[2],
    justifyContent: "space-between",
    minHeight: 38,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[2]
  },
  optionHovered: {
    backgroundColor: atomPalette.surfaceLow,
    borderColor: "transparent"
  },
  optionPressed: {
    backgroundColor: atomPalette.surfaceStrong
  },
  optionSelected: {
    backgroundColor: `${atomPalette.accent}10`
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
